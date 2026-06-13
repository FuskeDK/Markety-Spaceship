import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { SiteStrings } from "@/i18n/site-translations";

export const FAQ = ({
  t,
  headerTag = "h2",
  className,
}: {
  t: SiteStrings;
  headerTag?: "h1" | "h2";
  className?: string;
}) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-4xl">
        <div className="mb-14 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            FAQ
          </p>
          {headerTag === "h1" ? (
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{t.faq.heading}</h1>
          ) : (
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{t.faq.heading}</h2>
          )}
          <p className="text-muted-foreground mt-4 text-lg leading-snug">
            {t.faq.subheading}{" "}
            <Link href="/contact" className="text-foreground hover:opacity-75 transition-opacity">
              {t.faq.subheadingLink}
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {t.faq.categories.map((category, categoryIndex) => (
            <div key={category.title}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                {category.title}
              </p>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, i) => (
                  <AccordionItem key={i} value={`${categoryIndex}-${i}`}>
                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
