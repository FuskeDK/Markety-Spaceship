// Lightweight endpoint that checks whether a given contact_token has already
// been submitted through the CompanyInfoForm. The form page uses this on load
// to redirect already-submitted prospects to the CompanyInfoDone page instead
// of showing the form again. GET ?token=<contact_token> → { submitted: bool }.
// No auth required.
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400, headers });

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("contact_token", token)
    .maybeSingle();

  return NextResponse.json({ submitted: !!data }, { headers });
}
