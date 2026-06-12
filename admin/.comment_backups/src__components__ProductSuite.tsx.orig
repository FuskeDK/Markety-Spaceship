import { motion } from "framer-motion";
import { Mail, BarChart3, Globe } from "lucide-react";
import RevealOnScroll from "@/components/ui/reveal-on-scroll";

const products = [
  {
    icon: Mail,
    title: "Email Sequences",
    desc: "We write and automate a sequence of emails that warm up every lead from first opt-in to ready-to-buy. The right message at the right time, sent without anyone lifting a finger.",
    badge: "42% avg open rate",
    visual: [
      { label: "Sequence sent", value: "Day 1" },
      { label: "Follow-up", value: "Day 3" },
      { label: "Close attempt", value: "Day 7" },
    ],
  },
  {
    icon: BarChart3,
    title: "Funnel Architecture",
    desc: "We design the full path from first click to booked meeting. Your ads, pages, and follow-ups connected into one system that moves people forward automatically.",
    badge: "Full-path system",
    visual: [
      { label: "Ad click", value: "100%" },
      { label: "Landing page", value: "62%" },
      { label: "Lead captured", value: "28%" },
    ],
  },
  {
    icon: Globe,
    title: "Conversion Pages",
    desc: "We build focused pages designed around a single action: getting the visitor to become a lead. One clear message, one clear next step, nothing to distract them.",
    badge: "Built to convert",
    visual: [
      { label: "Bounce rate", value: "↓31%" },
      { label: "Form fills", value: "↑2.4×" },
      { label: "Load time", value: "1.9s" },
    ],
  },
];

const ProductSuite = () => {
  return (
    <section className="py-14 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">The setup</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Three services. One complete system.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Each piece works on its own. Together they cover everything.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto divide-y divide-border">
          {products.map((product, i) => {
            const direction: "left" | "right" = i === 1 ? "right" : "left";
            return (
              <RevealOnScroll
                key={product.title}
                threshold={1}
                rootMargin="0px"
                once
                direction={direction}
                stagger={60}
                className="py-8 md:py-12 reveal-strong"
              >
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center`}>
                  {/* Text side */}
                  <div className={i % 2 === 1 ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-5">
                      <product.icon className="w-5 h-5 text-purple-deep shrink-0" />
                      <span className="badge-pill text-xs font-semibold px-3 py-1 rounded-full">
                        {product.badge}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-foreground mb-3">{product.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.desc}</p>
                  </div>

                  {/* Visual panel */}
                  <div className={i % 2 === 1 ? "md:order-1" : ""}>
                    <div className="bg-muted/50 border border-border rounded-2xl p-5 md:p-6 space-y-3">
                      {product.visual.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
                        >
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <span className="text-sm font-bold text-purple-deep">{row.value}</span>
                        </div>
                      ))}
                      <div className="hidden md:flex justify-end pt-1 opacity-10">
                        <product.icon className="w-16 h-16 text-purple-deep" />
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSuite;
