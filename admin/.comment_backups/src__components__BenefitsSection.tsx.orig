import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Settings } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "No retainers, no fluff",
    description: "You pay for the leads we deliver, period. If the numbers don't work, you keep your money.",
  },
  {
    icon: TrendingUp,
    title: "Scales when you're ready",
    description: "Once we dial in what works, we put more behind it. Higher spend, same cost per lead, bigger pipeline.",
  },
  {
    icon: Settings,
    title: "We run the whole operation",
    description: "Ads, pages, emails, reporting. Your team doesn't lift a finger. We manage every piece of the pipeline.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-14 md:py-20 bg-muted/40">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Our model</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Built around your results
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We don't charge retainers. Our pricing is tied directly to the leads we deliver, so we're always motivated to send you people who are actually ready to buy.
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-extrabold text-purple-deep leading-none">$3</span>
              <span className="text-sm text-muted-foreground">average cost per lead</span>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-7 lg:pt-2"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0, transition: { duration: 0.45 } } }}
                className="flex gap-4 items-start"
              >
                <benefit.icon className="w-5 h-5 text-purple-deep shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
