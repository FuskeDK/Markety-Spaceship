// Fetches the total number of active client companies from api/stats.ts.
// Used in the StatsSection on the homepage as a social-proof stat.
import { useQuery } from "@tanstack/react-query";

async function fetchCompaniesCount(): Promise<number> {
  const res = await fetch("/api/stats");
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.companiesCount === "number" ? data.companiesCount : 0;
}

export function useCompaniesCount() {
  return useQuery({
    queryKey: ["supabase-companies-count"],
    queryFn: fetchCompaniesCount,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
