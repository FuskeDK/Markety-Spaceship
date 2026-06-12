// LinkedIn DM queue endpoint. Generates a personalized outreach DM based on
// trigger_type ("connection" | "comment" | "follower") and queues it as a
// pending content_approval row in Supabase so the admin can review and
// send it from the Content tab.
// Accepts POST { name, company, headline, trigger_type, profile_url }.
// Auth: x-queue-secret header must match ADMIN_PASSWORD (used by automation
// tools or Zapier to push prospects into the queue).
// Used by: src/pages/Admin.tsx (Content tab reads pending approvals from
// the content_approvals table via api/admin.ts generate-content action).
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function generateDM(name: string, company: string | undefined, trigger: string): string {
  const first = name.split(" ")[0];

  if (trigger === "connection") {
    const ctx = company ? `I noticed you work at ${company} - ` : "";
    return `Hey ${first}, thanks for connecting. ${ctx}We help businesses generate qualified leads consistently without relying on referrals. If that is ever something on your radar, feel free to message me.\n\n- Markety`;
  }

  if (trigger === "comment") {
    return `Hey ${first}, thanks for engaging with the post - glad it was useful. We help businesses build lead generation systems that run without constant effort. If that sounds relevant to what you are working on, let me know.\n\n- Markety`;
  }

  if (trigger === "follower") {
    return `Hey ${first}, saw you followed - appreciate it. We help businesses generate leads consistently through paid and organic channels. If you ever want to explore what that could look like for you, just say the word.\n\n- Markety`;
  }

  return `Hey ${first}, thanks for connecting. We help businesses generate qualified leads consistently. If that is relevant to you, happy to chat.\n\n- Markety`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = req.headers["x-queue-secret"] as string;
  if (!secret || secret !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const { name, company, headline, trigger_type, profile_url } = req.body ?? {};
  if (!name || !trigger_type) return res.status(400).json({ error: "name and trigger_type required" });

  const dm = generateDM(name, company ?? headline, trigger_type);
  const recipientLabel = [name, company].filter(Boolean).join(" - ") + (profile_url ? ` (${profile_url})` : "");

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { error } = await supabase.from("content_approvals").insert({
    type: "linkedin_dm",
    content: dm,
    recipient: recipientLabel,
    status: "pending",
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
