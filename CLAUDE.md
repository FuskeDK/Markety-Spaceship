# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow rules

- **Always push after every change.** After committing, run `git push` immediately. Every edit session ends with the repo up to date on the remote.
- **Never use underline on any element — ever.** No `underline`, `text-decoration: underline`, `hover:underline`, or similar in CSS, Tailwind, or inline styles. For interactive links use `hover:opacity-75 transition-opacity` instead.

## Start here

Read `overview.md` at the repo root for a complete breakdown of the codebase — every file's purpose, all API actions, database tables, environment variables, and key flows end-to-end. Start there before making non-trivial changes.

## Commands

```bash
npm run dev       # Next.js dev server on port 3000 (Turbopack)
npm run build     # Production build
npm run lint      # ESLint with auto-fix
npm run format    # Prettier format all files
```

There are no tests in the Next.js project. The admin panel (`admin/`) has its own commands — see `admin/CLAUDE.md`.

## Architecture

**Two systems share one repo:**

1. **Public website** (`src/`) — Next.js 15 App Router. Deployed from the repo root via Vercel.
2. **Admin panel** (`admin/`) — Separate Vite + React SPA with its own Vercel functions. Has its own `vercel.json` and is deployed as a separate Vercel project. See `admin/CLAUDE.md` for that system.

These are independent deployments. Env vars must be set in both Vercel projects separately.

## Key patterns (Next.js site)

**Route group `(site)`:** All public marketing pages live under `src/app/(site)/` and share `(site)/layout.tsx`, which renders `Navbar` + `<main>` + `Footer` + a global bottom purple glow overlay. Non-site routes (`/admin`, `/dashboard/[token]`) are outside this group.

**Translations:** All UI strings are in `src/i18n/site-translations.ts`. The `en` object is canonical — the TypeScript type `SiteStrings` is inferred from it. All other locales (`da`, `de`, `sv`, `no`) must match the same shape. `getSiteT()` always returns English; the locale routing system was removed. Edit strings directly in this file.

**API routes** live in `src/app/api/*/route.ts` as Next.js Route Handlers. All DB access uses the Supabase service key server-side — never expose it to the client. The main admin API is `src/app/api/admin/route.ts`; auth is checked via `x-admin-password` header using `timingSafeEqual`.

**Contact form flow:** `ContactForm` component → `next-safe-action` → `src/actions/server-action.ts` (saves to Supabase `contact_submissions`, sends emails via Spacemail SMTP, syncs to HubSpot).

**Rate limiting:** All public endpoints use Upstash Redis limiters defined in `src/lib/server/_ratelimit.ts`. Import the right limiter (`submitRatelimit`, `generalRatelimit`, etc.) and call it at the top of the handler.

**Styling:** Tailwind CSS v4. The `container` utility is overridden in `globals.css` — max-width 1220px at ≥1400px breakpoint. Dark mode uses `.dark` class via `next-themes`. Never add `text-decoration` to links — `globals.css` sets `a { text-decoration: none }` globally, including `.prose a`.

**Background gradient component** (`src/components/background.tsx`): Use `variant="top"` for hero sections. The bottom purple glow is handled globally in `(site)/layout.tsx` — do not add `variant="bottom"` wrappers around individual sections.

**MDX pages** (privacy, terms): Content is in `.mdx` files co-located with the page. Typography styles come from `@tailwindcss/typography` — prose underlines are suppressed in `globals.css`.

**Server-only helpers** in `src/lib/server/` (prefixed with `_`) must never be imported by client components. They handle email (`_mailer.ts`), rate limits (`_ratelimit.ts`), HubSpot (`_hubspot.ts`), ClickUp (`_clickup.ts`).
