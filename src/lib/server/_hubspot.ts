// HubSpot CRM helper. Syncs contact form submissions into HubSpot so the
// sales pipeline stays current. Handles both create (POST) and the 409
// duplicate case by falling back to PATCH on the existing contact.
// Requires HUBSPOT_ACCESS_TOKEN env var; silently no-ops if missing.
// Used exclusively by api/contact.ts.
const BASE = "https://api.hubapi.com";

function headers() {
  return {
    Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function upsertContact({
  name, email, company, cvr, companyDescription, goals, message,
}: {
  name: string;
  email: string;
  company?: string;
  cvr?: string;
  companyDescription?: string;
  goals?: string;
  message?: string;
}): Promise<void> {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) return;

  const parts = name.trim().split(" ");
  const properties: Record<string, string> = {
    email,
    firstname: parts[0],
  };
  if (parts.length > 1) properties.lastname = parts.slice(1).join(" ");
  if (company)         properties.company  = company;

  const msgParts = [
    companyDescription ? `What they do:\n${companyDescription}` : null,
    goals              ? `Goals:\n${goals}`                      : null,
    message            ? `Notes:\n${message}`                    : null,
    cvr                ? `CVR: ${cvr}`                           : null,
  ].filter(Boolean);
  if (msgParts.length) properties.message = msgParts.join("\n\n");

  const res = await fetch(`${BASE}/crm/v3/objects/contacts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ properties }),
  });

  if (!res.ok && res.status !== 409) {
    const body = await res.text();
    console.error("HubSpot create contact error:", res.status, body);
    return;
  }

  if (res.status === 409) {
    const existing = await fetch(
      `${BASE}/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`,
      { headers: headers() },
    );
    if (!existing.ok) {
      console.error("HubSpot lookup contact error:", existing.status, await existing.text());
      return;
    }
    const data = await existing.json() as { id: string };
    const patch = await fetch(`${BASE}/crm/v3/objects/contacts/${data.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ properties }),
    });
    if (!patch.ok) console.error("HubSpot patch contact error:", patch.status, await patch.text());
  }
}
