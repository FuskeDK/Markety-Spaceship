import { DashedLine } from "../dashed-line";
import type { SiteStrings } from "@/i18n/site-translations";

const CARD_DESCRIPTIONS = [
  "Automated email sequences that warm up prospects, handle follow-ups, and book calls — without you lifting a finger.",
  "Google, Meta, and LinkedIn campaigns managed daily. We test, cut the losers, and scale what works.",
  "High-converting landing pages tailored to your audience, built and A/B tested until they perform.",
];

export const Features = ({ t }: { t: SiteStrings }) => {
  return (
    <section id="feature-modern-teams" className="pb-28 lg:pb-32">
      <div className="container">
        <div className="relative flex items-center justify-center">
          <DashedLine className="text-muted-foreground" />
          <span className="bg-muted text-muted-foreground absolute px-3 font-mono text-sm font-medium tracking-wide max-md:hidden">
            {t.features.eyebrow}
          </span>
        </div>

        <div className="mx-auto mt-10 max-w-4xl lg:mt-24">
          <div className="mb-10 grid items-start gap-4 md:mb-14 md:grid-cols-2 md:gap-8">
            <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
              {t.features.heading}
            </h2>
            <p className="text-muted-foreground leading-snug">
              {t.features.subheading}
            </p>
          </div>

          <div className="grid overflow-hidden rounded-2xl border md:grid-cols-3">
            {t.features.cards.map((title, i) => (
              <div
                key={i}
                className={[
                  "flex flex-col gap-4 p-7",
                  i < 2 ? "md:border-r" : "",
                  i < t.features.cards.length - 1 ? "border-b md:border-b-0" : "",
                ].join(" ")}
              >
                <span className="font-display select-none text-5xl font-bold leading-none text-purple-200 dark:text-purple-900">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{CARD_DESCRIPTIONS[i]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
