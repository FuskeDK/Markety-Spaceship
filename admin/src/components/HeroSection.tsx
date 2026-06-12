// Homepage hero section. Shows the headline, subtext, CTA buttons, and
// a live companies-count badge that reads from useCompaniesCount (api/stats).
// The grid background is a pure CSS pattern via inline style.
// Used only in: src/pages/Index.tsx.
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompaniesCount } from "@/hooks/useCompaniesCount";

const gridStyle: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(to right, hsl(var(--foreground) / 0.21) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--foreground) / 0.21) 1px, transparent 1px)
  `,
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(ellipse 58% 52% at 50% 43%, transparent 0%, transparent 60%, black 88%)",
  WebkitMaskImage: "radial-gradient(ellipse 58% 52% at 50% 43%, transparent 0%, transparent 60%, black 88%)",
};

const fadeStyle: React.CSSProperties = {
  background: "linear-gradient(to bottom, transparent 60%, hsl(var(--background)) 100%)",
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { data: companiesCount = 0 } = useCompaniesCount();
  return (
    <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[580px] pointer-events-none" style={gridStyle} />
      <div className="absolute top-0 left-0 right-0 h-[580px] pointer-events-none" style={fadeStyle} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full badge-pill px-4 py-1.5 text-xs font-semibold mb-6"
          >
            Trusted by {companiesCount}+ companies worldwide
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-foreground mb-5 md:mb-6">
            Markety
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
            Markety handles your ad campaigns, funnels, and follow ups so your sales team always has someone to talk to.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="hero"
              size="lg"
              className="rounded-full text-base px-8 py-6 w-full sm:w-auto font-bold"
              onClick={() => navigate("/contact", { state: { scrollToForm: true } })}
              aria-label="Contact us to start your lead generation"
            >
              Try free for 30 days
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="heroOutline"
              size="lg"
              className="rounded-full text-base px-8 py-6 w-full sm:w-auto"
              onClick={() => navigate("/about")}
              aria-label="Learn more about Markety services"
            >
              Learn more
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">First 30 days free - no credit card required</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
