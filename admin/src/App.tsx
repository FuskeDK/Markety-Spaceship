// Root application component. Owns:
//   - React Query client (5-min stale, 10-min gc, no window-focus refetch)
//   - All client-side routes (see AnimatedRoutes below)
//   - Page-transition animation (framer-motion fade + 6px slide)
//   - Global providers: QueryClient, TooltipProvider, BrowserRouter, ErrorBoundary
//   - Global UI: CookieBanner, ScrollToTop, Toaster/Sonner, Vercel Analytics
//
// All pages are lazy-loaded. The leadsCount query is pre-fetched at startup
// so the homepage stat counter is ready instantly.
// SEO optimizations (dns-prefetch, font preload, lazy-image hints) are
// initialized once on first render via initializeSEOOptimizations().
//
// Route map:
//   /                     → Index (marketing homepage)
//   /about                → About
//   /contact              → Contact form
//   /contact/sent         → Post-submission confirmation
//   /privacy|cookies|terms → Legal pages
//   /dashboard/:token     → Client dashboard (auth via token)
//   /admin                → Admin panel (auth via password)
//   /lp/springling        → Springling landing page
//   *                     → NotFound
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
import ErrorBoundary from "@/components/ErrorBoundary";
import { initializeSEOOptimizations } from "./lib/seoOptimizations";

const Index    = lazy(() => import("./pages/Index"));
const About    = lazy(() => import("./pages/About"));
const Contact  = lazy(() => import("./pages/Contact"));
const ContactSent = lazy(() => import("./pages/ContactSent"));
const Privacy  = lazy(() => import("./pages/Privacy"));
const Cookies  = lazy(() => import("./pages/Cookies"));
const Terms    = lazy(() => import("./pages/Terms"));
const NotFound  = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Springling = lazy(() => import("./pages/Springling"));

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
    initializeSEOOptimizations();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 1, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes location={location}>
            <Route path="/"        element={<Index />} />
            <Route path="/about"   element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact/sent" element={<ContactSent />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/terms"   element={<Terms />} />
            <Route path="/dashboard/:token" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/lp/springling" element={<Springling />} />
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
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
        <CookieBanner />
        <ScrollToTop />
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
