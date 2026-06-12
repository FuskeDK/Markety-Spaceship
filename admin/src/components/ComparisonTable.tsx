import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

type Cell = { type: "check" } | { type: "cross" } | { type: "text"; value: string };

const rows: { label: string; markety: Cell; diy: Cell; freelancer: Cell; agency: Cell }[] = [
  {
    label: "Dedicated account manager",
    markety:    { type: "check" },
    diy:        { type: "cross" },
    freelancer: { type: "cross" },
    agency:     { type: "cross" },
  },
  {
    label: "Full lead gen system built for you",
    markety:    { type: "check" },
    diy:        { type: "cross" },
    freelancer: { type: "text", value: "Partial" },
    agency:     { type: "text", value: "Partial" },
  },
  {
    label: "Weekly performance reports",
    markety:    { type: "check" },
    diy:        { type: "cross" },
    freelancer: { type: "cross" },
    agency:     { type: "check" },
  },
  {
    label: "You own all assets & accounts",
    markety:    { type: "check" },
    diy:        { type: "check" },
    freelancer: { type: "text", value: "Sometimes" },
    agency:     { type: "cross" },
  },
  {
    label: "No long-term contracts",
    markety:    { type: "check" },
    diy:        { type: "check" },
    freelancer: { type: "check" },
    agency:     { type: "cross" },
  },
  {
    label: "Paid ads management",
    markety:    { type: "check" },
    diy:        { type: "text", value: "Time-heavy" },
    freelancer: { type: "text", value: "Varies" },
    agency:     { type: "check" },
  },
  {
    label: "Email sequences included",
    markety:    { type: "check" },
    diy:        { type: "cross" },
    freelancer: { type: "cross" },
    agency:     { type: "text", value: "Add-on cost" },
  },
  {
    label: "Custom landing pages",
    markety:    { type: "check" },
    diy:        { type: "cross" },
    freelancer: { type: "text", value: "Extra charge" },
    agency:     { type: "text", value: "Extra charge" },
  },
  {
    label: "Transparent, results-based pricing",
    markety:    { type: "check" },
    diy:        { type: "check" },
    freelancer: { type: "text", value: "Hourly/flat" },
    agency:     { type: "cross" },
  },
  {
    label: "Time to first lead",
    markety:    { type: "text", value: "2 weeks" },
    diy:        { type: "text", value: "3 to 6 months" },
    freelancer: { type: "text", value: "4 to 8 weeks" },
    agency:     { type: "text", value: "6 to 12 weeks" },
  },
];

const cols = [
  { full: "Markety",        short: "Markety" },
  { full: "DIY / In-house", short: "DIY"     },
  { full: "Freelancer",     short: "Freelancer" },
  { full: "Big Agency",     short: "Agency"  },
];

function CellContent({ cell, highlight }: { cell: Cell; highlight?: boolean }) {
  if (cell.type === "check")
    return <CheckCircle2 className={`w-5 h-5 mx-auto ${highlight ? "text-purple-deep" : "text-emerald-500"}`} />;
  if (cell.type === "cross")
    return <X className="w-4 h-4 mx-auto text-muted-foreground/40" />;
  return (
    <span className={`text-xs font-medium ${highlight ? "text-foreground" : "text-muted-foreground"}`}>
      {cell.value}
    </span>
  );
}

const ComparisonTable = () => {
  return (
    <section className="py-14 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">How we stack up</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Markety vs Other Lead Generation Agencies
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            See exactly how working with us compares to going it alone, hiring a freelancer, or signing with a big agency.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-separate border-spacing-0 text-sm" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-background text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-4 pr-3 md:pr-4 w-[38%] md:w-1/3">
                    Feature
                  </th>
                  {cols.map((col, i) => (
                    <th
                      key={col.full}
                      className={`text-center pb-4 px-2 md:px-3 text-xs md:text-sm font-bold ${
                        i === 0 ? "text-purple-deep" : "text-muted-foreground"
                      }`}
                    >
                      {i === 0 && (
                        <span className="inline-block bg-purple-deep/10 text-purple-deep text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 rounded-full mb-2 whitespace-nowrap">
                          Recommended
                        </span>
                      )}
                      <br />
                      <span className="md:hidden">{col.short}</span>
                      <span className="hidden md:inline">{col.full}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.label} className="group">
                    <td
                      className={`sticky left-0 z-10 bg-background py-3 md:py-3.5 pr-3 md:pr-4 text-xs md:text-sm font-medium text-foreground border-t border-border ${
                        idx === rows.length - 1 ? "border-b" : ""
                      }`}
                    >
                      {row.label}
                    </td>
                    {(["markety", "diy", "freelancer", "agency"] as const).map((key, i) => (
                      <td
                        key={key}
                        className={`py-3 md:py-3.5 px-2 md:px-3 text-center border-t border-border ${
                          i === 0
                            ? "bg-purple-deep/5 group-hover:bg-purple-deep/10 transition-colors"
                            : "group-hover:bg-muted/30 transition-colors"
                        } ${idx === rows.length - 1 ? "border-b" : ""}`}
                      >
                        <CellContent cell={row[key]} highlight={i === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
