import { motion } from "framer-motion";
import { Target, BarChart3, Zap, Mail, Users, Globe } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-14 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">What we handle</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Everything your pipeline needs, handled
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From running ads to writing follow ups. We take care of it so your team can sell.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Featured - Email Marketing */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 relative bg-card border border-purple-deep/25 rounded-2xl p-6 md:p-8 overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-purple-deep/8 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <Mail className="w-7 h-7 text-purple-deep mb-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-deep bg-purple-light px-2.5 py-1 rounded-full">Core service</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-foreground mt-3 mb-2">Email Marketing</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                We write and send emails that follow up with your leads automatically until they're ready to talk. No manual chasing.
              </p>
              <div className="mt-5 pt-5 border-t border-border flex gap-6 md:gap-8">
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-purple-deep">42%</p>
                  <p className="text-xs text-muted-foreground">avg open rate</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-purple-deep">3.1×</p>
                  <p className="text-xs text-muted-foreground">reply rate vs cold</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Running Ads */}
          <motion.div variants={cardVariants} className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 md:self-start">
            <Target className="w-5 h-5 text-purple-deep mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">Running Ads</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Google, Meta, and LinkedIn. Targeted at the buyers most likely to convert.</p>
          </motion.div>

          {/* Landing Pages */}
          <motion.div variants={cardVariants} className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
            <Globe className="w-5 h-5 text-purple-deep mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">Landing Pages</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Focused pages built around one goal: turning clicks into leads.</p>
          </motion.div>

          {/* Lead Tracking */}
          <motion.div variants={cardVariants} className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
            <Users className="w-5 h-5 text-purple-deep mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">Lead Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every lead scored and routed to the right person with full source context.</p>
          </motion.div>

          {/* Sales Funnels */}
          <motion.div variants={cardVariants} className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
            <Zap className="w-5 h-5 text-purple-deep mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">Sales Funnels</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">The full path from first ad to booked meeting, built around how you sell.</p>
          </motion.div>

          {/* Ad Copy - full width */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-3 bg-muted/50 border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <BarChart3 className="w-5 h-5 text-purple-deep shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground mb-1">Ad Copy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">We write your ads, emails, and page content. Clear, direct language that gets people to take the next step.</p>
            </div>
            <div className="flex items-center gap-5 sm:gap-6 shrink-0">
              <div className="text-center">
                <p className="text-lg font-extrabold text-purple-deep">CTR+</p>
                <p className="text-xs text-muted-foreground">click-through</p>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="text-center">
                <p className="text-lg font-extrabold text-purple-deep">CVR+</p>
                <p className="text-xs text-muted-foreground">conversion</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
