---
name: build-premium-website
description: Build a premium, animated marketing website (React + Vite + Tailwind + GSAP) for a Markety client. Creates a standalone site representing the CLIENT's own business — their name, services, phone, branding. This is the free website Markety delivers as part of the pay-per-lead deal. Use when asked to "build a website", "make a landing page for [business]", or "build a marketing site".
argument-hint: [business name or industry, optional]
---

# Build Client Website (Markety Delivery)

You are an expert at building high-end, animated, single-page marketing websites (React + Vite + Tailwind CSS + GSAP) for Markety's clients. The site represents the CLIENT's own business — their name, their brand, their services. Markety is NOT mentioned anywhere on the built site.

## Phase 1 — Gather client info

Use `AskUserQuestion` to collect:
- Company name (e.g. "Johnson's Plumbing")
- Industry (plumber, electrician, roofer, builder, landscaper, cleaner, painter, etc.)
- City / area they serve (e.g. "Manchester")
- Phone number
- Email address
- 3–5 specific services they offer
- Any brand color preference (if none, auto-pick from industry palette below)

If arguments are provided via `$ARGUMENTS`, pre-fill and only ask for what's missing.

## Phase 2 — Scaffold

Create the project at `~/Desktop/websites/<slug>/`:

```bash
cd ~/Desktop/websites
npm create vite@latest <slug> -- --template react
cd <slug>
npm install
npm install gsap lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Slug = company name lowercased, spaces→hyphens, no special chars (e.g. "johnsons-plumbing").

## Phase 3 — Configure Tailwind

In `tailwind.config.js` add the brand color tokens derived from the industry palette:

```js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '<hex>',
        'primary-dark': '<hex>',
        'primary-light': '<hex>',
        accent: '<hex>',
        'accent-dark': '<hex>',
        background: '#F9F9F9',
        surface: '#FFFFFF',
        ink: '#1A1A1A',
        muted: '#6A6A6A',
        divider: '#E0E0E0',
        deep: '#0F1419',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
}
```

In `index.html` add Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

In `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Inter', sans-serif; background: #F9F9F9; color: #1A1A1A; }
a { text-decoration: none; }

