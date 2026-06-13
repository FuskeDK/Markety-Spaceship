import { DashedLine } from "../dashed-line";
import { cn } from "@/lib/utils";

const items = [
  {
    quote: "Markety brought us leads at under $3 each. Our sales team couldn't keep up.",
    author: "Amy Chase",
    role: "Founder",
    company: "E-commerce Brand",
  },
  {
    quote: "We went from zero to 200+ qualified leads in the first two months.",
    author: "Jonas Kotara",
    role: "CEO",
    company: "SaaS Startup",
  },
  {
    quote: "Finally a lead gen partner that actually understands B2B sales cycles.",
    author: "Kevin Yam",
    role: "Head of Sales",
    company: "Professional Services",
  },
  {
    quote: "The email sequences Markety wrote convert better than anything we tried in-house.",
    author: "Kundo Marta",
    role: "Marketing Director",
    company: "Tech Agency",
  },
];

export const Testimonials = ({
  className,
  dashedLineClassName,
}: {
  className?: string;
  dashedLineClassName?: string;
}) => {
  return (
    <>
      <section className={cn("py-28 lg:py-32", className)}>
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                What our clients say
              </h2>
              <p className="text-muted-foreground mt-4 max-w-md leading-snug">
                We work with companies that are serious about growth. Here&apos;s what
                they think about working with Markety.
              </p>
            </div>
            <a
              href="/contact"
              className="shrink-0 text-sm font-semibold text-purple-600 hover:opacity-75 transition-opacity"
            >
              Work with us →
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:mt-16 md:grid-cols-2">
            {items.map((testimonial, index) => (
              <div
                key={index}
                className="bg-muted flex flex-col justify-between gap-8 rounded-2xl p-8"
              >
                <span className="font-display select-none text-5xl leading-none text-purple-200 dark:text-purple-900">
                  &ldquo;
                </span>
                <blockquote className="font-display text-xl font-medium leading-snug md:text-2xl">
                  {testimonial.quote}
                </blockquote>
                <div>
                  <div className="text-primary font-semibold">{testimonial.author}</div>
                  <div className="text-muted-foreground text-sm">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <DashedLine
        orientation="horizontal"
        className={cn("mx-auto max-w-[80%]", dashedLineClassName)}
      />
    </>
  );
};
