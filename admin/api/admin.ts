// Central admin API handler. Every admin action is routed through this single
// file via an `action` query/body param rather than separate routes.
// Authentication: most actions require the x-admin-password header matching
// ADMIN_PASSWORD env var (enforced by isAuthed()). Exceptions:
//   - "login"         - validates the password and returns success/failure
//   - "find-companies"- public CVR/company lookup (no auth)
//   - "cron-*"        - authenticated by CRON_SECRET Bearer token (Vercel cron)
//
// Key action groups:
//   Clients:    clients (list), add-client, update-client, delete-client,
//               update-onboarding, add-lead (manual), update-lead, delete-lead,
//               update-lead-notes
//   Invoicing:  invoice (mark), send-invoice (email + Stripe session), cron-invoice
//   Content:    generate-content, approve-content, reject-content, delete-content,
//               update-content, content-approvals
//   Outreach:   outreach-contacts
//   Stats:      stats (authenticated detailed breakdown)
//   Email:      send-email (compose + IMAP append to Sent folder)
//   Cron:       cron-invoice, cron-cleanup, cron-followup
//
// The appendToSent() helper keeps the Spacemail IMAP Sent folder in sync
// whenever an email is sent programmatically.
//
// Used by: src/pages/Admin.tsx (all admin panel operations).
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { sendEmail } from "../lib/server/_mailer.js";
import { createClickUpTask } from "../lib/server/_clickup.js";
import { ImapFlow } from "imapflow";

