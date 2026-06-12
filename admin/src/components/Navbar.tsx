// Site-wide navigation bar. Turns opaque on scroll (scrolled state).
// Mobile: hamburger menu with AnimatePresence slide-down panel.
// Desktop: inline links. "Get Started" CTA navigates to /contact.
// Used in: src/pages/Index.tsx, About.tsx, Contact.tsx, and other public pages.
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-50 transition-all duration-500 ${scrolled ? 'sm:w-[88%] sm:max-w-[900px]' : 'sm:w-[95%] sm:max-w-[1024px]'}`}>
      <div className="bg-card border border-border rounded-lg px-6 py-3 flex items-center justify-between transition-all duration-500">
        <Link to="/" className="flex items-center gap-2">
          <img src="/Markety.png" alt="Markety" className="h-8 w-auto" width="32" height="32" fetchPriority="high" />
          <span className="text-lg font-bold text-purple-deep" translate="no">Markety</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="hero" size="sm" className="rounded-full px-5" onClick={() => navigate("/contact", { state: { scrollToForm: true } })}>
            Contact us
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 bg-card border border-border rounded-lg px-6 py-4"
          >
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Contact</Link>
              <Button variant="hero" size="sm" className="rounded-full" onClick={() => { navigate("/contact", { state: { scrollToForm: true } }); setIsOpen(false); }}>Contact us</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
