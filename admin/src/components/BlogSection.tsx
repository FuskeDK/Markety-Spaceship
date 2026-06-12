import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";

const posts = [
  {
    tag: "Email Marketing",
    tagColor: "bg-blue-500/10 text-blue-400",
    title: "How to generate 50 qualified leads a month with cold email",
    excerpt:
      "Most cold email campaigns fail because they treat everyone the same. Here's the system we use to write sequences that average a 42% open rate and actually start conversations.",
    readTime: "5 min read",
    date: "Jan 2026",
    content: [
      {
        heading: null,
        body: "Most cold email fails for one reason: it's written for everyone, so it resonates with no one. You can't send the same email to a fintech CTO and a retail marketing manager and expect results from both.",
      },
      {
        heading: "Start with a tight audience",
        body: "Before writing a single word, define exactly who you're emailing, what their day looks like, and what problem they're sitting with right now. The more specific this is, the better the copy can be. Vague audiences produce vague emails. Vague emails get ignored.",
      },
      {
        heading: "Keep the sequence short",
        body: "We build 4 to 6 emails sent over 10 to 14 days. The first email is always the simplest. One sentence introducing who you are, one sentence on why you're reaching out to them specifically, and one soft question or CTA. No pitch deck links, no wall of text. The follow-ups test different angles until something resonates.",
      },
      {
        heading: "The 42% open rate formula",
        body: "It comes down to two things: subject lines written the way a colleague would write them (no marketing language), and clean sending infrastructure with properly warmed domains. Deliverability kills more campaigns than bad copy does, and most people completely ignore it.",
      },
      {
        heading: "One thing to remember",
        body: "The goal of a cold email is not to sell. It's to start a conversation. Keep that in mind and you'll write better emails automatically. Every word should be in service of a reply, not a purchase.",
      },
    ],
  },
  {
    tag: "Paid Ads",
    tagColor: "bg-amber-500/10 text-amber-400",
    title: "Why your Google Ads aren't converting (and how to fix it)",
    excerpt:
      "Clicks without conversions usually come down to one of four problems. We break down each one with real account examples and the exact fix we apply.",
    readTime: "4 min read",
    date: "Feb 2026",
    content: [
      {
        heading: null,
        body: "Spending money on Google Ads and seeing clicks but no leads is one of the most frustrating positions to be in. You know people are finding you. They're just not doing anything. In our experience, it almost always comes down to one of four problems.",
      },
      {
        heading: "1. The landing page doesn't match the ad",
        body: "If your ad says 'get a free lead generation audit' and the landing page is your homepage, you've lost them. Every ad needs its own dedicated page with one job. Sending traffic to a generic page and expecting conversions is the most common and most fixable mistake we see.",
      },
      {
        heading: "2. You're bidding on the wrong keywords",
        body: "Broad match and smart campaigns love spending your budget on search terms that sound related but have zero buying intent. Pull your search terms report and you'll usually find a long list of irrelevant queries eating 30-40% of the budget. Add negatives aggressively.",
      },
      {
        heading: "3. The copy isn't specific enough",
        body: "'High quality service' and 'trusted by businesses' tell nobody anything. Speak to a specific problem your buyer has right now. Be direct about what they get and what happens next. The more your ad reads like it was written for one person, the better it will perform.",
      },
      {
        heading: "4. The conversion tracking is measuring the wrong thing",
        body: "We've audited accounts where the conversion being optimised for was a page view, not a form submission. Google's algorithm optimises for whatever you tell it to. Make sure you're telling it the right thing. Fix the tracking before you touch anything else.",
      },
    ],
  },
  {
    tag: "Conversion",
    tagColor: "bg-emerald-500/10 text-emerald-400",
    title: "The anatomy of a high-converting landing page",
    excerpt:
      "After building hundreds of landing pages we've found the same 7 elements show up in the ones that convert above 12%. This is what they all have in common.",
    readTime: "6 min read",
    date: "Feb 2026",
    content: [
      {
        heading: null,
        body: "After building landing pages across a lot of different industries, the ones that convert well share a consistent structure. Here's what they all have.",
      },
      {
        heading: "A headline about the outcome, not the service",
        body: "Visitors decide in seconds whether to stay. If your headline is your company name or your tagline, you're wasting that window. Speak to the result the visitor wants, not what you do.",
      },
      {
        heading: "A subheadline that handles the obvious objection",
        body: "Whatever a sceptical person would think after reading your headline, address it immediately underneath. Pre-empting doubt keeps people reading.",
      },
      {
        heading: "One CTA, not three",
        body: "Every page we've tested with multiple options underperforms against pages with a single direction. Too many choices and people make none. Pick one action and point everything at it.",
      },
      {
        heading: "Social proof above the fold",
        body: "A review, a logo strip, a number. Something that tells the visitor other people trust you before they've even read the rest of the page. Trust signals placed early do far more work than ones buried at the bottom.",
      },
      {
        heading: "Benefit-led copy",
        body: "Not 'we use advanced targeting algorithms' but 'you only pay for leads that match your criteria.' Same thing, completely different effect. Always write from the reader's perspective, not yours.",
      },
      {
        heading: "A short form",
        body: "Every extra field reduces conversions. Name and email gets more responses than name, email, phone, company, job title, and budget range. Ask for what you actually need at this stage, nothing more.",
      },
    ],
  },
  {
    tag: "Strategy",
    tagColor: "bg-purple-light text-purple-deep",
    title: "B2B lead generation in 2025: what actually works",
    excerpt:
      "The tactics from 2021 are dead. Buyers are smarter, inboxes are noisier, and ad costs are up. Here's the full-funnel approach we're using to consistently hit targets.",
    readTime: "7 min read",
    date: "Jan 2026",
    content: [
      {
        heading: null,
        body: "The lead generation playbook from a few years ago is largely broken. Inboxes are overcrowded, ad costs have gone up, and buyers are more sceptical than they've ever been. The tactics that worked on autopilot before now require a lot more thought.",
      },
      {
        heading: "Targeted outreach over volume",
        body: "Sending 200 well-researched emails to the right people consistently outperforms blasting 2,000 generic ones. Tools that let you personalise at scale have made this more achievable, but the strategy still wins on specificity, not volume. Know who you're talking to before you say a word.",
      },
      {
        heading: "Shorter, simpler conversion paths",
        body: "The more steps between a visitor and becoming a lead, the more you lose. Cut the steps. A form with two fields on a focused landing page beats a multi-page funnel for most B2B offers. Simplicity isn't lazy. It's one of the highest-leverage things you can do.",
      },
      {
        heading: "Content that actually answers real questions",
        body: "Generic thought leadership doesn't do much anymore. Specific, practical content that helps your target buyer solve a real problem builds trust faster and earns attention more honestly. Write about what people are actually searching for, not what sounds impressive.",
      },
      {
        heading: "Retargeting as a standard part of every campaign",
        body: "Most people don't convert on their first visit. Running retargeting ads to people who've already shown interest is consistently one of the best uses of ad budget. High intent, lower cost per lead compared to cold traffic. If you're not doing this, you're leaving a lot on the table.",
      },
      {
        heading: "The bottom line",
        body: "The businesses generating strong pipelines right now aren't doing anything exotic. They've built reliable systems across these channels and they're consistent with them. Consistency beats cleverness in lead generation, almost every time.",
      },
    ],
  },
];

