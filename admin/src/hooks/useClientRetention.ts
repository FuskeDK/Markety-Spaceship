// Fetches the client retention rate (% of clients older than 30 days that
// still received a lead in the last 30 days) from api/stats.ts.
// Used in the StatsSection on the homepage as a social-proof metric.
import { useQuery } from "@tanstack/react-query";

async function fetchClientRetention(): Promise<number | null> {
  const res = await fetch("/api/stats");
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.clientRetention === "number" ? data.clientRetention : null;
}

export function useClientRetention() {
  return useQuery({
    queryKey: ["supabase-client-retention"],
    queryFn: fetchClientRetention,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
