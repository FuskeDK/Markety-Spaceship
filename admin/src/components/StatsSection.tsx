// Social-proof stats section on the homepage. Animates numbers counting up
// when the section scrolls into view (useInView). Pulls live data from three
// hooks: useCompaniesCount, useLeadsThisYear (both from api/stats.ts), and
// useLocaleCurrency for price display. Used only in: src/pages/Index.tsx.
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useCompaniesCount } from "@/hooks/useCompaniesCount";
import { useLeadsThisYear } from "@/hooks/useLeadsThisYear";
import { useLocaleCurrency } from "@/hooks/useLocaleCurrency";

function CountUpNumber({
  end,
  format,
  duration = 2000,
}: {
  end?: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === undefined || !isInView) return;
    let startTime: number | null = null;
    let rafId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(end * eased);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, end, duration]);

  if (end === undefined) {
    return <span ref={ref}>-</span>;
  }

  return <span ref={ref}>{format(count)}</span>;
}

const StatsSection = () => {
  const { data: companiesCount } = useCompaniesCount();
  const { data: leadsThisYear } = useLeadsThisYear();
  const { format: formatCurrency, rate } = useLocaleCurrency();

  const stats = [
    { format: (n: number) => formatCurrency(n / 100), end: 280, label: "Avg. cost per qualified lead" },
    { format: (n: number) => `${Math.round(n)}+`, end: companiesCount, label: "Companies using Markety" },
    { format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+` : `${Math.round(n)}+`, end: leadsThisYear, label: "Leads delivered this year" },
  ];

  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-16 border-y border-border bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-extrabold text-purple-deep mb-2 tabular-nums">
                <CountUpNumber end={stat.end} format={stat.format} />
              </p>
              <div className="w-8 h-0.5 bg-purple-deep rounded-full mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
