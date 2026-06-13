// Public stats endpoint - powers the social-proof numbers shown on the
// Markety marketing website (homepage, about page).
// Returns: leadsThisYear, companiesCount, avgDaysToFirstLead, clientRetention.
// No auth required; all values are aggregate and non-identifying.
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import { statsRatelimit } from "@/lib/server/_ratelimit";

export async function GET(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const { success } = await statsRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const headers = { "Access-Control-Allow-Origin": "*" };

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const yearStart = `${new Date().getFullYear()}-01-01`;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: leadsThisYear },
    { count: companiesCount },
    { data: clients },
    { data: leads },
    { data: recentLeads },
    { data: oldClients },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", yearStart),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("id, created_at"),
    supabase.from("leads").select("client_id, created_at").order("created_at", { ascending: true }),
    supabase.from("leads").select("client_id").gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("clients").select("id").lt("created_at", thirtyDaysAgo.toISOString()),
  ]);

  let avgDaysToFirstLead: number | null = null;
  if (clients && leads && clients.length > 0) {
    const firstLeadByClient = new Map<string, string>();
    leads.forEach((lead: { client_id: string; created_at: string }) => {
      if (!firstLeadByClient.has(lead.client_id)) {
        firstLeadByClient.set(lead.client_id, lead.created_at);
      }
    });
    let totalDays = 0;
    let count = 0;
    clients.forEach((client: { id: string; created_at: string }) => {
      const firstLead = firstLeadByClient.get(client.id);
      if (firstLead) {
        const days = Math.round((new Date(firstLead).getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0) { totalDays += days; count++; }
      }
    });
    if (count > 0) avgDaysToFirstLead = Math.round(totalDays / count);
  }

  let clientRetention: number | null = null;
  if (oldClients && recentLeads && oldClients.length > 0) {
    const activeIds = new Set(recentLeads.map((l: { client_id: string }) => l.client_id));
    const retained = oldClients.filter((c: { id: string }) => activeIds.has(c.id)).length;
    clientRetention = Math.round((retained / oldClients.length) * 100);
  }

  return NextResponse.json({
    leadsThisYear: leadsThisYear ?? 0,
    companiesCount: companiesCount ?? 0,
    avgDaysToFirstLead,
    clientRetention,
  }, { headers });
}
