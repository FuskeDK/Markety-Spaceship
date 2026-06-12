// LinkedIn DM queue endpoint. Generates a personalized outreach DM based on
// trigger_type ("connection" | "comment" | "follower") and queues it as a
// pending content_approval row in Supabase so the admin can review and
// send it from the Content tab.
// Accepts POST { name, company, headline, trigger_type, profile_url }.
// Auth: x-queue-secret header must match ADMIN_PASSWORD.
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  const secret = req.headers.get("x-queue-secret");
  if (!secret || secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500, headers });
  }

  const body = await req.json().catch(() => ({}));
  const { name, company, headline, trigger_type, profile_url } = body;
  if (!name || !trigger_type) return NextResponse.json({ error: "name and trigger_type required" }, { status: 400, headers });

  const dm = generateDM(name, company ?? headline, trigger_type);
  const recipientLabel = [name, company].filter(Boolean).join(" - ") + (profile_url ? ` (${profile_url})` : "");

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { error } = await supabase.from("content_approvals").insert({
    type: "linkedin_dm",
    content: dm,
    recipient: recipientLabel,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers });
  return NextResponse.json({ success: true }, { headers });
}
