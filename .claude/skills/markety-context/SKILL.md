---
name: markety-context
description: Full context about Markety — the business, codebase, stack, clients, and how everything works. Use this whenever working on the Markety website or admin panel.
auto-activate: true
---

# Markety Context

You are working on **Markety** (marketyleadgen.com) — a pay-per-lead agency run by Kare Jurgensen.

## Business Model
- **Pay-per-lead**: Clients only pay per qualified lead received — no fixed monthly retainer
- **Free trial**: First 30 days completely free
- **Free website + landing page**: Included for free as long as client is running leads with Markety
- **Target markets**: EN (UK), DA (Denmark), DE (Germany), SV (Sweden), NO (Norway)
- **Industries**: Plumbers, electricians, roofers, landscapers, HVAC, and other local trade businesses

## Codebase Structure
Two independent deployments in one repo at `/Users/karejurgensen/Desktop/websites/template/`:

1. **Public website** (`src/`) — Next.js 15 App Router, deployed via Vercel
2. **Admin panel** (`admin/`) — Vite + React SPA, separate Vercel project

**Critical**: `/api/admin` calls go to `src/app/api/admin/route.ts` (Next.js), NOT `admin/api/admin.ts`.

## Tech Stack
- **Framework**: Next.js 15, App Router, Turbopack
- **Styling**: Tailwind CSS v4, DM Sans font, dark mode via next-themes
- **DB**: Supabase (service key server-side only)
- **Payments**: Stripe
- **Email**: Spacemail SMTP via nodemailer
- **CRM**: HubSpot
- **Rate limiting**: Upstash Redis
- **Search**: Serper.dev (Google Search JSON API) for outreach feature
- **Deployment**: Vercel

## Key Design Rules (NEVER break these)
- **No underlines ever** — not on links, not on hover. Use `hover:opacity-75 transition-opacity` instead
- **No `variant="bottom"` Background** — bottom glow is global in `(site)/layout.tsx`
- **Purple primary**: `oklch(0.60 0.22 285)` / `text-purple-600`
- **Container**: max-width 1220px at ≥1400px
- **Always push after every commit** — `git push` immediately

## Key Files
- `src/app/(site)/page.tsx` — Homepage (Hero → Logos → Features → ResourceAllocation → StatsHero → Testimonials → FAQ)
- `src/app/(site)/about/page.tsx` — About page
- `src/components/blocks/about.tsx` — About content (has portrait photos, DO NOT remove)
- `src/components/blocks/hero.tsx` — Hero (image hidden on mobile: `hidden lg:block`)
- `src/app/api/admin/route.ts` — Main admin API (find-companies uses Serper.dev + regex, no AI)
- `src/app/admin/page.tsx` — Admin frontend (~3300 lines)
- `src/i18n/site-translations.ts` — All UI strings (en is canonical)
- `src/lib/server/_ratelimit.ts` — Rate limiters (submitRatelimit, generalRatelimit, outreachRatelimit)
- `next.config.ts` — Security headers

## Outreach Feature
- Searches Google via Serper.dev for UK trade businesses
- Parses company name/email/phone with regex — no AI/Anthropic needed
- Rate limited: 90 requests / 10 min per IP via `outreachRatelimit`
- Env var needed: `SERPER_API_KEY`

## Commands
```bash
npm run dev       # dev server port 3000
npm run build     # production build
npm run lint      # ESLint auto-fix
npm run format    # Prettier
```
