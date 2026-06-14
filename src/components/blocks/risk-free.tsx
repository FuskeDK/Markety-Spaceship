import { ShieldCheck, Gift, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  {
    icon: Wallet,
    title: "Only pay per lead",
    description:
      "No retainers, no setup fees. You're charged a flat price for each qualified lead we deliver — nothing else.",
  },
  {
    icon: Gift,
    title: "Free website included",
    description:
      "We design and build your website and landing pages at no cost, included for as long as you run leads with us.",
  },
  {
    icon: ShieldCheck,
    title: "30 days, zero risk",
    description:
      "Your first 30 days are completely free. See the leads roll in before you pay a single cent.",
  },
];

export const RiskFree = () => {
  return (
    <section className="py-8 lg:py-12">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 px-6 py-14 md:px-12 md:py-20">
          {/* Decorative glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl"
          />
          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
              <ShieldCheck className="size-3.5" />
              Risk-free guarantee
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl">
              You don&apos;t pay until you get results
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-balance text-purple-100">
              We flip the agency model on its head. No fixed fees, no long
              contracts — just qualified leads delivered to your inbox.
            </p>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3 md:gap-5">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-purple-100/90">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="relative mt-10 flex justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-purple-700 hover:bg-white/90"
            >
              <a href="/contact">Claim your free 30 days</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
