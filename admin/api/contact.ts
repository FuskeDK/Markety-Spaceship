// Contact form handler for the Markety website (/contact page).
// Accepts POST { name, email, company, cvr, companyDescription, goals, message }.
// On success:
//   1. Saves the submission to the `contact_submissions` table in Supabase.
//   2. Sends a confirmation email to the prospect.
//   3. Syncs the contact to HubSpot CRM via _hubspot.ts.
// No auth required - this is a public-facing form. The frontend at
// src/pages/Contact.tsx posts here; on success it navigates to /contact/sent.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "../lib/server/_mailer.js";
import { upsertContact } from "../lib/server/_hubspot.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name, email, company, cvr, companyDescription, goals, message,
  } = req.body ?? {};

  if (!name || !email || !companyDescription || !goals) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Save to Supabase
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    supabase.from("contact_submissions").insert({
      name, email,
      company: company ?? null,
      cvr: cvr ?? null,
      company_description: companyDescription,
      goals,
      message: message ?? null,
    }).then(({ error }) => { if (error) console.error("Supabase contact insert:", error); });
  }

  const first = (name as string).split(" ")[0];

  const customerHtml = `<!DOCTYPE html>
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

      <h1 style="margin:0 0 6px;font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-0.03em;">Hi, ${first}</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.5;">We have received your message and will be in touch within one business day.</p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 26px;">

      <h2 style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0f172a;">What happens next?</h2>
      <ul style="margin:0 0 6px;padding-left:18px;">
        <li style="font-size:14px;color:#374151;margin-bottom:6px;">We review your details and put together a plan</li>
        <li style="font-size:14px;color:#374151;">You will hear from us within one business day</li>
      </ul>

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
    await sendEmail({
      to: email,
      subject: "We got your message",
      html: customerHtml,
    });

    try {
      await upsertContact({ name, email, company, cvr, companyDescription, goals, message });
    } catch (err) {
      console.error("HubSpot upsertContact threw:", err);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
