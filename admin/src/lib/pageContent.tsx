// Static content for the legal/policy pages (Privacy, Cookies, Terms).
// Each export is an array of { title, body } sections rendered by the
// corresponding page component. Keeping content here (not inline in the
// page) makes it easy to update legal copy without touching JSX.
// src/pages/Privacy.tsx, Cookies.tsx, and Terms.tsx all import from here.
import type { ReactNode } from "react";

export type Section = { title: string; body: string };


export const defaultPrivacy: Section[] = [
  {
    title: "1. Data controller",
    body: "Markety is the data controller for personal data collected through this website.\n\nMarkety\nDenmark\nEmail: info@marketyleadgen.com\nWebsite: www.marketyleadgen.com\n\nIf you have any questions about how we handle your personal data, please contact us at info@marketyleadgen.com.",
  },
  {
    title: "2. What information we collect",
    body: "We collect information in the following ways:\n- Contact form: when you fill in our contact form we collect your name, email address, company name, CVR number (optional), company description, goals, and any message you include.\n- Cookies and analytics: we use cookies and analytics tools to understand how visitors use our site. These are only set if you consent. See section 6 for details.\n- Technical data: when you visit our website, your browser automatically sends standard technical information such as your IP address, browser type, and the page you visited. This is processed by our hosting provider (Vercel) and analytics tools.",
  },
  {
    title: "3. Lawful basis and purposes",
    body: "We process your personal data on the following legal bases under Article 6 of the GDPR:\n\n- Legitimate interests (Article 6(1)(f)): we process contact form submissions to respond to your enquiry and assess whether we can work together. Our legitimate interest is to communicate with prospective clients.\n- Consent (Article 6(1)(a)): we only place analytics and marketing cookies (Google Analytics, Google Tag Manager) after you have given explicit consent via our cookie banner. You may withdraw consent at any time.\n- Legal obligation (Article 6(1)(c)): we may retain certain records to comply with applicable accounting and tax law.\n\nWe never use your data for automated decision-making or profiling.",
  },
  {
    title: "4. Third-party processors",
    body: "We use the following third-party services to operate our website and business. Each acts as a data processor on our behalf:\n\n- Supabase (USA) — database and backend infrastructure. Data is stored in EU data centres where available.\n- Resend (USA) — transactional email delivery (confirmation emails, notifications).\n- HubSpot (USA) — CRM used to manage contact enquiries.\n- Google Analytics / Google Tag Manager (USA) — website analytics, only loaded with your consent.\n- Vercel (USA) — website hosting and serverless functions.\n\nAll US-based processors operate under the EU–US Data Privacy Framework or Standard Contractual Clauses, which provide appropriate safeguards for transfers of personal data outside the EU/EEA.",
  },
  {
    title: "5. International data transfers",
    body: "Some of the services listed above transfer data to countries outside the European Economic Area (EEA), including the United States. Where this occurs, we rely on:\n- The EU–US Data Privacy Framework (where the processor is certified), or\n- Standard Contractual Clauses (SCCs) approved by the European Commission.\n\nYou can request a copy of the applicable transfer safeguards by contacting us at info@marketyleadgen.com.",
  },
  {
    title: "6. Cookies",
    body: "Cookies are small text files stored in your browser. We use the following types:\n- Essential cookies: required for the website to function correctly (e.g. remembering your cookie consent choice).\n- Analytics cookies: Google Analytics and Google Tag Manager help us understand how visitors interact with our site. These are only placed after you accept cookies.\n\nYou can withdraw consent at any time by clearing your browser's local storage or contacting us. Withdrawing consent does not affect the lawfulness of any processing carried out before withdrawal.",
  },
  {
    title: "7. Data retention",
    body: "We retain personal data for as long as necessary for the purpose it was collected:\n- Contact form enquiries: up to 2 years, or until you request deletion.\n- Analytics data: as governed by Google's retention settings (default 14 months).\n- CRM records (HubSpot): up to 3 years from last contact.\n\nYou can request deletion of your data at any time by contacting info@marketyleadgen.com.",
  },
  {
    title: "8. Your rights under GDPR",
    body: "As a data subject under EU/Danish law, you have the following rights:\n- Right of access: you can request a copy of the personal data we hold about you.\n- Right to rectification: you can ask us to correct inaccurate data.\n- Right to erasure: you can ask us to delete your data (subject to legal retention obligations).\n- Right to restriction: you can ask us to limit how we use your data.\n- Right to data portability: you can request your data in a structured, machine-readable format.\n- Right to object: you can object to processing based on legitimate interests.\n- Right to withdraw consent: where processing is based on consent, you may withdraw it at any time.\n\nTo exercise any of these rights, contact us at info@marketyleadgen.com. We will respond within 30 days.\n\nYou also have the right to lodge a complaint with the Danish Data Protection Authority (Datatilsynet):\nDatatilsynet\nCarlEDR Christiansens Gade 1\n1553 Copenhagen V\nwww.datatilsynet.dk\ndt@datatilsynet.dk",
  },
  {
    title: "9. Third-party links",
    body: "Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to read their privacy policies.",
  },
  {
    title: "10. Changes to this policy",
    body: "We may update this Privacy Policy from time to time. When we do, we will update the \"Last updated\" date at the top of this page. For material changes, we will take reasonable steps to notify you.",
  },
  {
    title: "11. Contact",
    body: "For any questions or concerns about this Privacy Policy or how we handle your data, contact us at info@marketyleadgen.com.",
  },
];


