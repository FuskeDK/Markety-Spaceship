// SEO Performance Optimization Utility
export const initializeSEOOptimizations = () => {
  // Add preload/prefetch hints for critical resources
  const addLinkHint = (rel: 'preload' | 'prefetch' | 'dns-prefetch', href: string, as?: string) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.as = as;
    document.head.appendChild(link);
  };

  // DNS Prefetch for third-party services
  addLinkHint('dns-prefetch', 'https://fonts.googleapis.com');
  addLinkHint('dns-prefetch', 'https://fonts.gstatic.com');

  // Preload critical fonts
  addLinkHint('preload', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap', 'style');

  // Optimize images - add lazy loading to all images
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  // Remove non-critical rendering resources
  // This helps with Core Web Vitals
  addLinkHint('prefetch', '/about');
  addLinkHint('prefetch', '/contact');
};

// Add JSON-LD Organization schema dynamically
export const addOrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Markety",
    "url": "https://markety2.vercel.app",
    "logo": "https://markety2.vercel.app/Markety.png",
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

// Add WebSite schema with search action
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
