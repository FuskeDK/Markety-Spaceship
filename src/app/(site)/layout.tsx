import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { LangBanner } from "@/components/lang-banner";
import { GoogleTranslate } from "@/components/google-translate";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleTranslate />
      <LangBanner />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
