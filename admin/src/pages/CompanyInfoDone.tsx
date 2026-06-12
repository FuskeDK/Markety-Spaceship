import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, Clock } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";

const CompanyInfoDone = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setSeoMeta("contact");
  }, []);

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

              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">All done</p>
              <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-4" style={{ letterSpacing: "-0.03em" }}>
                We have everything we need
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                Your details have been submitted. We will review everything and get back to you within one business day.
              </p>

              <div className="space-y-3 mb-8">
                <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-4 text-left">
                  <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center shrink-0 mt-0.5">
                    <LayoutDashboard className="w-4 h-4 text-purple-deep" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Your dashboard is ready</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We emailed you a personal dashboard link. Once your campaign is live you will be able to track every lead we deliver in real time.
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-4 text-left">
                  <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-purple-deep" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">What happens next</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We will review your info and reach out within one business day to discuss the next steps and get your campaign set up.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/")}>
                Back to home
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CompanyInfoDone;
