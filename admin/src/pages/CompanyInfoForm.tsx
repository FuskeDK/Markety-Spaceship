// New-client onboarding form. Reached via a personal link like
// /company-info/:token where token is a pre-created contact_token.
// On mount, calls api/check-submission.ts to see if this token has already
// been submitted - if yes, redirects to /company-info-done.
// On submit, POSTs to api/company-info.ts which auto-creates the client in
// Supabase and emails both admin and the prospect their dashboard link.
// The :token param is optional; if absent the form still works but no
// submission deduplication is performed.
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { setSeoMeta } from "@/lib/seo";
import { CheckCircle2 } from "lucide-react";

const CompanyInfoForm = () => {
  const params = useParams() as { token?: string };
  const token = params.token;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [cvr, setCvr] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    setSeoMeta("contact");
  }, []);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    fetch(`/api/check-submission?token=${token}`)
      .then(r => r.ok ? r.json() : { submitted: false })
      .then(data => { if (data.submitted) setAlreadySubmitted(true); })
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      const stored = localStorage.getItem(`markety_lead_${token}`);
      const original = stored ? JSON.parse(stored) : {};

      const payload = {
        token,
        name: original.name,
        email: original.email,
        company: original.company,
        message: original.message,
        currentDate: original.currentDate,
        companyName,
        cvr,
        companyDescription,
        goals,
      };

      const response = await fetch("/api/company-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API error");

      localStorage.removeItem(`markety_lead_${token}`);
      toast({ title: "Thanks, info received", description: "We've sent your company details to our team." });
      navigate("/company-info/done");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <main className="min-h-screen bg-background">
          <Navbar />
          <section className="pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-2xl text-center">
              <h1 className="text-2xl font-bold">Invalid link</h1>
              <p className="text-muted-foreground mt-4">This form link appears invalid. Please return to the contact page and submit again.</p>
              <div className="mt-6">
                <Button onClick={() => navigate("/contact")}>Back to contact</Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-purple-deep" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <>
        <main className="min-h-screen bg-background">
          <Navbar />
          <section className="pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-xl text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-7 h-7 text-purple-deep" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Already submitted</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  You have already filled out this form. We have received your details and will be in touch shortly.
                </p>
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
  }

  return (
    <>
      <main className="min-h-screen bg-background">
        <Navbar />

        <section className="relative pt-28 pb-12 md:pt-40 md:pb-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Company info</p>
              <h1 className="text-3xl font-extrabold text-foreground mb-4">A few quick details about your company</h1>
              <p className="text-muted-foreground mb-6">This helps us prepare before we get back to you. It only takes 2 minutes.</p>
            </motion.div>

            <div className="max-w-2xl mx-auto mt-8 bg-card border border-border rounded-2xl p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company name *</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="cvr">CVR number (optional)</Label>
                  <Input id="cvr" value={cvr} onChange={(e) => setCvr(e.target.value)} placeholder="12345678" />
                </div>

                <div>
                  <Label htmlFor="companyDescription">What does your company do? *</Label>
                  <Textarea id="companyDescription" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} rows={4} required />
                </div>

                <div>
                  <Label htmlFor="goals">What do you want to achieve? *</Label>
                  <Textarea id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} required />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button type="submit" variant="hero" size="sm" className="rounded-full px-5 w-full sm:w-auto" disabled={loading}>
                    {loading ? "Sending…" : "Send company info"}
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground w-full sm:w-auto" onClick={() => navigate("/")}>
                    Back to home
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CompanyInfoForm;
