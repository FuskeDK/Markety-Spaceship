// Supabase Edge Function (Deno runtime). Proxies the Trustpilot API to avoid
// exposing the API key in the browser. Called by src/hooks/useTrustpilotStats.ts
// with the Supabase anon key. Returns { fiveStarCount: number }.
// Deployed to Supabase via: supabase functions deploy trustpilot-stats
// Secrets needed in Supabase: TRUSTPILOT_BUSINESS_UNIT_ID, TRUSTPILOT_API_KEY.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const businessUnitId = Deno.env.get("TRUSTPILOT_BUSINESS_UNIT_ID");
    const apiKey = Deno.env.get("TRUSTPILOT_API_KEY");

    if (!businessUnitId || !apiKey) {
      throw new Error("Missing TRUSTPILOT_BUSINESS_UNIT_ID or TRUSTPILOT_API_KEY secrets");
    }

    const response = await fetch(
      `https://api.trustpilot.com/v1/business-units/${businessUnitId}?apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Trustpilot API returned ${response.status}`);
    }

    const data = await response.json();
    const fiveStarCount: number = data?.ratingDistribution?.fiveStar ?? 0;

    return new Response(
      JSON.stringify({ fiveStarCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
