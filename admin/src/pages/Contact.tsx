import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { setSeoMeta } from "@/lib/seo";

const faqs = [
  {
    q: "What happens after I send a message?",
    a: "We read every message personally and reply within one business day. If there's a potential fit, we'll follow up to learn more about your situation.",
  },
  {
    q: "What types of businesses do you work with?",
    a: "Companies that have a sales team in place - agencies, professional services, SaaS, and similar. We need a clear target customer and a process for closing deals.",
  },
  {
    q: "Do you run campaigns inside my ad accounts or yours?",
    a: "Everything runs inside your own ad accounts. You keep full ownership of every campaign, every asset, and all your data from day one.",
  },
  {
    q: "How long does it take to get started?",
    a: "Most clients are live within 7 days. We handle the build - pages, emails, campaigns - before anything goes live.",
  },
  {
    q: "How do you keep us updated?",
    a: "You get a weekly summary covering what ran, what it cost, how many leads came in, and what we're adjusting. Live dashboards are available any time.",
  },
];

const steps = [
  {
    number: "01",
    title: "You send a message",
    desc: "Tell us about your business and what you're looking for. Takes about two minutes.",
  },
  {
    number: "02",
    title: "We get back to you",
    desc: "We reply within one business day to ask a few follow-up questions and see if there's a fit.",
  },
  {
    number: "03",
    title: "We get to work",
    desc: "If it makes sense, we set up your system and you start seeing leads within the first week.",
  },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [cvr, setCvr] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; email?: boolean; companyDescription?: boolean; goals?: boolean; message?: boolean }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSeoMeta("contact");
    if (location.state?.scrollToForm) {
      setTimeout(() => {
        document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }, [location.state?.scrollToForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!name.trim()) errors.name = true;
    if (!email.trim()) errors.email = true;
    if (!companyDescription.trim()) errors.companyDescription = true;
    if (!goals.trim()) errors.goals = true;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitError(null);
    setLoading(true);
    try {
      const now = new Date();
      const currentDate = now.toLocaleString("en-US", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
      });
      const bodyPayload = { name, email, company, cvr, companyDescription, goals, message, currentDate };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) throw new Error("API error");

      setName(""); setEmail(""); setCompany(""); setCvr(""); setCompanyDescription(""); setGoals(""); setMessage("");
      setLoading(false);
      navigate("/contact/sent", { state: bodyPayload });
    } catch {
      setLoading(false);
      setSubmitError("Please try again or email us directly.");
    }
  };

  return (
    <>
      <main className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-44 md:pb-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">Contact</p>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-medium text-foreground mb-5"
                style={{ letterSpacing: "-0.035em", lineHeight: 1.08 }}
              >
                Get in touch
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Tell us about your business and what you need. We'll get back to you within one business day.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form + Info */}
        <section id="contact-form" className="py-16 md:py-20 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 md:gap-16">

              {/* Form - 3 cols */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <h2 className="text-2xl font-semibold text-foreground mb-2" style={{ letterSpacing: "-0.02em" }}>
                  Send us a message
                </h2>
                <p className="text-muted-foreground mb-8 text-sm">Fill this out and we'll get back to you within one business day.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Your name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: false })); }}
                        placeholder="Alex Johnson"
                        className={`h-11 px-4 rounded-[8px] border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors ${fieldErrors.name ? "border-red-400 ring-2 ring-red-400/20" : "border-border"}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Work email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: false })); }}
                        placeholder="alex@company.com"
                        className={`h-11 px-4 rounded-[8px] border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors ${fieldErrors.email ? "border-red-400 ring-2 ring-red-400/20" : "border-border"}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Company name</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Your company"
                        className="h-11 px-4 rounded-[8px] border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">CVR number <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <input
                        type="text"
                        value={cvr}
                        onChange={(e) => setCvr(e.target.value)}
                        placeholder="12345678"
                        className="h-11 px-4 rounded-[8px] border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">What does your company do?</label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => { setCompanyDescription(e.target.value); setFieldErrors(p => ({ ...p, companyDescription: false })); }}
                      placeholder="Briefly describe your business, what you sell, and who your customers are..."
                      rows={3}
                      className={`px-4 py-3 rounded-[8px] border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors resize-none ${fieldErrors.companyDescription ? "border-red-400 ring-2 ring-red-400/20" : "border-border"}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">What do you want to achieve?</label>
                    <textarea
                      value={goals}
                      onChange={(e) => { setGoals(e.target.value); setFieldErrors(p => ({ ...p, goals: false })); }}
                      placeholder="More leads, lower cost per lead, enter a new market - tell us your goals..."
                      rows={3}
                      className={`px-4 py-3 rounded-[8px] border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors resize-none ${fieldErrors.goals ? "border-red-400 ring-2 ring-red-400/20" : "border-border"}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Anything else? <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Additional context, questions, or anything specific you'd like us to know..."
                      rows={3}
                      className="px-4 py-3 rounded-[8px] border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-deep/40 focus:border-purple-deep transition-colors resize-none"
                    />
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    className="rounded-full w-full h-12 text-base font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send message"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>

                  {submitError && (
                    <ErrorMessage message={submitError} />
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    We respond within one business day. No spam, no sales pressure.
                  </p>
                </form>
              </motion.div>

              {/* Info - 2 cols */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="bg-card border border-border rounded-lg p-6 space-y-5">
                  <p className="text-sm font-semibold text-foreground">Contact details</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-purple-deep" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">info@marketyleadgen.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-purple-deep" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-foreground">Denmark</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-purple-deep" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Response time</p>
                        <p className="text-sm font-medium text-foreground">Within 1 business day</p>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </section>

        {/* What happens next */}
        <section className="py-16 md:py-24 border-t border-border bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">The process</p>
              <h2 className="text-3xl md:text-4xl font-medium text-foreground" style={{ letterSpacing: "-0.03em" }}>
                What happens after you reach out
              </h2>
            </motion.div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-deep">{step.number}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">{step.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-deep mb-4">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-medium text-foreground" style={{ letterSpacing: "-0.03em" }}>
                  Frequently Asked Questions
                </h2>
              </motion.div>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium text-foreground text-sm">{faq.q}</span>
                      <span className={`text-purple-deep text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default Contact;
