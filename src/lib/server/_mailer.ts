// Shared SMTP email helper used by every API handler that sends mail.
// Connects to Spacemail (mail.spacemail.com:465) with credentials from
// SPACEMAIL_PASSWORD env var. All outbound mail is sent from
// info@marketyleadgen.com. Used by: api/admin.ts, api/add-lead.ts,
// api/contact.ts, api/company-info.ts, api/nordic-contact.ts,
// api/nordic-messages.ts. Always import this module for email - never
// create a second transporter elsewhere.
import * as nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "mail.spacemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@marketyleadgen.com",
    pass: process.env.SPACEMAIL_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return transporter.sendMail({
    from: "Markety <info@marketyleadgen.com>",
    to,
    subject,
    html,
    replyTo,
  });
}
