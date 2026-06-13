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
                  "group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/70 to-muted/20 p-6 lg:p-8",
                  i === 4 && "md:col-span-2",
                )}
              >
                <span className="pointer-events-none absolute -bottom-5 right-3 select-none font-black leading-none text-foreground/[0.05] text-[6rem] lg:text-[7.5rem]">
                  {i + 1}
                </span>

                <div className="relative flex flex-col gap-6">
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 ring-1 ring-purple-500/20 dark:bg-purple-400/10 dark:text-purple-400">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
