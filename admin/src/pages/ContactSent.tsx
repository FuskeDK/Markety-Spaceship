import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";

const ContactSent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSeoMeta("contact");
  }, []);

  const state = (location.state || {}) as { name?: string; form_url?: string };

  return (
    <>
      <main className="min-h-screen bg-background">
        <Navbar />

        <section className="relative pt-28 pb-12 md:pt-40 md:pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto text-center"
            >
              <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-7 h-7 text-purple-deep" />
              </div>

              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Message sent</p>
              <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-4" style={{ letterSpacing: "-0.03em" }}>
                Thanks{state.name ? `, ${state.name}` : ""}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                We've received your message and will be in touch within one business day.
              </p>

              <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-4 text-left mb-8">
                <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-purple-deep" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Check your inbox</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We've sent you a confirmation email. We'll reach out shortly to discuss how we can help.
                  </p>
                </div>
              </div>

              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/")}>
                Back to home
              </Button>

              <p className="text-xs text-muted-foreground mt-6">
                Loving the experience so far?{" "}
                <a
                  href="https://www.trustpilot.com/review/marketyleadgen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Leave us a review on Trustpilot
                </a>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactSent;
