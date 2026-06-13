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
      <div className="relative">
        <main>{children}</main>
        <Footer />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[480px] -z-10 bg-linear-to-t from-primary/25 to-transparent" />
      </div>
    </>
  );
}
