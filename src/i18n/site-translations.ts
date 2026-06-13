export type Locale = "en" | "da" | "de" | "sv" | "no" | "fr" | "es" | "nl" | "it" | "pt" | "pl" | "fi" | "ru" | "ja" | "zh" | "ko" | "ar" | "tr" | "hi";

// Maps locale codes from URL (e.g. da-DK) to the short code used here
export const LOCALE_MAP: Record<string, Locale> = {
  "en": "en", "en-US": "en", "en-GB": "en",
  "da": "da", "da-DK": "da",
  "de": "de", "de-DE": "de", "de-AT": "de", "de-CH": "de",
  "sv": "sv", "sv-SE": "sv",
  "no": "no", "nb-NO": "no", "nn-NO": "no",
};

export type SiteStrings = typeof en;

const en = {
  nav: {
    services: "Services",
    about: "About",
    faq: "FAQ",
    contact: "Contact",
    contactBtn: "Contact us",
  },
  hero: {
    headline: "Qualified leads, delivered.",
    subheadline: "Markety runs your full lead generation system - paid ads, landing pages, email follow-ups, and everything in between.",
    ctaPrimary: "Try free for 30 days",
    ctaSecondary: "Learn how it works",
    features: [
      { title: "Email marketing", description: "Sequences that warm up leads and turn interest into booked calls." },
      { title: "Paid campaigns", description: "Ads managed across Google, Meta, and beyond - optimised daily." },
      { title: "Landing pages", description: "High-converting pages built around your offer and audience." },
      { title: "Full-funnel setup", description: "From first click to qualified conversation, every step handled." },
    ],
  },
  features: {
    eyebrow: "RESULTS-DRIVEN MARKETING",
    heading: "Everything your campaign needs",
    subheading: "Markety handles your entire lead generation pipeline - from the first ad impression to a qualified conversation ready for your sales team.",
    cards: [
      "Email marketing that converts",
      "Paid campaigns, fully managed",
      "Landing pages that capture leads",
    ],
  },
  stats: {
    heading: "We turn ad spend into qualified conversations",
    sub1: "A full lead generation system, built and managed for you.",
    sub2: "No retainers. No vanity metrics. We charge per qualified lead and work backwards from your sales process to build a system that delivers people who are already interested and ready to talk.",
    labels: ["Avg. cost per qualified lead", "Companies served", "Leads delivered", "Based in"],
  },
  process: {
    steps: [
      {
        title: "We learn your business.",
        description: "You tell us about your customers, sales process, and what a qualified lead looks like. No generic playbooks.",
      },
      {
        title: "We build your system.",
        description: "Landing pages, email sequences, and ad campaigns - all built before anything goes live.",
      },
      {
        title: "We go live and improve.",
        description: "Campaigns launch and we immediately start testing. Every week we analyse what's working and cut what isn't.",
      },
      {
        title: "Leads arrive, you close.",
        description: "Your sales team gets a steady stream of people who are already interested and fully qualified.",
      },
      {
        title: "Transparent reporting.",
        description: "Know exactly what's performing, what each lead costs, and how your pipeline is growing.",
      },
    ],
  },
  faq: {
    heading: "Got Questions?",
    subheading: "If you can't find what you're looking for,",
    subheadingLink: "get in touch",
    categories: [
      {
        title: "How it works",
        questions: [
          {
            question: "What exactly does Markety do?",
            answer: "Markety is a lead generation agency. We build and manage your full acquisition system - paid ad campaigns, landing pages, and email follow-up sequences - so that qualified prospects land in your sales team's inbox, ready for a conversation.",
          },
          {
            question: "How is Markety different from a traditional marketing agency?",
            answer: "Most agencies charge a retainer and deliver impressions or clicks. We charge per qualified lead - meaning we only win when you win. Everything we do is optimised around one outcome: delivering prospects who are genuinely interested and match your criteria.",
          },
          {
            question: "What counts as a 'qualified lead'?",
            answer: "We define a qualified lead together before we start. That usually means a person who fits your target profile, has shown genuine interest in your offer, and has provided contact details. We agree on the definition upfront so there are no surprises.",
          },
        ],
      },
      {
        title: "Leads & Pricing",
        questions: [
          {
            question: "How soon will I start seeing leads?",
            answer: "Most clients see their first leads within 7-14 days of campaigns going live. The first week after launch we're collecting data and optimising - volume typically ramps up in weeks 2 and 3.",
          },
          {
            question: "How much does it cost?",
            answer: "We charge per qualified lead delivered. Pricing starts at around $2.80 per lead depending on your industry and volume. There are no monthly retainers - you pay for results. Contact us for a quote tailored to your business.",
          },
        ],
      },
      {
        title: "Getting started",
        questions: [
          {
            question: "Do I need to provide anything to get started?",
            answer: "We need access to your ad accounts and a brief about your business, target customer, and offer. We handle everything else - creative, copy, landing pages, and setup. Most clients are live within 5-7 business days.",
          },
          {
            question: "Can I stop working with you at any time?",
            answer: "Yes. After the initial 30-day engagement period, we work on a rolling month-to-month basis. You can cancel with 14 days written notice. We believe the results should speak for themselves - we don't lock people in.",
          },
        ],
      },
    ],
  },
  about: {
    headline: "Turning ad spend into qualified leads",
    subheadline: "Markety builds and manages your complete lead generation system.",
    body: "We're a lead generation agency built from the ground up to deliver qualified prospects to your sales team. No generic playbooks, no wasted budget - just a system tuned to your business and your customers.",
    body2: "We are customer-obsessed - investing the time to understand every aspect of your sales process so that we can build campaigns that actually convert. We work on a pay-per-lead model because your success is our success. We don't win unless you do.",
    statsLabels: ["Avg. cost per qualified lead", "Companies served", "Leads delivered", "Based in"],
  },
};

