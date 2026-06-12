// Fetches a list of client company names from a public Google Sheet (column A)
// to power the animated logo marquee on the homepage (LogoMarquee component).
// Uses the Google Visualization Query API to avoid needing an API key.
// The sheet is publicly readable; SHEET_ID is the Google Sheets document ID.
import { useQuery } from "@tanstack/react-query";

const SHEET_ID = "1RpEDx9HGQxdZaIvppAMJudbeefqLPN2ZvX-fwlW7ud4";

async function fetchCompanyNames(): Promise<string[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch company names");

  const text = await res.text();
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) return [];

  const data = JSON.parse(jsonStr);
  interface SheetRow {
    c?: Array<{ v: unknown } | null>;
  }
  const rows: SheetRow[] = data?.table?.rows ?? [];

  return rows
    .map((row) => row?.c?.[0]?.v)           // first column (A)
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    .map((v) => String(v).trim());
}

export function useCompanyNames() {
  return useQuery({
    queryKey: ["sheet-company-names"],
    queryFn: fetchCompanyNames,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
