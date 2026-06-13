import { BookOpen, PieChart, PhoneCall, Rocket, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SiteStrings } from "@/i18n/site-translations";

const ICONS = [BookOpen, Wrench, Rocket, PhoneCall, PieChart];

export const ResourceAllocation = ({ t }: { t: SiteStrings }) => {
  return (
    <section id="resource-allocation" className="pb-28 lg:pb-32">
      <div className="container">
        <h2 className="text-center text-3xl tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
          How we do it &amp; more
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-16 lg:gap-5">
          {t.process.steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-5 rounded-2xl border border-border p-6 lg:p-8",
                  i === 4 && "md:col-span-2 md:flex-row md:items-center md:gap-12 lg:col-span-1 lg:flex-col lg:items-start lg:gap-5",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 ring-1 ring-purple-500/20 dark:bg-purple-400/10 dark:text-purple-400">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className={cn(i === 4 && "md:flex-1 lg:flex-none")}>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
