import {
  Wrench,
  Zap,
  Home,
  Stethoscope,
  Car,
  Scissors,
  Hammer,
  Sparkles,
  Scale,
  Dumbbell,
  Leaf,
  Building2,
} from "lucide-react";

const INDUSTRIES = [
  { icon: Wrench, name: "Plumbers" },
  { icon: Zap, name: "Electricians" },
  { icon: Home, name: "Roofers" },
  { icon: Stethoscope, name: "Dentists & clinics" },
  { icon: Car, name: "Car repair shops" },
  { icon: Hammer, name: "Builders" },
  { icon: Leaf, name: "Landscapers" },
  { icon: Sparkles, name: "Cleaning services" },
  { icon: Scissors, name: "Salons & spas" },
  { icon: Scale, name: "Law firms" },
  { icon: Building2, name: "Real estate" },
  { icon: Dumbbell, name: "Fitness studios" },
];

export const Industries = ({ className }: { className?: string }) => {
  return (
    <section className={className ?? "py-24 lg:py-32"}>
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-sm font-medium tracking-widest text-purple-600 uppercase dark:text-purple-400">
            Who we help
          </span>
          <h2 className="mt-4 text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Built for local service businesses
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-snug text-balance">
            If your customers find you on Google or Facebook, we can fill your
            calendar. These are the trades and services we know best.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:mt-16 md:gap-4 lg:grid-cols-4">
          {INDUSTRIES.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="group bg-background hover:border-purple-500/40 hover:bg-purple-600/[0.03] flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors duration-200 dark:hover:bg-purple-400/[0.04]"
            >
              <div className="bg-purple-600/10 text-purple-600 ring-1 ring-purple-500/15 group-hover:bg-purple-600 group-hover:text-white inline-flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 dark:bg-purple-400/10 dark:text-purple-400">
                <Icon className="size-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{name}</span>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Don&apos;t see your trade?{" "}
          <a
            href="/contact"
            className="text-purple-600 font-medium hover:opacity-75 transition-opacity dark:text-purple-400"
          >
            Ask us — we likely cover it.
          </a>
        </p>
      </div>
    </section>
  );
};
