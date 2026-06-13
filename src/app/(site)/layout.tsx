import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar locale="en" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
