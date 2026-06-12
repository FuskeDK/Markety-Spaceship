import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { Logos } from "@/components/blocks/logos";
import { ResourceAllocation } from "@/components/blocks/resource-allocation";
import { StatsHero } from "@/components/blocks/stats-hero";
import { Testimonials } from "@/components/blocks/testimonials";
import { getSiteT } from "@/lib/get-locale";

export default async function Home() {
  const t = await getSiteT();
  return (
    <>
      <Background className="via-muted to-muted/80">
        <Hero t={t} />
        <Logos />
        <Features t={t} />
        <ResourceAllocation t={t} />
      </Background>
      <StatsHero t={t} />
      <Testimonials />
      <Background variant="bottom">
        <FAQ t={t} />
      </Background>
    </>
  );
}
