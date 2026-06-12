import { motion } from "framer-motion";
import { Mail, BarChart3, Globe, CheckCircle } from "lucide-react";

const products = [
  {
    icon: Mail,
    tag: "Email Marketing",
    title: "Email sequences that sell while you sleep",
    desc: "We write and automate a sequence of emails that warm up every lead from first opt-in to ready-to-buy. The right message at the right time, sent without anyone lifting a finger.",
    badge: "42% avg open rate",
    points: [
      "Fully written and automated by us",
      "Follows up until the lead is ready to talk",
      "Personalised by source and behaviour",
    ],
  },
  {
    icon: BarChart3,
    tag: "Funnel Architecture",
    title: "A system that moves leads forward automatically",
    desc: "We design the full path from first click to qualified lead. Your ads, pages, and follow-ups connected into one system that moves people forward automatically.",
    badge: "Full-path system",
    points: [
      "Ads, pages, and emails all connected",
      "Built around how your sales team works",
      "Every step tracked and measured",
    ],
  },
  {
    icon: Globe,
    tag: "Conversion Pages",
    title: "Pages built around one goal: getting the lead",
    desc: "We build focused pages designed around a single action: getting the visitor to become a lead. One clear message, one clear next step, nothing to distract them.",
    badge: "Built to convert",
    points: [
      "Designed and written by us",
      "Tested for speed and mobile",
      "Optimised continuously after launch",
    ],
  },
];

const ProductSuite = () => {
  return (
    <section className="py-16 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">The setup</p>
          <h2
            className="text-4xl md:text-5xl font-medium text-foreground mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Three services. One complete system.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
            Each piece works on its own. Together they cover the entire path from first click to closed deal.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {products.map((product) => (
            <motion.div
              key={product.title}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
              className="bg-card border border-border rounded-lg p-8 flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-light flex items-center justify-center shrink-0">
                  <product.icon className="w-5 h-5 text-purple-deep" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-purple-deep bg-purple-light px-2.5 py-1 rounded-full">
                  {product.tag}
                </span>
              </div>

              <div>
                <h3
                  className="text-lg font-semibold text-foreground mb-2"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.desc}</p>
              </div>

              <ul className="mt-auto space-y-2 pt-5 border-t border-border">
                {product.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-deep shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductSuite;
