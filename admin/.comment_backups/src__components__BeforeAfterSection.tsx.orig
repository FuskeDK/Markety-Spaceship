import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const before = [
  "Chasing unqualified leads that go nowhere",
  "Wasting budget on ads with no clear ROI",
  "Sales team spending time prospecting instead of closing",
  "Inconsistent pipeline. Feast one month, famine the next.",
  "No system, just guessing what works",
  "Paying $40 to $80 per lead and hoping for the best",
];

const after = [
  "Qualified leads delivered straight to your inbox",
  "Every dollar tracked. You know exactly what's working.",
  "Sales team focused on calls, demos, and closing",
  "Predictable, steady flow of leads every single month",
  "A full system running on autopilot in the background",
  "Average cost per lead under $5",
];

const BeforeAfterSection = () => {
  return (
    <section className="py-14 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">
            The difference
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Life before and after Markety
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Most businesses are one system away from a full pipeline. Here's what that shift looks like.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-muted/50 border border-border rounded-2xl md:rounded-r-none md:rounded-l-2xl p-8"
          >
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-muted-foreground mb-6">
              Before Markety
            </p>
            <ul className="flex flex-col gap-4">
              {before.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-3 h-3 text-red-500" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-purple-deep border border-purple-deep rounded-2xl md:rounded-l-none md:rounded-r-2xl p-8"
          >
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/50 mb-6">
              After Markety
            </p>
            <ul className="flex flex-col gap-4">
              {after.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="flex items-start gap-3 text-sm text-white/90"
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