const BlogSection = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="py-14 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">From the blog</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Lead generation, explained plainly
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No-fluff guides from the team that runs campaigns every day. Tactics you can actually use.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {expanded === null ? (

              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {posts.map((post, i) => (
                  <motion.article
                    key={post.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    onClick={() => setExpanded(i)}
                    className="group bg-card border border-border rounded-lg p-6 flex flex-col gap-3 hover:border-purple-deep/40 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>
                        {post.tag}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-purple-deep transition-colors duration-200">
                      {post.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-purple-deep group-hover:gap-2 transition-all duration-200">
                        Read more <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (

              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-card border border-border rounded-lg p-8 md:p-10"
              >
                {}
                <button
                  onClick={() => setExpanded(null)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200 mb-7"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to articles
                </button>

                {}
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${posts[expanded].tagColor}`}>
                    {posts[expanded].tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {posts[expanded].readTime}
                  </div>
                  <span className="text-xs text-muted-foreground">{posts[expanded].date}</span>
                </div>

                {}
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-snug mb-8">
                  {posts[expanded].title}
                </h2>

                {}
                <div className="flex flex-col gap-6">
                  {posts[expanded].content.map((section, i) => (
                    <div key={i}>
                      {section.heading && (
                        <h3 className="text-base font-bold text-foreground mb-2">
                          {section.heading}
                        </h3>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {section.body}
                      </p>
                    </div>
                  ))}
                </div>

                {}
                <div className="mt-10 pt-7 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Want us to build this for you?
                  </p>
                  <button
                    onClick={() => setExpanded(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to articles
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
