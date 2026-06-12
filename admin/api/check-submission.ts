// Lightweight endpoint that checks whether a given contact_token has already
// been submitted through the CompanyInfoForm. The form page uses this on load
// to redirect already-submitted prospects to the CompanyInfoDone page instead
// of showing the form again. GET ?token=<contact_token> → { submitted: bool }.
// No auth required. Used by: src/pages/CompanyInfoForm.tsx.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = req.query.token as string;
  if (!token) return res.status(400).json({ error: "Token required" });

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("contact_token", token)
    .maybeSingle();

  return res.status(200).json({ submitted: !!data });
}
