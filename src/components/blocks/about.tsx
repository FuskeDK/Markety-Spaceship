import Image from "next/image";
import Link from "next/link";
import { Target, Users, TrendingUp, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

const HOW_WE_WORK_STEPS = [
  {
    title: "We learn your business",
    description: "You tell us about your customers, sales process, and what a qualified lead looks like. No generic playbooks.",
  },
  {
    title: "We build your system",
    description: "Landing pages, email sequences, and ad campaigns - all built and tested before anything goes live.",
  },
  {
    title: "We launch and optimise",
    description: "Campaigns go live and we start testing immediately. Every week we cut what isn't working and scale what is.",
  },
  {
    title: "Leads arrive, you close",
    description: "Your sales team gets a steady stream of people who are already interested and fully qualified.",
  },
];

const VALUES = [
  {
    icon: Target,
    title: "We win when you win",
    description: "Our pay-per-lead model means we have one job: deliver qualified prospects. We don't earn retainers or hide behind vanity metrics. If your pipeline isn't growing, we're not doing our job.",
  },
  {
    icon: Users,
    title: "We keep it personal",
    description: "We are a small team and we intend to stay that way. Every client gets direct access to the people building their campaigns. No account managers, no handoffs.",
  },
  {
    icon: TrendingUp,
    title: "We move fast and iterate",
    description: "We don't sit on campaigns for weeks. We launch, collect data, and improve quickly. Most clients see their first results within 7 to 14 days of going live.",
  },
  {
    icon: Shield,
    title: "We are transparent",
    description: "You always know what you are paying for, what is working, and what isn't. We send weekly performance reports and flag issues before you have to ask.",
  },
];

const About = () => {
  return (
    <div>
      {/* Mission intro - text only, no images */}
      <section className="container max-w-5xl mt-10 md:mt-16 lg:mt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              About us
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              We build lead machines for businesses serious about growth.
            </h2>
          </div>
          <div className="text-muted-foreground space-y-5 text-lg leading-relaxed">
            <p>
              At Markety, we are dedicated to one thing: delivering qualified leads to your sales team. Our mission is to give every business access to the kind of full-funnel lead generation system that only the best-resourced companies used to afford.
            </p>
            <p>
              We are customer-obsessed - investing the time to understand every aspect of your business before we build anything. We work on a pay-per-lead model because we believe in earning our keep. We don't win unless you do.
            </p>
          </div>
        </div>
      </section>

      {/* Three images - portrait row with offset middle */}
      <section className="container max-w-5xl mt-12 md:mt-16">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4" }}>
            <Image src="/about/1.webp" alt="Team at work" fill className="object-cover" />
          </div>
          <div className="relative overflow-hidden rounded-2xl mt-8 md:mt-12" style={{ aspectRatio: "3/4" }}>
            <Image src="/about/2.webp" alt="Campaign work" fill className="object-cover" />
          </div>
          <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4" }}>
            <Image src="/about/3.webp" alt="Team environment" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Team section - simple 2-col: text left, image right */}
      <section className="container max-w-5xl mt-20 md:mt-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">The team</h2>
            <div className="text-muted-foreground mt-6 space-y-4 text-lg leading-relaxed">
              <p>
                We started Markety to solve a problem we kept seeing: companies spending money on ads without a reliable, repeatable way to turn clicks into qualified conversations.
              </p>
              <p>
                We are a small, focused team based in Denmark. We keep things lean so we can move fast and stay close to our clients. Every campaign we run is built and managed by people who care about results, not just delivery.
              </p>
              <p>
                If you want to work with a team that treats your pipeline like it's our own, get in touch.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/contact">
                <Button size="lg">Get in touch</Button>
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "4/5" }}>
            <Image src="/about/4.webp" alt="Our team" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container mt-24 max-w-5xl lg:mt-32">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Our process
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How we work</h2>
          <p className="text-muted-foreground mt-4 text-lg leading-snug">
            We don't do generic playbooks. Before anything goes live, we spend time understanding your business, your customers, and what a qualified lead actually looks like for you.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-8 w-px bg-gradient-to-b from-purple-500 to-transparent md:hidden" />
          <div className="absolute top-5 left-[10%] right-[10%] hidden h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent md:block" />
          <div className="grid gap-10 md:gap-4 md:grid-cols-4">
            {HOW_WE_WORK_STEPS.map((step, i) => (
              <div key={i} className="relative flex gap-6 pl-14 md:flex-col md:items-center md:pl-0 md:text-center md:pt-0">
                <div className="absolute left-0 top-0 z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-purple-500 bg-background text-sm font-bold text-purple-600 dark:text-purple-400 md:static md:mx-auto">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mt-24 max-w-5xl lg:mt-32">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Our principles
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">What we stand for</h2>
          <p className="text-muted-foreground mt-4 text-lg leading-snug">
            Four principles that shape how we build campaigns and work with clients.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="flex flex-col gap-3">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 ring-1 ring-purple-500/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mt-24 max-w-5xl lg:mt-32">
        <div className="rounded-3xl bg-muted p-8 md:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why pay per lead?</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Most marketing agencies charge a monthly retainer regardless of results. We think that's backwards. When you pay per qualified lead, our incentives are aligned with yours. We only earn when we deliver.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              This model also means we're selective about who we work with. We only take on clients we believe we can genuinely help, because our reputation depends on it.
            </p>
          </div>
          <div className="mt-8 shrink-0 lg:mt-0">
            <Link href="/contact">
              <Button size="lg">Start for free</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