export const defaultTerms: Section[] = [
  {
    title: "1. Introduction",
    body: "These Terms and Conditions govern your use of the Markety website and any services we provide. By accessing our website or engaging our services, you agree to be bound by these Terms. If you do not agree, please do not use our site or services.\n\nMarkety operates as a digital marketing and lead generation agency. Questions about these Terms can be directed to info@marketyleadgen.com.",
  },
  {
    title: "2. Services",
    body: "Markety provides lead generation, paid advertising management, email marketing, landing page creation, funnel architecture, and related digital marketing services. The exact scope of services for each client is agreed in writing before work begins.\n\nWe reserve the right to refuse service to any party at our sole discretion.",
  },
  {
    title: "3. Client responsibilities",
    body: "When working with Markety, you agree to:\n- Provide accurate and complete information about your business and goals.\n- Grant us the necessary access to your ad accounts, platforms, and tools required to deliver the agreed services.\n- Respond to our communications within a reasonable timeframe.\n- Ensure that any content, materials, or information you provide to us does not infringe any third-party rights or violate applicable law.",
  },
  {
    title: "4. Payment terms",
    body: "Our pricing is based on the leads we deliver, as agreed in writing before engagement. Invoices are due within 14 days of issue unless otherwise agreed. Late payments may result in a pause of services until the outstanding balance is settled.\n\nAll prices are exclusive of any applicable taxes unless stated otherwise. You are responsible for any taxes applicable in your jurisdiction.",
  },
  {
    title: "4a. Setup fee and minimum engagement",
    body: "Before any campaign goes live, Markety invests significant time building your system -including landing pages, ad campaigns, email sequences, tracking, and account configuration. This work is carried out in good faith based on your commitment to the engagement.\n\nAs a result, the following terms apply:\n\n- If a client stops using Markety after the setup phase is complete and has received fewer than 20 qualified leads, the client agrees to pay a one-time setup fee of USD $50. No setup fee applies if the client remains engaged until receiving at least 20 qualified leads or otherwise continues using Markety after setup is complete.\n- After your campaigns go live, you agree to maintain the engagement for a minimum of 30 days. This allows sufficient time for campaigns to generate data, optimise, and deliver meaningful results.\n- If you terminate the engagement within 30 days of your campaign launch date, a cancellation fee equal to 50% of one month's estimated lead spend is due. This compensates Markety for the setup work invested and the opportunity cost of declining other clients during your onboarding.\n- Cancellations must be submitted in writing to info@marketyleadgen.com. The 30-day period begins from the date your campaigns go live, not from the date of first contact.",
  },
  {
    title: "5. Intellectual property",
    body: "All campaign assets, landing pages, email sequences, and creative materials built by Markety for your account are owned by you upon full payment. Markety retains no claim over work delivered and paid for.\n\nAny tools, templates, methodologies, or processes developed by Markety remain the intellectual property of Markety and are licensed to you for use during the engagement only.",
  },
  {
    title: "6. Confidentiality",
    body: "Both parties agree to keep confidential any non-public information shared during the engagement, including but not limited to business strategy, pricing, client data, and performance metrics. This obligation survives the termination of any agreement.",
  },
  {
    title: "7. Results and guarantees",
    body: "Markety works to deliver qualified leads as defined and agreed before an engagement begins. However, we cannot guarantee specific outcomes, revenue, or conversion rates, as results depend on factors outside our control including market conditions, your sales process, and platform performance.\n\nWe are committed to transparency. If campaigns are underperforming, we will tell you promptly and adjust our approach.",
  },
  {
    title: "8. Termination",
    body: "Either party may terminate the engagement with 14 days written notice, subject to the minimum engagement period described in section 4a. We operate on a month-to-month basis after the initial 30-day period.\n\nUpon termination, all assets built in your accounts remain yours once all outstanding invoices are settled. Any invoices for work completed up to the termination date -including the setup fee and any applicable cancellation fee under section 4a -remain payable in full.\n\nMarkety reserves the right to terminate the engagement immediately if a client repeatedly fails to pay invoices on time, provides false information, or acts in a way that makes continued work impossible or unreasonable.",
  },
  {
    title: "9. Limitation of liability",
    body: "To the maximum extent permitted by law, Markety's total liability to you for any claim arising out of or in connection with our services shall not exceed the total fees paid by you in the three months preceding the claim.\n\nWe are not liable for any indirect, incidental, consequential, or punitive damages, including loss of revenue or loss of data.",
  },
  {
    title: "10. Use of this website",
    body: "You may use this website for lawful purposes only. You must not use it in any way that violates applicable local, national, or international law or regulation, or to transmit any unsolicited commercial communications.\n\nWe reserve the right to suspend or terminate access to this website for anyone who violates these Terms.",
  },
  {
    title: "11. Changes to these Terms",
    body: "We may update these Terms from time to time. When we do, we will revise the \"Last updated\" date at the top of this page. Your continued use of our website or services after changes are posted constitutes acceptance of the updated Terms.",
  },
  {
    title: "12. Governing law",
    body: "These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the relevant courts.",
  },
  {
    title: "13. Contact",
    body: "For any questions about these Terms, please contact us at info@marketyleadgen.com.",
  },
];


