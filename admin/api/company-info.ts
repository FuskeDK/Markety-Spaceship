// Company info onboarding form handler — called from the CompanyInfoForm page
// after a prospect fills in their details. This is the main new-client
// intake flow. On POST it:
//   1. Auto-creates a new row in the `clients` table with a unique dashboard
//      token (randomUUID) and default price of $2.80/lead.
//   2. Links the optional `contact_token` so api/check-submission.ts can
//      detect whether this prospect has already submitted.
//   3. Emails the admin with the full submission + a direct Reply button.
//   4. Emails the customer a "your dashboard is ready" confirmation with their
//      personal dashboard URL.
// No admin auth required. Used by: src/pages/CompanyInfoForm.tsx.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { sendEmail } from "../lib/server/_mailer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    token, name, email, company, message, currentDate,
    companyName, cvr, companyDescription, goals,
  } = req.body ?? {};

  if (!companyName || !companyDescription || !goals) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Auto-create client in Supabase
  let dashboardUrl = "";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const clientToken = randomUUID();
    await supabase.from("clients").insert({
      token: clientToken,
      contact_token: token ?? null,
      name: name ?? companyName,
      company: companyName,
      email: email ?? "",
      price_per_lead: 2.80,
      currency: "USD",
    });
    const siteUrl = process.env.SITE_URL ?? "https://marketyleadgen.com";
    dashboardUrl = `${siteUrl}/dashboard/${clientToken}`;
  }

  const adminHtml = `
<div style="background:#0f0f14;padding:24px 0;">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;background:#0f0f14;padding:0 24px;">
  <div style="padding:36px 0 28px;">
    <p style="margin:0;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#f9fafb;">Markety</p>
  </div>
  <hr style="border:none;border-top:1px solid #1f2937;margin:0 0 32px;" />
  <p style="margin:0 0 28px;font-size:15px;color:#d1d5db;line-height:1.6;">New submission from <strong style="color:#f9fafb;">${name ?? companyName}</strong>${email ? ` &lt;<a href="mailto:${email}" style="color:#6836F4;text-decoration:none;">${email}</a>&gt;` : ""}.</p>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
    <tr><td style="width:120px;padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">Name</td><td style="padding:7px 0;font-size:13px;color:#f9fafb;font-weight:500;">${name ?? "-"}</td></tr>
    <tr><td style="padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">Email</td><td style="padding:7px 0;font-size:13px;"><a href="mailto:${email}" style="color:#6836F4;text-decoration:none;">${email ?? "-"}</a></td></tr>
    <tr><td style="padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">Company</td><td style="padding:7px 0;font-size:13px;color:#f9fafb;">${company || companyName}</td></tr>
    ${cvr ? `<tr><td style="padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">CVR</td><td style="padding:7px 0;font-size:13px;color:#f9fafb;">${cvr}</td></tr>` : ""}
    <tr><td style="padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">Submitted</td><td style="padding:7px 0;font-size:13px;color:#6b7280;">${currentDate ?? "-"}</td></tr>
  </table>
  ${message ? `<p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Message</p><p style="margin:0 0 32px;font-size:14px;color:#d1d5db;line-height:1.75;white-space:pre-wrap;border-left:2px solid #1f2937;padding-left:14px;">${message}</p>` : ""}
  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">What they do</p>
  <p style="margin:0 0 28px;font-size:14px;color:#d1d5db;line-height:1.75;white-space:pre-wrap;">${companyDescription}</p>
  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Their goals</p>
  <p style="margin:0 0 32px;font-size:14px;color:#d1d5db;line-height:1.75;white-space:pre-wrap;">${goals}</p>
  ${dashboardUrl ? `<hr style="border:none;border-top:1px solid #1f2937;margin:0 0 28px;" /><p style="margin:0 0 6px;font-size:13px;color:#d1d5db;">Client dashboard:</p><p style="margin:0 0 32px;"><a href="${dashboardUrl}" style="color:#6836F4;font-size:13px;text-decoration:none;word-break:break-all;">${dashboardUrl}</a></p>` : ""}
  <table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#2563eb" style="border-radius:8px;border:1.5px solid #2563eb;">
    <a href="mailto:${email}" style="display:inline-block;padding:11px 22px;font-size:15px;font-weight:800;font-family:Inter,system-ui,-apple-system,sans-serif;color:#ffffff;text-decoration:none;white-space:nowrap;border-radius:8px;">Reply to ${name ?? "lead"} →</a>
  </td></tr></table>
  <hr style="border:none;border-top:1px solid #1f2937;margin:36px 0 24px;" />
  <p style="margin:0;font-size:12px;color:#374151;">Markety &middot; marketyleadgen.com</p>
</div>
</div>`;

  const customerHtml = `
<div style="color-scheme:light;background:#ffffff;padding:24px 0;">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;padding:0 24px;">
  <div style="padding:36px 0 28px;">
    <p style="margin:0;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#111827;">Markety</p>
  </div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 32px;" />
  <p style="margin:0 0 20px;font-size:15px;color:#111827;">Hi ${name ?? "there"},</p>
  <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.75;">Thanks for sending everything over. We have your details and will be in touch soon to get your campaign set up.</p>
  <p style="margin:0 0 28px;font-size:14px;color:#374151;line-height:1.75;">Once you're live, your dashboard is where you'll see every lead we deliver in real time.</p>
  <table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#2563eb" style="border-radius:8px;border:1.5px solid #2563eb;">
    <a href="${dashboardUrl}" style="display:inline-block;padding:11px 22px;font-size:15px;font-weight:800;font-family:Inter,system-ui,-apple-system,sans-serif;color:#ffffff;text-decoration:none;white-space:nowrap;border-radius:8px;">View your dashboard →</a>
  </td></tr></table>
  <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">Or open this link: <a href="${dashboardUrl}" style="color:#6836F4;text-decoration:none;word-break:break-all;">${dashboardUrl}</a></p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 24px;" />
  <p style="margin:0;font-size:12px;color:#9ca3af;">Keep this link safe - it's personal to you. Questions? <a href="mailto:info@marketyleadgen.com" style="color:#6836F4;text-decoration:none;">info@marketyleadgen.com</a></p>
</div>
</div>`;

  try {
    // Admin notification
    try {
      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL ?? "info@marketyleadgen.com",
        subject: `New submission: ${companyName}${name ? ` - ${name}` : ""}`,
        html: adminHtml,
        replyTo: email,
      });
    } catch (err) {
      console.error("Admin email error:", err);
    }

    // Customer email
    if (email && dashboardUrl) {
      await sendEmail({
        to: email,
        subject: "Your Markety dashboard is ready",
        html: customerHtml,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Company info handler error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
