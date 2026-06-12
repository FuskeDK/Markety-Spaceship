// Contact form handler for Nordic Solfilm (nordicsolfilm.dk).
// Accepts POST { name, phone, email, message }. On success:
//   1. Sends a Danish confirmation email to the prospect.
//   2. Writes the contact to Airtable (the "Kontakter" table) via _airtable.ts.
// CORS is open so nordicsolfilm.dk can POST here.
import { NextRequest, NextResponse } from "next/server";

import { addNordicContact } from "@/lib/server/_airtable";
import { sendEmail } from "@/lib/server/_mailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, phone, email, message } = body;

  if (!name || !phone || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
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
      subject: "Vi har modtaget din besked – Nordic Solfilm",
      html: customerHtml,
    });

    try {
      await addNordicContact({ name, phone, email, message });
    } catch (err) {
      console.error("Airtable error:", err);
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("Nordic contact handler error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500, headers: corsHeaders });
  }
}