.glass { backdrop-filter: blur(12px); background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.5); }
.glass-dark { backdrop-filter: blur(12px); background: rgba(15,20,25,0.6); border: 1px solid rgba(255,255,255,0.1); }
.noise-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.035; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); }
.gradient-text { background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.magnetic-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.magnetic-btn:hover { transform: scale(1.04); }
.lift-on-hover { transition: transform 0.2s ease; }
.lift-on-hover:hover { transform: translateY(-2px); }
```

## Phase 4 — Build the site

Write `src/App.jsx` as a single file with all sections. DO NOT copy Markety's site structure — this is the client's own business website.

### 4.1 Navbar
- Left: company name as wordmark (font-display font-bold)
- Right: phone number as `tel:` link + "Get a free quote" button (rounded-full, bg-primary text-white)
- Fixed position, starts transparent, becomes `glass` on scroll (useEffect + window scroll listener)
- No underlines — use `lift-on-hover` on links

### 4.2 Hero
- Full viewport height (`min-h-screen`)
- Background: dark overlay (`bg-deep`) with a relevant Unsplash image as `background-image` (CSS inline style)
- Text is white on this dark background
- Headline (font-display): "[Company name]" on line 1, then italic serif tagline on line 2 (e.g. "Manchester's trusted plumbers")
- Body: short punchy description of their main service
- Two CTAs: "Call now" (tel: link, glass-dark style) + "Get a free quote" (bg-primary style)
- GSAP: stagger fade-up on mount (headline → body → CTAs)

### 4.3 Services grid
- Section bg: white (`bg-surface`)
- Mono eyebrow: "WHAT WE DO"
- H2: "Our Services"
- Grid: 3 columns on desktop, 1 on mobile (`grid grid-cols-1 sm:grid-cols-3 gap-6`)
- Each card: rounded-3xl border border-divider p-8, icon in rounded-2xl bg-primary/10 box, h3 + short description
- Icons from lucide-react relevant to each service
- GSAP: scroll-triggered stagger reveal

### 4.4 Why choose us (3 trust pillars)
- Section bg: `bg-background`
- Mono eyebrow: "WHY US"
- 3 large stat or trust points: e.g. "10+ Years Experience", "Fully Insured", "Local to [city]"
- Each: big number/icon in primary color + label + short sentence
- GSAP: counter animation on scroll for numeric pillars

### 4.5 How it works (3 steps)
- Section bg: `bg-deep` (dark section, white text)
- Mono eyebrow in primary-light: "THE PROCESS"
- H2 in white
- 3 horizontal steps with step number, title, description
- Connecting line between steps on desktop

### 4.6 Contact / quote form
- Section bg: `bg-surface`
- Mono eyebrow: "GET IN TOUCH"
- H2: "Get a free quote"
- Left side: form (name, phone, email, message) + large submit button bg-primary
- Right side: their phone + email displayed prominently + short reassurance text
- Form state: idle → sending → sent (mock, no backend needed)

### 4.7 Footer
- bg: `bg-deep`, text white
- Company name + tagline
- Phone, email, city
- "© [year] [Company name]. All rights reserved."
- One line: "Website by Markety" (small, muted — this is the ONE place Markety appears, subtly in footer only)

## Industry color palettes

Pick the primary based on industry:

| Industry | primary | primary-dark | primary-light | accent |
|---|---|---|---|---|
| Plumber | `#3b82f6` | `#2563eb` | `#93c5fd` | `#f59e0b` |
| Electrician | `#f59e0b` | `#d97706` | `#fcd34d` | `#3b82f6` |
| Roofer | `#64748b` | `#475569` | `#94a3b8` | `#f97316` |
| Builder / Construction | `#f97316` | `#ea580c` | `#fdba74` | `#64748b` |
| Landscaper / Garden | `#16a34a` | `#15803d` | `#86efac` | `#f59e0b` |
| Cleaner | `#06b6d4` | `#0891b2` | `#67e8f9` | `#a855f7` |
| Painter / Decorator | `#a855f7` | `#9333ea` | `#d8b4fe` | `#f97316` |

## Type scale

| Element | Classes |
|---|---|
| H1 hero | `text-5xl sm:text-7xl lg:text-8xl tracking-tighter font-display font-extrabold` |
| H2 section | `text-3xl sm:text-5xl tracking-tight font-display font-bold` |
| H3 card | `text-xl font-display font-semibold` |
| Serif tagline | `font-serif italic text-2xl sm:text-4xl` |
| Mono eyebrow | `font-mono text-[10px] sm:text-xs uppercase tracking-[0.18em] text-primary` |
| Body | `font-body text-base sm:text-lg leading-relaxed text-muted` |

## Spacing

- Section padding: `py-24 sm:py-32 lg:py-40`
- Container: `max-w-7xl mx-auto px-6 sm:px-10 lg:px-16`
- Card padding: `p-6 sm:p-8`

## GSAP setup

Import at top of App.jsx:
```js
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
```

Hero stagger:
```js
useEffect(() => {
  gsap.fromTo('.hero-el', { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
  })
}, [])
```

Scroll reveal (apply to service cards, pillars):
```js
gsap.fromTo(el, { opacity: 0, y: 30 }, {
  opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
  scrollTrigger: { trigger: el, start: 'top 80%' }
})
```

## Phase 5 — Polish & verify

```bash
cd ~/Desktop/websites/<slug> && npm run dev
```

Check:
- Resize to 375 / 768 / 1440 to verify responsive layout
- Scroll full page — confirm hero stagger, section reveals
- Submit contact form — verify idle → sending → sent state
- Fix any console errors

Report the local URL (`http://localhost:5173`) to the user.

## Phase 6 — Deploy to Vercel

```bash
cd ~/Desktop/websites/<slug>
npx vercel --yes
```

Share the preview URL so the user can send it to the client.

## Key principles

- This is the CLIENT's website. Their name, phone, services front and center.
- Do NOT use Markety's purple brand colors, Markety's component patterns, or Markety's copy.
- Do NOT import anything from the Markety Next.js project.
- The only Markety mention is a small "Website by Markety" in the footer.
- Always English — these are UK clients.