function linkify(text: string): ReactNode {
  const parts = text.split(/(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} className="text-purple-deep hover:underline" target="_blank" rel="noopener noreferrer">
              {part}
            </a>
          );
        }
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
          return (
            <a key={i} href={`mailto:${part}`} className="text-purple-deep hover:underline">
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function renderBody(body: string): ReactNode[] {
  const result: ReactNode[] = [];
  let key = 0;

  for (const block of body.split("\n\n")) {
    const lines = block.split("\n");
    let textBuf: string[] = [];
    let listBuf: string[] = [];

    const flushText = () => {
      if (!textBuf.length) return;
      result.push(<p key={key++}>{linkify(textBuf.join(" "))}</p>);
      textBuf = [];
    };
    const flushList = () => {
      if (!listBuf.length) return;
      result.push(
        <ul key={key++} className="list-disc pl-5 space-y-2">
          {listBuf.map((item, j) => <li key={j}>{linkify(item)}</li>)}
        </ul>
      );
      listBuf = [];
    };

    for (const line of lines) {
      if (line.startsWith("- ")) {
        flushText();
        listBuf.push(line.slice(2));
      } else {
        flushList();
        if (line.trim()) textBuf.push(line);
      }
    }
    flushText();
    flushList();
  }

  return result;
}


const KEYS = {
  privacy: "markety-privacy-content-v2",
  terms: "markety-terms-content-v2",
} as const;

export function loadContent(page: "privacy" | "terms"): Section[] {
  try {
    const stored = localStorage.getItem(KEYS[page]);
    if (stored) return JSON.parse(stored) as Section[];
  } catch {  }
  return page === "privacy" ? defaultPrivacy : defaultTerms;
}

export function saveContent(page: "privacy" | "terms", sections: Section[]): void {
  localStorage.setItem(KEYS[page], JSON.stringify(sections));
}

export function resetContent(page: "privacy" | "terms"): Section[] {
  localStorage.removeItem(KEYS[page]);
  return page === "privacy" ? defaultPrivacy : defaultTerms;
}
