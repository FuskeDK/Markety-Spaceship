// Marketing homepage. Composes all landing page section components in order:
// Navbar → Hero → LogoMarquee → Stats → Features → HowItWorks → BeforeAfter
// → AboutPreview → ProductSuite → Differentiators → Benefits → FAQ → CTA → Footer
// Sets SEO meta tags on mount. No data fetching here — each section component
// pulls its own live data via hooks where needed.
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LogoMarquee from "@/components/LogoMarquee";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import AboutPreview from "@/components/AboutPreview";
import ProductSuite from "@/components/ProductSuite";
import DifferentiatorsSection from "@/components/DifferentiatorsSection";
import BenefitsSection from "@/components/BenefitsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { setSeoMeta } from "@/lib/seo";
import RevealOnScroll from "@/components/ui/reveal-on-scroll";

const Index = () => {
  useEffect(() => {
    setSeoMeta("home");
  }, []);

  return (
    <>
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />

        <RevealOnScroll delay={80} direction="right" stagger={16}>
          <LogoMarquee />
        </RevealOnScroll>

        <RevealOnScroll delay={120} stagger={100}>
          <StatsSection />
        </RevealOnScroll>

        <RevealOnScroll delay={160} direction="left" stagger={60}>
          <FeaturesSection />
        </RevealOnScroll>

        <RevealOnScroll delay={200} direction="right" stagger={60}>
          <HowItWorksSection />
        </RevealOnScroll>

        <RevealOnScroll delay={220} direction="zoom" stagger={50}>
          <BeforeAfterSection />
        </RevealOnScroll>

        <RevealOnScroll delay={260} direction="left" stagger={40}>
          <AboutPreview />
        </RevealOnScroll>

        <ProductSuite />

        <RevealOnScroll delay={300} direction="left" stagger={40}>
          <DifferentiatorsSection />
        </RevealOnScroll>

        <RevealOnScroll delay={320} stagger={40}>
          <BenefitsSection />
        </RevealOnScroll>

        <RevealOnScroll delay={340} stagger={30}>
          <FAQSection />
        </RevealOnScroll>

        <RevealOnScroll delay={360}>
          <CTASection />
        </RevealOnScroll>
      </main>
      <Footer />
    </>
  );
};

export default Index;
