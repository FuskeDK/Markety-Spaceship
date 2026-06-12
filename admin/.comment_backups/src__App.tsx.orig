import { Suspense, lazy, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { leadsCountQueryConfig } from "./hooks/useLeadsCount";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { initializeSEOOptimizations } from "./lib/seoOptimizations";

const Index    = lazy(() => import("./pages/Index"));
const About    = lazy(() => import("./pages/About"));
const Contact  = lazy(() => import("./pages/Contact"));
const ContactSent = lazy(() => import("./pages/ContactSent"));
const CompanyInfoForm = lazy(() => import("./pages/CompanyInfoForm"));
const Privacy  = lazy(() => import("./pages/Privacy"));
const Terms    = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime:    1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
queryClient.prefetchQuery(leadsCountQueryConfig);

const AnimatedRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize SEO optimizations on first load
    initializeSEOOptimizations();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
      >
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes location={location}>
            <Route path="/"        element={<Index />} />
            <Route path="/about"   element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact/sent" element={<ContactSent />} />
            <Route path="/company-info/:token" element={<CompanyInfoForm />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms"   element={<Terms />} />
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
        <CookieBanner />
        <ScrollToTop />
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
