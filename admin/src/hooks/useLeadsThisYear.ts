// Fetches the total leads delivered this calendar year from api/stats.ts.
// Used in the StatsSection on the homepage as a social-proof stat.
import { useQuery } from "@tanstack/react-query";

async function fetchLeadsThisYear(): Promise<number> {
  const res = await fetch("/api/stats");
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.leadsThisYear === "number" ? data.leadsThisYear : 0;
}

export function useLeadsThisYear() {
  return useQuery({
    queryKey: ["supabase-leads-this-year"],
    queryFn: fetchLeadsThisYear,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
