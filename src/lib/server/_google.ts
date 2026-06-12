// Google People API helper for saving contacts to Google Contacts.
// Currently a standalone utility — not wired into any active API route but
// available for future outreach workflows. Requires GOOGLE_CLIENT_ID,
// GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN env vars; silently
// no-ops if any are missing.
import { google } from "googleapis";

function getClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

export async function createContact({
  name,
  email,
  phone,
  notes,
}: {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}) {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    return;
  }

  const parts = name.trim().split(" ");
  const people = google.people({ version: "v1", auth: getClient() });

  await people.people.createContact({
    requestBody: {
      names: [{ givenName: parts[0], familyName: parts.slice(1).join(" ") }],
      ...(email && { emailAddresses: [{ value: email }] }),
      ...(phone && { phoneNumbers: [{ value: phone }] }),
      ...(notes && { biographies: [{ value: notes, contentType: "TEXT_PLAIN" }] }),
    },
  });
}
