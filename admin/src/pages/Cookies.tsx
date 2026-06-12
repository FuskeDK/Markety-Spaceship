import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
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

const Cookies = () => {
  useEffect(() => {
    setSeoMeta("cookies");
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
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Cookie Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
            </motion.div>

            <div className="prose-none">
              <Section title="1. What are cookies?">
                <p>Cookies are small text files stored in your browser when you visit a website. They help the site remember information about your visit and function correctly across pages.</p>
              </Section>

              <Section title="2. How we use cookies">
                <p>We split the cookies on this site into two categories:</p>

                <h3 className="font-semibold text-foreground mt-4 mb-1">Essential cookies (always active)</h3>
                <p>These are required for the site to function and cannot be switched off.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>markety-cookie-consent</strong> - Stores your response to the cookie banner (accepted or declined). Saved in your browser's local storage and does not expire automatically.</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-4 mb-1">Analytics cookies (only with your consent)</h3>
                <p>If you accept cookies, we load Google Tag Manager (GTM-WHLBZ9FC) and Google Analytics 4 (G-66GYHXYLDV). These services set their own cookies to collect anonymised statistics about visits, pages viewed, and traffic sources - solely to help us understand and improve the site.</p>
                <p>Google Analytics cookies include:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>_ga</strong> - Distinguishes between visitors. Expires after 2 years.</li>
                  <li><strong>_ga_*</strong> - Stores session state for Google Analytics 4. Expires after 2 years.</li>
                  <li><strong>_gid</strong> - Identifies a session. Expires after 24 hours.</li>
                </ul>
                <p>Data is processed by Google LLC under their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-deep hover:underline">privacy policy</a>. We do not share personal information with Google.</p>
                <p>If you decline cookies, neither Google Tag Manager nor Google Analytics will load and no analytics cookies will be set.</p>
              </Section>

              <Section title="3. Managing your consent">
                <p>When you first visit this site, a banner asks for your consent. You can change your mind at any time by clearing your browser's local storage or cookies, which will cause the banner to reappear on your next visit.</p>
                <p>Most browsers also let you block or delete all cookies directly in their settings:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Chrome: Settings › Privacy and security › Cookies and other site data</li>
                  <li>Firefox: Settings › Privacy & Security › Cookies and Site Data</li>
                  <li>Safari: Settings › Safari › Advanced › Privacy Report</li>
                  <li>Edge: Settings › Cookies and site permissions</li>
                </ul>
              </Section>

              <Section title="4. Changes to this policy">
                <p>We may update this Cookie Policy from time to time. When we do, we will update the "Last updated" date at the top of this page.</p>
              </Section>

              <Section title="5. Contact">
                <p>Questions about our use of cookies can be sent to <a href="mailto:info@marketyleadgen.com" className="text-purple-deep hover:underline">info@marketyleadgen.com</a>.</p>
              </Section>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Cookies;
