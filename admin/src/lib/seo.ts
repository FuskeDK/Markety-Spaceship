// Static SEO metadata (title, description, keywords) for every public page.
// Consumed by each page component to set <title> and <meta> tags.
// Update this file when adding new pages or changing marketing copy.
export const seoMetadata = {
  home: {
    title: "Markety",
    description: "Pay-per-lead agency for local businesses. We run your ads, build your funnels, and deliver qualified leads. No retainers. First leads in 2 weeks.",
    keywords: "lead generation agency, pay per lead, local business lead generation, done for you lead generation, qualified leads, B2B lead generation, lead generation service, pay per qualified lead, outsourced lead generation",
  },
  about: {
    title: "About - Markety",
    description: "Learn how Markety delivers qualified leads via ads, landing pages, and email funnels. Pay per lead only. Average cost under $2.80. No retainers.",
    keywords: "Markety lead generation agency, about Markety, pay per lead agency, done for you lead generation, marketing agency for local businesses, lead generation team",
  },
  contact: {
    title: "Contact - Markety",
    description: "Contact Markety to get qualified leads flowing in 2 weeks. We run your ads, pages, and funnels. Pay per lead only. No retainers, no contracts.",
    keywords: "contact Markety, get qualified leads, lead generation consultation, start lead generation, pay per lead agency contact",
  },
  cookies: {
    title: "Cookie Policy | Markety",
    description: "How Markety uses cookies and tracking technologies on our website. Read our policy to manage your preferences.",
    keywords: "cookie policy, cookies, tracking",
  },
  privacy: {
    title: "Privacy Policy | Markety",
    description: "How Markety collects, uses, and protects your personal data when you visit or use our lead generation services.",
    keywords: "privacy policy, data protection, Markety privacy",
  },
  terms: {
    title: "Terms of Service | Markety",
    description: "Terms of service governing your use of Markety's lead generation platform and services.",
    keywords: "terms of service, terms and conditions, Markety terms",
  },
};

const pageSchemas: Partial<Record<keyof typeof seoMetadata, object>> = {
  about: {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://marketyleadgen.com/about#webpage",
    "url": "https://marketyleadgen.com/about",
    "name": "About - Markety",
    "description": "Learn about Markety, a pay-per-lead generation agency that delivers qualified leads to local businesses via ad campaigns, landing pages, and email funnels.",
    "isPartOf": { "@id": "https://marketyleadgen.com/#website" },
    "about": { "@id": "https://marketyleadgen.com/#organization" },
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2"] }
  },
  contact: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://marketyleadgen.com/contact#webpage",
        "url": "https://marketyleadgen.com/contact",
        "name": "Contact - Markety",
        "description": "Contact Markety to start your pay-per-lead generation system. First leads within 2 weeks.",
        "isPartOf": { "@id": "https://marketyleadgen.com/#website" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What happens after I contact Markety?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Markety reads every message personally and replies within one business day. If there is a potential fit, they will follow up to learn more about your business and goals."
            }
          },
          {
            "@type": "Question",
            "name": "Does Markety run campaigns inside my ad accounts?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Markety runs all campaigns inside your own ad accounts. You keep full ownership of every campaign, every asset, and all your data from day one."
            }
          },
          {
            "@type": "Question",
            "name": "How long does it take to get started with Markety?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most Markety clients are live within 7 to 14 days. Markety handles the full build - landing pages, email sequences, and ad campaigns - before anything goes live."
            }
          }
        ]
      }
    ]
  }
};

const PAGE_SCHEMA_ID = "page-specific-schema";

export const setSeoMeta = (key: keyof typeof seoMetadata) => {
  const meta = seoMetadata[key];

  document.title = meta.title;

  const existing = document.getElementById(PAGE_SCHEMA_ID);
  if (existing) existing.remove();
  const schema = pageSchemas[key];
  if (schema) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = PAGE_SCHEMA_ID;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  const updateMeta = (selector: string, attributes: Record<string, string>) => {
    let element = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
    if (!element) {
      if (selector.startsWith('meta')) {
        element = document.createElement('meta');
      } else if (selector.startsWith('link')) {
        element = document.createElement('link');
      }
      if (element) document.head.appendChild(element);
    }
    if (!element) return;
    Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
  };

  const noindexPages: (keyof typeof seoMetadata)[] = ["privacy", "cookies", "terms"];
  const robotsContent = noindexPages.includes(key) ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
  updateMeta('meta[name="robots"]', { name: 'robots', content: robotsContent });

  updateMeta('meta[name="description"]', { name: 'description', content: meta.description });
  updateMeta('meta[name="keywords"]', { name: 'keywords', content: meta.keywords });
  updateMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
  updateMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
  updateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
  updateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });

  const canonicalUrl = window.location.origin + window.location.pathname;
  updateMeta('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
  updateMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  updateMeta('meta[name="twitter:url"]', { name: 'twitter:url', content: canonicalUrl });
};
