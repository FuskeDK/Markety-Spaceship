"use client";

import { useEffect, useState } from "react";
import { DashedLine } from "@/components/dashed-line";
import type { SiteStrings } from "@/i18n/site-translations";

interface StatsData { leadsThisYear: number; companiesCount: number; }
function formatLeads(n: number) { return n >= 1000 ? `${Math.floor(n / 1000)}K+` : `${n}+`; }

export function AboutHero({ t }: { t: SiteStrings }) {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const stats = [
    { value: "~$2.80", label: t.about.statsLabels[0] },
    { value: data ? `${data.companiesCount}+` : "150+", label: t.about.statsLabels[1] },
    { value: data ? formatLeads(data.leadsThisYear) : "50K+", label: t.about.statsLabels[2] },
    { value: "Denmark", label: t.about.statsLabels[3] },
  ];

  return (
    <section className="">
      <div className="container flex max-w-5xl flex-col justify-between gap-8 md:gap-20 lg:flex-row lg:items-center lg:gap-24 xl:gap-24">
        <div className="flex-[1.5]">
          <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">{t.about.headline}</h1>
          <p className="text-muted-foreground mt-5 text-2xl md:text-3xl lg:text-4xl">{t.about.subheadline}</p>
          <p className="text-muted-foreground mt-8 hidden max-w-lg space-y-6 text-lg text-balance md:block lg:mt-12">
            {t.about.body}
            <br /><br />
            {t.about.body2}
          </p>
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-3 pt-10 lg:pt-0 lg:pl-10">
          <DashedLine orientation="vertical" className="absolute top-0 left-0 max-lg:hidden" />
          <DashedLine orientation="horizontal" className="absolute top-0 lg:hidden" />
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <div className="font-display text-4xl tracking-wide md:text-5xl">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
