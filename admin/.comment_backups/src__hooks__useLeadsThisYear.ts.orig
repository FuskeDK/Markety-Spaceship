import { useQuery } from "@tanstack/react-query";

const SHEET_ID = "1z2ddAL1TP04SdAQ9kkDRkKSqSHVderUvBMsEqJXEDTw";

async function fetchLeadsThisYear(): Promise<number> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leads sheet");

  const text = await res.text();
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) return 0;

  const data = JSON.parse(jsonStr);
  interface SheetRow {
    c?: Array<{ v: unknown } | null>;
  }
  const rows: SheetRow[] = data?.table?.rows ?? [];
  const currentYear = new Date().getFullYear();

  return rows.filter((row) => {
    const cell = row?.c?.[1]; // column B (index 1)
    if (!cell || cell.v === null) return false;

    const val = String(cell.v);

    // gviz returns dates as "Date(2024,0,15)"
    const dateMatch = val.match(/^Date\((\d{4}),/);
    if (dateMatch) return parseInt(dateMatch[1]) === currentYear;

    // Fallback: plain year string or number e.g. "2024" or 2024
    const year = parseInt(val);
    return !isNaN(year) && year === currentYear;
  }).length;
}

export function useLeadsThisYear() {
  return useQuery({
    queryKey: ["sheet-leads-this-year"],
    queryFn: fetchLeadsThisYear,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
