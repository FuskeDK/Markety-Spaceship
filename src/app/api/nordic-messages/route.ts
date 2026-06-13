// Admin-side reader and reply handler for Nordic Solfilm Airtable contacts.
//   GET  → lists all Airtable contacts sorted newest-first
//   POST { to, contactName, replyMessage, recordId } → sends a Danish reply email
//        and marks the Airtable record as "besvaret" (answered)
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

import { sendEmail } from "@/lib/server/_mailer";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-password",
};

function isAuthed(req: NextRequest): boolean {
  const pw = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!pw || !expected) return false;
  try {
    return timingSafeEqual(Buffer.from(pw), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) return NextResponse.json({ error: "AIRTABLE_API_KEY not set" }, { status: 500, headers: corsHeaders });

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?returnFieldsByFieldId=true&sort%5B0%5D%5Bfield%5D=${F.oprettet}&sort%5B0%5D%5Bdirection%5D=desc`;

  try {
    const airtableRes = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!airtableRes.ok) {
      const body = await airtableRes.text();
      console.error("Airtable fetch error:", airtableRes.status, body);
      return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500, headers: corsHeaders });
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

    return NextResponse.json({ contacts }, { headers: corsHeaders });
  } catch (err) {
    console.error("Nordic messages GET error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { to, contactName, replyMessage, recordId } = body;

  if (!to || !replyMessage) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
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

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("Nordic reply error:", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500, headers: corsHeaders });
  }
}
