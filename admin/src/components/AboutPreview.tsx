import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const points = [
  {
    title: "We learn how your sales team works",
    desc: "Before we launch anything, we sit down with your team and map every campaign to your actual sales process.",
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

const AboutPreview = () => {
  return (
    <section className="py-16 md:py-28 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Why us</p>
            <h2
              className="text-4xl md:text-5xl font-medium text-foreground mb-5"
              style={{ letterSpacing: "-0.03em", lineHeight: 1.15 }}
            >
              We plug into your workflow, not the other way around
            </h2>
            <p className="text-muted-foreground mb-10 leading-relaxed text-base">
              Most agencies operate in a black box. We'd rather show you exactly what we're doing, why, and what it costs - then adjust based on what your sales team is actually seeing.
            </p>
            <div className="space-y-6">
              {points.map((point) => (
                <div key={point.title} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-purple-light flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-deep" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{point.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Team collaborating on lead generation strategy"
              className="w-full h-[560px] object-cover rounded-2xl"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
