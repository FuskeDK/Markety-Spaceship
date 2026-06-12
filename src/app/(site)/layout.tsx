import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { LangBanner } from "@/components/lang-banner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LangBanner />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
