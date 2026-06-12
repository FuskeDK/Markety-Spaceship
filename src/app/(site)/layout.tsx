import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { LangBanner } from "@/components/lang-banner";
import { getLocale } from "@/lib/get-locale";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <>
      <LangBanner />
      <Navbar locale={locale} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
