// ClickUp task-creation helper. Every new lead and contact form submission
// creates a task in the Markety ClickUp workspace so nothing falls through
// the cracks. LIST_IDS maps human names to the real ClickUp list IDs.
// Requires CLICKUP_TOKEN env var; silently no-ops if missing so local dev
// works without the token. Used by: api/add-lead.ts (leads list),
// api/contact.ts (contact list).
const BASE = "https://api.clickup.com/api/v2";

export const LIST_IDS = {
  leads: "901218239612",
  contact: "901218239615",
} as const;

export async function createClickUpTask(
  listId: string,
  name: string,
  description: string
): Promise<void> {
  const token = process.env.CLICKUP_TOKEN;
  if (!token) return;

  await fetch(`${BASE}/list/${listId}/task`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });
}
