import { Check, X } from "lucide-react";

const TRADITIONAL = [
  "Fixed monthly retainer — you pay even with zero results",
  "Long contracts and lock-in periods",
  "Website and landing pages cost extra",
  "Vague reporting and slow communication",
];

const MARKETY = [
  "Pay only per lead you actually receive",
  "No fixed monthly fee — cancel anytime",
  "Free website & landing page included",
  "First 30 days completely free",
];

export const Comparison = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-sm font-medium tracking-wide text-purple-600 dark:text-purple-400">
            Why Markety
          </span>
          <h2 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
            A better deal than a traditional agency
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-snug text-balance">
            Most agencies charge you whether they deliver or not. We only get paid
            when you do.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:mt-16 md:grid-cols-2">
          {/* Traditional agency */}
          <div className="bg-muted/60 flex flex-col gap-6 rounded-2xl border border-border p-7 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-muted-foreground/10 text-muted-foreground inline-flex size-9 items-center justify-center rounded-xl">
                <X className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Traditional agency
              </h3>
            </div>
            <ul className="flex flex-col gap-4">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="mt-0.5 size-5 shrink-0 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Markety */}
          <div className="relative flex flex-col gap-6 rounded-2xl border border-purple-500/30 bg-purple-600/5 p-7 ring-1 ring-purple-500/10 lg:p-8 dark:bg-purple-400/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-9 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 ring-1 ring-purple-500/20 dark:bg-purple-400/10 dark:text-purple-400">
                <Check className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Markety</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {MARKETY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm leading-relaxed text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