const da: SiteStrings = {
  nav: {
    services: "Tjenester",
    about: "Om os",
    faq: "FAQ",
    contact: "Kontakt",
    contactBtn: "Kontakt os",
  },
  hero: {
    headline: "Kvalificerede leads - leveret.",
    subheadline: "Markety driver dit komplette leadgenereringssystem - betalte annoncer, landingssider, e-mailopfølgninger og alt derimellem.",
    ctaPrimary: "Prøv gratis i 30 dage",
    ctaSecondary: "Se hvordan det virker",
    features: [
      { title: "E-mailmarketing", description: "Sekvenser der varmer leads op og omdanner interesse til bookede møder." },
      { title: "Betalte kampagner", description: "Annoncer på Google, Meta og mere - optimeret dagligt." },
      { title: "Landingssider", description: "Sider med høj konvertering, bygget til dit tilbud og din målgruppe." },
      { title: "Fuld funnel-opsætning", description: "Fra første klik til kvalificeret samtale - hvert trin håndteret." },
    ],
  },
  features: {
    eyebrow: "RESULTATORIENTERET MARKEDSFØRING",
    heading: "Alt din kampagne har brug for",
    subheading: "Markety håndterer din komplette leadgenereringspipeline - fra første annonceklik til en kvalificeret samtale, klar til dit salgsteam.",
    cards: [
      "E-mailmarketing der konverterer",
      "Betalte kampagner, fuldt styret",
      "Landingssider der fanger leads",
    ],
  },
  stats: {
    heading: "Vi omdanner annoncebudget til kvalificerede samtaler",
    sub1: "Et komplet leadgenereringssystem, bygget og styret for dig.",
    sub2: "Ingen retainers. Ingen forfængeligheds-metrics. Vi opkræver per kvalificeret lead og arbejder baglæns fra din salgsproces for at bygge et system, der leverer folk, som allerede er interesserede og klar til at snakke.",
    labels: ["Gns. pris pr. kvalificeret lead", "Virksomheder betjent", "Leads leveret", "Baseret i"],
  },
  process: {
    steps: [
      {
        title: "Vi lærer din virksomhed at kende.",
        description: "Du fortæller om dine kunder, salgsproces og hvad et kvalificeret lead er. Ingen generiske playbooks.",
      },
      {
        title: "Vi bygger dit system.",
        description: "Landingssider, e-mailsekvenser og annoncekampagner - alt er bygget, inden noget går live.",
      },
      {
        title: "Vi går live og optimerer.",
        description: "Kampagnerne lanceres, og vi begynder straks at teste. Hver uge analyserer vi hvad der virker og skærer det fra, der ikke gør.",
      },
      {
        title: "Leads ankommer, du lukker.",
        description: "Dit salgsteam får en stabil strøm af folk, der allerede er interesserede og fuldt kvalificerede.",
      },
      {
        title: "Transparent rapportering.",
        description: "Kend præcis hvad der performer, hvad hvert lead koster, og hvordan din pipeline vokser.",
      },
    ],
  },
  faq: {
    heading: "Har du spørgsmål?",
    subheading: "Kan du ikke finde svaret,",
    subheadingLink: "er du velkommen til at kontakte os",
    categories: [
      {
        title: "Sådan fungerer det",
        questions: [
          {
            question: "Hvad laver Markety præcis?",
            answer: "Markety er et leadgenereringsbureau. Vi bygger og administrerer dit komplette kampagnesystem - betalte annoncekampagner, landingssider og e-mailsekvenser - så kvalificerede leads lander i dit salgsteams indbakke, klar til en samtale.",
          },
          {
            question: "Hvordan adskiller Markety sig fra et traditionelt marketingbureau?",
            answer: "De fleste bureauer opkræver en retainer og leverer visninger eller klik. Vi opkræver per kvalificeret lead - vi vinder kun, når du vinder. Alt vi gør er optimeret mod ét resultat: at levere kundeemner, der er genuint interesserede og matcher dine kriterier.",
          },
          {
            question: "Hvad tæller som et 'kvalificeret lead'?",
            answer: "Vi definerer det kvalificerede lead sammen, inden vi begynder. Det er som regel en person, der matcher din målgruppe, har vist reel interesse for dit tilbud og har givet kontaktoplysninger. Vi aftaler definitionen på forhånd - ingen overraskelser.",
          },
        ],
      },
      {
        title: "Leads og priser",
        questions: [
          {
            question: "Hvornår begynder jeg at se leads?",
            answer: "De fleste kunder ser deres første leads inden for 7-14 dage efter kampagnerne er gået live. Den første uge indsamler vi data og optimerer - volumen stiger typisk i uge 2 og 3.",
          },
          {
            question: "Hvad koster det?",
            answer: "Vi opkræver per leveret kvalificeret lead. Priser starter ved ca. $2,80 per lead, afhængigt af din branche og volumen. Ingen månedlige retainers - du betaler for resultater. Kontakt os for et tilbud tilpasset din virksomhed.",
          },
        ],
      },
      {
        title: "Kom i gang",
        questions: [
          {
            question: "Hvad skal jeg bidrage med for at komme i gang?",
            answer: "Vi har brug for adgang til dine annoncekonti og en briefing om din virksomhed, målgruppe og tilbud. Vi håndterer alt andet - kreativt, copy, landingssider og opsætning. De fleste kunder er live inden for 5-7 arbejdsdage.",
          },
          {
            question: "Kan jeg stoppe samarbejdet når som helst?",
            answer: "Ja. Efter den indledende 30-dages periode arbejder vi måned for måned. Du kan opsige med 14 dages skriftligt varsel. Vi mener, at resultaterne skal tale for sig selv - vi låser ikke folk fast.",
          },
        ],
      },
    ],
  },
  about: {
    headline: "Vi omdanner annoncekroner til kvalificerede leads",
    subheadline: "Markety bygger og administrerer dit komplette leadgenereringssystem.",
    body: "Vi er et leadgenereringsbureau, der er bygget fra bunden for at levere kvalificerede kundeemner til dit salgsteam. Ingen generiske playbooks, intet spildt budget - kun et system tilpasset din virksomhed og dine kunder.",
    body2: "Vi er kundeobsessive - vi investerer tid i at forstå alle aspekter af din salgsproces, så vi kan bygge kampagner der rent faktisk konverterer. Vi arbejder med pay-per-lead-model, fordi din succes er vores succes. Vi vinder ikke, medmindre du vinder.",
    statsLabels: ["Gns. pris pr. kvalificeret lead", "Virksomheder betjent", "Leads leveret", "Baseret i"],
  },
};

