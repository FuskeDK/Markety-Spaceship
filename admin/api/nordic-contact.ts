// Contact form handler for Nordic Solfilm (nordicsolfilm.dk) - a Markety
// client with their own contact page hosted on that domain.
// Accepts POST { name, phone, email, message }. On success:
//   1. Sends a Danish confirmation email to the prospect.
//   2. Writes the contact to Airtable (the "Kontakter" table) via _airtable.ts.
// No Supabase usage - Nordic Solfilm's contacts live in Airtable only.
// The admin can read and reply to these from the admin panel via
// api/nordic-messages.ts. CORS is open so nordicsolfilm.dk can POST here.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendEmail } from "../lib/server/_mailer.js";
import { addNordicContact } from "../lib/server/_airtable.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, phone, email, message } = req.body ?? {};

  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const customerHtml = `
<div style="color-scheme:light;background:#ffffff;padding:24px 0;">
<div style="font-family:Inter,system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;padding:0 24px;">
  <div style="padding:36px 0 28px;"><p style="margin:0;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#111827;">Nordic Solfilm</p></div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 32px;"/>
  <p style="margin:0 0 20px;font-size:15px;color:#111827;">Hej ${name.split(" ")[0]},</p>
  <p style="margin:0 0 28px;font-size:14px;color:#374151;line-height:1.75;">Tak for din henvendelse. Vi har modtaget din besked og vender tilbage inden for én hverdag.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 24px;"/>
  <p style="margin:0;font-size:12px;color:#9ca3af;">Spørgsmål? <a href="mailto:info@nordicsolfilm.dk" style="color:#5735de;text-decoration:none;">info@nordicsolfilm.dk</a></p>
</div>
</div>`;

  try {
    await sendEmail({
      to: email,
      subject: "Vi har modtaget din besked - Nordic Solfilm",
      html: customerHtml,
    });

    try {
      await addNordicContact({ name, phone, email, message });
    } catch (err) {
      console.error("Airtable error:", err);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Nordic contact handler error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
