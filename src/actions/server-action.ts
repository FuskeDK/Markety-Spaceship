/* eslint-disable import/order */
/* eslint-disable no-console */
"use server";

import { createClient } from "@supabase/supabase-js";
import { actionClient } from "./safe-action";
import { formSchema } from "@/lib/form-schema";
import { sendEmail } from "@/lib/server/_mailer";

export const serverAction = actionClient
  .inputSchema(formSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, company, employees, message } = parsedInput;
    const first = name.split(" ")[0];

    // Save to Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const { error } = await supabase.from("contact_submissions").insert({
        name,
        email,
        company: company ?? null,
        goals: employees ?? null,
        message: message ?? null,
        pipeline_status: "new",
      });
      if (error) console.error("Supabase contact insert:", error);
    }

    // Confirmation email to the prospect
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

    // Internal notification to admin
    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,Arial,sans-serif;padding:32px 16px;background:#fff;">
  <img src="https://www.marketyleadgen.com/MarketySquare.png" width="48" style="border-radius:10px;margin-bottom:20px;">
  <h2 style="color:#0f172a;margin:0 0 16px;">New contact form submission</h2>
  <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;border-collapse:collapse;">
    <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Name</td><td>${name}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Email</td><td><a href="mailto:${email}" style="color:#5B21F4;">${email}</a></td></tr>
    ${company ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Company</td><td>${company}</td></tr>` : ""}
    ${employees ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Employees</td><td>${employees}</td></tr>` : ""}
    ${message ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;">Message</td><td>${message}</td></tr>` : ""}
  </table>
  <p style="margin-top:24px;"><a href="https://www.marketyleadgen.com/admin" style="display:inline-block;padding:12px 24px;background:#5B21F4;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;">View in Admin</a></p>
</body>
</html>`;

    try {
      await sendEmail({ to: email, subject: "We got your message", html: customerHtml });
      sendEmail({ to: "info@marketyleadgen.com", subject: `New contact: ${name}`, html: adminHtml }).catch(() => {});
    } catch (err) {
      console.error("Contact email error:", err);
    }

    return { success: true, message: "Form submitted successfully" };
  });
