// IMAP inbox reader for the admin panel email tab. Connects directly to
// the Spacemail inbox (mail.spacemail.com:993) using ImapFlow.
// Supports three operations (all require x-admin-password header):
//   GET (no uid)     — list the last 50 emails (uid, subject, from, date, seen flag)
//   GET ?uid=<n>     — fetch and parse the full HTML/text body of one email
//   DELETE { uid }   — delete one message by UID
//   DELETE { all }   — clear the entire inbox
// Used by: src/pages/Admin.tsx (Emails tab).
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

function makeClient() {
  return new ImapFlow({
    host: "mail.spacemail.com",
    port: 993,
    secure: true,
    auth: { user: "info@marketyleadgen.com", pass: process.env.SPACEMAIL_PASSWORD },
    logger: false,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = req.headers["x-admin-password"] as string;
  if (!pw || pw !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  if (!process.env.SPACEMAIL_PASSWORD) return res.status(500).json({ error: "Mail not configured" });

  // ── GET list ──────────────────────────────────────────────────────────────
  if (req.method === "GET" && !req.query.uid) {
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
            emails.push({
              uid: msg.uid,
              subject: env.subject ?? "(no subject)",
              from: env.from?.[0] ? `${env.from[0].name ?? ""} <${env.from[0].address}>`.trim() : "",
              date: env.date?.toISOString() ?? null,
              seen: msg.flags.has("\\Seen"),
            });
          }
        }
      } finally { lock.release(); }
      await client.logout();
      return res.status(200).json({ emails: emails.reverse() });
    } catch (err) {
      console.error("IMAP fetch error:", err);
      try { await client.logout(); } catch {}
      return res.status(500).json({ error: "Failed to fetch emails" });
    }
  }

  // ── GET single email body ─────────────────────────────────────────────────
  if (req.method === "GET" && req.query.uid) {
    const uid = Number(req.query.uid);
    if (!uid) return res.status(400).json({ error: "Invalid uid" });
    const client = makeClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      let html: string | null = null;
      let text: string | null = null;
      try {
        const dl = await client.download(String(uid), undefined, { uid: true });
        if (dl) {
          const parsed = await simpleParser(dl.content);
          html = parsed.html || null;
          text = parsed.text || null;
        }
      } finally { lock.release(); }
      await client.logout();
      return res.status(200).json({ html, text });
    } catch (err) {
      console.error("IMAP body error:", err);
      try { await client.logout(); } catch {}
      return res.status(500).json({ error: "Failed to fetch email body" });
    }
  }

  // ── DELETE one or all ─────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { uid, all } = req.body ?? {};
    if (!uid && !all) return res.status(400).json({ error: "uid or all required" });
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
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("IMAP delete error:", err);
      try { await client.logout(); } catch {}
      return res.status(500).json({ error: "Failed to delete" });
    }
  }

  return res.status(405).end();
}
