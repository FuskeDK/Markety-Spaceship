// Kør: node send-leads.mjs

import fs from "fs";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";

// Læs .env.local automatisk
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !key.startsWith("#")) {
      process.env[key.trim()] ??= rest.join("=").trim();
    }
  }
}

const PASSWORD = process.env.SPACEMAIL_PASSWORD;
if (!PASSWORD) {
  console.error("Mangler SPACEMAIL_PASSWORD i .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "mail.spacemail.com",
  port: 465,
  secure: true,
  auth: { user: "info@marketyleadgen.com", pass: PASSWORD },
});

const imap = new ImapFlow({
  host: "mail.spacemail.com",
  port: 993,
  secure: true,
  auth: { user: "info@marketyleadgen.com", pass: PASSWORD },
  logger: false,
});

const SUBJECT = "Free website + leads for your plumbing business";

const BODY = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#000000;">
<p>Hi,</p>
<p>I help plumbing companies get more clients through Google and Facebook ads.</p>
<p>As part of the deal, we build you a brand new website and landing page - included for free as long as you're running leads with us.</p>
<p>You only pay per enquiry you receive (pay-per-lead), so no fixed monthly price and no risk.</p>
<p>The first 30 days are completely free.</p>
<p>Feel free to reply if this sounds interesting.</p>
<br>
<p style="color:#555555;font-size:13px;">Markety<br>marketyleadgen.com&nbsp;&nbsp;|&nbsp;&nbsp;info@marketyleadgen.com</p>
</div>`;

const FAKE_EMAILS = [
  "example@example.com",
  "john.smith@emailhost.com",
  "not-provided@modal.form",
  "enquiries@companieshouse.gov.uk",
  "housingenquiries@leeds.gov.uk",
];

function isValidEmail(email) {
  if (!email || email.trim() === "") return false;
  if (FAKE_EMAILS.includes(email.toLowerCase())) return false;
  if (email.includes("companieshouse") || email.includes("leeds.gov")) return false;
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

// Load already-sent emails so we never double-send
const SENT_LOG = "sent-log.txt";
const alreadySent = new Set(
  fs.existsSync(SENT_LOG)
    ? fs.readFileSync(SENT_LOG, "utf8").split("\n").filter(Boolean)
    : []
);
if (alreadySent.size > 0) {
  console.log(`⏭️  Springer ${alreadySent.size} allerede-sendte emails over\n`);
}

// Parse CSV
const csv = fs.readFileSync("leads.csv", "utf8");
const lines = csv.trim().split("\n").slice(1);
const leads = lines
  .map((line) => {
    const parts = line.match(/"([^"]*)"/g)?.map((s) => s.replace(/"/g, "")) ?? [];
    return { name: parts[0], email: parts[1], phone: parts[2], website: parts[3] };
  })
  .filter((l) => isValidEmail(l.email) && !alreadySent.has(l.email));

console.log(`\n📋 ${leads.length} gyldige emails fundet i leads.csv\n`);

// Test SMTP
try {
  await transporter.verify();
  console.log("✅ SMTP OK");
} catch (e) {
  console.error("❌ SMTP fejl:", e.message);
  process.exit(1);
}

// Forbind til IMAP (valgfrit — emails sendes uanset hvad)
let imapOk = false;
let sentPath = "Sent";
try {
  await imap.connect();
  const mailboxes = await imap.list();
  const sentBox = mailboxes.find((m) =>
    /sent/i.test(m.name) || (m.specialUse && m.specialUse === "\\Sent")
  );
  sentPath = sentBox?.path ?? "Sent";
  imapOk = true;
  console.log(`✅ IMAP OK — Sent-mappe: ${sentPath}\n`);
} catch (e) {
  console.log(`⚠️  IMAP ikke tilgængelig (${e.message}) — sender alligevel via SMTP\n`);
}

let sent = 0;
let failed = 0;

for (const lead of leads) {
  try {
    const info = await transporter.sendMail({
      from: "Markety <info@marketyleadgen.com>",
      to: lead.email,
      subject: SUBJECT,
      html: BODY,
    });

    // Gem kopi i Sent-mappen via IMAP hvis tilgængelig
    if (imapOk) {
      const rawMessage = [
        `From: Markety <info@marketyleadgen.com>`,
        `To: ${lead.email}`,
        `Subject: ${SUBJECT}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        BODY,
      ].join("\r\n");
      try {
        await imap.append(sentPath, rawMessage, ["\\Seen"]);
      } catch {}
    }

    fs.appendFileSync(SENT_LOG, lead.email + "\n");
    console.log(`✅ Sendt + gemt: ${lead.email} (${lead.website})`);
    sent++;
    await new Promise((r) => setTimeout(r, 800));
  } catch (e) {
    console.error(`❌ Fejl for ${lead.email}: ${e.message}`);
    failed++;
  }
}

if (imapOk) await imap.logout();

console.log(`\n✅ Færdig. ${sent} sendt, ${failed} fejlede.`);
console.log("Tjek Sent-mappen på mail.spacemail.com");
