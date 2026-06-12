// Runtime SEO/performance helpers injected once on app mount (App.tsx).
// initializeSEOOptimizations: adds dns-prefetch/preload hints for Google Fonts
// and prefetch links for /about and /contact to warm up the next navigation.
// addOrganizationSchema: injects a JSON-LD Organization schema block -
// call this from Index.tsx if structured data is needed.
export const initializeSEOOptimizations = () => {
  const addLinkHint = (rel: 'preload' | 'prefetch' | 'dns-prefetch', href: string, as?: string) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.as = as;
    document.head.appendChild(link);
  };
  addLinkHint('dns-prefetch', 'https://fonts.googleapis.com');
  addLinkHint('dns-prefetch', 'https://fonts.gstatic.com');
  addLinkHint('preload', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap', 'style');
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }
  addLinkHint('prefetch', '/about');
  addLinkHint('prefetch', '/contact');
};
export const addOrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Markety",
    "url": "https://markety2.vercel.app",
    "logo": "https://marketyleadgen.com/markety-logo.png",
    "description": "Lead generation platform handling ads, landing pages, email sequences and follow-ups",
    "sameAs": [
      "https://twitter.com/Markety",
      "https://linkedin.com/company/markety"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-contact",
      "contactType": "Customer Support",
      "url": "https://markety2.vercel.app/contact"
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};
export const addWebsiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Markety",
    "url": "https://markety2.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://markety2.vercel.app/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};
