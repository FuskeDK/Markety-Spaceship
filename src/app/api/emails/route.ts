// IMAP inbox reader for the admin panel email tab. Connects directly to
// the Spacemail inbox (mail.spacemail.com:993) using ImapFlow.
// Supports three operations (all require x-admin-password header):
//   GET (no uid)     - list the last 50 emails (uid, subject, from, date, seen flag)
//   GET ?uid=<n>     - fetch and parse the full HTML/text body of one email
//   DELETE { uid }   - delete one message by UID
//   DELETE { all }   - clear the entire inbox
// Used by: src/app/admin/page.tsx (Emails tab).
import { NextRequest, NextResponse } from "next/server";

import { timingSafeEqual } from "crypto";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

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


function makeClient() {
  return new ImapFlow({
    host: "mail.spacemail.com",
    port: 993,
    secure: true,
    auth: { user: "info@marketyleadgen.com", pass: process.env.SPACEMAIL_PASSWORD },
    logger: false,
  });
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.SPACEMAIL_PASSWORD) return NextResponse.json({ error: "Mail not configured" }, { status: 500 });

  const uid = new URL(req.url).searchParams.get("uid");

  // ── GET list ──────────────────────────────────────────────────────────────
  if (!uid) {
    const client = makeClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      const emails: object[] = [];
      try {
        const status = await client.status("INBOX", { messages: true });
        const total = status.messages ?? 0;
        if (total > 0) {
          const from = Math.max(1, total - 49);
          for await (const msg of client.fetch(`${from}:${total}`, { uid: true, flags: true, envelope: true })) {
            const env = msg.envelope;
            if (!env) continue;
            emails.push({
              uid: msg.uid,
              subject: env.subject ?? "(no subject)",
              from: env.from?.[0] ? `${env.from[0].name ?? ""} <${env.from[0].address}>`.trim() : "",
              date: env.date?.toISOString() ?? null,
              seen: msg.flags?.has("\\Seen") ?? false,
            });
          }
        }
      } finally { lock.release(); }
      await client.logout();
      return NextResponse.json({ emails: emails.reverse() });
    } catch (err) {
      console.error("IMAP fetch error:", err);
      try { await client.logout(); } catch {}
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }
  }

  // ── GET single email body ─────────────────────────────────────────────────
  const uidNum = Number(uid);
  if (!uidNum) return NextResponse.json({ error: "Invalid uid" }, { status: 400 });
  const client = makeClient();
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let html: string | null = null;
    let text: string | null = null;
    try {
      const dl = await client.download(String(uidNum), undefined, { uid: true });
      if (dl) {
        const parsed = await simpleParser(dl.content);
        html = parsed.html || null;
        text = parsed.text || null;
      }
    } finally { lock.release(); }
    await client.logout();
    return NextResponse.json({ html, text });
  } catch (err) {
    console.error("IMAP body error:", err);
    try { await client.logout(); } catch {}
    return NextResponse.json({ error: "Failed to fetch email body" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.SPACEMAIL_PASSWORD) return NextResponse.json({ error: "Mail not configured" }, { status: 500 });

  const { uid, all } = await req.json().catch(() => ({}));
  if (!uid && !all) return NextResponse.json({ error: "uid or all required" }, { status: 400 });
  const client = makeClient();
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      if (all) {
        const status = await client.status("INBOX", { messages: true });
        if ((status.messages ?? 0) > 0) await client.messageDelete("1:*", { uid: false });
      } else {
        await client.messageDelete(String(uid), { uid: true });
      }
    } finally { lock.release(); }
    await client.logout();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("IMAP delete error:", err);
    try { await client.logout(); } catch {}
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