const de: SiteStrings = {
  nav: {
    services: "Leistungen",
    about: "Über uns",
    faq: "FAQ",
    contact: "Kontakt",
    contactBtn: "Kontakt aufnehmen",
  },
  hero: {
    headline: "Qualifizierte Leads - geliefert.",
    subheadline: "Markety betreibt Ihr gesamtes Lead-Generierungssystem - bezahlte Anzeigen, Landing Pages, E-Mail-Follow-ups und alles dazwischen.",
    ctaPrimary: "30 Tage kostenlos testen",
    ctaSecondary: "So funktioniert es",
    features: [
      { title: "E-Mail-Marketing", description: "Sequenzen, die Leads aufwärmen und Interesse in gebuchte Gespräche umwandeln." },
      { title: "Bezahlte Kampagnen", description: "Anzeigen auf Google, Meta und mehr - täglich optimiert." },
      { title: "Landing Pages", description: "Hochkonvertierende Seiten, zugeschnitten auf Ihr Angebot und Ihre Zielgruppe." },
      { title: "Full-Funnel-Setup", description: "Vom ersten Klick bis zum qualifizierten Gespräch - jeder Schritt erledigt." },
    ],
  },
  features: {
    eyebrow: "ERGEBNISORIENTIERTES MARKETING",
    heading: "Alles, was Ihre Kampagne braucht",
    subheading: "Markety übernimmt Ihre gesamte Lead-Generierungs-Pipeline - vom ersten Anzeigenkontakt bis zum qualifizierten Gespräch für Ihr Vertriebsteam.",
    cards: [
      "E-Mail-Marketing das konvertiert",
      "Bezahlte Kampagnen, vollständig verwaltet",
      "Landing Pages die Leads erfassen",
    ],
  },
  stats: {
    heading: "Wir verwandeln Werbeausgaben in qualifizierte Gespräche",
    sub1: "Ein vollständiges Lead-Generierungssystem, für Sie aufgebaut und verwaltet.",
    sub2: "Keine Retainer. Keine Eitelkeits-Metriken. Wir berechnen pro qualifiziertem Lead und arbeiten rückwärts von Ihrem Vertriebsprozess, um ein System zu entwickeln, das Menschen liefert, die bereits interessiert sind.",
    labels: ["Ø Kosten pro qualifiziertem Lead", "Betreute Unternehmen", "Gelieferte Leads", "Standort"],
  },
  process: {
    steps: [
      { title: "Wir lernen Ihr Unternehmen kennen.", description: "Sie erzählen uns von Ihren Kunden, dem Vertriebsprozess und wie ein qualifizierter Lead aussieht. Keine generischen Playbooks." },
      { title: "Wir bauen Ihr System.", description: "Landing Pages, E-Mail-Sequenzen und Anzeigenkampagnen - alles aufgebaut, bevor etwas live geht." },
      { title: "Wir gehen live und verbessern.", description: "Kampagnen starten und wir beginnen sofort mit dem Testen. Jede Woche analysieren wir, was funktioniert." },
      { title: "Leads kommen, Sie schließen ab.", description: "Ihr Vertriebsteam erhält einen stetigen Strom von Menschen, die bereits interessiert und vollständig qualifiziert sind." },
      { title: "Transparentes Reporting.", description: "Wissen Sie genau, was performt, was jeder Lead kostet und wie Ihre Pipeline wächst." },
    ],
  },
  faq: {
    heading: "Haben Sie Fragen?",
    subheading: "Wenn Sie nicht finden, was Sie suchen,",
    subheadingLink: "nehmen Sie Kontakt auf",
    categories: [
      {
        title: "So funktioniert es",
        questions: [
          { question: "Was macht Markety genau?", answer: "Markety ist eine Lead-Generierungsagentur. Wir bauen und verwalten Ihr vollständiges Akquisesystem - bezahlte Anzeigenkampagnen, Landing Pages und E-Mail-Follow-up-Sequenzen - damit qualifizierte Interessenten in der Inbox Ihres Vertriebsteams landen." },
          { question: "Wie unterscheidet sich Markety von einer traditionellen Marketingagentur?", answer: "Die meisten Agenturen berechnen einen Retainer und liefern Impressionen oder Klicks. Wir berechnen pro qualifiziertem Lead - wir gewinnen nur, wenn Sie gewinnen." },
          { question: "Was gilt als 'qualifizierter Lead'?", answer: "Wir definieren den qualifizierten Lead gemeinsam vor dem Start. Das bedeutet in der Regel eine Person, die zu Ihrem Zielprofil passt, echtes Interesse an Ihrem Angebot gezeigt hat und Kontaktdaten hinterlassen hat." },
        ],
      },
      {
        title: "Leads & Preise",
        questions: [
          { question: "Wann werde ich erste Leads sehen?", answer: "Die meisten Kunden sehen ihre ersten Leads innerhalb von 7-14 Tagen nach dem Kampagnenstart. In der ersten Woche sammeln wir Daten und optimieren - das Volumen steigt typischerweise in Woche 2 und 3." },
          { question: "Was kostet es?", answer: "Wir berechnen pro geliefertem qualifizierten Lead. Die Preise beginnen bei ca. $2,80 pro Lead, abhängig von Ihrer Branche und Ihrem Volumen. Keine monatlichen Retainer - Sie zahlen für Ergebnisse." },
        ],
      },
      {
        title: "Erste Schritte",
        questions: [
          { question: "Was muss ich für den Start bereitstellen?", answer: "Wir benötigen Zugang zu Ihren Anzeigenkonten und ein Briefing über Ihr Unternehmen, Ihre Zielgruppe und Ihr Angebot. Wir kümmern uns um alles andere." },
          { question: "Kann ich die Zusammenarbeit jederzeit beenden?", answer: "Ja. Nach der anfänglichen 30-Tage-Bindungsfrist arbeiten wir auf monatlicher Basis. Sie können mit 14 Tagen schriftlicher Kündigung kündigen." },
        ],
      },
    ],
  },
  about: {
    headline: "Wir verwandeln Werbebudget in qualifizierte Leads",
    subheadline: "Markety baut und verwaltet Ihr komplettes Lead-Generierungssystem.",
    body: "Wir sind eine Lead-Generierungsagentur, die von Grund auf entwickelt wurde, um qualifizierte Interessenten an Ihr Vertriebsteam zu liefern. Keine generischen Playbooks, kein verschwendetes Budget.",
    body2: "Wir sind kundenbesessen - wir investieren Zeit, um jeden Aspekt Ihres Vertriebsprozesses zu verstehen. Wir arbeiten mit einem Pay-per-Lead-Modell, weil Ihr Erfolg unser Erfolg ist.",
    statsLabels: ["Ø Kosten pro qualifiziertem Lead", "Betreute Unternehmen", "Gelieferte Leads", "Standort"],
  },
};

