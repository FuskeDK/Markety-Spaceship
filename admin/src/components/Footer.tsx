const Footer = () => {
  return (
    <footer className="border-t border-border py-14 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/MarketySquare.png" alt="Markety Logo" className="h-10 w-auto" loading="lazy" />
              <span className="text-lg font-bold text-purple-deep" translate="no">Markety</span>
            </div>
            <p className="text-sm text-muted-foreground">Lead generation platform that handles your entire pipeline so you can focus on closing deals.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 pb-4">
          <address className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 text-sm text-muted-foreground not-italic">
            <span className="flex items-center gap-2">
              <strong>Email:</strong> info@marketyleadgen.com
            </span>
            <span className="flex items-center gap-2">
              <strong>Location:</strong> Denmark, DK
            </span>
          </address>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 <span translate="no">Markety</span>. All rights reserved. | Helping companies generate qualified leads on autopilot.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
