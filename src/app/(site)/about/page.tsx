import { Background } from "@/components/background";
import About from "@/components/blocks/about";
import { AboutHero } from "@/components/blocks/about-hero";
import { Investors } from "@/components/blocks/investors";
import { DashedLine } from "@/components/dashed-line";
import { getSiteT } from "@/lib/get-locale";

export default async function AboutPage() {
  const t = await getSiteT();
  return (
    <Background>
      <div className="py-28 lg:py-32 lg:pt-44">
        <AboutHero t={t} />
        <About />
        <div className="pt-28 lg:pt-32">
          <DashedLine className="container max-w-5xl scale-x-115" />
          <Investors />
        </div>
      </div>
    </Background>
  );
}
