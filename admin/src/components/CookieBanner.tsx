// GDPR cookie consent banner. Persists consent choice to localStorage under
// "markety-cookie-consent". On accept, dynamically injects GTM and GA4 scripts
// (loadTracking). On reject, analytics scripts are never loaded.
// Mounted globally in App.tsx so it appears on every page.
// The banner also links to /cookies for the full cookie policy.
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const STORAGE_KEY = "markety-cookie-consent";

type Consent = { essential: true; analytics: boolean };

function loadTracking() {
  if ((window as any).__trackingLoaded) return;
  (window as any).__trackingLoaded = true;

  // GTM
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const gtm = document.createElement("script");
  gtm.async = true;
  gtm.src = "https://www.googletagmanager.com/gtm.js?id=GTM-WHLBZ9FC";
  document.head.appendChild(gtm);

  // GA4
  const ga4 = document.createElement("script");
  ga4.async = true;
  ga4.src = "https://www.googletagmanager.com/gtag/js?id=G-66GYHXYLDV";
  ga4.onload = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: unknown[]) { (window as any).dataLayer.push(args); }
    (window as any).gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-66GYHXYLDV");
  };
  document.head.appendChild(ga4);
}

function applyConsent(consent: Consent) {
  if (consent.analytics) loadTracking();
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const consent = JSON.parse(raw) as Consent;
        applyConsent(consent);
      } catch {
        // legacy "accepted"/"declined" values
        if (raw === "accepted") applyConsent({ essential: true, analytics: true });
      }
    } else {
      setVisible(true);
    }
  }, []);

  const save = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    applyConsent(consent);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg"
        >
          <div className="bg-foreground text-background rounded-lg px-4 py-5 sm:px-5 sm:py-4 flex flex-col gap-4 shadow-lg">
            <div>
              <p className="text-base sm:text-sm leading-snug mb-1">
                This site uses cookies to improve your experience.{" "}
                <Link to="/cookies" className="underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity font-medium">
                  Cookie Policy
                </Link>
              </p>
              <button
                onClick={() => setShowDetails(v => !v)}
                className="text-xs opacity-60 hover:opacity-90 underline underline-offset-2 transition-opacity"
              >
                {showDetails ? "Hide details" : "Manage preferences"}
              </button>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 border-t border-background/20 pt-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Essential cookies</p>
                        <p className="text-xs opacity-60 mt-0.5">Required for the site to work. Cannot be disabled.</p>
                      </div>
                      <span className="text-xs font-medium opacity-50 shrink-0 mt-0.5">Always on</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Analytics cookies</p>
                        <p className="text-xs opacity-60 mt-0.5">Google Analytics & Tag Manager - help us understand how visitors use the site.</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={analyticsChecked}
                        onClick={() => setAnalyticsChecked(v => !v)}
                        className="shrink-0 self-center h-[26px] px-[3px] flex items-center rounded-full w-[50px] cursor-pointer transition-colors duration-200"
                        style={{
                          background: analyticsChecked ? "hsl(252, 89%, 58%)" : "rgba(255,255,255,0.12)",
                          border: analyticsChecked ? "1px solid transparent" : "1px solid rgba(255,255,255,0.2)",
                          boxShadow: "inset 0px 0px 12px rgba(0,0,0,0.25)",
                        }}
                      >
                        <motion.div
                          key={String(analyticsChecked)}
                          initial={{ width: "18px", x: analyticsChecked ? 0 : 22 }}
                          animate={{
                            height: ["18px", "10px", "18px"],
                            width: ["18px", "26px", "18px"],
                            x: analyticsChecked ? 22 : 0,
                          }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="h-[18px] rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => save({ essential: true, analytics: true })}
                className="flex-1 text-sm font-semibold bg-background text-foreground rounded-lg px-4 py-3 sm:py-2.5 hover:opacity-90 transition-opacity text-center"
              >
                Accept all
              </button>
              {showDetails ? (
                <button
                  onClick={() => save({ essential: true, analytics: analyticsChecked })}
                  className="flex-1 text-sm font-medium bg-background/20 hover:bg-background/30 transition-colors border border-background/30 rounded-lg px-4 py-3 sm:py-2.5 text-center"
                >
                  Save preferences
                </button>
              ) : (
                <button
                  onClick={() => save({ essential: true, analytics: false })}
                  className="flex-1 text-sm font-medium opacity-60 hover:opacity-90 transition-opacity border border-background/30 rounded-lg px-4 py-3 sm:py-2.5 text-center"
                >
                  Essential only
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
