// Airtable helper for the Nordic Solfilm "Kontakter" table.
// Nordic Solfilm is a client whose contact form leads are stored in Airtable
// rather than Supabase. BASE_ID / TABLE_ID point to the shared workspace.
// Requires AIRTABLE_API_KEY env var; logs an error but does not throw if
// missing. Used by: api/nordic-contact.ts (writes new contacts),
// api/nordic-messages.ts (reads contacts and marks answered).
const BASE_ID = "appgN1vAfAqY0wHD1";
const TABLE_ID = "tblfqo6sEW0jYBsB1";

// Field IDs from the Kontakter table
const F = {
  navn:     "fld9tynnxEsKI78F4",
  telefon:  "fldHpXdrpVJwyd7T9",
  email:    "fldDMmMh1kJTnPjT8",
  besked:   "fldZNem1YdjPjTUN8",
  oprettet: "fldRlNE5iIgLS8O41",
};

export async function addNordicContact({
  name, email, phone, message,
}: {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
}) {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) {
    console.error("AIRTABLE_API_KEY is not set");
    return;
  }

  const fields: Record<string, unknown> = {
    [F.navn]:     name,
    [F.oprettet]: new Date().toISOString(),
  };
  if (email)   fields[F.email]   = email;
  if (phone)   fields[F.telefon] = phone;
  if (message) fields[F.besked]  = message;

  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Airtable error:", res.status, body);
  }
}