async function appendToSent({ to, subject, html, messageId }: { to: string; subject: string; html: string; messageId?: string }) {
  const client = new ImapFlow({
    host: "mail.spacemail.com",
    port: 993,
    secure: true,
    auth: { user: "info@marketyleadgen.com", pass: process.env.SPACEMAIL_PASSWORD ?? "" },
    logger: false,
  });
  await client.connect();
  const raw = [
    `From: Markety <info@marketyleadgen.com>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Message-ID: ${messageId ?? `<${Date.now()}@marketyleadgen.com>`}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ].join("\r\n");
  const sentFolder = "Sent";
  const appendResult = await client.append(sentFolder, Buffer.from(raw));
  // Remove \Seen flag - some servers add it automatically on append
  if (appendResult && typeof appendResult === "object" && "uid" in appendResult && appendResult.uid) {
    await client.mailboxOpen(sentFolder);
    await client.messageFlagsRemove({ uid: appendResult.uid as number }, ["\\Seen"]);
  }
  await client.logout();
}

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function isAuthed(req: VercelRequest): boolean {
  const pw = req.headers["x-admin-password"] as string;
  return !!pw && pw === process.env.ADMIN_PASSWORD;
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_MAX = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now >= record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_MAX) return false;
  record.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const action = (req.query.action ?? req.body?.action) as string;
    
    if (!action) return res.status(400).json({ error: "No action specified" });

    // ── Cron: monthly auto-invoice (authenticated by CRON_SECRET) ─────────────
    if (action === "cron-invoice") {
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = req.headers["authorization"];
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) return res.status(401).json({ error: "Unauthorized" });

      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return res.status(500).json({ error: "Supabase not configured" });
      const supabaseCron = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthName = now.toLocaleString("en-GB", { month: "long", year: "numeric" });
      const { data: allClients } = await supabaseCron.from("clients").select("id, token, name, company, email, price_per_lead, currency, language, last_invoiced_at");
      let sent = 0; const errors: string[] = [];
      for (const client of allClients ?? []) {
        if (client.last_invoiced_at) { const d = new Date(client.last_invoiced_at); if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) continue; }
        const { data: leadsData } = await supabaseCron.from("leads").select("price").eq("client_id", client.id).gte("created_at", monthStart.toISOString());
        const leads = leadsData ?? []; if (leads.length === 0) continue;
        const amountDue = leads.reduce((sum, l) => sum + (l.price != null ? Number(l.price) : client.price_per_lead), 0);
        const cur = client.currency || "DKK"; const isDa = (client.language ?? "en") === "da";
        const dashUrl = `https://marketyleadgen.com/dashboard/${client.token}`;
        const html = `<html><body style="font-family:sans-serif;padding:32px 16px;"><img src="https://www.marketyleadgen.com/MarketySquare.png" width="48" style="border-radius:10px;margin-bottom:20px;"><h2 style="color:#0f172a;">${isDa ? `Hej ${client.name.split(" ")[0]}, her er din faktura for ${monthName}` : `Hi ${client.name.split(" ")[0]}, here is your invoice for ${monthName}`}</h2><p style="color:#374151;">${isDa ? `${leads.length} leads leveret - samlet ${money(amountDue, cur)}` : `${leads.length} leads delivered - total ${money(amountDue, cur)}`}</p><a href="${dashUrl}" style="display:inline-block;padding:12px 24px;background:#5B21F4;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;">${isDa ? "Se faktura" : "View invoice"}</a></body></html>`;
        try {
          await sendEmail({ to: client.email, subject: isDa ? `Faktura ${monthName} · ${money(amountDue, cur)}` : `Invoice ${monthName} · ${money(amountDue, cur)}`, html, replyTo: "info@marketyleadgen.com" });
          await supabaseCron.from("clients").update({ last_invoiced_at: now.toISOString() }).eq("id", client.id);
          await supabaseCron.from("invoices").upsert({ client_id: client.id, month_key: monthKey, month_label: monthName, leads_count: leads.length, amount: amountDue, currency: cur, sent_at: now.toISOString() }, { onConflict: "client_id,month_key" });
          sent++;
        } catch (e) { errors.push(`${client.company}: ${String(e)}`); }
      }
      sendEmail({ to: "info@marketyleadgen.com", subject: `Auto-invoicing done - ${sent} sent`, html: `<p style="font-family:sans-serif;">${sent} invoices sent for ${monthName}.${errors.length ? " Errors: " + errors.join(", ") : ""}</p>` }).catch(() => {});
      return res.status(200).json({ sent, errors });
    }

    // ── Cron: monthly DB cleanup ──────────────────────────────────────────────
    if (action === "cron-cleanup") {
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = req.headers["authorization"];
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) return res.status(401).json({ error: "Unauthorized" });
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return res.status(500).json({ error: "Supabase not configured" });
      const supabaseCron = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [rejectedContent, oldReplied] = await Promise.all([
        // Remove rejected content older than 30 days
        supabaseCron.from("content_approvals").delete().eq("status", "rejected").lte("created_at", thirtyDaysAgo),
        // Remove replied contact submissions older than 6 months
        supabaseCron.from("contact_submissions").delete().not("replied_at", "is", null).lte("created_at", sixMonthsAgo),
      ]);

      console.log("[CLEANUP]", { rejectedContent: rejectedContent.error, oldReplied: oldReplied.error });
      return res.status(200).json({ success: true });
    }

    // ── Cron: 24h follow-up reminder ─────────────────────────────────────────
    if (action === "cron-followup") {
      const cronSecret = process.env.CRON_SECRET;
      const authHeader = req.headers["authorization"];
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) return res.status(401).json({ error: "Unauthorized" });

      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return res.status(500).json({ error: "Supabase not configured" });
      const supabaseCron = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: staleLeads } = await supabaseCron.from("leads").select("id, name, phone, email, created_at, clients(name, company, email, token, language)").eq("lead_status", "new").lte("created_at", twentyHoursAgo).gte("created_at", fortyEightHoursAgo);
      let sent = 0;
      for (const lead of staleLeads ?? []) {
        const client = (Array.isArray(lead.clients) ? lead.clients[0] : lead.clients) as { name: string; company: string; email: string; token: string; language: string } | null;
        if (!client?.email) continue;
        const isDa = (client.language ?? "en") === "da";
        const leadName = escapeHtml(lead.name ?? lead.phone ?? lead.email ?? "a lead");
        const safePhone = lead.phone ? escapeHtml(lead.phone) : null;
        const safeEmail = lead.email ? escapeHtml(lead.email) : null;
        const dashUrl = `https://marketyleadgen.com/dashboard/${client.token}`;
        const html = `<html><body style="font-family:sans-serif;padding:32px 16px;background:#fff8ed;"><img src="https://www.marketyleadgen.com/MarketySquare.png" width="48" style="border-radius:10px;margin-bottom:16px;"><h2 style="color:#0f172a;">${isDa ? "Husker du dette lead?" : "Did you follow up?"}</h2><p style="color:#374151;">${isDa ? `<strong>${leadName}</strong> udfyldte din formular for over 20 timer siden og er endnu ikke kontaktet.` : `<strong>${leadName}</strong> filled in your form over 20 hours ago and hasn't been contacted yet.`}</p>${safePhone ? `<p><a href="tel:${safePhone}" style="color:#5B21F4;font-weight:600;">${safePhone}</a></p>` : ""}${safeEmail ? `<p><a href="mailto:${safeEmail}" style="color:#5B21F4;">${safeEmail}</a></p>` : ""}<a href="${dashUrl}" style="display:inline-block;padding:12px 24px;background:#5B21F4;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;">${isDa ? "Se i dashboard" : "View in dashboard"}</a></body></html>`;
        try { await sendEmail({ to: client.email, subject: isDa ? `Husker du ${leadName}?` : `Reminder: ${leadName} is still waiting`, html, replyTo: "info@marketyleadgen.com" }); sent++; } catch { /* continue */ }
      }
      return res.status(200).json({ sent });
    }

    // Validate required environment variables
    if (!process.env.ADMIN_PASSWORD) {
      return res.status(500).json({ error: "ADMIN_PASSWORD not configured" });
    }

    // ── Login (no auth required) ──────────────────────────────────────────────
    if (req.method === "POST" && action === "login") {
    const ip = ((req.headers["x-forwarded-for"] as string) ?? "").split(",")[0].trim() || "unknown";
    if (!checkLoginRateLimit(ip)) {
      return res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
    }
    const { password } = req.body ?? {};
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!adminPassword) return res.status(500).json({ error: "Admin not configured" });
    if ((password ?? "").trim() !== adminPassword) {
      return res.status(401).json({ error: "Wrong password" });
    }
    return res.status(200).json({ success: true });
  }

  // ── Company finder (English-speaking markets via Nimble + Claude) ─────────
  if (req.method === "GET" && action === "find-companies") {
    const q = req.query.q as string;
    if (!q) return res.status(200).json({ result: null });

    const nimbleKey = process.env.NIMBLE_API_KEY;
    if (!nimbleKey) return res.status(500).json({ error: "Nimble API key not configured" });

    try {
      // Search Google UK for a small English-speaking business matching this query
      const searchUrl = `https://www.google.co.uk/search?q=${encodeURIComponent(q + " UK small business email")}&gl=gb&hl=en&num=8`;
      const nimbleRes = await fetch("https://api.webit.live/api/v1/realtime/web", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(`${nimbleKey}:${nimbleKey}`).toString("base64"),
        },
        body: JSON.stringify({ url: searchUrl, render: false, format: "markdown", country: "GB" }),
      });
      const nimbleData = await nimbleRes.json();
      const searchText = ((nimbleData?.parsing?.markdown ?? nimbleData?.data?.markdown ?? "") as string).slice(0, 5000);
      if (!searchText) return res.status(200).json({ result: null });

      // Claude haiku parses the search results into a structured company record
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 350,
        messages: [{
          role: "user",
          content: `From these Google search results, extract the FIRST small local business in the UK, US, or Australia that appears to have 1-3 employees (owner-operated, sole trader, family business, one-man band, etc.). Skip large chains, franchises, and any business that obviously has more than 5 employees. IMPORTANT: Only extract businesses from English-speaking countries (UK, US, Australia, Canada). If a business appears to be from Denmark, Germany, Sweden, Norway, or any non-English-speaking country, skip it entirely and return {"result":null}.

Return ONLY a valid JSON object — no explanation, no markdown fences:
{
  "name": "Business Name",
  "email": "info@example.com or null",
  "phone": "+44 7700 000000 or null",
  "homepage": "https://example.com or null",
  "city": "London",
  "address": "123 High Street, London",
  "employees": "1-2",
  "industrydesc": "Plumbing services",
  "owners": [{"name": "John Smith"}]
}

If you cannot find a suitable English-speaking micro-business, return exactly: {"result":null}

Search results:
${searchText}`,
        }],
      });

      const raw = (msg.content[0] as { type: string; text: string }).text.trim();
      let parsed: Record<string, unknown> | null = null;
      try { parsed = JSON.parse(raw); } catch { return res.status(200).json({ result: null }); }
      if (!parsed || parsed.result === null || !parsed.name) return res.status(200).json({ result: null });

      // If we have a website but no email, scrape the contact page
      if (parsed.homepage && !parsed.email) {
        try {
          const contactUrl = (parsed.homepage as string).replace(/\/$/, "") + "/contact";
          const contactRes = await fetch("https://api.webit.live/api/v1/realtime/web", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Basic " + Buffer.from(`${nimbleKey}:${nimbleKey}`).toString("base64"),
            },
            body: JSON.stringify({ url: contactUrl, render: false, format: "markdown", country: "GB" }),
          });
          const contactData = await contactRes.json();
          const contactText = (contactData?.parsing?.markdown ?? contactData?.data?.markdown ?? "") as string;
          const emailMatch = contactText.match(/[a-zA-Z0-9._%+-]+@(?!.*\.(png|jpg|gif|svg))[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) parsed.email = emailMatch[0];
        } catch { /* email stays null */ }
      }

      return res.status(200).json({
        result: {
          name: parsed.name ?? "",
          email: parsed.email ?? null,
          phone: parsed.phone ?? null,
          homepage: parsed.homepage ?? null,
          city: parsed.city ?? "",
          zipcode: "",
          address: parsed.address ?? "",
          industrydesc: parsed.industrydesc ?? null,
          employees: parsed.employees ?? "1-3",
          owners: parsed.owners ?? null,
          vat: null,
        },
      });
    } catch (err) {
      console.error("find-companies error:", err);
      return res.status(200).json({ result: null });
    }
  }

  // All other actions require auth
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized" });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // ── Clients list ──────────────────────────────────────────────────────────
  if (req.method === "GET" && action === "clients") {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, token, name, company, email, phone, price_per_lead, currency, created_at, last_invoiced_at, language, lead_cap, cap_paused, deal_value, onboarding_steps")
      .order("created_at", { ascending: false });

    if (!clients) return res.status(200).json({ clients: [] });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const clientsWithLeads = await Promise.all(
      clients.map(async (client) => {
        const { data: allLeads } = await supabase
          .from("leads")
          .select("id, name, email, phone, source, created_at, price, lead_status, lead_notes")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false });
        const leads = allLeads ?? [];
        const thisMonthLeads = leads.filter(l => new Date(l.created_at) >= monthStart);
        const amount_due = thisMonthLeads.reduce((acc, l) => acc + (l.price != null ? Number(l.price) : 0), 0);
        return {
          ...client,
          leads,
          leads_this_month: thisMonthLeads.length,
          amount_due,
        };
      })
    );

    return res.status(200).json({ clients: clientsWithLeads });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  if (req.method === "GET" && action === "stats") {
    const year = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: leads } = await supabase
      .from("leads")
      .select("created_at, client_id, price, clients(price_per_lead)")
      .gte("created_at", yearStart);

    const rows = (leads ?? []) as unknown as Array<{
      created_at: string;
      price: number | null;
      clients: { price_per_lead: number }[] | null;
    }>;

    const months: Record<number, { leads: number; earnings: number }> = {};
    for (let m = 0; m < 12; m++) months[m] = { leads: 0, earnings: 0 };

    let earningsThisYear = 0;
    let earningsThisMonth = 0;
    let leadsThisMonth = 0;

    for (const row of rows) {
      const d = new Date(row.created_at);
      const m = d.getMonth();
      const fallback = (Array.isArray(row.clients) ? row.clients[0] : row.clients)?.price_per_lead ?? 0;
      const price = row.price != null ? Number(row.price) : fallback;
      months[m].leads++;
      months[m].earnings += price;
      earningsThisYear += price;
      if (d >= monthStart) {
        earningsThisMonth += price;
        leadsThisMonth++;
      }
    }

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();

    const monthlyBreakdown = Array.from({ length: currentMonth + 1 }, (_, i) => ({
      month: MONTH_NAMES[i],
      leads: months[i].leads,
      earnings: Math.round(months[i].earnings * 100) / 100,
    }));

    const { count: totalClients } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    return res.status(200).json({
      earningsThisYear: Math.round(earningsThisYear * 100) / 100,
      earningsThisMonth: Math.round(earningsThisMonth * 100) / 100,
      leadsThisYear: rows.length,
      leadsThisMonth,
      totalClients: totalClients ?? 0,
      monthlyBreakdown,
    });
  }

  // ── Mark invoice ──────────────────────────────────────────────────────────
  if (req.method === "POST" && action === "invoice") {
    const { clientId, invoiced } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    await supabase
      .from("clients")
      .update({ last_invoiced_at: invoiced ? new Date().toISOString() : null })
      .eq("id", clientId);
    return res.status(200).json({ success: true });
  }

  // ── Send invoice email ────────────────────────────────────────────────────
  if (req.method === "POST" && action === "send-invoice") {
    const { default: Stripe } = await import("stripe");
    const { clientId } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });

    const { data: client } = await supabase
      .from("clients")
      .select("id, token, name, company, email, price_per_lead, currency, language")
      .eq("id", clientId)
      .single();

    if (!client) return res.status(404).json({ error: "Client not found" });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: leadsThisMonth } = await supabase
      .from("leads")
      .select("price, name, email, source, created_at")
      .eq("client_id", client.id)
      .gte("created_at", monthStart.toISOString())
      .order("created_at", { ascending: true });

    const leads = (leadsThisMonth ?? []).length;
    const amountDue = (leadsThisMonth ?? []).reduce(
      (sum, l) => sum + (l.price != null ? Number(l.price) : client.price_per_lead),
      0
    );
    const lang = (client.language ?? "en") as string;
    const isDa = lang === "da";
    const locale = isDa ? "da-DK" : "en-GB";
    const monthName = new Date().toLocaleString(locale, { month: "long", year: "numeric" });
    const t = {
      invoice: isDa ? "Faktura" : "Invoice",
      hi: isDa ? `Hej, ${client.name}` : `Hi, ${client.name}`,
      intro: isDa ? `Her er din faktura for ${monthName}` : `Here is your invoice for ${monthName}`,
      colLead: isDa ? "Lead" : "Lead",
      colSource: isDa ? "Kilde" : "Source",
      colPrice: isDa ? "Pris" : "Price",
      total: isDa ? "I alt" : "Total due",
      payNow: isDa ? "Betal nu" : "Pay now",
      viewInvoice: isDa ? "Se faktura" : "View invoice",
      fallback: isDa ? "Knappen virker ikke? <a href=\"PAYURL\" style=\"color:#4c1d95;\">Klik her for at betale</a>" : "Button not working? <a href=\"PAYURL\" style=\"color:#4c1d95;\">Click here to pay</a>",
      questions: isDa ? "Har du spørgsmål? Svar på denne e-mail - vi hjælper gerne." : "If you have questions, just hit reply - we're here to help.",
      subject: isDa ? `Faktura ${monthName} - ${leads} leads` : `Invoice ${monthName} - ${leads} leads`,
    };
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Auto-generate Stripe Checkout Session if configured
    let paymentUrl: string | null = null;
    if (process.env.STRIPE_SECRET_KEY && amountDue > 0) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: (client.currency || "USD").toLowerCase(),
              product_data: { name: `${leads} leads - ${monthName}` },
              unit_amount: Math.round(amountDue * 100),
            },
            quantity: 1,
          }],
          metadata: { client_id: client.id, month_key: monthKey },
          success_url: `https://marketyleadgen.com/dashboard/${client.token}`,
          cancel_url: `https://marketyleadgen.com/dashboard/${client.token}`,
        });
        paymentUrl = session.url;
      } catch (err) {
        console.error("Stripe session error:", err);
      }
    }

    if (!process.env.SPACEMAIL_PASSWORD) return res.status(500).json({ error: "Email service not configured" });

    const cur = client.currency || "DKK";
    const ctaHref = paymentUrl ?? `https://marketyleadgen.com/dashboard/${client.token}`;
    const ctaLabel = paymentUrl ? t.payNow : t.viewInvoice;
    const footerNote = paymentUrl
      ? t.fallback.replace("PAYURL", paymentUrl)
      : t.questions;

    const leadsLine = isDa
      ? `${leads} leads leveret i ${monthName}`
      : `${leads} leads delivered in ${monthName}`;

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:36px 16px 32px;">
<tr><td align="center">

  <!-- Logo image -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr><td align="center">
      <img src="https://www.marketyleadgen.com/MarketySquare.png" alt="Markety" width="64" height="64" style="display:block;border-radius:14px;">
    </td></tr>
  </table>

  <!-- Card -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;background:#f4f4f5;border-radius:20px;overflow:hidden;">
    <tr><td style="padding:36px 36px 32px;">

      <!-- Greeting -->
      <h1 style="margin:0 0 6px;font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-0.03em;">${t.hi}</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.5;">${t.intro}</p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 26px;">

      <!-- Lead info section -->
      <h2 style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0f172a;">${isDa ? "Informationer omkring faktura" : "Invoice details"}</h2>
      <ul style="margin:0 0 6px;padding-left:18px;">
        <li style="font-size:14px;color:#374151;margin-bottom:4px;">${leadsLine}</li>
        <li style="font-size:14px;color:#374151;">${isDa ? `Samlet beløb: <strong>${money(amountDue, cur)}</strong>` : `Total amount: <strong>${money(amountDue, cur)}</strong>`}</li>
      </ul>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:26px 0;">

      <!-- Payment section -->
      <h2 style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0f172a;">${isDa ? "Betaling" : "Payment"}</h2>
      <p style="margin:0 0 22px;font-size:14px;color:#64748b;line-height:1.65;">${isDa ? `Den samlede pris er <strong style="color:#0f172a;">${money(amountDue, cur)}</strong> - betal ved at trykke på knappen forneden` : `The total amount is <strong style="color:#0f172a;">${money(amountDue, cur)}</strong> - pay by clicking the button below`}</p>

      <!-- Button -->
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="#5B21F4" style="border-radius:50px;">
          <a href="${ctaHref}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;white-space:nowrap;">${ctaLabel}</a>
        </td></tr>
      </table>

    </td></tr>
  </table>

  <!-- Footer pill -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;max-width:500px;width:100%;">
    <tr><td bgcolor="#ede9fe" style="border-radius:50px;padding:14px 28px;text-align:center;">
      <span style="font-size:14px;color:#4c1d95;">${footerNote}</span>
    </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;

    try {
      await sendEmail({
        to: client.email,
        subject: `${t.subject} · ${money(amountDue, cur)}`,
        html,
        replyTo: "info@marketyleadgen.com",
      });
    } catch (err) {
      console.error("Invoice email error:", err);
      return res.status(502).json({ error: "Failed to send email" });
    }

    await Promise.all([
      supabase.from("clients").update({ last_invoiced_at: now.toISOString() }).eq("id", clientId),
      supabase.from("invoices").upsert(
        {
          client_id: client.id,
          month_key: monthKey,
          month_label: monthName,
          leads_count: leads,
          amount: amountDue,
          currency: client.currency || "USD",
          stripe_link: paymentUrl,
          sent_at: now.toISOString(),
        },
        { onConflict: "client_id,month_key" }
      ),
    ]);

    return res.status(200).json({ success: true });
  }

  // ── Add client ────────────────────────────────────────────────────────────
  if (req.method === "POST" && action === "add-client") {
    const { name, company, email, price_per_lead, currency } = req.body ?? {};
    if (!name || !company || !email || !price_per_lead) {
      return res.status(400).json({ error: "name, company, email, and price_per_lead are required" });
    }
    const token = randomBytes(24).toString("hex");
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        name: (name as string).trim(),
        company: (company as string).trim(),
        email: (email as string).trim().toLowerCase(),
        price_per_lead: parseFloat(price_per_lead),
        currency: (currency as string) || "USD",
        token,
        claimed: false,
      })
      .select("id, token")
      .single();
    if (error || !client) {
      console.error("Add client error:", error);
      return res.status(500).json({ error: "Failed to create client" });
    }

    const dashboardUrl = `https://marketyleadgen.com/dashboard/${client.token}`;

    // Welcome email to client
    if (process.env.SPACEMAIL_PASSWORD) {
      const firstName = (name as string).trim().split(" ")[0];
      const welcomeHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:36px 16px 40px;">
<tr><td align="center">

  <!-- Logo -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr><td align="center">
      <img src="https://www.marketyleadgen.com/MarketySquare.png" alt="Markety" width="60" height="60" style="display:block;border-radius:14px;">
    </td></tr>
  </table>

  <!-- Main card -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#f4f4f5;border-radius:20px;overflow:hidden;">
    <tr><td style="padding:36px 36px 12px;">

      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">Welcome, ${firstName}.</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">Your Markety dashboard is live. Here's everything you need to get started.</p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;">

      <!-- Step 1: Set up password -->
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:28px;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#5B21F4;text-transform:uppercase;letter-spacing:0.08em;">Step 1 - Do this first</p>
          <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0f172a;">Set up your password</p>
          <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">Click the button below to open your dashboard. The first time you visit, you'll be asked to create a password. Choose something you'll remember - this is how you log in every time.</p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#5B21F4" style="border-radius:50px;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:11px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;white-space:nowrap;">Open dashboard and set password</a>
            </td></tr>
          </table>
          <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Your personal link: <a href="${dashboardUrl}" style="color:#5B21F4;text-decoration:none;">${dashboardUrl}</a></p>
        </td></tr>
      </table>

      <!-- Dashboard overview -->
      <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0f172a;">What's in your dashboard</p>

      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:28px;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;"><span style="font-weight:700;color:#0f172a;">Overview</span> - Every lead that comes in: name, phone, and email. Mark each one as contacted, converted, or lost to track your pipeline.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;"><span style="font-weight:700;color:#0f172a;">Analytics</span> - Charts showing how many leads came in per day, per month, and by source. Useful for spotting what's working.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;"><span style="font-weight:700;color:#0f172a;">Invoices</span> - Your monthly invoices with a payment link. You only get invoiced for leads we actually delivered that month.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;"><span style="font-weight:700;color:#0f172a;">Campaigns</span> - An overview of the ads running for your business and where your leads are coming from.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;vertical-align:top;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;"><span style="font-weight:700;color:#0f172a;">Account</span> - Change your password at any time.</p>
          </td>
        </tr>
      </table>

      <!-- What happens next -->
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;">
      <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0f172a;">What happens next</p>
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;"><strong>Within a few days</strong> - We finish building your ads, landing page, and lead forms.</p>
        </td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;"><strong>Typically within 2 weeks</strong> - First leads start coming in. You'll get an email instantly each time.</p>
        </td></tr>
        <tr><td style="padding:8px 0;">
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;"><strong>End of each month</strong> - You receive an invoice only for the leads delivered that month. No leads, no charge.</p>
        </td></tr>
      </table>

    </td></tr>
  </table>

  <!-- Footer -->
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;max-width:500px;width:100%;">
    <tr><td bgcolor="#ede9fe" style="border-radius:50px;padding:14px 28px;text-align:center;">
      <span style="font-size:13px;color:#4c1d95;">Questions? Just reply to this email. We're here to help.</span>
    </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
      sendEmail({
        to: (email as string).trim().toLowerCase(),
        subject: `Welcome to Markety - here's how your dashboard works`,
        html: welcomeHtml,
        replyTo: "info@marketyleadgen.com",
      }).catch(() => {});
    }

    // ClickUp onboarding task
    const onboardingListId = process.env.CLICKUP_ONBOARDING_LIST;
    if (onboardingListId) {
      createClickUpTask(onboardingListId, `[ONBOARD] ${(company as string).trim()}`, [
        `Client: ${(name as string).trim()}`,
        `Email: ${(email as string).trim()}`,
        `Price/lead: ${price_per_lead} ${currency || "USD"}`,
        `Dashboard: ${dashboardUrl}`,
        ``,
        `Tasks:`,
        `- Set up Facebook/Google Ads`,
        `- Build landing page`,
        `- Configure lead form with token`,
        `- Test lead submission`,
        `- Confirm first lead received`,
      ].join("\n")).catch(() => {});
    }

    return res.status(200).json({ success: true, token: client.token });
  }

  // ── Delete client ─────────────────────────────────────────────────────────
  if (req.method === "POST" && action === "delete-client") {
    const { clientId } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    await supabase.from("leads").delete().eq("client_id", clientId);
    await supabase.from("invoices").delete().eq("client_id", clientId);
    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) { console.error("Delete client error:", error); return res.status(500).json({ error: "Failed to delete client" }); }
    return res.status(200).json({ success: true });
  }

  // ── Update client ─────────────────────────────────────────────────────────
  if (req.method === "POST" && action === "update-client") {
    const { clientId, name, company, email, phone, price_per_lead, currency, language, lead_cap } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = (name as string).trim();
    if (company !== undefined) updates.company = (company as string).trim();
    if (email !== undefined) updates.email = (email as string).trim().toLowerCase();
    if (phone !== undefined) updates.phone = (phone as string).trim() || null;
    if (price_per_lead !== undefined) {
      const p = parseFloat(price_per_lead);
      if (isNaN(p) || p < 0) return res.status(400).json({ error: "Invalid price_per_lead" });
      updates.price_per_lead = p;
    }
    if (currency !== undefined) updates.currency = currency;
    if (language !== undefined) updates.language = language;
    if (lead_cap !== undefined) {
      if (lead_cap === null || lead_cap === "") {
        updates.lead_cap = null;
      } else {
        const cap = Number(lead_cap);
        if (isNaN(cap) || cap < 1) return res.status(400).json({ error: "Invalid lead_cap" });
        updates.lead_cap = cap;
      }
    }

    const { error } = await supabase.from("clients").update(updates).eq("id", clientId);
    if (error) { console.error("Update client error:", error); return res.status(500).json({ error: "Failed to update client" }); }
    return res.status(200).json({ success: true });
  }

  // ── Reactivate client (clear cap pause, keep cap) ────────────────────────
  if (req.method === "POST" && action === "reactivate-client") {
    const { clientId } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    const { error } = await supabase.from("clients").update({ cap_paused: false }).eq("id", clientId);
    if (error) { console.error("Reactivate error:", error); return res.status(500).json({ error: "Failed to reactivate" }); }
    return res.status(200).json({ success: true });
  }

  // ── Remove cap (clear pause + remove cap entirely) ────────────────────────
  if (req.method === "POST" && action === "remove-cap") {
    const { clientId } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    const { error } = await supabase.from("clients").update({ cap_paused: false, lead_cap: null }).eq("id", clientId);
    if (error) { console.error("Remove cap error:", error); return res.status(500).json({ error: "Failed to remove cap" }); }
    return res.status(200).json({ success: true });
  }

  // ── Generate payment link for current month invoice ───────────────────────
  if (req.method === "POST" && action === "generate-payment-link") {
    const { default: Stripe } = await import("stripe");
    const { clientId } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe not configured" });

    const { data: client } = await supabase
      .from("clients")
      .select("id, name, company, price_per_lead, currency")
      .eq("id", clientId)
      .single();
    if (!client) return res.status(404).json({ error: "Client not found" });

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthName = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: leadsData } = await supabase
      .from("leads")
      .select("price")
      .eq("client_id", client.id)
      .gte("created_at", monthStart.toISOString());

    const leads = (leadsData ?? []).length;
    const amountDue = (leadsData ?? []).reduce(
      (sum, l) => sum + (l.price != null ? Number(l.price) : client.price_per_lead),
      0
    );
    if (amountDue <= 0) return res.status(400).json({ error: "No amount due this month" });

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: (client.currency || "USD").toLowerCase(),
            product_data: { name: `${leads} leads - ${monthName}` },
            unit_amount: Math.round(amountDue * 100),
          },
          quantity: 1,
        }],
        metadata: { client_id: client.id, month_key: monthKey },
        success_url: "https://marketyleadgen.com",
        cancel_url: "https://marketyleadgen.com",
      });

      await supabase.from("invoices")
        .update({ stripe_link: session.url })
        .eq("client_id", clientId)
        .eq("month_key", monthKey);

      return res.status(200).json({ success: true, url: session.url });
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      console.error("Stripe session error:", msg);
      return res.status(502).json({ error: msg });
    }
  }

  // ── Reset client password ────────────────────────────────────────────────
  if (req.method === "POST" && action === "reset-client-password") {
    const { clientId } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    const { error } = await supabase
      .from("clients")
      .update({ claimed: false, password_hash: null })
      .eq("id", clientId);
    if (error) { console.error("Reset password error:", error); return res.status(500).json({ error: "Failed to reset password" }); }
    return res.status(200).json({ success: true });
  }

  // ── Delete lead ──────────────────────────────────────────────────────────
  if (req.method === "POST" && action === "delete-lead") {
    const { leadId } = req.body ?? {};
    if (!leadId) return res.status(400).json({ error: "leadId required" });
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) return res.status(500).json({ error: "Failed to delete lead" });
    return res.status(200).json({ success: true });
  }

  // ── Toggle invoice paid ───────────────────────────────────────────────────
  if (req.method === "POST" && action === "toggle-invoice-paid") {
    const { clientId, paid } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await supabase.from("invoices")
      .update({ paid_at: paid ? now.toISOString() : null })
      .eq("client_id", clientId)
      .eq("month_key", monthKey);
    return res.status(200).json({ success: true });
  }

  // ── Contact submissions: reply ───────────────────────────────────────────
  if (req.method === "POST" && action === "reply-contact") {
    const { id, name, email, body } = req.body ?? {};
    if (!id || !name || !email || !body) return res.status(400).json({ error: "id, name, email, and body required" });

    const first = (name as string).split(" ")[0];
    const html = `<!DOCTYPE html>
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
      <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#0f172a;">Hi, ${first}</p>
      <div style="font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap;">${(body as string).replace(/\n/g, "<br>")}</div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 20px;">
      <p style="margin:0;font-size:14px;color:#374151;">Markety,<br><a href="https://www.marketyleadgen.com" style="color:#5B21F4;text-decoration:none;">www.marketyleadgen.com</a></p>
    </td></tr>
  </table>
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;max-width:500px;width:100%;">
    <tr><td bgcolor="#ede9fe" style="border-radius:50px;padding:14px 28px;text-align:center;">
      <span style="font-size:14px;color:#4c1d95;">Questions? <a href="mailto:info@marketyleadgen.com" style="color:#5B21F4;text-decoration:none;font-weight:600;">info@marketyleadgen.com</a></span>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

    try {
      await sendEmail({ to: email, subject: `Re: Your message to Markety`, html, replyTo: "info@marketyleadgen.com" });
    } catch (err) {
      console.error("Reply email error:", err);
      return res.status(502).json({ error: "Failed to send email" });
    }

    const fullMessage = `Hi, ${first}\n\n${body}\n\nMarkety,\nwww.marketyleadgen.com`;
    const { error } = await supabase
      .from("contact_submissions")
      .update({ replied_at: new Date().toISOString(), reply_message: fullMessage })
      .eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Send outreach email ───────────────────────────────────────────────────
  if (req.method === "POST" && action === "send-outreach") {
    const { to, subject, body } = req.body ?? {};
    if (!to || !subject || !body) return res.status(400).json({ error: "Missing fields" });
    const signature = `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-family:-apple-system,Arial,sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">
      <span style="color:#333;">Markety</span><br>
      <a href="mailto:info@marketyleadgen.com" style="color:#6836F4;text-decoration:none;">info@marketyleadgen.com</a><br>
      <a href="https://www.marketyleadgen.com" style="color:#6836F4;text-decoration:none;">www.marketyleadgen.com</a>
    </div>`;
    const html = `<div style="font-family:-apple-system,Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;max-width:560px;">${String(body).replace(/\n/g, "<br>")}${signature}</div>`;
    try {
      const info = await sendEmail({ to, subject, html, replyTo: "info@marketyleadgen.com" });
      // Append to Sent folder via IMAP
      appendToSent({ to, subject, html, messageId: info.messageId }).catch(() => {});
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("send-outreach error:", err);
      return res.status(500).json({ error: "Failed to send email" });
    }
  }

  // ── Contact submissions: list ────────────────────────────────────────────
  if (req.method === "GET" && action === "list-contacts") {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ contacts: data ?? [] });
  }

  // ── Content approvals: list ──────────────────────────────────────────────
  if (req.method === "GET" && action === "list-content") {
    const { data, error } = await supabase
      .from("content_approvals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data ?? [] });
  }

  // ── Content approvals: update ────────────────────────────────────────────
  if (req.method === "POST" && action === "update-content-status") {
    const { id, status, content } = req.body ?? {};
    if (!id || !status) return res.status(400).json({ error: "id and status required" });
    const updates: Record<string, unknown> = { status };
    if (content !== undefined) updates.content = content;
    if (status === "posted") updates.posted_at = new Date().toISOString();
    const { error } = await supabase.from("content_approvals").update(updates).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Content: approve (marks approved, no posting attempt) ───────────────────
  // ── Content: approve and post via Zapier webhook ─────────────────────────
  if (req.method === "POST" && action === "approve-and-post") {
    const { id, type, content } = req.body ?? {};
    if (!id || !type || !content) return res.status(400).json({ error: "id, type, and content required" });

    const finalContent = (content as string).trim();

    const webhookEnvKey: Record<string, string> = {
      linkedin_post: "LINKEDIN_WEBHOOK_URL",
      x_post: "X_WEBHOOK_URL",
    };

    const webhookUrl = process.env[webhookEnvKey[type as string] ?? ""];

    if (webhookUrl) {
      const hookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalContent, type }),
      });

      if (!hookRes.ok) {
        const errText = await hookRes.text();
        console.error("[Webhook] Post failed:", errText);
        await supabase.from("content_approvals").update({ status: "approved", content: finalContent }).eq("id", id);
        return res.status(200).json({ success: true, posted: false, reason: `Webhook error: ${errText}` });
      }

      await supabase.from("content_approvals").update({
        status: "posted",
        content: finalContent,
        posted_at: new Date().toISOString(),
      }).eq("id", id);
      return res.status(200).json({ success: true, posted: true });
    }

    // No webhook configured - mark approved, show manual fallback
    await supabase.from("content_approvals").update({ status: "approved", content: finalContent }).eq("id", id);
    return res.status(200).json({ success: true, posted: false, reason: "No webhook configured - post manually" });
  }

  // ── Content: insert pre-written content (used by Zapier skill) ──────────────
  if (req.method === "POST" && action === "insert-content") {
    const { type, content } = req.body ?? {};
    if (!type || !content) return res.status(400).json({ error: "type and content required" });
    const validTypes = ["linkedin_post", "x_post", "linkedin_dm", "email"];
    if (!validTypes.includes(type)) return res.status(400).json({ error: "invalid type" });
    const { error } = await supabase.from("content_approvals").insert({
      type,
      content: (content as string).trim(),
      status: "pending",
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Content generation (template bank - no API key needed) ──────────────────
  if (req.method === "POST" && action === "generate-content") {
    const { type } = req.body ?? {};
    if (!type || !["linkedin_post", "x_post"].includes(type)) {
      return res.status(400).json({ error: "type must be linkedin_post or x_post" });
    }

    const linkedinTemplates = [
      `Most business owners I talk to have no idea what they're paying per lead.\n\nThey know their retainer. They know their ad spend. But they can't tell me the actual cost of a single qualified enquiry.\n\nWhen we work it out together, the number is almost always shocking.\n\nSometimes it's $80. Sometimes $200. Once it was over $400.\n\nAnd they're still signing the same monthly cheque every month, whether leads come in or not.\n\nThe pay-per-lead model flips this completely. You know exactly what you're paying for every lead before you start. No retainer. No guesswork.\n\nOur average is $2.80 per lead across all the industries we work in.\n\nIf you've never actually calculated your cost per lead, I'd start there. The number will probably surprise you.\n\nWhat does your business pay per enquiry right now?`,
      `Here's something most marketing agencies don't want you to know:\n\nThe retainer model works in their favour, not yours.\n\nThey get paid whether results come or not. Great month, slow month - same invoice.\n\nPay-per-lead completely removes that misalignment.\n\nWe only earn when you get a qualified lead in your inbox. If campaigns underperform, we take the hit - not you.\n\nFor local businesses especially - contractors, clinics, consultants - this model changes everything.\n\nYou get predictable cost, predictable results, and no risk of burning budget on a slow month.\n\nFirst leads typically arrive within 2 weeks. No long-term contracts.\n\nHonest question: when did you last audit whether your marketing agency is actually accountable for results?`,
      `A local plumber tried Facebook ads and got nothing.\n\nSo I asked him three questions:\n\nWhat was your landing page? He sent people to his homepage.\nWhat happened after someone clicked? No follow-up, no call.\nHow long did you run it? Three weeks.\n\nFacebook ads work. The setup around them usually doesn't.\n\nThe ad is just the first step. You need the right landing page, the right offer, and a system that catches the lead before they disappear.\n\nWe handle all three for our clients. That's why our average cost per lead sits at $2.80 across very competitive local industries.\n\nThe ad was never the problem. The system around it was.\n\nHave you had a similar experience with paid ads not working?`,
      `Two businesses. Same industry. Same city. Same budget.\n\nOne gets 40 leads a month. The other gets 4.\n\nThe difference isn't the amount spent. It's the landing page.\n\nMost local businesses send paid traffic to their homepage - a page designed for existing customers, not new ones.\n\nA dedicated landing page built for conversion does one thing: turn visitors into leads.\n\nOne clear headline. One compelling offer. One form.\n\nWe build these for every client we work with. It's not glamorous but it's what makes the numbers work.\n\nIf you're running ads and wondering why the leads aren't coming in, start by looking at where the traffic is going.\n\nIs your landing page designed to convert or just to look nice?`,
      `The first hour after a lead comes in is worth more than the next 24.\n\nData consistently shows that response time is one of the biggest factors in whether a lead converts to a customer.\n\nCall within 5 minutes: dramatically higher conversion.\nCall within an hour: still solid.\nCall the next day: good luck.\n\nThis is especially true for local service businesses - the person who called three other contractors is not sitting around waiting.\n\nSo even if your lead generation is working perfectly, slow follow-up can kill your results.\n\nWe send clients an email the moment a lead comes in. The rest is up to them.\n\nWhat's your current average response time to a new lead?`,
      `No retainer. No long-term contract. No monthly fee.\n\nJust pay for the leads you actually receive.\n\nI know this sounds obvious. But most lead generation agencies still charge you regardless of results.\n\nThe pay-per-lead model only works if we can actually deliver. That accountability is the whole point.\n\nWe work with local businesses across a wide range of industries - tradespeople, clinics, consultants, service companies.\n\nAverage cost: $2.80 per qualified lead.\nTime to first lead: typically under 2 weeks.\nContracts: none.\n\nIf you're currently paying a retainer and not sure what you're actually getting for it, it might be worth running the numbers.\n\nHappy to share what the real cost per lead looks like in your industry if you drop it in the comments.`,
      `5 signs your lead generation is broken:\n\n1. You can't name your exact cost per lead\n2. Your agency reports on clicks and impressions, not leads\n3. Leads come in and immediately go cold\n4. You've been running ads for months with no clear feedback loop\n5. You're still paying a flat monthly fee with no performance guarantee\n\nNone of these are unfixable. But you need to know they're happening before you can fix them.\n\nThe biggest problem I see isn't bad campaigns. It's no accountability in the whole system - from ad to lead to follow-up.\n\nWhich of these feels most familiar to you right now?`,
      `Here's the real reason local businesses struggle with lead generation:\n\nThey're thinking about it like a big business.\n\nBig brands run campaigns for awareness. For reach. For brand building.\n\nLocal businesses need phone calls. Bookings. Enquiries.\n\nThose are completely different goals that need completely different strategies.\n\nA hyper-local Facebook campaign with a tight offer and a focused landing page will outperform a broad "brand awareness" campaign every time for a local service business.\n\nThe mistake is letting an agency treat you like a national brand when you need local results.\n\nWe work exclusively with local businesses because the approach is fundamentally different.\n\nWhat's the most frustrating thing you've been told by a marketing agency that didn't quite fit your business?`,
      `Organic content is great. SEO is worth investing in. Word of mouth is powerful.\n\nBut none of them give you leads next Tuesday.\n\nPaid lead generation - done right - is the only channel that can produce qualified enquiries within days of launching.\n\nFor a business that needs customers now, not in 6 months, that matters.\n\nWe typically see first leads within 2 weeks of going live for a new client.\n\nThe tradeoff is cost. But at $2.80 per lead with no retainer, the math usually works out favourably compared to most alternatives.\n\nLong-term, organic + paid working together is the ideal. Short-term, paid is the lever that moves fastest.\n\nAre you running both or relying on one?`,
      `The question isn't "how much does marketing cost?"\n\nIt's "what is a customer worth to you?"\n\nIf the average job for a contractor is $3,000 and they close 1 in 5 leads, a $14 cost per acquired customer is an extraordinary return.\n\nBut most local business owners never do this math. They just see "marketing spend" as a cost, not an investment with a measurable return.\n\nWhen you know your close rate and average deal value, lead generation becomes simple arithmetic.\n\nThat's why we charge per lead. We want you to be able to calculate exactly what each enquiry is worth to you before you commit to anything.\n\nDo you know what a single new customer is worth to your business over 12 months?`,
      `Most agencies measure success with vanity metrics.\n\nImpressions. Reach. Click-through rate. Cost per click.\n\nNone of those pay your invoices.\n\nThe only metric that matters for a local service business is: how many qualified people contacted you this month?\n\nEverything else is noise.\n\nWe don't report on clicks. We report on leads - real people who filled out a form or called because they want your service.\n\nIf your agency's monthly report doesn't start with that number, ask yourself why.\n\nWhat metric does your current marketing agency lead with in their reports?`,
      `There's a gap between "interested" and "qualified" that most lead gen companies ignore.\n\nInterested: someone who clicked an ad.\nQualified: someone who actually wants and can afford your service.\n\nWe define exactly what a qualified lead looks like for your business before we start. Location, budget, job type - whatever matters to you.\n\nYou only pay for leads that match. Everything else we filter out.\n\nThis is why cost per lead means nothing without a definition of what the lead actually is.\n\n$2.80 per qualified lead beats $0.50 per random contact every time.\n\nHow does your current agency define a "qualified lead" for your business?`,
      `Seasonality is one of the most underused levers in local business marketing.\n\nMost businesses run the same campaigns year-round and wonder why results vary.\n\nThe smart ones adjust their offer and messaging ahead of peak demand - not during it.\n\nA landscaper running "spring prep" ads in February will outperform one who starts in April when every competitor is also advertising.\n\nWe plan campaigns around your business cycle, not just around what's easiest to set up.\n\nThe cost per lead drops significantly when you're advertising before the rush, not into it.\n\nWhen is your busiest season, and how far ahead do you typically start marketing for it?`,
      `A high close rate fixes almost every other problem in your business.\n\nBad marketing? Still profitable if you close well.\nExpensive leads? Still worth it if you convert enough.\nSlow months? Less painful when the leads you do get convert at 50%+.\n\nMost local business owners focus on getting more leads. The faster lever is often converting the ones you already have better.\n\nWe see it constantly: a business with 20 leads a month closing 4 vs. a competitor closing 12 from the same number.\n\nSame marketing spend. Very different revenue.\n\nDo you track your lead-to-customer conversion rate? If so, what is it?`,
      `The worst client we ever had wasn't difficult. They were just never ready.\n\nGreat campaigns. Strong landing page. Solid leads coming in daily.\n\nBut they'd follow up three days later, lose half the leads before even speaking to them, and then complain the leads weren't good enough.\n\nLead generation only works when the sales process behind it works.\n\nBefore you invest in more leads, ask yourself: if 20 qualified prospects contacted you tomorrow, do you have a system to handle all of them?\n\nIf not, that's the problem to fix first.\n\nWhat does your lead follow-up process look like right now?`,
      `Google Ads vs. Meta Ads for local service businesses.\n\nNeither is universally better. It depends entirely on what you're selling.\n\nGoogle: high intent, more expensive, shorter sales cycle. People searching for "emergency plumber" are ready to buy now.\n\nMeta: lower intent, cheaper, needs a compelling offer. Better for services people don't know they need yet.\n\nFor most local trades and service businesses, Google is where you start. Meta scales what's already working.\n\nThe mistake is treating them as interchangeable. They're completely different conversations with completely different buyers.\n\nWhich platform have you had better results with in your industry?`,
      `The number one mistake I see local businesses make with paid ads:\n\nRunning traffic to their website instead of a dedicated landing page.\n\nYour website is designed to tell people about your business.\nA landing page is designed to do one thing: convert a visitor into a lead.\n\nOne goal. One offer. One form. Nothing else.\n\nWhen we switch clients from homepage traffic to a purpose-built landing page, conversion rates typically double or triple.\n\nSame ad spend. Double the leads. Half the cost per lead.\n\nIt's the single highest-leverage change most local businesses can make right now.\n\nAre you currently running paid traffic to your homepage or a dedicated page?`,
      `Referrals are great. Until they aren't.\n\nEvery business that relies on word-of-mouth has the same quiet fear: what happens when it slows down?\n\nA referral-based pipeline is unpredictable by design. You can't turn it on when you need it or scale it when you want to grow.\n\nPaid lead generation isn't a replacement for referrals. It's the safety net that makes your business predictable.\n\nWhen referrals are strong, the paid leads are a bonus. When referrals slow, you don't feel it.\n\nWe work with businesses that have great reputations but want to stop being at the mercy of whether someone recommends them this month.\n\nHow much of your current pipeline comes from referrals vs. outbound channels?`,
      `The best time to fix your lead generation is before you need it.\n\nMost businesses come to us in one of two situations:\n\n1. Slow period, need leads now, under pressure.\n2. Growing fast, need to scale the pipeline to match.\n\nSituation 1 is reactive. You're negotiating from a weak position.\nSituation 2 is strategic. You're investing from a position of momentum.\n\nThe businesses that build their lead gen system during good months are the ones who never really have bad months.\n\nIf your pipeline is healthy right now, that's actually the best time to add another channel - not when you desperately need it.\n\nAre you building your marketing infrastructure during the good times or waiting for a quiet spell?`,
      `What separates a $50 lead from a $5 lead?\n\nUsually the qualifier, not the channel.\n\nA form that asks three qualifying questions will produce fewer but better leads than a form that just asks for a name and email.\n\nFewer leads sounds bad. It isn't.\n\nA contractor who gets 8 qualified leads a month and closes 4 is doing better than one getting 40 unqualified leads and closing 3.\n\nLead quality is a design decision, not luck. You define what qualified means, and the system filters for it.\n\nWe work with every client to define their ideal lead before we build anything. It changes everything downstream.\n\nIf you could add one qualifier to your lead form tomorrow, what would it be?`,
      `There's a version of every local business that runs itself.\n\nNot completely. But close.\n\nLeads come in automatically. Follow-up is triggered immediately. The calendar fills without the owner chasing anyone.\n\nMost businesses are nowhere near this. Not because it's technically hard, but because no one has set it up.\n\nA landing page + paid ads + instant lead notification + a simple CRM takes maybe a week to build.\n\nThe ROI is every hour the owner stops spending on finding customers instead of serving them.\n\nHow much time do you personally spend each week on finding new customers?`,
      `Cold outreach is dead for local service businesses.\n\nNot because it doesn't work. Because there's a better option.\n\nPaid lead generation means people come to you having already expressed interest. They clicked. They read. They filled out the form.\n\nThat's a completely different conversation than calling someone who never asked to hear from you.\n\nClose rates on inbound leads are dramatically higher than cold outreach. The conversations are easier. The friction is lower.\n\nFor local businesses with a defined service area and a clear offer, inbound lead gen almost always beats cold outbound.\n\nHave you tried both? Which has worked better for your business?`,
      `Marketing agencies love complicated strategies.\n\nMulti-channel funnels. Brand storytelling. Awareness campaigns. Nurture sequences.\n\nLocal businesses don't need any of that.\n\nThey need: a clear offer, a landing page, an ad that reaches the right people, and a fast follow-up.\n\nThat's it. Four things.\n\nComplexity is where agencies hide their lack of results. Simple is where results actually live.\n\nWe've built campaigns for dozens of local businesses. The ones that work aren't complicated. They're clear, specific, and fast.\n\nWhat's the simplest version of your offer that would make someone pick up the phone?`,
      `The businesses growing fastest right now aren't spending more on marketing.\n\nThey're spending smarter.\n\nSpecifically: they know their numbers.\n\nCost per lead. Cost per sale. Average deal value. Customer lifetime value.\n\nWhen you know those four numbers, every marketing decision becomes obvious. You know exactly how much you can afford to pay per lead and still be profitable.\n\nMost business owners make marketing decisions based on how it feels. The ones winning make them based on math.\n\nDo you know your cost per acquired customer right now?`,
      `We turned down a client last month.\n\nNot because they were difficult. Because the math didn't work for them.\n\nThey wanted leads at $2.80, but their average sale was $180 and they closed 1 in 10.\n\nThat's $28 to acquire a $180 customer. Workable - but barely, once you factor in their costs.\n\nWe could have taken their money. But they would have churned in 60 days and told people it didn't work.\n\nHonesty upfront saves everyone time. Lead gen works when the unit economics work. Always check the math before you commit to any channel.\n\nHave you ever worked with a supplier who told you the truth when it wasn't in their interest to?`,
      `Your ad budget is not your marketing cost.\n\nYour marketing cost is your cost per acquired customer.\n\nA business spending $500/month and acquiring 10 customers has a $50 CAC.\nA business spending $5,000/month and acquiring 200 customers has a $25 CAC.\n\nThe second business is being more efficient with every pound, even though they're spending 10x more.\n\nThis is why "we can't afford marketing" is almost always a maths problem, not a budget problem.\n\nWhen the CAC is below the value of a customer, more spend = more profit. It's that simple.\n\nHave you calculated your CAC across different channels recently?`,
      `Landing pages fail for one of three reasons:\n\n1. The headline doesn't match what the ad promised.\n2. The form asks for too much, too soon.\n3. There's no reason to act now.\n\nFix all three and your conversion rate improves - almost every time.\n\nMatch the headline to the ad. Keep the form to three fields max. Add a real reason urgency (availability, offer deadline, capacity).\n\nWe've tested hundreds of variations across dozens of industries. These three things move the needle more than anything else - more than design, more than copy length, more than colour.\n\nWhich of these do you think is most often the problem?`,
      `Most business owners think they need more traffic.\n\nUsually, they need better conversion.\n\nIf 1,000 people visit your landing page and 10 fill out the form, that's a 1% conversion rate.\n\nDouble the conversion rate to 2% and you've doubled your leads without spending another pound on ads.\n\nImproving what you already have is almost always faster and cheaper than buying more traffic.\n\nWe audit landing pages before launching any new campaign. In most cases, the existing page is leaving half the leads on the table.\n\nWhat's your current landing page conversion rate? Most people don't know - which is itself the problem.`,
      `The clients who get the best results from lead generation all have one thing in common.\n\nThey're fast.\n\nFast to respond to leads. Fast to make decisions. Fast to approve changes we recommend.\n\nLead gen is not a set-and-forget system. The first 30 days are the most important - that's when we learn what's working and cut what isn't.\n\nSlowness in that window costs real money. Every week of delayed optimisation is a week of overpaying for leads.\n\nIf you're thinking about paid lead generation, the question isn't just "can I afford it?" It's "can I move fast enough to make it work?"\n\nWhat's the one thing that typically slows down decision-making in your business?`,
      `There are two types of marketing spend.\n\nSpend that buys you time (brand, SEO, content).\nSpend that buys you leads right now (paid acquisition).\n\nBoth are valuable. Neither replaces the other.\n\nThe mistake is spending on brand when you need leads now, or spending only on acquisition when you need long-term equity.\n\nMost local businesses should be spending 80% on acquisition and 20% on brand-building - at least until the pipeline is full and predictable.\n\nOnce you have consistent inbound, that ratio can shift.\n\nHow would you split your current marketing budget between short-term acquisition and long-term brand?`,
      `Here's a test for whether your agency is actually accountable:\n\nAsk them: what happens if leads don't come in this month?\n\nIf the answer is "we'll review the campaigns" - they're not accountable.\nIf the answer is "you don't pay" - they are.\n\nAccountability changes everything about how a team operates.\n\nWhen we only get paid for leads delivered, every decision we make is about results. There's no incentive to run campaigns that look good on paper but don't produce.\n\nThis is the only arrangement that truly aligns agency and client.\n\nHas an agency ever offered you a money-back guarantee or results-based pricing?`,
      `The hidden cost of bad leads isn't the money. It's the time.\n\nEvery unqualified lead your sales team chases is 30 minutes they didn't spend on someone who was actually going to buy.\n\nFor a business with two salespeople, 20 junk leads a week is 10 hours of wasted selling time. Every week.\n\nQuality over quantity isn't just a preference. It's an economic necessity.\n\nWe qualify leads before they hit your inbox. Location, budget, job type - whatever filter matters for your business.\n\nThe goal isn't more leads. It's more of the right leads.\n\nHow much time does your team spend each week following up on leads that go nowhere?`,
      `Every business has a leaky bucket problem.\n\nYou pour leads in at the top.\nThey leak out through slow follow-up, bad qualification, no nurture sequence.\n\nMost businesses try to fix the leak by pouring more leads in. It doesn't work.\n\nYou have to fix the bucket first.\n\nBefore we start any new campaign, we ask: what happens to a lead the moment it comes in? Is there a process? Is someone responsible? Is it tracked?\n\nIf the answer is "we call them when we get a chance" - we help them fix that first.\n\nMore leads into a broken process just means more waste.\n\nWhere in your sales process do most leads drop off?`,
      `Local businesses often underestimate how competitive their market is online.\n\nEvery competitor is running Google Ads. Everyone is trying to rank for the same keywords. The market is crowded.\n\nThe businesses that win aren't necessarily spending more. They're being more specific.\n\nSpecific audience. Specific offer. Specific landing page.\n\nA roofer targeting "flat roof replacement in [specific city]" with a landing page built for that exact search will outperform a generic "roofing services" campaign every time.\n\nSpecificity reduces competition and increases relevance - two things that lower cost per lead significantly.\n\nHow specific is your current targeting?`,
    ];

    const xTemplates = [
      `Retainer marketing = paying whether it works or not.\n\nPay-per-lead = paying only when it works.\n\nThe math isn't complicated.`,
      `Most local businesses overpay for leads by 5-10x. They just don't know it because nobody ever showed them the actual number.`,
      `$2.80 average cost per lead. No retainer. First leads in 2 weeks. No long-term contracts.\n\nThat's what accountable marketing looks like.`,
      `A plumber doesn't charge you if the pipe doesn't get fixed.\n\nYour marketing agency should think the same way.`,
      `Stop paying for clicks. Start paying for leads.`,
      `The best marketing metric isn't impressions or reach.\n\nIt's cost per closed deal.`,
      `Local businesses don't need more followers. They need more phone calls.`,
      `Paying a retainer with no guaranteed leads is like paying rent for an office you're not allowed to use.`,
      `If your agency can't tell you your exact cost per lead, that's the problem.`,
      `The fastest way to grow a local service business: pay only for what actually works.`,
      `Cold lead → no response for 24 hours → lost.\n\nCall within the first hour. It changes everything.`,
      `Most Facebook ad campaigns fail because of the landing page, not the ad.\n\nSend traffic to a purpose-built page, not your homepage.`,
      `You don't have a marketing problem.\n\nYou have a measurement problem.`,
      `First leads in 2 weeks.\nNo setup fee.\nNo retainer.\nPay per lead.\n\nWhy would you ever pay a flat monthly fee again?`,
      `The agency gets paid regardless of results.\n\nThat's the whole problem with the retainer model.`,
      `Your homepage is not a landing page.\n\nStop sending ad traffic there.`,
      `Qualified lead in your inbox > 10,000 impressions on a post.`,
      `If you can't calculate your cost per acquired customer, you can't scale.`,
      `Slow follow-up is the most expensive mistake in local business sales.`,
      `The businesses growing fastest right now know three numbers:\nCost per lead.\nClose rate.\nAverage deal value.\n\nEverything else is noise.`,
      `A $2.80 lead that converts is worth more than a $0.30 click that disappears.`,
      `Lead gen works when the math works.\n\nAlways check the math before you commit to any channel.`,
      `No contract. No retainer. No risk.\n\nJust leads.`,
      `The best time to build your pipeline is when you don't need it.`,
      `More traffic is not the answer.\n\nBetter conversion is.`,
      `Google Ads = high intent buyers searching right now.\nFacebook Ads = low intent buyers who need a reason.\n\nKnow which one your business needs.`,
      `Your agency should be more nervous about results than you are.\n\nIf they're not, the incentives are wrong.`,
      `Referrals are unpredictable by design.\n\nPaid leads are predictable by design.\n\nYou need both.`,
      `The goal isn't more leads.\n\nIt's more of the right leads.`,
      `If your landing page has a navigation menu, you're losing leads.`,
    ];

    const pool = type === "linkedin_post" ? linkedinTemplates : xTemplates;

    const { data: recent } = await supabase
      .from("content_approvals")
      .select("content")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(pool.length - 1);

    const recentContents = new Set((recent ?? []).map(r => r.content.slice(0, 60)));
    const available = pool.filter(t => !recentContents.has(t.slice(0, 60)));
    const pickFrom = available.length > 0 ? available : pool;
    const text = pickFrom[Math.floor(Math.random() * pickFrom.length)];

    const { error: dbErr } = await supabase.from("content_approvals").insert({
      type,
      content: text,
      status: "pending",
    });

    if (dbErr) return res.status(500).json({ error: dbErr.message });
    return res.status(200).json({ success: true, content: text });
  }

  // ── Update lead (status + notes) ─────────────────────────────────────────
  if (req.method === "POST" && action === "update-lead") {
    const { leadId, lead_status, lead_notes } = req.body ?? {};
    if (!leadId) return res.status(400).json({ error: "leadId required" });
    const updates: Record<string, unknown> = {};
    if (lead_status !== undefined) updates.lead_status = lead_status;
    if (lead_notes !== undefined) updates.lead_notes = lead_notes;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "Nothing to update" });
    const { error } = await supabase.from("leads").update(updates).eq("id", leadId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Invoice queue: clients due for invoicing with lead counts ─────────────
  if (req.method === "GET" && action === "invoice-queue") {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, company, email, price_per_lead, currency, last_invoiced_at, language, token")
      .order("company", { ascending: true });

    if (!clients) return res.status(200).json({ queue: [] });

    const queue = await Promise.all(clients.map(async (c) => {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("price")
        .eq("client_id", c.id)
        .gte("created_at", monthStart.toISOString());

      const leads = leadsData ?? [];
      const amount = leads.reduce((sum, l) => sum + (l.price != null ? Number(l.price) : c.price_per_lead), 0);

      const alreadyInvoiced = (() => {
        if (!c.last_invoiced_at) return false;
        const d = new Date(c.last_invoiced_at);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })();

      return { ...c, leads_count: leads.length, amount_due: amount, already_invoiced: alreadyInvoiced };
    }));

    return res.status(200).json({ queue: queue.filter(c => c.leads_count > 0) });
  }

  // ── Payment reminders: list unpaid invoices > 7 days ─────────────────────
  if (req.method === "GET" && action === "check-reminders") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, client_id, month_label, amount, currency, sent_at, paid_at, reminder_7d_at, reminder_14d_at, clients(name, company, email)")
      .is("paid_at", null)
      .lte("sent_at", sevenDaysAgo)
      .order("sent_at", { ascending: true });

    return res.status(200).json({ reminders: invoices ?? [] });
  }

  // ── Send payment reminder ─────────────────────────────────────────────────
  if (req.method === "POST" && action === "send-payment-reminder") {
    const { invoiceId, reminderType } = req.body ?? {};
    if (!invoiceId || !reminderType) return res.status(400).json({ error: "invoiceId and reminderType required" });

    const { data: inv } = await supabase
      .from("invoices")
      .select("id, client_id, month_label, amount, currency, stripe_link, clients(name, company, email, language, token)")
      .eq("id", invoiceId)
      .single();

    if (!inv) return res.status(404).json({ error: "Invoice not found" });
    const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients as { name: string; company: string; email: string; language: string; token: string };

    const first = client.name.split(" ")[0];
    const isDa = (client.language ?? "en") === "da";
    const dashboardUrl = `https://marketyleadgen.com/dashboard/${client.token}`;
    const payUrl = (inv as { stripe_link?: string | null }).stripe_link ?? dashboardUrl;

    const html = `<!DOCTYPE html>
<html lang="${client.language ?? "en"}">
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
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#0f172a;">${isDa ? `Påmindelse: Faktura for ${inv.month_label}` : `Reminder: Invoice for ${inv.month_label}`}</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">${isDa ? `Hej ${first}, vi har endnu ikke modtaget betaling for din faktura for ${inv.month_label}. Beløbet er` : `Hi ${first}, we haven't received payment for your ${inv.month_label} invoice yet. The amount due is`} <strong style="color:#0f172a;">${money(Number(inv.amount), inv.currency)}</strong>.</p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="#5B21F4" style="border-radius:50px;">
          <a href="${payUrl}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;white-space:nowrap;">${isDa ? "Betal nu" : "Pay now"}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;max-width:500px;width:100%;">
    <tr><td bgcolor="#ede9fe" style="border-radius:50px;padding:14px 28px;text-align:center;">
      <span style="font-size:14px;color:#4c1d95;">${isDa ? "Spørgsmål? Svar på denne email." : "Questions? Just reply to this email."}</span>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

    if (!process.env.SPACEMAIL_PASSWORD) return res.status(500).json({ error: "Email not configured" });

    await sendEmail({
      to: client.email,
      subject: isDa ? `Påmindelse: Faktura ${inv.month_label} - ${money(Number(inv.amount), inv.currency)}` : `Payment reminder: ${inv.month_label} invoice - ${money(Number(inv.amount), inv.currency)}`,
      html,
      replyTo: "info@marketyleadgen.com",
    });

    const reminderField = reminderType === "7d" ? "reminder_7d_at" : "reminder_14d_at";
    await supabase.from("invoices").update({ [reminderField]: new Date().toISOString() }).eq("id", invoiceId);

    return res.status(200).json({ success: true });
  }

  // ── Bulk approve content ──────────────────────────────────────────────────
  if (req.method === "POST" && action === "bulk-approve-content") {
    const { ids } = req.body ?? {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "ids array required" });
    const { error } = await supabase.from("content_approvals")
      .update({ status: "approved" })
      .in("id", ids);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Update contact pipeline status ────────────────────────────────────────
  if (req.method === "POST" && action === "update-contact-pipeline") {
    const { id, pipeline_status } = req.body ?? {};
    if (!id || !pipeline_status) return res.status(400).json({ error: "id and pipeline_status required" });
    const { error } = await supabase.from("contact_submissions").update({ pipeline_status }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Update onboarding checklist steps ────────────────────────────────────
  if (req.method === "POST" && action === "update-onboarding-steps") {
    const { clientId, steps } = req.body ?? {};
    if (!clientId || !steps) return res.status(400).json({ error: "clientId and steps required" });
    const { error } = await supabase.from("clients").update({ onboarding_steps: steps }).eq("id", clientId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Update client deal value ──────────────────────────────────────────────
  if (req.method === "POST" && action === "update-deal-value") {
    const { clientId, deal_value } = req.body ?? {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });
    const val = deal_value === null || deal_value === "" ? null : Number(deal_value);
    const { error } = await supabase.from("clients").update({ deal_value: val }).eq("id", clientId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // ── Nimble: research company website and personalize outreach ───────────────
  if (req.method === "POST" && action === "research-company") {
    const { homepage, companyName, industry } = req.body ?? {};
    if (!homepage) return res.status(400).json({ error: "homepage required" });

    const nimbleKey = process.env.NIMBLE_API_KEY;
    if (!nimbleKey) return res.status(500).json({ error: "Nimble API key not configured" });

    // Scrape the company homepage
    let siteContent = "";
    try {
      const nimbleRes = await fetch("https://api.webit.live/api/v1/realtime/web", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(`${nimbleKey}:${nimbleKey}`).toString("base64"),
        },
        body: JSON.stringify({
          url: homepage,
          render: false,
          format: "markdown",
          country: "GB",
        }),
      });
      const nimbleData = await nimbleRes.json();
      siteContent = nimbleData?.parsing?.markdown ?? nimbleData?.data?.markdown ?? nimbleData?.data?.html ?? "";
      // Trim to avoid huge payloads
      siteContent = siteContent.slice(0, 3000);
    } catch (e) {
      return res.status(500).json({ error: "Failed to fetch company website", details: String(e) });
    }

    if (!siteContent) return res.status(422).json({ error: "Could not extract content from website" });

    // Use Claude to generate a personalized message from the scraped content
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are writing a cold outreach email for Markety, a pay-per-lead agency. We help small local businesses get more clients through Google and Facebook ads, paying only per lead received - no fixed monthly price. First 30 days are free.

I scraped the homepage of a ${industry ?? "local business"} called "${companyName ?? "this company"}". Here is what their website says:

---
${siteContent}
---

Write a short, personal cold email in English. Rules:
- 3-4 short paragraphs max
- Reference something SPECIFIC from their website (a service, their tagline, a specific thing they do) in the first or second line - make it feel like you actually looked at their business
- Mention Markety's pay-per-lead model and that the first 30 days are free
- Conversational tone, not corporate
- Do NOT use placeholders like [name] - just write naturally without a name if you don't have one
- End with a soft CTA like "Reply if this sounds interesting" or similar
- Return ONLY the email body text, no subject line, no "Subject:", no greeting prefix`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const personalizedBody = (msg.content[0] as { type: string; text: string }).text.trim();
    return res.status(200).json({ success: true, body: personalizedBody });
  }

  if (req.method === "POST" && action === "delete-contact") {
    const { id } = req.body ?? {};
    if (!id) return res.status(400).json({ error: "id required" });
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === "POST" && action === "delete-content") {
    const { id } = req.body ?? {};
    if (!id) return res.status(400).json({ error: "id required" });
    const { error } = await supabase.from("content_approvals").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("[ADMIN] Unexpected error:", err);
    // Alert admin by email on unexpected 500s
    if (process.env.SPACEMAIL_PASSWORD) {
      sendEmail({
        to: "info@marketyleadgen.com",
        subject: `[Markety Error] Admin API error - action: ${(req.query.action ?? req.body?.action) as string ?? "unknown"}`,
        html: `<pre style="font-family:monospace;font-size:12px;padding:16px;">${String(err)}\n\nAction: ${(req.query.action ?? req.body?.action) as string ?? "unknown"}\nBody: ${JSON.stringify(req.body ?? {}).slice(0, 500)}</pre>`,
      }).catch(() => {});
    }
    return res.status(500).json({ error: "Internal server error", details: String(err) });
  }
}
