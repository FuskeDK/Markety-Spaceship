// Public lead-submission endpoint — the only API route called by client
// websites (e.g. a client's landing page). Accepts a POST with
// { clientToken, name, email, phone, source } and:
//   1. Validates phone format and deduplicates within 30 days.
//   2. Inserts a row into the `leads` table with client_id and price snapshot.
//   3. Auto-pauses delivery (cap_paused = true) when the client's lead_cap is
//      reached; sends an 80% warning email to admin before that.
//   4. Emails the client (lead notification) and admin (internal alert).
//   5. Creates a ClickUp task in the Leads list.
// Origin gating: only accepts requests from ALLOWED_ORIGINS.
// No admin auth required — the clientToken acts as the access key.
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { createClickUpTask, LIST_IDS } from "@/lib/server/_clickup";
import { sendEmail } from "@/lib/server/_mailer";

// Rate limiting - max 5 submissions per IP per 10 minutes
const submitAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = submitAttempts.get(ip);
  if (!record || now >= record.resetAt) {
    submitAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_MAX) return false;
  record.count++;
  return true;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, "");
}

function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone).replace(/\D/g, "");
  return digits.length >= 7;
}

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function leadNotificationEmailToClient(lead: { name: string | null; email: string | null; phone: string | null; source: string | null }, client: { name: string; company: string; currency: string; token: string }, dashboardUrl: string): string {
  const leadName = lead.name ?? "New lead";
  void leadName;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:36px 16px 32px;">
<tr><td align="center">
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr><td align="center">
      <img src="https://www.marketyleadgen.com/MarketySquare.png" alt="Markety" width="64" height="64" style="display:block;border-radius:14px;">
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;background:#f4f4f5;border-radius:20px;overflow:hidden;">
    <tr><td style="padding:36px 36px 32px;">
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.03em;">You got a new lead</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.5;">A new lead just came in for ${client.company}. Contact them as soon as possible - leads go cold fast.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 26px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        ${lead.name ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:80px;">Name</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;">${lead.name}</td></tr>` : ""}
        ${lead.phone ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Phone</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;"><a href="tel:${lead.phone}" style="color:#5B21F4;text-decoration:none;">${lead.phone}</a></td></tr>` : ""}
        ${lead.email ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Email</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a;"><a href="mailto:${lead.email}" style="color:#5B21F4;text-decoration:none;">${lead.email}</a></td></tr>` : ""}
        ${lead.source ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Source</td><td style="padding:6px 0;font-size:14px;color:#374151;">${lead.source}</td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:26px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="#5B21F4" style="border-radius:50px;">
          <a href="${dashboardUrl}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;white-space:nowrap;">View in dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;max-width:500px;width:100%;">
    <tr><td bgcolor="#ede9fe" style="border-radius:50px;padding:14px 28px;text-align:center;">
      <span style="font-size:14px;color:#4c1d95;">Call within the first hour for the best chance of closing. <a href="mailto:info@marketyleadgen.com" style="color:#5B21F4;text-decoration:none;">Questions?</a></span>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function leadNotificationEmailToAdmin(lead: { name: string | null; email: string | null; phone: string | null; source: string | null }, client: { company: string; currency: string; price_per_lead: number }, leadsThisMonth: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e5e7eb;">
  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">New lead</p>
  <h2 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#111827;">${client.company}</h2>
  <table style="width:100%;font-size:14px;">
    ${lead.name ? `<tr><td style="color:#6b7280;padding:4px 0;">Name</td><td style="font-weight:600;color:#111827;">${lead.name}</td></tr>` : ""}
    ${lead.phone ? `<tr><td style="color:#6b7280;padding:4px 0;">Phone</td><td style="font-weight:600;color:#111827;">${lead.phone}</td></tr>` : ""}
    ${lead.email ? `<tr><td style="color:#6b7280;padding:4px 0;">Email</td><td style="font-weight:600;color:#111827;">${lead.email}</td></tr>` : ""}
    ${lead.source ? `<tr><td style="color:#6b7280;padding:4px 0;">Source</td><td style="color:#374151;">${lead.source}</td></tr>` : ""}
    <tr><td style="color:#6b7280;padding:4px 0;">Price</td><td style="font-weight:600;color:#111827;">${money(client.price_per_lead, client.currency)}</td></tr>
    <tr><td style="color:#6b7280;padding:4px 0;">Leads this month</td><td style="font-weight:600;color:#111827;">${leadsThisMonth}</td></tr>
  </table>
</div>
</body>
</html>`;
}

// Allowed origins - your own domains + localhost for dev
const ALLOWED_ORIGINS = [
  "https://marketyleadgen.com",
  "https://www.marketyleadgen.com",
  "https://nordicsolfilm.dk",
  "https://www.nordicsolfilm.dk",
];

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.some(o => origin === o || origin.endsWith(".vercel.app"))
    ? origin
    : ALLOWED_ORIGINS[0];

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    },
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";

  // Allow requests from known domains; block everything else (except no-origin server-side calls)
  if (origin && !ALLOWED_ORIGINS.some(o => origin === o || origin.endsWith(".vercel.app"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowOrigin = origin && ALLOWED_ORIGINS.some(o => origin === o || origin.endsWith(".vercel.app"))
    ? origin
    : ALLOWED_ORIGINS[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };

  // Rate limiting
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { clientToken, name, email, phone, source } = body;
  if (!clientToken) return NextResponse.json({ error: "clientToken required" }, { status: 400, headers: corsHeaders });

  // Basic phone validation
  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, company, email, price_per_lead, currency, lead_cap, token, language")
    .eq("token", clientToken)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: corsHeaders });

  // Duplicate detection: same email or phone within 30 days for this client
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  if (email || phone) {
    const orConditions = [];
    if (email) orConditions.push(`email.eq.${email}`);
    if (phone) orConditions.push(`phone.eq.${normalizePhone(phone)}`);

    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("client_id", client.id)
      .gte("created_at", thirtyDaysAgo)
      .or(orConditions.join(","))
      .limit(1);

    if (existing && existing.length > 0) {
      // Silently accept (so form shows success) but don't save duplicate
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }
  }

  const { error } = await supabase.from("leads").insert({
    client_id: client.id,
    name: name ?? null,
    email: email ?? null,
    phone: phone ? normalizePhone(phone) : null,
    source: source ?? "website",
    price: client.price_per_lead,
    lead_status: "new",
  });

  if (error) return NextResponse.json({ error: "Failed to save lead" }, { status: 500, headers: corsHeaders });

  // Count leads this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: monthCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("client_id", client.id)
    .gte("created_at", monthStart.toISOString());

  const leadsThisMonth = monthCount ?? 0;

  // Check lead cap after inserting
  if (client.lead_cap) {
    const { count: totalCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client.id);

    const total = totalCount ?? 0;

    if (total >= client.lead_cap) {
      await supabase.from("clients").update({ cap_paused: true }).eq("id", client.id);
    } else if (total >= Math.floor(client.lead_cap * 0.8)) {
      // 80% cap warning to admin
      const pct = Math.round((total / client.lead_cap) * 100);
      sendEmail({
        to: "info@marketyleadgen.com",
        subject: `Cap warning: ${client.company} at ${pct}% (${total}/${client.lead_cap} leads)`,
        html: `<div style="font-family:sans-serif;padding:20px;max-width:400px;">
          <h2 style="color:#f59e0b;">Lead cap warning</h2>
          <p><strong>${client.company}</strong> has used <strong>${total} of ${client.lead_cap}</strong> leads (${pct}%).</p>
          <p>Consider reaching out to discuss raising the cap before delivery pauses.</p>
        </div>`,
      }).catch(() => {});
    }
  }

  // Email notifications - fire and forget
  const dashboardUrl = `https://marketyleadgen.com/dashboard/${client.token}`;

  // Notify client
  if (process.env.SPACEMAIL_PASSWORD) {
    sendEmail({
      to: client.email,
      subject: `New lead: ${name ?? phone ?? email ?? "Someone"} is interested`,
      html: leadNotificationEmailToClient(
        { name: name ?? null, email: email ?? null, phone: phone ?? null, source: source ?? null },
        { name: client.name, company: client.company, currency: client.currency, token: client.token },
        dashboardUrl
      ),
      replyTo: "info@marketyleadgen.com",
    }).catch(() => {});

    // Notify admin
    sendEmail({
      to: "info@marketyleadgen.com",
      subject: `[Lead] ${client.company} - ${name ?? phone ?? email ?? "Unknown"}`,
      html: leadNotificationEmailToAdmin(
        { name: name ?? null, email: email ?? null, phone: phone ?? null, source: source ?? null },
        { company: client.company, currency: client.currency, price_per_lead: client.price_per_lead },
        leadsThisMonth
      ),
    }).catch(() => {});
  }

  // ClickUp task
  const taskName = name ?? email ?? phone ?? "New lead";
  const lines = [
    name  ? `Name: ${name}`   : null,
    email ? `Email: ${email}` : null,
    phone ? `Phone: ${phone}` : null,
    source ? `Source: ${source}` : null,
    `Client: ${client.company}`,
  ].filter(Boolean).join("\n");
  createClickUpTask(LIST_IDS.leads, taskName, lines).catch(() => {});

  return NextResponse.json({ success: true }, { headers: corsHeaders });
}
