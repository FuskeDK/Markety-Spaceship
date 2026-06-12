import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What exactly does Markety do?",
    answer:
      "We run your full lead generation system - ad campaigns, landing pages, funnels, and follow-ups. You give us access to your accounts and we handle everything. Your sales team just shows up to conversations with people who are already interested.",
  },
  {
    question: "How much does lead generation cost?",
    answer:
      "Our pricing is pay-per-lead, not a fixed monthly retainer. Before we start, we agree on what a qualified lead looks like for your business, and that's what you pay for. You only pay for results.",
  },
  {
    question: "What kind of businesses do you generate leads for?",
    answer:
      "We work with local businesses and service-based companies - contractors, agencies, consultants, clinics, tradespeople - who want a steady flow of qualified prospects without managing marketing themselves.",
  },
  {
    question: "How quickly will I see results?",
    answer:
      "Most clients start receiving leads within the first 2 weeks. The first few days are spent setting up your campaigns, landing pages, and email flows. After that, we go live and start optimizing.",
  },
  {
    question: "Do I need to do anything myself?",
    answer:
      "Very little. We need access to your ad accounts and about 30 minutes to understand your business and what a good lead looks like for you. After that, we take care of everything. You just talk to the leads we send your way.",
  },
  {
    question: "What if the leads aren't good quality?",
    answer:
      "We define exactly what counts as a qualified lead with you before we start. If a lead doesn't meet that standard, it doesn't count. We're motivated to send you people who are actually ready to buy. That's how we get paid.",
  },
  {
    question: "Can I stop working with you at any time?",
    answer:
      "Yes. We don't lock you into long-term contracts. If things aren't working, you can walk away. We'd rather earn your business every month than hold you to a 12-month deal.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-14 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Straight answers to the things people usually ask before working with us.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-card border border-border rounded-lg px-6"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5 hover:text-purple-deep data-[state=open]:text-purple-deep transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
