import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Target, Users, TrendingUp, BarChart3, Heart, Eye, Lightbulb, ArrowRight,
  CheckCircle2, Megaphone, Mail, Globe, Zap, LineChart, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCompaniesCount } from "@/hooks/useCompaniesCount";
import { useAvgDaysToFirstLead } from "@/hooks/useAvgDaysToFirstLead";
import { useClientRetention } from "@/hooks/useClientRetention";
import { setSeoMeta } from "@/lib/seo";

const platforms = [
  "Google Ads", "Meta Ads", "LinkedIn Ads", "Email Sequences",
  "Landing Pages", "CRM Setup", "A/B Testing", "Analytics & Reporting",
];

const About = () => {
  const navigate = useNavigate();
  const { data: companiesCount = 0 } = useCompaniesCount();
  const { data: avgDays } = useAvgDaysToFirstLead();
  const { data: clientRetention } = useClientRetention();

  const avgTimeDisplay = avgDays == null
    ? "-"
    : avgDays < 14
      ? `${avgDays} days`
      : `${Math.round(avgDays / 7)} weeks`;
  const retentionDisplay = clientRetention == null ? "-" : `${clientRetention}%`;

  useEffect(() => {
    setSeoMeta("about");
  }, []);

  return (
    <>
      <main className="min-h-screen bg-background">
        <Navbar />

      {}
      <section className="relative pt-28 pb-12 md:pt-40 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 58% 48% at 50% 38%, transparent 0%, transparent 58%, black 88%)',
          WebkitMaskImage: 'radial-gradient(ellipse 58% 48% at 50% 38%, transparent 0%, transparent 58%, black 88%)',
        }} />
        <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none" style={{
          background: `linear-gradient(to bottom, transparent 60%, hsl(var(--background)) 100%)`
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-6">About Markety</p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">
              The team behind your next pipeline
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Marketers, media buyers, and campaign strategists focused on one thing: getting businesses more of the right leads.
            </p>
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep">How we got here</p>
              <h2 className="text-3xl font-extrabold text-foreground">
                We started because we kept seeing the same problem.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed pt-2">
                <p>
                  Companies were spending money on ads and content but had no system to turn attention into revenue. Budgets got burned. Sales teams waited around. Nobody could point to what was working.
                </p>
                <p>
                  We started Markety to fix that. We handle the campaigns, the funnels, the follow ups. The whole machine. Our clients get a steady flow of qualified prospects without building an in house team.
                </p>
                <p>
                  We work with B2B and B2C companies across a range of industries. The common thread: they want more of the right leads, at a cost that makes sense.
                </p>
              </div>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-0"
            >
              {[
                {
                  period: "The problem",
                  title: "Businesses were flying blind",
                  desc: "Ad spend went out. Results were unclear. Sales teams sat waiting. Most companies had no real system connecting their marketing to their pipeline.",
                },
                {
                  period: "The decision",
                  title: "We built what didn't exist",
                  desc: "In 2026 we launched Markety to fill the gap. A team that handles everything from first click to qualified lead, so clients never have to stitch together freelancers or agencies again.",
                },
                {
                  period: "Today",
                  title: "We grow when you grow",
                  desc: "Every campaign teaches us something. That knowledge goes back into every account we run. The longer we work together, the sharper the results get.",
                },
              ].map((item, i, arr) => (
                <motion.div
                  key={item.period}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.15 }}
                  className="flex gap-5"
                >
                  {}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-deep ring-2 ring-purple-deep/25 border-2 border-background mt-1 shrink-0" />
                    {i < arr.length - 1 && (
                      <div className="flex-1 w-px bg-border mt-2 mb-0 min-h-[40px]" />
                    )}
                  </div>
                  {}
                  <div className={`pb-10 ${i === arr.length - 1 ? "pb-0" : ""}`}>
                    <p className="text-[11px] font-bold text-purple-deep uppercase tracking-[0.18em] mb-1">{item.period}</p>
                    <h3 className="text-base font-bold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20 bg-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">By the numbers</p>
            <h2 className="text-3xl font-extrabold text-background dark:text-foreground">Impact we've made so far</h2>
          </motion.div>
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-background/10"
          >
            {[
              { value: "$2.80", label: "Avg. cost per lead", compact: false },
              { value: avgTimeDisplay, label: "Avg. time to first lead", compact: true },
              { value: retentionDisplay, label: "Client retention", compact: false },
              { value: `${companiesCount}+`, label: "Companies served", compact: false },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="bg-foreground px-4 md:px-8 py-8 md:py-10 text-center"
              >
                <p className={`font-extrabold text-background mb-2 ${stat.compact ? "text-2xl md:text-4xl" : "text-3xl md:text-5xl"}`}>{stat.value}</p>
                <p className="text-xs md:text-sm text-background/50">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Who we are</p>
            <h2 className="text-3xl font-extrabold text-foreground">Built for one thing</h2>
          </motion.div>
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
          >
            {[
              { title: "Built for results", desc: "We launched in 2026 with one focus: building campaign systems that actually deliver leads at a cost that makes sense." },
              { title: "Built around teamwork", desc: "Our strategists, writers, and media buyers work on each account together. Not in separate silos." },
              { title: "We stay current", desc: "Platforms change fast. We run weekly tests across channels so our playbooks stay relevant." },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">What we stand for</p>
            <h2 className="text-3xl font-extrabold text-foreground">
              How we approach every campaign
            </h2>
          </motion.div>

          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-2xl overflow-hidden"
          >
            {[
              {
                icon: Heart,
                title: "Ownership",
                tagline: "Your budget is our budget.",
                desc: "We treat your ad spend like it's ours. Every dollar matters, and we optimize with the same urgency we'd bring to our own business.",
              },
              {
                icon: Eye,
                title: "Honesty",
                tagline: "Bad news first, no excuses.",
                desc: "If a campaign isn't performing, we tell you before you have to ask. No spin, no burying bad numbers in a glossy PDF.",
              },
              {
                icon: Lightbulb,
                title: "Curiosity",
                tagline: "We test every week.",
                desc: "New creatives, new audiences, new channels. We run structured experiments continuously. What works gets scaled, what doesn't gets cut.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="bg-card px-6 md:px-8 py-8 md:py-10"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-purple-deep" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs font-semibold text-purple-deep mb-3">{item.tagline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">The experience</p>
              <h2 className="text-3xl font-extrabold text-foreground mb-4">
                What it's like to work with us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We've worked with enough agencies to know what makes them frustrating. Slow onboarding, vague updates, contacts who don't know your account. We built Markety to fix all of that.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Clock, text: "Onboarded in days, not months" },
                  { icon: CheckCircle2, text: "You own every asset we build" },
                  { icon: LineChart, text: "Live results visible at all times" },
                  { icon: Users, text: "Same team on your account, always" },
                ].map((point) => (
                  <div key={point.text} className="flex items-center gap-3">
                    <point.icon className="w-4 h-4 text-purple-deep shrink-0" />
                    <p className="text-sm font-medium text-foreground">{point.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border bg-muted/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your first 30 days</p>
              </div>
              {[
                { day: "Day 1-3", title: "Kickoff & onboarding", desc: "We reach out over message, learn your ideal buyer, goals, and existing assets." },
                { day: "Day 4-10", title: "Build phase", desc: "Landing pages, ad creatives, and email sequences go live in your accounts." },
                { day: "Day 11-14", title: "Launch", desc: "Campaigns go live. We monitor closely and start testing immediately." },
                { day: "Day 30", title: "First results report", desc: "Full breakdown of what's working and where we're scaling next." },
              ].map((step, i) => (
                <div key={step.day} className={`px-6 py-5 flex gap-4 items-start ${i !== 0 ? "border-t border-border" : ""}`}>
                  <span className="badge-pill text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5 whitespace-nowrap">{step.day}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">What we run</p>
            <h2 className="text-3xl font-extrabold text-foreground mb-3">
              Every channel that drives leads
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We manage everything across the platforms where your buyers actually spend time.
            </p>
          </motion.div>

          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-10"
          >
            {[
              { icon: Megaphone, title: "Paid Advertising", desc: "Google Ads, Meta, and LinkedIn. Full campaign management including creative, targeting, bidding, and ongoing optimisation.", tags: ["Google Ads", "Meta Ads", "LinkedIn Ads"] },
              { icon: Mail, title: "Email Marketing", desc: "Sequences that nurture leads from first opt-in to ready-to-buy. Written, scheduled, and automated by us.", tags: ["Drip sequences", "Re-engagement", "Cold outreach"] },
              { icon: Globe, title: "Landing Pages", desc: "Conversion-focused pages built inside your own accounts. One goal per page, no distractions.", tags: ["Lead capture", "A/B tested", "Fast load"] },
              { icon: Zap, title: "Funnel & Automation", desc: "The full path from click to qualified lead, automated. Forms, redirects, CRM entry, and follow-up all connected.", tags: ["CRM setup", "Lead scoring", "Automation"] },
            ].map((service) => (
              <motion.div
                key={service.title}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="bg-card border border-border rounded-2xl p-6 md:p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <service.icon className="w-5 h-5 text-purple-deep shrink-0" />
                  <h3 className="text-base font-bold text-foreground">{service.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map(tag => (
                    <span key={tag} className="badge-pill text-[11px] font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {platforms.map((p) => (
              <span key={p} className="text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1.5 bg-card">
                {p}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">How we're different</p>
            <h2 className="text-3xl font-extrabold text-foreground">Why clients stay with us</h2>
          </motion.div>
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[
              { icon: Target, title: "We know who to target", desc: "Every campaign starts with your ideal buyer profile. We don't run broad ads and hope for the best." },
              { icon: Users, title: "You get a real team", desc: "Not a junior account manager. You work with strategists, writers, and buyers who know your account." },
              { icon: TrendingUp, title: "We get paid on results", desc: "Our fees are tied to what we deliver. If the leads don't come in, we don't get paid." },
              { icon: BarChart3, title: "You see everything", desc: "Live dashboards, no hidden metrics. You always know what's running and what it costs." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                className="group relative bg-card border border-border rounded-2xl p-6 md:p-8 flex gap-5 overflow-hidden hover:border-purple-deep/30 transition-all duration-300"
              >
                <span className="absolute bottom-3 right-4 text-8xl font-extrabold text-muted/20 group-hover:text-purple-deep/10 transition-colors leading-none select-none tabular-nums pointer-events-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <item.icon className="w-6 h-6 text-purple-deep shrink-0 relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Interested in working together?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              We keep our client list small so we can focus. If you think there's a fit, reach out and let's talk.
            </p>
            <Button
              variant="hero"
              size="lg"
              className="rounded-full text-base px-10 py-6 font-bold w-full sm:w-auto"
              onClick={() => navigate('/contact', { state: { scrollToForm: true } })}
              aria-label="Get in touch with Markety"
            >
              Get in touch
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
