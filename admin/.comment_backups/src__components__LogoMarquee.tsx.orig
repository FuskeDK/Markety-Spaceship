import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCompanyNames } from "@/hooks/useCompanyNames";

const ITEMS_PER_PAGE = 4;
const MAX_SHOWN = 10;

const LogoMarquee = () => {
  const { data: names = [] } = useCompanyNames();
  const [page, setPage] = useState(0);

  // Shuffle once per mount (new random order on every page refresh), cap at 10
  const displayed = useMemo(() => {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_SHOWN);
  }, [names]);

  const logos = displayed.map((name) => ({ name }));

  const pageCount = Math.ceil(logos.length / ITEMS_PER_PAGE);
  const visibleLogos = logos.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/60 mb-8">
        Trusted by fast-growing companies
      </p>

      {/* Mobile: grid + arrows */}
      <div className="md:hidden px-6">
        <div className="grid grid-cols-2 gap-4 mb-6 min-h-[56px]">
          {visibleLogos.map((logo, i) => (
            <div key={i} className="flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground/70 text-center">{logo.name}</span>
            </div>
          ))}
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setPage(p => (p - 1 + pageCount) % pageCount)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground">{page + 1} / {pageCount}</span>
            <button
              onClick={() => setPage(p => (p + 1) % pageCount)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop: marquee */}
      <div className="hidden md:block relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee">
          {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center mx-12 shrink-0">
              <span className="text-sm font-semibold text-muted-foreground/70 whitespace-nowrap">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
