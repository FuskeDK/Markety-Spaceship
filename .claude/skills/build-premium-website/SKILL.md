---
name: build-premium-website
description: Build a standalone marketing website for a Markety client. Creates a new Vite + React + Tailwind site representing the CLIENT's own business (their brand, their services, their contact info). This is the free website Markety delivers as part of the deal.
argument-hint: [client name or industry, optional]
---

# Build Client Website (Markety Delivery)

You are building a standalone marketing website for one of Markety's clients. This is the FREE website Markety delivers as part of their pay-per-lead deal. The site represents the CLIENT's business — their name, their brand, their services — not Markety.

## Phase 1 — Gather client info

Use `AskUserQuestion` to collect:
- Company name (e.g. "Johnson's Plumbing")
- Industry (plumber, electrician, roofer, builder, landscaper)
- City / area they serve (e.g. "Manchester")
- Phone number
- Email address
- 3-5 services they offer
- Any brand color preference (or auto-pick from industry)

If arguments are provided via `$ARGUMENTS`, pre-fill and only ask for what's missing.

## Phase 2 — Scaffold standalone project

Create the project at `~/Desktop/websites/[slug]/`:

```bash
cd ~/Desktop/websites
npm create vite@latest [slug] -- --template react
cd [slug]
npm install
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Slug = company name lowercased, hyphenated (e.g. "johnsons-plumbing").

## Phase 3 — Build the site

Create `src/App.jsx` as a single file with these sections:

**1. Navbar**
- Client's company name as logo/wordmark (left)
- Phone number (right, prominent)
- "Get a free quote" CTA button

**2. Hero**
- Full-screen with dark overlay
- Background: relevant Unsplash image (plumber at work, electrician, etc.)
- Headline: "[Company name] — [City]'s trusted [industry]"
- Subheadline: Short punchy line about their service
- Two CTAs: "Call now" (tel: link) + "Get a free quote" (scroll to contact)

**3. Services (3-6 tiles)**
- Grid of their specific services
- Icon from lucide-react per service
- Short description per tile

**4. Why choose them (3 trust points)**
- Years of experience
- Fully insured / certified
- Local to [city]

**5. Contact / quote form**
- Name, phone, email, message
- Large "Get a free quote" submit button
- Their phone number displayed prominently

**6. Footer**
- Company name, phone, email, city
- © [year]

## Styling rules

- **Industry color palette** — pick a fitting primary color:
  - Plumber: blue (`#1d4ed8`)
  - Electrician: amber (`#d97706`)
  - Roofer: slate (`#475569`)
  - Builder: orange (`#ea580c`)
  - Landscaper: green (`#16a34a`)
- Clean, professional, mobile-first
- No animations needed — keep it fast and simple
- Use Tailwind utility classes throughout

## Phase 4 — Deploy to Vercel

```bash
cd ~/Desktop/websites/[slug]
npx vercel --yes
```

Share the preview URL with the user so they can send it to the client.

## Language
Always English — these are UK clients.

## Key principle
This is the CLIENT'S website. Their name is on it, their phone number is on it, their services are listed. Markety is not mentioned anywhere on the site.
