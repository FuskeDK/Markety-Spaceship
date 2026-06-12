import { DashedLine } from "@/components/dashed-line";

const stats = [
  {
    value: "~$2.80",
    label: "Avg. cost per qualified lead",
  },
  {
    value: "150+",
    label: "Companies served",
  },
  {
    value: "50K+",
    label: "Leads delivered",
  },
  {
    value: "Denmark",
    label: "Based in",
  },
];

export function AboutHero() {
  return (
    <section className="">
      <div className="container flex max-w-5xl flex-col justify-between gap-8 md:gap-20 lg:flex-row lg:items-center lg:gap-24 xl:gap-24">
        <div className="flex-[1.5]">
          <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Turning ad spend into qualified leads
          </h1>

          <p className="text-muted-foreground mt-5 text-2xl md:text-3xl lg:text-4xl">
            Markety builds and manages your complete lead generation system.
          </p>

          <p className="text-muted-foreground mt-8 hidden max-w-lg space-y-6 text-lg text-balance md:block lg:mt-12">
            We’re a lead generation agency built from the ground up to deliver
            qualified prospects to your sales team. No generic playbooks, no
            wasted budget - just a system tuned to your business and your
            customers.
            <br />
            <br />
            We are customer-obsessed - investing the time to understand every
            aspect of your sales process so that we can build campaigns that
            actually convert. We work on a pay-per-lead model because your
            success is our success. We don’t win unless you do.
          </p>
        </div>

        <div
          className={`relative flex flex-1 flex-col justify-center gap-3 pt-10 lg:pt-0 lg:pl-10`}
        >
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <div className="font-display text-4xl tracking-wide md:text-5xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