const sv: SiteStrings = {
  nav: { services: "Tjänster", about: "Om oss", faq: "FAQ", contact: "Kontakt", contactBtn: "Kontakta oss" },
  hero: {
    headline: "Kvalificerade leads - levererade.",
    subheadline: "Markety driver ditt kompletta leadgenereringssystem - betald annonsering, landningssidor, e-postuppföljningar och allt däremellan.",
    ctaPrimary: "Prova gratis i 30 dagar",
    ctaSecondary: "Se hur det fungerar",
    features: [
      { title: "E-postmarknadsföring", description: "Sekvenser som värmer upp leads och omvandlar intresse till bokade möten." },
      { title: "Betalda kampanjer", description: "Annonser på Google, Meta och mer - optimerade dagligen." },
      { title: "Landningssidor", description: "Högkonverterande sidor byggda kring ditt erbjudande och din målgrupp." },
      { title: "Full-funnel-uppsättning", description: "Från första klick till kvalificerat samtal - varje steg hanterat." },
    ],
  },
  features: {
    eyebrow: "RESULTATDRIVEN MARKNADSFÖRING",
    heading: "Allt din kampanj behöver",
    subheading: "Markety hanterar hela din leadgenereringspipeline - från första annonsvisning till ett kvalificerat samtal redo för ditt säljteam.",
    cards: ["E-postmarknadsföring som konverterar", "Betalda kampanjer, helt hanterade", "Landningssidor som fångar leads"],
  },
  stats: {
    heading: "Vi omvandlar annonsbudget till kvalificerade samtal",
    sub1: "Ett komplett leadgenereringssystem, byggt och hanterat för dig.",
    sub2: "Inga retainers. Inga fåfängliga mätvärden. Vi tar betalt per kvalificerat lead och arbetar bakifrån din säljprocess.",
    labels: ["Genomsnittlig kostnad per lead", "Betjänade företag", "Levererade leads", "Baserat i"],
  },
  process: {
    steps: [
      { title: "Vi lär känna din verksamhet.", description: "Du berättar om dina kunder, säljprocess och hur ett kvalificerat lead ser ut. Inga generiska spelböcker." },
      { title: "Vi bygger ditt system.", description: "Landningssidor, e-postsekvenser och annonskampanjer - allt byggt innan något går live." },
      { title: "Vi går live och förbättrar.", description: "Kampanjer lanseras och vi börjar omedelbart testa. Varje vecka analyserar vi vad som fungerar." },
      { title: "Leads anländer, du stänger.", description: "Ditt säljteam får en stadig ström av personer som redan är intresserade och fullt kvalificerade." },
      { title: "Transparent rapportering.", description: "Vet exakt vad som presterar, vad varje lead kostar och hur din pipeline växer." },
    ],
  },
  faq: {
    heading: "Har du frågor?",
    subheading: "Om du inte hittar det du söker,",
    subheadingLink: "kontakta oss",
    categories: [
      { title: "Hur det fungerar", questions: [
        { question: "Vad gör Markety exakt?", answer: "Markety är en leadgenereringsbyrå. Vi bygger och hanterar ditt kompletta anskaffningssystem - betalda annonskampanjer, landningssidor och e-postsekvenser." },
        { question: "Hur skiljer sig Markety från en traditionell marknadsföringsbyrå?", answer: "De flesta byråer tar en retainer och levererar visningar eller klick. Vi tar betalt per kvalificerat lead - vi vinner bara när du vinner." },
        { question: "Vad räknas som ett 'kvalificerat lead'?", answer: "Vi definierar det kvalificerade leadet tillsammans innan vi börjar. Det är vanligtvis en person som matchar din målprofil och har visat genuint intresse." },
      ]},
      { title: "Leads och priser", questions: [
        { question: "När börjar jag se leads?", answer: "De flesta kunder ser sina första leads inom 7-14 dagar efter att kampanjerna gått live." },
        { question: "Vad kostar det?", answer: "Vi tar betalt per levererat kvalificerat lead. Priser börjar på ungefär $2,80 per lead. Inga månadsavgifter." },
      ]},
      { title: "Komma igång", questions: [
        { question: "Vad behöver jag bidra med för att komma igång?", answer: "Vi behöver tillgång till dina annonskonton och en briefing om din verksamhet. Vi hanterar allt annat." },
        { question: "Kan jag avsluta samarbetet när som helst?", answer: "Ja. Vi arbetar månad för månad efter den inledande 30-dagarsperioden. Du kan säga upp med 14 dagars varsel." },
      ]},
    ],
  },
  about: {
    headline: "Vi omvandlar annonspengar till kvalificerade leads",
    subheadline: "Markety bygger och hanterar ditt kompletta leadgenereringssystem.",
    body: "Vi är en leadgenereringsbyrå byggd från grunden för att leverera kvalificerade prospekt till ditt säljteam. Inga generiska spelböcker, ingen slösad budget.",
    body2: "Vi är kundobsessiva - vi investerar tid för att förstå varje aspekt av din säljprocess. Vi arbetar med pay-per-lead eftersom din framgång är vår framgång.",
    statsLabels: ["Genomsnittlig kostnad per lead", "Betjänade företag", "Levererade leads", "Baserat i"],
  },
};

