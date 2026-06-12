# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Read `overview.md` at the repo root for a full breakdown of the codebase - file purposes, all API actions, database tables, environment variables, and how key flows work end-to-end. Start there before making non-trivial changes.

## Commands

```bash
npm run dev        # Dev server on port 8080
npm run build      # Production build → dist/
npm run lint       # ESLint
npm run test       # Vitest (single run)
npm run test:watch # Vitest (watch mode)
```

Run a single test file:
```bash
npx vitest run src/test/example.test.ts
```

## Architecture

**Two separate systems share one repo:**

1. **Frontend** (`src/`) - Vite + React SPA. All routes are client-side; Vercel rewrites everything non-API to `index.html`.

2. **Backend** (`api/`) - Vercel serverless Node.js functions. Each file is an independent HTTP handler. `api/admin.ts` is the main one - it handles every admin action via an `action` query/body param rather than separate routes.

**Path alias:** `@/` maps to `src/`.

## Key Patterns

**Admin API authentication:** Every request to `api/admin.ts` (except `login`, cron actions, and `find-companies`) must include an `x-admin-password` header matching `process.env.ADMIN_PASSWORD`. The `isAuthed()` helper enforces this.

**Client dashboard auth:** No login - clients access `/dashboard/:token` where the token is their unique identifier. `api/dashboard-api.ts` looks up the client by token on every request.

**Admin.tsx is large (~3300 lines).** It is one file containing all tab components as local functions (`ClientsTab`, `LeadsTab`, `OutreachTab`, `ContentTab`, etc.). When editing, grep for the specific tab function name first.

**Adding a new admin action:** Add an `if (req.method === "..." && action === "your-action")` block in `api/admin.ts` before the final `return res.status(400).json({ error: "Unknown action" })` line. All actions must call `isAuthed(req)` unless intentionally public.

**Supabase is always called server-side** using the service key (`SUPABASE_SERVICE_KEY`). There is no client-side Supabase usage - all DB access goes through the API functions.

**Content generation** (`generate-content` action) uses a hardcoded pool of 32 LinkedIn post templates. It deduplicates against recent DB entries before picking. No AI API is needed for this action.

**Email sending** uses Spacemail SMTP via nodemailer and additionally appends sent emails to the IMAP Sent folder using `imapflow` so the inbox stays in sync.

## Environment Variables

All secrets live in Vercel dashboard (Settings → Environment Variables). See `overview.md` for the full list. Locally, create a `.env` file - Vite exposes only `VITE_`-prefixed vars to the frontend; all others are server-side only.
