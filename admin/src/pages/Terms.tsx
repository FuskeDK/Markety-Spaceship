import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { loadContent, renderBody } from "@/lib/pageContent";
import { setSeoMeta } from "@/lib/seo";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="mb-10"
  >
    <h2 className="text-lg font-extrabold text-foreground mb-3">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </motion.div>
);

const Terms = () => {
  const sections = loadContent("terms");

  useEffect(() => {
    setSeoMeta("terms");
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="flex-1 pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Legal</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Terms &amp; Conditions</h1>
              <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
            </motion.div>

            <div className="prose-none">
              {sections.map((section, i) => (
                <Section key={i} title={section.title}>
                  {renderBody(section.body)}
                </Section>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Terms;
