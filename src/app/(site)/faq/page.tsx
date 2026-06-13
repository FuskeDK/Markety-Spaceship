import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Testimonials } from "@/components/blocks/testimonials";
import { DashedLine } from "@/components/dashed-line";
import { getSiteT } from "@/lib/get-locale";

export default async function Page() {
  const t = await getSiteT();
  return (
    <Background>
      <FAQ t={t} className="lg:pt-44 lg:pb-32" headerTag="h1" />
      <DashedLine className="mx-auto max-w-xl" />
      <Testimonials dashedLineClassName="hidden" />
    </Background>
  );
}
