import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const cases = [
  {
    industry: "SaaS / B2B",
    challenge:
      "The client was spending £8,000/month on Google Ads with a cost per lead of £310. Most leads were low-quality and rarely converted past a demo.",
    solution:
      "We rebuilt the campaign structure from scratch, introduced tighter audience targeting on LinkedIn, and created a dedicated landing page for each ad group with a clear single CTA.",
    metrics: [
      { label: "Cost per lead",        before: "£310",          after: "£148",       delta: "−52%" },
      { label: "Qualified leads / mo", before: "26",            after: "79",         delta: "+200%" },
      { label: "Demo-to-close rate",   before: "11%",           after: "28%",        delta: "+17pp" },
    ],
    timeframe: "60 days",
  },
  {
    industry: "Professional Services",
    challenge:
      "The client relied entirely on referrals and had no outbound system. Their sales team had empty pipelines outside of word-of-mouth.",
    solution:
      "We built a cold email outreach system targeting mid-market finance directors, paired with a 5-step nurture sequence that moved prospects from cold to booked meeting automatically.",
    metrics: [
      { label: "Pipeline added",     before: "£0 outbound", after: "£68K / mo", delta: "From £0" },
      { label: "Meetings booked",    before: "0 / mo",      after: "14 / mo",   delta: "+14" },
      { label: "Email open rate",    before: "No system",   after: "44%",       delta: "44%" },
    ],
    timeframe: "45 days",
  },
  {
    industry: "E-commerce / DTC",
    challenge:
      "The client had strong organic traffic but no system to capture and convert that audience. Their email list was dormant and Meta ads were ROAS negative.",
    solution:
      "We launched a retargeting strategy on Meta, rebuilt their email automation with a 7-email welcome flow, and A/B tested their product page CTAs.",
    metrics: [
      { label: "Email revenue share",    before: "4%",   after: "31%",   delta: "+27pp" },
      { label: "Meta ROAS",              before: "0.8×", after: "3.4×",  delta: "+325%" },
      { label: "Monthly leads captured", before: "120",  after: "890",   delta: "+641%" },
    ],
    timeframe: "90 days",
  },
];

const CaseStudiesSection = () => {
  return (
    <section className="py-14 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Real results</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            What happens when you work with us
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three industries. Three different problems. One outcome: more qualified leads, faster.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
        >
          {cases.map((c) => (
            <motion.div
              key={c.industry}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-purple-deep bg-purple-deep/10 px-2.5 py-1 rounded-full">
                  {c.industry}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-2.5 py-1 shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  {c.timeframe}
                </div>
              </div>

              {/* Challenge */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">The problem</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.challenge}</p>
              </div>

              {/* Solution */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">What we did</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.solution}</p>
              </div>

              {/* Metrics */}
              <div className="border-t border-border pt-4 mt-auto">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Results</p>
                <div className="flex flex-col gap-2.5">
                  {c.metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/50 line-through">{m.before}</span>
                        <span className="text-xs font-bold text-foreground">{m.after}</span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-500">
                          <ArrowUpRight className="w-3 h-3" />
                          {m.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
