import Link from "next/link";
import { CheckCircle, Wrench, TrendingUp, Shield } from "lucide-react";
import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    title: "We learn your business",
    description: "We spend time understanding your customers, your area, and what a qualified lead looks like for you.",
  },
  {
    number: "02",
    title: "We build your ads and landing page",
    description: "We set up your Google and Facebook campaigns and build a dedicated landing page — all included free.",
  },
  {
    number: "03",
    title: "Leads arrive, you close",
    description: "Qualified enquiries come straight to you. You focus on the work, we keep the leads flowing.",
  },
];

const WHAT_YOU_GET = [
  {
    icon: Wrench,
    title: "Free website and landing page",
    description: "We build and maintain your landing page at no cost — included as long as you run leads with us.",
  },
  {
    icon: Shield,
    title: "Pay per lead only",
    description: "No fixed monthly fee. No retainer. You only pay when you receive a qualified enquiry.",
  },
  {
    icon: TrendingUp,
    title: "First 30 days free",
    description: "Try it completely free for the first month. No card required to get started.",
  },
];

export default function JohnsonsPlumbingLondon() {
  return (
    <Background variant="top">
      <div className="pb-28 pt-32 lg:pb-32 lg:pt-44">

        {/* Hero */}
        <section className="container max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Johnson&apos;s Plumbing · London
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Get more plumbing clients in London — guaranteed.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            We run Google and Facebook ads to bring qualified customers straight to you. You only pay when you get an enquiry — no monthly fees, no risk.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/contact">Get free leads</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact" className="hover:opacity-75 transition-opacity">Learn more</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No monthly fee", "First 30 days free", "Free website included"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* What you get */}
        <section className="container mt-24 max-w-5xl lg:mt-32">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              What&apos;s included
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to grow
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              We handle the marketing so you can focus on the work.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
              {WHAT_YOU_GET.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-background flex flex-col gap-4 p-6 lg:p-8">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 ring-1 ring-purple-500/20 dark:bg-purple-400/10 dark:text-purple-400">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container mt-24 max-w-5xl lg:mt-32">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Our process
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Up and running in days, not months.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col gap-4 pl-5 relative">
                <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-purple-500 to-purple-500/0" />
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">{step.number}</span>
                  <div className="size-1.5 rounded-full bg-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="container mt-24 max-w-5xl lg:mt-32">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Social proof
          </div>
          <h2 className="mb-10 text-3xl font-bold tracking-tight md:text-4xl">
            Join plumbers across the UK already using Markety
          </h2>
          <div className="rounded-2xl border border-border bg-muted p-8 md:p-10">
            <p className="text-lg leading-relaxed text-foreground">
              &ldquo;We were sceptical at first — we&apos;d tried agencies before and wasted a lot of money. Markety is completely different. We paid nothing for the first month and got 11 enquiries. Now we&apos;re running at full capacity and turning work away.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-600/10 ring-1 ring-purple-500/20 flex items-center justify-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                DM
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Dave M.</p>
                <p className="text-xs text-muted-foreground">Plumber · South London</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mt-24 max-w-5xl lg:mt-32">
          <div className="rounded-3xl bg-muted p-8 md:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The first 30 days are completely free. No card required. We&apos;ll have your first leads coming in within a week.
              </p>
            </div>
            <div className="mt-8 shrink-0 lg:mt-0">
              <Button size="lg" asChild>
                <Link href="/contact">Get free leads</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </Background>
  );
}
