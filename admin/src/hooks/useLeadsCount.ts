// Fetches the total all-time leads count from a Google Apps Script that reads
// a Google Sheet (VITE_GOOGLE_SHEETS_SCRIPT_URL env var). Used on the homepage
// for the social-proof stat counter. Falls back to 0 if the env var is absent.
// The query config is exported so App.tsx can pre-fetch it at startup.
import { useQuery } from "@tanstack/react-query";

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL as string | undefined;

export async function fetchLeadsCount(): Promise<number> {
  if (!SCRIPT_URL) return 0;

  const res = await fetch(SCRIPT_URL);
  if (!res.ok) throw new Error("Failed to fetch leads count");

  const data = await res.json();
  return typeof data.leadsCount === "number" ? data.leadsCount : 0;
}

export const leadsCountQueryConfig = {
  queryKey: ["sheet-leads-count"] as const,
  queryFn: fetchLeadsCount,
  staleTime: 1000 * 60 * 10,
  retry: 1,
};

export function useLeadsCount() {
  return useQuery(leadsCountQueryConfig);
}
