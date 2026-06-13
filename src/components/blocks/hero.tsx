import Image from "next/image";
import { ArrowRight, ChartNoAxesColumn, FileText, Mail, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteStrings } from "@/i18n/site-translations";

const ICONS = [Mail, TrendingUp, FileText, ChartNoAxesColumn];

export const Hero = ({ t }: { t: SiteStrings }) => {
  return (
    <section className="pb-16 pt-32 lg:pb-20 lg:pt-44">
      <div className="container flex flex-col">
        <h1 className="text-foreground max-w-3xl text-4xl tracking-tight md:text-5xl lg:text-6xl">
          {t.hero.headline}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-lg md:text-xl">
          {t.hero.subheadline}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
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

      <div className="container mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 lg:mt-16">
        {t.hero.features.map((feature, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={feature.title}
              className="group flex items-start gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-purple-200 dark:hover:border-purple-800"
            >
              <div className="shrink-0 inline-flex size-10 items-center justify-center rounded-xl bg-purple-600 dark:bg-purple-700">
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <h2 className="font-text text-sm font-semibold text-foreground">{feature.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
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
