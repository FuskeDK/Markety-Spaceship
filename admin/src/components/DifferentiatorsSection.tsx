import { motion } from "framer-motion";
import { User, FileText, Shield, Calendar } from "lucide-react";

const items = [
  {
    icon: User,
    title: "One dedicated contact",
    desc: "You talk to the same person every time. Someone who knows your account, your goals, and your market. Not a different rep each week.",
  },
  {
    icon: FileText,
    title: "Weekly reports, always",
    desc: "Every Monday you get a clear summary: what ran, what it cost, how many leads came in, and what we're doing next. No fluff, just the numbers.",
  },
  {
    icon: Shield,
    title: "You own everything",
    desc: "Every campaign, page, and email list lives in your own accounts. We build it, you keep it. Leave any time and take it all with you.",
  },
  {
    icon: Calendar,
    title: "No long term contracts",
    desc: "We work month to month. We'd rather keep your business because results are good. Not because you're locked into an annual deal.",
  },
];

const DifferentiatorsSection = () => {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">What you get</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Built to be easy to work with
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No black boxes, no surprises. Just a straightforward setup where you always know what's happening.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto divide-y divide-border border border-border rounded-lg overflow-hidden"
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              className="flex gap-4 md:gap-5 items-start px-5 md:px-7 py-5 md:py-6 bg-card hover:bg-muted/40 transition-colors duration-200"
            >
              <item.icon className="w-5 h-5 text-purple-deep shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;
