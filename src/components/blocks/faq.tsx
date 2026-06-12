import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "How it works",
    questions: [
      {
        question: "What exactly does Markety do?",
        answer:
          "Markety is a lead generation agency. We build and manage your full acquisition system - paid ad campaigns, landing pages, and email follow-up sequences - so that qualified prospects land in your sales team's inbox, ready for a conversation.",
      },
      {
        question: "How is Markety different from a traditional marketing agency?",
        answer:
          "Most agencies charge a retainer and deliver impressions or clicks. We charge per qualified lead - meaning we only win when you win. Everything we do is optimised around one outcome: delivering prospects who are genuinely interested and match your criteria.",
      },
      {
        question: "What counts as a 'qualified lead'?",
        answer:
          "We define a qualified lead together before we start. That usually means a person who fits your target profile, has shown genuine interest in your offer, and has provided contact details. We agree on the definition upfront so there are no surprises.",
      },
    ],
  },
  {
    title: "Leads & Pricing",
    questions: [
      {
        question: "How soon will I start seeing leads?",
        answer:
          "Most clients see their first leads within 7-14 days of campaigns going live. The first week after launch we're collecting data and optimising - volume typically ramps up in weeks 2 and 3.",
      },
      {
        question: "How much does it cost?",
        answer:
          "We charge per qualified lead delivered. Pricing starts at around $2.80 per lead depending on your industry and volume. There are no monthly retainers - you pay for results. Contact us for a quote tailored to your business.",
      },
    ],
  },
  {
    title: "Getting started",
    questions: [
      {
        question: "Do I need to provide anything to get started?",
        answer:
          "We need access to your ad accounts and a brief about your business, target customer, and offer. We handle everything else - creative, copy, landing pages, and setup. Most clients are live within 5-7 business days.",
      },
      {
        question: "Can I stop working with you at any time?",
        answer:
          "Yes. After the initial 30-day engagement period, we work on a rolling month-to-month basis. You can cancel with 14 days written notice. We believe the results should speak for themselves - we don't lock people in.",
      },
    ],
  },
];

export const FAQ = ({
  headerTag = "h2",
  className,
  className2,
}: {
  headerTag?: "h1" | "h2";
  className?: string;
  className2?: string;
}) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className={cn("mx-auto grid gap-16 lg:grid-cols-2", className2)}>
          <div className="space-y-4">
            {headerTag === "h1" ? (
              <h1 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Got Questions?
              </h1>
            ) : (
              <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Got Questions?
              </h2>
            )}
            <p className="text-muted-foreground max-w-md leading-snug lg:mx-auto">
              If you can't find what you're looking for,{" "}
              <Link href="/contact" className="hover:opacity-75 transition-opacity">
                get in touch
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-6 text-start">
            {categories.map((category, categoryIndex) => (
              <div key={category.title} className="">
                <h3 className="text-muted-foreground border-b py-4">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${categoryIndex}-${i}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