const no: SiteStrings = {
  nav: { services: "Tjenester", about: "Om oss", faq: "FAQ", contact: "Kontakt", contactBtn: "Kontakt oss" },
  hero: {
    headline: "Kvalifiserte leads - levert.",
    subheadline: "Markety driver ditt komplette leadgenereringssystem - betalte annonser, landingssider, e-postoppfølginger og alt imellom.",
    ctaPrimary: "Prøv gratis i 30 dager",
    ctaSecondary: "Se hvordan det fungerer",
    features: [
      { title: "E-postmarkedsføring", description: "Sekvenser som varmer opp leads og gjør interesse om til bookede møter." },
      { title: "Betalte kampanjer", description: "Annonser på Google, Meta og mer - optimalisert daglig." },
      { title: "Landingssider", description: "Høykonverterende sider bygget rundt ditt tilbud og din målgruppe." },
      { title: "Full funnel-oppsett", description: "Fra første klikk til kvalifisert samtale - hvert steg håndtert." },
    ],
  },
  features: {
    eyebrow: "RESULTATORIENTERT MARKEDSFØRING",
    heading: "Alt kampanjen din trenger",
    subheading: "Markety håndterer hele din leadgenereringspipeline - fra første annonseklikk til en kvalifisert samtale klar for salgsteamet ditt.",
    cards: ["E-postmarkedsføring som konverterer", "Betalte kampanjer, fullt styrt", "Landingssider som fanger leads"],
  },
  stats: {
    heading: "Vi gjør annonsebudsjett om til kvalifiserte samtaler",
    sub1: "Et komplett leadgenereringssystem, bygget og styrt for deg.",
    sub2: "Ingen retainere. Ingen forfengelighetsmetrikker. Vi tar betalt per kvalifisert lead.",
    labels: ["Gj.sn. kostnad per kvalifisert lead", "Betjente virksomheter", "Leverte leads", "Basert i"],
  },
  process: {
    steps: [
      { title: "Vi lærer din virksomhet å kjenne.", description: "Du forteller om kundene dine, salgsprosessen og hva et kvalifisert lead er. Ingen generiske playbooks." },
      { title: "Vi bygger systemet ditt.", description: "Landingssider, e-postsekvenser og annonsekampanjer - alt bygget før noe går live." },
      { title: "Vi går live og forbedrer.", description: "Kampanjene lanseres og vi begynner umiddelbart å teste. Hver uke analyserer vi hva som fungerer." },
      { title: "Leads ankommer, du lukker.", description: "Salgsteamet ditt får en jevn strøm av folk som allerede er interesserte og fullt kvalifiserte." },
      { title: "Transparent rapportering.", description: "Vit nøyaktig hva som presterer, hva hvert lead koster og hvordan pipelinen din vokser." },
    ],
  },
  faq: {
    heading: "Har du spørsmål?",
    subheading: "Finner du ikke det du leter etter,",
    subheadingLink: "ta kontakt",
    categories: [
      { title: "Slik fungerer det", questions: [
        { question: "Hva gjør Markety egentlig?", answer: "Markety er et leadgenereringsbyrå. Vi bygger og administrerer ditt komplette anskaffelsessystem - betalte annonsekampanjer, landingssider og e-postsekvenser." },
        { question: "Hvordan skiller Markety seg fra et tradisjonelt markedsføringsbyrå?", answer: "De fleste byråer tar en retainer og leverer visninger eller klikk. Vi tar betalt per kvalifisert lead - vi vinner bare når du vinner." },
        { question: "Hva teller som et 'kvalifisert lead'?", answer: "Vi definerer det kvalifiserte leadet sammen før vi starter. Det er vanligvis en person som matcher målprofilen din og har vist reell interesse." },
      ]},
      { title: "Leads og priser", questions: [
        { question: "Når begynner jeg å se leads?", answer: "De fleste kunder ser sine første leads innen 7-14 dager etter at kampanjene er live." },
        { question: "Hva koster det?", answer: "Vi tar betalt per levert kvalifisert lead. Priser starter på rundt $2,80 per lead. Ingen månedlige retainere." },
      ]},
      { title: "Kom i gang", questions: [
        { question: "Hva trenger jeg å bidra med for å komme i gang?", answer: "Vi trenger tilgang til annonsekontene dine og en briefing om virksomheten din. Vi tar hånd om alt annet." },
        { question: "Kan jeg avslutte samarbeidet når som helst?", answer: "Ja. Vi jobber måned for måned etter den innledende 30-dagersperioden. Du kan si opp med 14 dagers varsel." },
      ]},
    ],
  },
  about: {
    headline: "Vi gjør annonsebudsjett om til kvalifiserte leads",
    subheadline: "Markety bygger og administrerer ditt komplette leadgenereringssystem.",
    body: "Vi er et leadgenereringsbyrå bygget fra grunnen for å levere kvalifiserte prospekter til salgsteamet ditt. Ingen generiske playbooks, ingen kastet bort budsjett.",
    body2: "Vi er kundebesatte - vi investerer tid i å forstå alle aspekter av salgsprosessen din. Vi jobber med pay-per-lead fordi din suksess er vår suksess.",
    statsLabels: ["Gj.sn. kostnad per kvalifisert lead", "Betjente virksomheter", "Leverte leads", "Basert i"],
  },
};

export const translations: Partial<Record<Locale, SiteStrings>> & { en: SiteStrings } = { en, da, de, sv, no };

export function getT(locale: string): SiteStrings {
  const l = LOCALE_MAP[locale] ?? "en";
  return translations[l] ?? translations.en;
}
