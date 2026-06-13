import Image from "next/image";
import { ArrowRight, ChartNoAxesColumn, FileText, Mail, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteStrings } from "@/i18n/site-translations";

const ICONS = [Mail, TrendingUp, FileText, ChartNoAxesColumn];

export const Hero = ({ t }: { t: SiteStrings }) => {
  return (
    <section className="pb-16 pt-32 lg:pb-20 lg:pt-44">
      <div className="container flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-purple-500" />
          Pay only per qualified lead · No monthly retainer
        </div>
        <h1 className="text-foreground max-w-4xl text-4xl tracking-tight md:text-5xl lg:text-6xl">
          {t.hero.headline}
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg md:text-xl">
          {t.hero.subheadline}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <a href="/contact">{t.hero.ctaPrimary}</a>
          </Button>
          <Button size="lg" variant="outline" className="from-background gap-2 bg-linear-to-r to-transparent shadow-md" asChild>
            <a href="/#resource-allocation">
              {t.hero.ctaSecondary}
              <ArrowRight className="size-4 stroke-3" />
            </a>
          </Button>
        </div>
      </div>

      <div className="container mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 lg:mt-16">
        {t.hero.features.map((feature, i) => {
          const Icon = ICONS[i];
          return (
            <div key={feature.title} className="rounded-2xl border bg-card p-5">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                <Icon className="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-text text-sm font-semibold text-foreground">{feature.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 max-lg:ml-6 max-lg:h-[550px] max-lg:overflow-hidden md:mt-16 lg:container lg:mt-20">
        <div className="relative h-[793px] w-full">
          <Image src="/hero.webp" alt="hero" fill className="rounded-2xl object-cover object-left-top shadow-lg max-lg:rounded-tr-none" />
        </div>
      </div>
    </section>
  );
};
