import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "We learn your business",  desc: "We reach out, you tell us about your customers, your sales process, and what a qualified lead looks like for you. No generic playbooks." },
  { number: "02", title: "We build your system",    desc: "Landing pages, email sequences, and ad campaigns. All built and ready to go live before anything is pushed." },
  { number: "03", title: "We go live and improve",  desc: "Campaigns launch and we immediately start testing. Every week we analyse what's working, cut what isn't, and put more behind what drives results." },
  { number: "04", title: "Leads arrive, you close", desc: "Your sales team gets a steady stream of people who are already interested and fully qualified. You focus on conversations. We handle everything before that." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-14 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">How it works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">From first message to full pipeline</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Four steps and you're live. No months of onboarding, no complicated handoffs.</p>
        </motion.div>

        {/* Desktop: horizontal process */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative grid grid-cols-4"
          >
            <div className="absolute top-6 left-[calc(12.5%)] right-[calc(12.5%)] h-px border-t-2 border-dashed border-border z-0" />
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="flex flex-col items-center text-center px-4"
              >
                <div className="relative z-10 w-12 h-12 rounded-full bg-purple-deep flex items-center justify-center mb-6 shrink-0">
                  <span className="text-white font-extrabold text-sm">{step.number}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative pl-10 max-w-lg mx-auto">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative mb-8 last:mb-0"
            >
              <div className="absolute -left-10 top-0 w-7 h-7 rounded-full bg-purple-deep flex items-center justify-center">
                <span className="text-white font-extrabold text-[10px]">{step.number}</span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
