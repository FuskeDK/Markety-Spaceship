import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";

function CountUpNumber({
  end,
  start = 0,
  format,
  duration = 2000,
}: {
  end: number;
  start?: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let rafId: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(start + (end - start) * eased);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, end, start, duration]);

  return <span ref={ref}>{format(count)}</span>;
}

const points = [
  {
    title: "We learn how your sales team works",
    desc: "Before we launch anything, we sit down with your team and map campaigns to your actual sales process.",
  },
  {
    title: "Every metric is shared with you",
    desc: "Live dashboards showing spend, cost per lead, and pipeline value. Nothing is hidden or locked behind a report.",
  },
  {
    title: "We stay current across every platform",
    desc: "Platforms shift fast. We run weekly tests so the tactics we use are always what's working right now.",
  },
];

const statRows = [
  { end: 200, start: 0, format: (n: number) => `${Math.round(n)}+`, label: "Companies worked with", percent: 80 },
  { end: 92, start: 0, format: (n: number) => `${Math.round(n)}%`, label: "Client retention rate", percent: 92 },
  { end: 3, start: 0, format: (n: number) => `$${Math.round(n)}`, label: "Avg. cost per lead", percent: 60 },
];

const AboutPreview = () => {
  return (
    <section className="py-14 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left - text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Why us</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              We plug into your workflow, not the other way around
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Most agencies operate in a black box. We'd rather show you exactly what we're doing, why, and what it costs. Then adjust based on what your sales team is actually seeing.
            </p>
            <div className="space-y-5">
              {points.map((point) => (
                <div key={point.title} className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-deep shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">{point.title}</p>
                    <p className="text-sm text-muted-foreground">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - dashboard-style card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Header bar */}
            <div className="bg-purple-deep px-6 py-4 flex items-center justify-between">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Performance overview</p>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Stat rows with bars */}
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="divide-y divide-border"
            >
              {statRows.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }}
                  className="px-6 py-5"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-foreground tabular-nums">
                      <CountUpNumber end={stat.end} start={stat.start} format={stat.format} />
                    </p>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-deep rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer note */}
            <div className="px-6 py-4 bg-muted/50 border-t border-border">
              <p className="text-xs text-muted-foreground">Updated weekly · All data from live accounts</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
