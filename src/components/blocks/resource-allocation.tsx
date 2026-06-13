import type { SiteStrings } from "@/i18n/site-translations";

export const ResourceAllocation = ({ t }: { t: SiteStrings }) => {
  const top = t.process.steps.slice(0, 2);
  const bottom = t.process.steps.slice(2);

  return (
    <section id="resource-allocation" className="pb-28 lg:pb-32">
      <div className="container">
        <h2 className="text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
          How we do it &amp; more
        </h2>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border lg:mt-16">
          <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
            {top.map((step, i) => (
              <Card key={i} step={step} index={i} />
            ))}
          </div>
          <div className="flex flex-col divide-y divide-border border-t border-border sm:flex-row sm:divide-x sm:divide-y-0">
            {bottom.map((step, i) => (
              <Card key={i} step={step} index={i + 2} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ step, index }: { step: { title: string; description: string }; index: number }) => (
  <div className="flex flex-1 flex-col gap-5 p-6 lg:p-8">
    <div className="flex items-center gap-2">
      <div className="size-1.5 rounded-full bg-purple-500" />
      <span className="font-mono text-xs tracking-widest text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
    </div>
  </div>
);
