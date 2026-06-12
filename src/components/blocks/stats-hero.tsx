const stats = [
  { value: "~$2.80", label: "Avg. cost per qualified lead" },
  { value: "150+", label: "Companies served" },
  { value: "50K+", label: "Leads delivered" },
  { value: "Denmark", label: "Based in" },
];

export const StatsHero = () => {
  return (
    <section className="py-28 lg:py-32">
      <div className="container max-w-5xl">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Left - Headline + Copy */}
          <div className="flex flex-col justify-center gap-5 pr-0 md:pr-16">
            <h2
              className="text-3xl tracking-tight md:text-4xl lg:text-5xl bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, var(--color-foreground) 0%, color-mix(in oklch, var(--color-foreground) 75%, transparent) 100%)",
              }}
            >
              We turn ad spend into qualified conversations
            </h2>
            <p className="text-muted-foreground text-lg leading-snug">
              A full lead generation system, built and managed for you.
            </p>
            <p className="text-muted-foreground hidden leading-relaxed md:block">
              No retainers. No vanity metrics. We charge per qualified lead and
              work backwards from your sales process to build a system that
              delivers people who are already interested and ready to talk.
            </p>
          </div>

          {/* Right - Stats with dashed borders */}
          <div className="relative mt-10 pt-10 md:mt-0 md:pt-0 md:pl-16">
            {/* Vertical separator - left edge of right column (desktop) */}
            <div
              className="absolute top-0 left-0 hidden h-[calc(100%+3.5rem)] w-px border-l border-dashed border-border md:block"
              style={{
                maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to top, black 0%, transparent 100%)",
              }}
            />
            {/* Horizontal separator (mobile) */}
            <div
              className="absolute top-0 inset-x-0 h-px border-t border-dashed border-border md:hidden"
            />
            {/* Right edge line (desktop) */}
            <div
              className="absolute top-0 right-0 hidden h-[calc(100%+3.5rem)] w-px border-r border-dashed border-border md:block"
              style={{
                maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to top, black 0%, transparent 100%)",
              }}
            />

            <div className="flex flex-col">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 border-b border-dashed border-border py-5 first:pt-0 last:border-0"
                >
                  <span className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
