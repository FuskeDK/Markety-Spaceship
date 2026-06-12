import { motion } from "framer-motion";
import { Mail, Target, Globe, Filter, BarChart3 } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">
            What we handle
          </p>
          <h2
            className="text-4xl md:text-5xl font-medium text-foreground mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Everything your pipeline needs
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
            From running ads to writing follow-ups - we take care of all of it so your team can focus on closing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto border border-border rounded-lg overflow-hidden"
        >
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">

            {/* Email Marketing - featured */}
            <div className="p-8 md:p-10 flex flex-col gap-5 transition-colors duration-200 hover:bg-black/[0.04] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-deep" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <h3 className="text-xl font-semibold text-foreground" style={{ letterSpacing: "-0.02em" }}>
                    Email Marketing
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-purple-deep bg-purple-light px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automated email flows that follow up with every lead until they're ready to talk. No manual chasing, no missed opportunities.
                </p>
              </div>
            </div>

            {/* Live reporting */}
            <div className="p-8 md:p-10 flex flex-col gap-5 transition-colors duration-200 hover:bg-black/[0.04] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-deep" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Live reporting
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See every lead and every dollar in one place - updated in real time. You always know exactly what's working.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">

            <div className="p-8 md:p-10 flex flex-col gap-5 transition-colors duration-200 hover:bg-black/[0.04] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-deep" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Paid Campaigns
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Targeted ads on Google, Meta, and LinkedIn that attract and convert the right people - not just anyone.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col gap-5 transition-colors duration-200 hover:bg-black/[0.04] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-deep" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Landing Pages
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pages designed to capture attention, build trust, and turn visitors into leads - with one clear next step.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col gap-5 transition-colors duration-200 hover:bg-black/[0.04] cursor-default">
              <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-deep" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Funnel Structure
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A complete system that takes cold audiences and turns them into warm, qualified leads ready to buy.
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
