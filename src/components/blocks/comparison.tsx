import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRADITIONAL = [
  "Fixed monthly retainer — you pay even with zero results",
  "Long contracts and lock-in periods",
  "Website and landing pages cost extra",
  "Vague reporting and slow replies",
  "You carry all the risk",
];

const MARKETY = [
  "Pay only per lead you actually receive",
  "No fixed monthly fee — cancel anytime",
  "Free website & landing page included",
  "Weekly reports and direct access to the team",
  "First 30 days completely free",
];

export const Comparison = () => {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]"
      />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-sm font-medium tracking-widest text-purple-600 uppercase dark:text-purple-400">
            Why Markety
          </span>
          <h2 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
            A smarter deal than a traditional agency
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-snug text-balance">
            Most agencies get paid whether they deliver or not. We only earn when
            you get real leads.
          </p>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-4xl items-stretch gap-5 md:mt-16 md:grid-cols-2">
          {/* Traditional agency — muted, recedes */}
          <div className="bg-muted/40 flex flex-col gap-6 rounded-3xl border border-border/60 p-7 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-muted-foreground/10 text-muted-foreground inline-flex size-10 items-center justify-center rounded-xl">
                <X className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Traditional agency
                </h3>
                <p className="text-muted-foreground text-xs">The old way</p>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-4">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="bg-muted-foreground/10 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                    <X className="size-3 text-muted-foreground/70" />
                  </span>
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Markety — glowing, elevated */}
          <div className="relative flex flex-col gap-6 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-600/10 to-purple-600/[0.02] p-7 shadow-xl shadow-purple-500/5 ring-1 ring-purple-500/10 lg:p-8 dark:from-purple-400/10 dark:to-transparent">
            <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="size-3" />
              Recommended
            </span>
            <div className="flex items-center gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
                <Check className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Markety</h3>
                <p className="text-purple-600 text-xs font-medium dark:text-purple-400">
                  Pay per lead
                </p>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-4">
              {MARKETY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-600/15 dark:bg-purple-400/15">
                    <Check className="size-3 text-purple-600 dark:text-purple-400" />
                  </span>
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-2 w-full">
              <a href="/contact">Start free for 30 days</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
