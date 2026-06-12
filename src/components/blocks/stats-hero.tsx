"use client";

import { useEffect, useState } from "react";
import type { SiteStrings } from "@/i18n/site-translations";

interface StatsData {
  leadsThisYear: number;
  companiesCount: number;
}

function formatLeads(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  return `${n}+`;
}

export const StatsHero = ({ t }: { t: SiteStrings }) => {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const stats = [
    { value: "~$2.80", label: t.stats.labels[0] },
    { value: data ? `${data.companiesCount}+` : "150+", label: t.stats.labels[1] },
    { value: data ? formatLeads(data.leadsThisYear) : "50K+", label: t.stats.labels[2] },
    { value: "Denmark", label: t.stats.labels[3] },
  ];

  return (
    <section className="py-28 lg:py-32">
      <div className="container max-w-5xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-5 pr-0 md:pr-16">
            <h2
              className="text-3xl tracking-tight md:text-4xl lg:text-5xl bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to bottom, var(--color-foreground) 0%, color-mix(in oklch, var(--color-foreground) 75%, transparent) 100%)" }}
            >
              {t.stats.heading}
            </h2>
            <p className="text-muted-foreground text-lg leading-snug">{t.stats.sub1}</p>
            <p className="text-muted-foreground hidden leading-relaxed md:block">{t.stats.sub2}</p>
          </div>

          <div className="relative mt-10 pt-10 md:mt-0 md:pt-0 md:pl-16">
            <div className="absolute top-0 left-0 hidden h-[calc(100%+3.5rem)] w-px border-l border-dashed border-border md:block" style={{ maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
            <div className="absolute top-0 inset-x-0 h-px border-t border-dashed border-border md:hidden" />
            <div className="absolute top-0 right-0 hidden h-[calc(100%+3.5rem)] w-px border-r border-dashed border-border md:block" style={{ maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

            <div className="flex flex-col">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1 border-b border-dashed border-border py-5 first:pt-0 last:border-0">
                  <span className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{stat.value}</span>
                  <span className="text-muted-foreground text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
