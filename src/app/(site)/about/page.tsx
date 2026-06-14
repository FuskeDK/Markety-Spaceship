import { Background } from "@/components/background";
import About from "@/components/blocks/about";
import { AboutHero } from "@/components/blocks/about-hero";
import { getSiteT } from "@/lib/get-locale";

export default async function AboutPage() {
  const t = await getSiteT();
  return (
    <Background>
      <div className="py-28 lg:py-32 lg:pt-44">
        <AboutHero t={t} />
        <About />
      </div>
    </Background>
  );
}
