// Fetches the average number of days between a client signing up and receiving
// their first lead, from api/stats.ts. Used in the StatsSection on the homepage.
import { useQuery } from "@tanstack/react-query";

async function fetchAvgDaysToFirstLead(): Promise<number | null> {
  const res = await fetch("/api/stats");
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.avgDaysToFirstLead === "number" ? data.avgDaysToFirstLead : null;
}

export function useAvgDaysToFirstLead() {
  return useQuery({
    queryKey: ["supabase-avg-days-to-first-lead"],
    queryFn: fetchAvgDaysToFirstLead,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
