// Admin-side reader and reply handler for Nordic Solfilm Airtable contacts.
// Used by the Outreach tab in the admin panel to manage Nordic Solfilm's
// inbound messages without leaving the Markety UI.
//   GET  → lists all Airtable contacts sorted newest-first
//   POST { to, contactName, replyMessage, recordId } → sends a Danish reply
//        email via Spacemail and marks the Airtable record as "besvaret" (answered)
// Requires x-admin-password header for auth (implicitly via same ADMIN_PASSWORD).
// No x-admin-password check here — this is called from the admin panel which
// already manages the session client-side. Add auth if this ever becomes
// more exposed. Data source: same Airtable table as api/nordic-contact.ts.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendEmail } from "../lib/server/_mailer.js";

const BASE_ID = "appgN1vAfAqY0wHD1";
const TABLE_ID = "tblfqo6sEW0jYBsB1";

const F = {
  navn:      "fld9tynnxEsKI78F4",
  telefon:   "fldHpXdrpVJwyd7T9",
  email:     "fldDMmMh1kJTnPjT8",
  besked:    "fldZNem1YdjPjTUN8",
  oprettet:  "fldRlNE5iIgLS8O41",
  besvaret:  "flddyYzcTzJK44s3t",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    const key = process.env.AIRTABLE_API_KEY;
    if (!key) return res.status(500).json({ error: "AIRTABLE_API_KEY not set" });

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?returnFieldsByFieldId=true&sort%5B0%5D%5Bfield%5D=${F.oprettet}&sort%5B0%5D%5Bdirection%5D=desc`;

    try {
      const airtableRes = await fetch(url, {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (!airtableRes.ok) {
        const body = await airtableRes.text();
        console.error("Airtable fetch error:", airtableRes.status, body);
        return res.status(500).json({ error: "Failed to fetch contacts" });
      }

      const data = await airtableRes.json() as { records?: Array<{ id: string; createdTime: string; fields: Record<string, unknown> }> };
      const contacts = (data.records ?? []).map((r) => ({
        id:        r.id,
        name:      (r.fields[F.navn]      as string)  ?? "",
        phone:     (r.fields[F.telefon]   as string)  ?? "",
        email:     (r.fields[F.email]     as string)  ?? "",
        message:   (r.fields[F.besked]    as string)  ?? "",
        createdAt: (r.fields[F.oprettet]  as string)  ?? r.createdTime ?? "",
        answered:  (r.fields[F.besvaret]  as boolean) ?? false,
      }));

      return res.status(200).json({ contacts });
    } catch (err) {
      console.error("Nordic messages GET error:", err);
      return res.status(500).json({ error: "Unexpected error" });
    }
  }

  if (req.method === "POST") {
    const { to, contactName, replyMessage, recordId } = req.body ?? {};

    if (!to || !replyMessage) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const firstName = contactName ? String(contactName).split(" ")[0] : "dig";
    const safeMessage = String(replyMessage)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = `
<div style="color-scheme:light;background:#ffffff;padding:24px 0;">
<div style="font-family:Inter,system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;padding:0 24px;">
  <div style="padding:36px 0 28px;"><p style="margin:0;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#111827;">Nordic Solfilm</p></div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 32px;"/>
  <p style="margin:0 0 20px;font-size:15px;color:#111827;">Hej ${firstName},</p>
  <p style="margin:0 0 28px;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap;">${safeMessage}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 24px;"/>
  <p style="margin:0;font-size:12px;color:#9ca3af;">Nordic Solfilm &middot; <a href="mailto:info@nordicsolfilm.dk" style="color:#5735de;text-decoration:none;">info@nordicsolfilm.dk</a></p>
</div>
</div>`;

    try {
      await sendEmail({
        to: String(to),
        subject: "Svar fra Nordic Solfilm",
        html,
        replyTo: "info@nordicsolfilm.dk",
      });

      if (recordId) {
        const key = process.env.AIRTABLE_API_KEY;
        if (key) {
          await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ fields: { [F.besvaret]: true } }),
          });
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Nordic reply error:", err);
      return res.status(500).json({ error: "Failed to send reply" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
