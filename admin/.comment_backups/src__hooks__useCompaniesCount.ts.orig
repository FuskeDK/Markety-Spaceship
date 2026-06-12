import { useQuery } from "@tanstack/react-query";

const SHEET_ID = "1RpEDx9HGQxdZaIvppAMJudbeefqLPN2ZvX-fwlW7ud4";

async function fetchCompaniesCount(): Promise<number> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch companies count");

  const text = await res.text();

  // Strip the /*O_o*/ wrapper Google wraps around the JSON
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) return 0;

  const data = JSON.parse(jsonStr);
  const rows: unknown[] = data?.table?.rows ?? [];

  // Count rows that have at least one filled cell
  interface SheetRow {
    c?: Array<{ v: unknown } | null>;
  }
  
  const filled = rows.filter((row: SheetRow) =>
    row?.c?.some((cell: { v: unknown } | null) => cell !== null && cell?.v !== null && cell?.v !== "")
  );

  return filled.length;
}

export function useCompaniesCount() {
  return useQuery({
    queryKey: ["sheet-companies-count"],
    queryFn: fetchCompaniesCount,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
