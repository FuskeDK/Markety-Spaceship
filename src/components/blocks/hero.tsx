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
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href="/#resource-allocation">
              {t.hero.ctaSecondary}
              <ArrowRight className="size-4 stroke-3" />
            </a>
          </Button>
        </div>
      </div>

      <div className="container mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 md:mt-16 lg:mt-20">
        {t.hero.features.map((feature, i) => {
          const Icon = ICONS[i];
          return (
            <div key={feature.title} className="group flex items-start gap-5 pl-5 relative">
              <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-purple-500 to-purple-500/0" />
              <div className="shrink-0 inline-flex size-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 ring-1 ring-purple-500/20">
                <Icon className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-base text-foreground">{feature.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block mt-12 lg:container lg:mt-20">
        <div className="relative h-[793px] w-full">
          <Image src="/hero.png" alt="hero" fill className="rounded-2xl object-cover object-left-top shadow-lg max-lg:rounded-tr-none" />
        </div>
      </div>
    </section>
  );
};
