# Markety - Full Codebase Overview

## What is this?

Markety is a **pay-per-lead agency** for local businesses. The codebase contains two systems that live in the same GitHub repository:

| System | Location | Tech | Purpose |
|---|---|---|---|
| **Public website** | `/` (repo root) | Next.js 15 + Tailwind | Marketing site, contact forms, legal pages |
| **Admin + Dashboard** | `/admin/` | Vite + React SPA + Vercel Functions | Internal admin panel, client dashboard, outreach tool |

Both are deployed to Vercel. Domain: `marketyleadgen.com`.

---

## System 1 - Public Website (Next.js, repo root)

### Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Forms | react-hook-form + zod + next-safe-action |
| Content | MDX (via @next/mdx) |
| Email | Nodemailer via Spacemail SMTP |
| Database | Supabase (server-side only, service key) |
| Rate limiting | Upstash Redis + @upstash/ratelimit |
| CRM | HubSpot (contact sync) |
| Analytics | Vercel Analytics |

### Directory structure

```
/                               # Repo root = Next.js project
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: fonts, ThemeProvider, StyleGlideProvider
│   │   ├── not-found.tsx       # Global 404 page
│   │   │
│   │   ├── (site)/             # Route group for the public marketing site
│   │   │   ├── layout.tsx      # Site layout: Navbar + Footer + bottom glow
│   │   │   ├── page.tsx        # Home page (/)
│   │   │   ├── about/page.tsx  # About page (/about)
│   │   │   ├── contact/page.tsx# Contact page (/contact)
│   │   │   ├── faq/page.tsx    # FAQ page (/faq)
│   │   │   ├── pricing/page.tsx# Pricing page (/pricing)
│   │   │   ├── login/page.tsx  # Login stub (/login)
│   │   │   ├── signup/page.tsx # Signup stub (/signup)
│   │   │   ├── privacy/        # Privacy policy (/privacy)
│   │   │   │   ├── page.tsx
│   │   │   │   └── privacy.mdx # Full GDPR-compliant Markety privacy policy
│   │   │   └── terms/          # Terms & Conditions (/terms)
│   │   │       ├── page.tsx
│   │   │       └── terms.mdx   # Full T&C content
│   │   │
│   │   ├── admin/page.tsx      # Internal admin UI served at /admin
│   │   │
│   │   ├── dashboard/
│   │   │   └── [token]/page.tsx# Client dashboard (/dashboard/:token)
│   │   │
│   │   └── api/                # Next.js Route Handlers (serverless)
│   │       ├── admin/route.ts  # Main admin API - all internal actions
│   │       ├── admin-contact/route.ts  # Public contact form handler
│   │       ├── add-lead/route.ts       # Adds a lead for a client
│   │       ├── check-submission/route.ts # Deduplication check
│   │       ├── company-info/route.ts   # Client onboarding form
│   │       ├── dashboard-api/route.ts  # Client dashboard data
│   │       ├── emails/route.ts         # Email utility actions
│   │       ├── nordic-contact/route.ts # Nordic Solfilm project contact
│   │       ├── nordic-messages/route.ts# Nordic Solfilm messages
│   │       ├── queue-dm/route.ts       # LinkedIn DM queue
│   │       └── stats/route.ts          # Public stats endpoint
│   │
│   ├── actions/
│   │   ├── safe-action.ts      # next-safe-action client setup
│   │   └── server-action.ts    # Contact form server action (saves to Supabase + sends email)
│   │
│   ├── components/
│   │   ├── background.tsx      # Purple gradient background wrapper (variant: top/bottom)
│   │   ├── dashed-line.tsx     # Decorative repeating-gradient horizontal divider
│   │   ├── lang-banner.tsx     # (Unused - language banner was removed)
│   │   ├── styleglide-provider.tsx  # StyleGlide font provider
│   │   ├── theme-provider.tsx  # next-themes dark/light mode provider
│   │   ├── theme-toggle.tsx    # Dark/light toggle button
│   │   │
│   │   ├── blocks/             # Page section components
│   │   │   ├── about-hero.tsx  # About page hero section
│   │   │   ├── about.tsx       # Full about page content (images, how-we-work, values)
│   │   │   ├── contact-form.tsx# Contact form with react-hook-form + zod
│   │   │   ├── contact.tsx     # Contact page layout (2-column: info + form)
│   │   │   ├── faq.tsx         # FAQ section with accordion
│   │   │   ├── features.tsx    # "Everything your campaign needs" section
│   │   │   ├── footer.tsx      # Site footer (columns + CTA card + legal links)
│   │   │   ├── hero.tsx        # Homepage hero (left-aligned headline + feature items)
│   │   │   ├── investors.tsx   # Investors/partners section
│   │   │   ├── logos.tsx       # Logo marquee strip
│   │   │   ├── navbar.tsx      # Top navigation bar
│   │   │   ├── pricing-table.tsx # Pricing comparison table
│   │   │   ├── pricing.tsx     # Pricing section
│   │   │   ├── resource-allocation.tsx # "How it works" process steps with images
│   │   │   ├── stats-hero.tsx  # Stats banner (leads delivered, companies served, etc.)
│   │   │   └── testimonials.tsx# Client quotes grid
│   │   │
│   │   └── ui/                 # shadcn/ui primitives
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── select.tsx
│   │       ├── switch.tsx
│   │       └── textarea.tsx
│   │
│   ├── i18n/
│   │   └── site-translations.ts  # All UI strings (EN, DA, DE, SV, NO) - EN is canonical
│   │
│   ├── lib/
│   │   ├── form-schema.ts      # Zod schema for the contact form
│   │   ├── get-locale.ts       # Returns the "en" locale always (locale system removed)
│   │   ├── translations.ts     # Dashboard i18n strings (EN + DA)
│   │   ├── utils.ts            # cn() Tailwind class merge helper
│   │   └── server/             # Server-only helpers (never imported by client components)
│   │       ├── _airtable.ts    # Airtable API helper
│   │       ├── _clickup.ts     # ClickUp task creation helper
│   │       ├── _google.ts      # Google API helper
│   │       ├── _hubspot.ts     # HubSpot CRM contact upsert
│   │       ├── _mailer.ts      # Nodemailer SMTP transporter (Spacemail)
│   │       └── _ratelimit.ts   # Upstash Redis rate limiters
│   │
│   ├── middleware.ts           # Next.js middleware (no-op - locale routing removed)
│   └── styles/
│       └── globals.css         # Tailwind imports, CSS variables, dark mode, base resets
│
├── public/                     # Static files at root
│   ├── hero.webp               # Hero section image
│   ├── about/1-4.webp          # About page images
│   ├── features/               # Feature section SVG cards
│   ├── resource-allocation/    # How-it-works step images
│   ├── testimonials/           # Testimonial portrait photos
│   └── MarketySquare.png       # Logo (used in emails and favicon)
│
├── next.config.ts              # Security headers, MDX config
├── tsconfig.json               # TypeScript config
├── components.json             # shadcn/ui config
└── package.json                # Dependencies
```

### Pages & routes

| URL | File | Notes |
|---|---|---|
| `/` | `src/app/(site)/page.tsx` | Main marketing homepage |
| `/about` | `src/app/(site)/about/page.tsx` | About page |
| `/contact` | `src/app/(site)/contact/page.tsx` | Contact form page |
| `/faq` | `src/app/(site)/faq/page.tsx` | FAQ + Testimonials |
| `/pricing` | `src/app/(site)/pricing/page.tsx` | Pricing page |
| `/privacy` | `src/app/(site)/privacy/page.tsx` | MDX privacy policy |
| `/terms` | `src/app/(site)/terms/page.tsx` | MDX terms & conditions |
| `/admin` | `src/app/admin/page.tsx` | Internal admin panel UI |
| `/dashboard/:token` | `src/app/dashboard/[token]/page.tsx` | Client dashboard |

### API routes (`src/app/api/`)

All are Next.js Route Handlers. Public endpoints have their own rate limiting.

| Route | Auth | What it does |
|---|---|---|
| `POST /api/admin-contact` | None | Contact form: saves to Supabase, sends confirmation email to prospect, notifies admin, syncs to HubSpot. Rate limited: 5 per 10 min |
| `GET/POST /api/admin?action=*` | `x-admin-password` header | All internal admin operations (see full list below) |
| `POST /api/add-lead` | Client token | Adds a lead record for a client (called from landing pages / Zapier) |
| `GET /api/check-submission` | None | Checks if email already submitted a contact form |
| `POST /api/company-info` | None | Handles new-client onboarding form |
| `GET/POST /api/dashboard-api` | Client token in body | Serves client dashboard data |
| `GET /api/stats` | None | Public stats (total leads, companies). Rate limited: 30 per min |
| `POST /api/queue-dm` | Admin password | Queues a LinkedIn DM |

### Admin API actions (`/api/admin?action=`)

**Cron jobs** (authenticated via `CRON_SECRET` Bearer token, called by Vercel scheduler):

| Action | When | What it does |
|---|---|---|
| `cron-invoice` | 1st of month 07:00 | Auto-generates and emails invoices for all active clients with leads this month |
| `cron-cleanup` | 1st of month 03:00 | Deletes rejected content older than 30 days; deletes replied contacts older than 6 months |
| `cron-followup` | Daily 09:00 | Emails client a reminder if a lead is 20-48h old and still in "new" status |

**Client management** (all POST, require admin password):

| Action | What it does |
|---|---|
| `GET clients` | List all clients with their leads and this-month stats |
| `POST add-client` | Create client, send welcome email, create ClickUp onboarding task |
| `POST update-client` | Edit client fields (name, email, price, currency, lead cap, etc.) |
| `POST delete-client` | Delete client + all their leads and invoices |
| `POST reactivate-client` | Un-pause a cap-paused client |
| `POST remove-cap` | Remove lead cap from client |
| `POST reset-client-password` | Reset client dashboard password (clears `claimed` + `password_hash`) |

**Leads:**

| Action | What it does |
|---|---|
| `POST delete-lead` | Delete a lead record |
| `POST update-lead` | Update lead status or notes |
| `POST update-onboarding-steps` | Update client onboarding checklist |
| `POST update-deal-value` | Set deal value on client |

**Billing:**

| Action | What it does |
|---|---|
| `GET stats` | Monthly earnings, leads this month/year, client count, monthly chart data |
| `POST send-invoice` | Creates Stripe checkout session + emails invoice to client |
| `POST generate-payment-link` | Generate a Stripe link for current month |
| `POST toggle-invoice-paid` | Mark invoice paid/unpaid |
| `POST invoice` | Mark client as invoiced (sets `last_invoiced_at`) |

**Contacts & outreach:**

| Action | What it does |
|---|---|
| `GET list-contacts` | List contact form submissions |
| `POST reply-contact` | Email a reply to a prospect + mark as replied in DB |
| `POST delete-contact` | Delete a contact submission |
| `POST update-contact-pipeline` | Move contact through pipeline stages |
| `POST send-outreach` | Send cold outreach email via Spacemail + save to IMAP Sent folder |
| `GET find-companies` | Search Google UK via Nimble API for small English-speaking businesses matching query + city |
| `POST research-company` | Scrape company website via Nimble + generate personalized email via Claude Haiku |

**Content:**

| Action | What it does |
|---|---|
| `GET list-content` | List content approval queue |
| `POST generate-content` | Pick from pool of 32 LinkedIn or 30 X post templates (deduplicates against recent entries) |
| `POST insert-content` | Manually insert a content item |
| `POST update-content-status` | Approve / reject / mark as posted |
| `POST approve-and-post` | Approve + publish via webhook (LinkedIn/X) |

**Login:**

| Action | What it does |
|---|---|
| `POST login` | Validates admin password. Rate limited: 5 attempts per 15 min per IP. Uses `timingSafeEqual` |

### Security measures

- **Rate limiting**: Upstash Redis sliding windows on login (5/15min), contact form (5/10min), stats (30/min)
- **Admin auth**: `x-admin-password` header checked against `ADMIN_PASSWORD` env var using `timingSafeEqual` (timing-safe comparison)
- **Input validation**: All contact form fields validated by Zod schema + explicit length checks (name ≤200, email ≤254, messages ≤5000-10000 chars)
- **Security headers**: Set via `next.config.ts` on all routes: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`
- **HTML escaping**: All user content in email templates is escaped via `escapeHtml()` before insertion into HTML
- **Supabase**: Service key is used server-side only, never exposed to the client
- **IMAP Sent sync**: After sending outreach emails, saves to Spacemail Sent folder via IMAP so the inbox stays in sync

### Key server-side libraries

| File | What it does |
|---|---|
| `src/lib/server/_mailer.ts` | Single shared Nodemailer transporter. Spacemail SMTP port 465 from `info@marketyleadgen.com`. Used by every email-sending API. |
| `src/lib/server/_ratelimit.ts` | Upstash Redis rate limiters: `loginRatelimit`, `submitRatelimit`, `generalRatelimit`, `statsRatelimit` |
| `src/lib/server/_hubspot.ts` | Upserts contacts to HubSpot CRM. Handles 409 duplicate by PATCH-ing existing contact |
| `src/lib/server/_clickup.ts` | Creates onboarding tasks in ClickUp when a new client is added |

### Component architecture

**Layouts:**

`src/app/layout.tsx` → root layout (fonts, ThemeProvider, StyleGlideProvider, body)
`src/app/(site)/layout.tsx` → site layout (Navbar + `<main>` + Footer + bottom glow overlay)

**Background gradient** (`background.tsx`):
- `variant="top"` (default): Purple-to-muted gradient fading downward. Used on hero sections.
- `variant="bottom"`: Content fades from background into primary color. NOT actively used on home page - the site layout handles the bottom glow globally.
- Layout adds an absolute-positioned `bg-linear-to-t from-primary/25 to-transparent` at the bottom, so every page's footer has the purple glow.

**Translations** (`src/i18n/site-translations.ts`):
- The `en` object is the canonical shape (`SiteStrings` type is inferred from it)
- Additional locale objects (`da`, `de`, `sv`, `no`) must match the same shape
- `getT(locale)` returns the matching translation or falls back to `en`
- `getSiteT()` (in `src/lib/get-locale.ts`) always returns English now (locale routing was removed)

**Contact form flow:**
1. User submits `ContactForm` (`contact-form.tsx`)
2. `next-safe-action` calls `serverAction` (`src/actions/server-action.ts`)
3. Server action: saves to Supabase `contact_submissions`, sends confirmation email to prospect, sends admin notification email
4. Admin sees it under the Contacts tab in `/admin`

---

## System 2 - Admin + Dashboard (Vite SPA, `/admin/`)

This is a separate Vite React SPA with its own Vercel deployment config. It contains the operational admin panel and is the primary internal tool.

See `admin/overview.md` for the full detailed breakdown. Summary:

### What it contains

- `admin/src/pages/Admin.tsx` (~3300 lines) — entire admin dashboard (password-protected). Tabs: Dashboard, Clients, Leads, Contacts, Outreach, Content, Billing
- `admin/src/pages/Dashboard.tsx` — client-facing dashboard (token-auth)
- `admin/api/admin.ts` — original Vercel function version of the admin API (older, parallels `src/app/api/admin/route.ts`)
- Public pages: Index.tsx, About.tsx, Contact.tsx, Privacy.tsx, Terms.tsx

### Outreach tab

The Outreach tab in `Admin.tsx` is the cold outreach tool:
1. **Find company**: Hits `GET /api/admin?action=find-companies&q={industry+city}` which searches Google UK via Nimble API, then Claude Haiku extracts company data (name, email, phone, website, city). Only UK/US/AU businesses with 1-3 employees are returned.
2. **Research & personalize**: Hits `POST /api/admin?action=research-company` which scrapes the company homepage via Nimble and generates a personalized email using Claude Haiku.
3. **Send**: Hits `POST /api/admin?action=send-outreach` which sends via Spacemail SMTP and saves to IMAP Sent folder.

Cities used: `ENGLISH_CITIES` — London, Manchester, Birmingham, Leeds, Glasgow, Liverpool, Edinburgh, Bristol, Sheffield, Cardiff, New York, Los Angeles, Chicago, Houston, Dallas, Miami, Sydney, Melbourne, Brisbane.

---

## Database (Supabase)

All tables use Row Level Security disabled (service key bypasses RLS from server side).

### `clients`

One row per Markety client.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Contact person name |
| `company` | text | Company name |
| `email` | text | Contact email |
| `phone` | text | Optional |
| `token` | text | Unique 48-char hex - used in dashboard URL and `add-lead` endpoint |
| `claimed` | boolean | Whether client has set a dashboard password |
| `password_hash` | text | bcrypt hash of client's dashboard password |
| `price_per_lead` | numeric | Default price per lead (overridable per lead) |
| `currency` | text | `USD`, `DKK`, `GBP`, etc. |
| `language` | text | `en` or `da` (determines invoice/email language) |
| `lead_cap` | int | Max leads per month (null = no cap) |
| `cap_paused` | boolean | True when cap was hit and client is paused |
| `deal_value` | numeric | Estimated value of one closed deal (used in ROI calculator) |
| `onboarding_steps` | jsonb | Checklist of onboarding tasks |
| `last_invoiced_at` | timestamptz | When last invoice was sent (prevents double-invoicing) |
| `created_at` | timestamptz | |

### `leads`

One row per lead delivered.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `client_id` | uuid | FK → clients |
| `name` | text | |
| `email` | text | |
| `phone` | text | |
| `message` | text | Lead's message / notes |
| `source` | text | Where the lead came from |
| `price` | numeric | Per-lead price override (falls back to `clients.price_per_lead`) |
| `lead_status` | text | `new`, `contacted`, `qualified`, `closed`, `lost` |
| `lead_notes` | text | Internal admin notes |
| `created_at` | timestamptz | |

### `invoices`

One row per invoice (keyed by client + month).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `client_id` | uuid | FK → clients |
| `month_key` | text | `YYYY-MM` format - unique constraint with `client_id` |
| `month_label` | text | Human label e.g. "June 2026" |
| `leads_count` | int | Number of leads in that month |
| `amount` | numeric | Total amount due |
| `currency` | text | |
| `stripe_link` | text | Stripe checkout URL |
| `sent_at` | timestamptz | When invoice email was sent |
| `paid_at` | timestamptz | When payment confirmed |

### `contact_submissions`

Inbound contact form submissions from the public website.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | text | |
| `email` | text | |
| `company` | text | |
| `goals` | text | Number of employees or business goals |
| `message` | text | |
| `pipeline_status` | text | `new`, `contacted`, `qualified`, `converted`, `rejected` |
| `replied_at` | timestamptz | Set when admin replies |
| `reply_message` | text | The reply that was sent |
| `created_at` | timestamptz | |

### `content_approvals`

LinkedIn/X post queue.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `type` | text | `linkedin_post`, `x_post`, `linkedin_dm`, `email` |
| `content` | text | Post body |
| `status` | text | `pending`, `approved`, `posted`, `rejected` |
| `posted_at` | timestamptz | When published |
| `created_at` | timestamptz | |

---

## Environment Variables

Set in Vercel dashboard. Both systems need these.

| Variable | Used by | What it is |
|---|---|---|
| `SUPABASE_URL` | All API handlers | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | All API handlers | Service role key - bypasses RLS |
| `ADMIN_PASSWORD` | `/api/admin` | Password to access the admin panel |
| `SPACEMAIL_PASSWORD` | `_mailer.ts`, `admin/api/admin.ts` | Spacemail SMTP + IMAP password for `info@marketyleadgen.com` |
| `STRIPE_SECRET_KEY` | `/api/admin` (send-invoice, generate-payment-link) | Stripe API key |
| `CRON_SECRET` | `/api/admin` (cron actions) | Vercel cron authentication token |
| `NIMBLE_API_KEY` | `/api/admin` (find-companies, research-company) | Nimble web scraping API |
| `ANTHROPIC_API_KEY` | `/api/admin` (find-companies, research-company) | Claude API key for Haiku |
| `CLICKUP_ONBOARDING_LIST` | `/api/admin` (add-client) | ClickUp list ID for new client tasks |
| `HUBSPOT_ACCESS_TOKEN` | `_hubspot.ts` | HubSpot CRM private app token |
| `UPSTASH_REDIS_REST_URL` | `_ratelimit.ts` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | `_ratelimit.ts` | Upstash Redis token |
| `LINKEDIN_WEBHOOK_URL` | `/api/admin` (approve-and-post) | Webhook URL for posting LinkedIn content |
| `X_WEBHOOK_URL` | `/api/admin` (approve-and-post) | Webhook URL for posting X content |

---

## Key Flows End to End

### New prospect contacts via website form

```
/contact (ContactForm component)
  → serverAction (src/actions/server-action.ts)
    → Supabase: INSERT contact_submissions
    → Spacemail SMTP: confirmation email to prospect
    → Spacemail SMTP: admin notification to info@marketyleadgen.com
    → HubSpot: upsertContact (via _hubspot.ts)
Admin: sees submission in Contacts tab
  → reply-contact action: email reply via Spacemail, saved to IMAP Sent, updates replied_at in DB
```

### New lead added

```
External source (landing page / Zapier webhook)
  → POST /api/add-lead { token, name, email, phone, message, source }
    → Verifies client token exists in Supabase
    → INSERT leads
    → Spacemail SMTP: "New lead" email to client
Client: sees lead at /dashboard/:token (real-time poll)
Admin: sees lead in Leads tab in /admin
```

### Cold outreach (Outreach tab)

```
Admin selects industry + city (or types custom query)
  → GET /api/admin?action=find-companies&q={industry+city}
    → Nimble API: fetches google.co.uk search results
    → Claude Haiku: extracts first UK/English micro-business as JSON
    → If homepage found but no email: Nimble scrapes /contact page for email regex
    → Returns: { name, email, phone, homepage, city, address, employees, owners }
Admin clicks "Research & personalise"
  → POST /api/admin?action=research-company { homepage, name, city, industry }
    → Nimble API: fetches company homepage content
    → Claude Haiku: reads homepage, writes a personalized email body
Admin edits email + clicks Send
  → POST /api/admin?action=send-outreach { to, subject, body }
    → Spacemail SMTP: sends email
    → IMAP: appendToSent() saves to Sent folder
```

### Monthly billing (automated)

```
Vercel Cron: 1st of month 07:00 UTC
  → GET /api/admin?action=cron-invoice (auth: CRON_SECRET)
    → Supabase: gets all clients not yet invoiced this month
    → For each client with leads this month:
        → Sums lead prices for the month
        → Spacemail SMTP: sends invoice email with Stripe link
        → Supabase: upserts invoices row, updates last_invoiced_at
Admin can also send manually:
  → POST /api/admin?action=send-invoice { clientId }
    → Creates Stripe checkout session
    → Sends email with payment button
Client pays via Stripe (Stripe Checkout session)
  → stripe-webhook: marks invoice paid_at in Supabase
```

### Client dashboard access

```
New client:
  Client opens /dashboard/:token (link from welcome email)
    → dashboard-api: GET ?token= verifies token, returns client data
    → "Claim" flow: client sets a password
    → password_hash saved to Supabase, claimed = true
Returning client:
  Enters password at /dashboard/:token
    → dashboard-api: POST verifies bcrypt hash
    → Session stored in localStorage (token + expiry)
    → Tabs: Overview (leads list + stats), Analytics (charts), Invoices, Campaigns, Account
```

### Lead follow-up reminder (automated)

```
Vercel Cron: daily 09:00 UTC
  → GET /api/admin?action=cron-followup (auth: CRON_SECRET)
    → Supabase: finds leads with status "new" created 20-48h ago
    → For each: emails the client a reminder with the lead's contact info
```

### Content generation

```
Admin clicks "Generate LinkedIn post" in Content tab
  → POST /api/admin?action=generate-content { type: "linkedin_post" }
    → Picks from pool of 32 LinkedIn templates (or 30 X templates)
    → Checks Supabase for recently used content (deduplication by first 60 chars)
    → Inserts selected post with status "pending"
Admin reviews → clicks "Approve & Post"
  → POST /api/admin?action=approve-and-post { id, type, content }
    → POSTs to LINKEDIN_WEBHOOK_URL (Zapier or Make webhook)
    → Updates status to "posted" in Supabase
```

---

## Vercel Cron Schedule

Defined in `next.config.ts` or `admin/vercel.json`:

| Cron expression | Time | Action |
|---|---|---|
| `0 7 1 * *` | 07:00, 1st of month | `cron-invoice` - auto-invoicing |
| `0 9 * * *` | 09:00 daily | `cron-followup` - lead follow-up reminders |
| `0 3 1 * *` | 03:00, 1st of month | `cron-cleanup` - DB cleanup |

---

## External APIs Used

| API | Where used | Auth method | What for |
|---|---|---|---|
| Supabase | All API handlers | Service key (env var) | Database for clients, leads, invoices, contacts, content |
| Spacemail SMTP | `_mailer.ts` | Password (env var) | Sending all outbound email from `info@marketyleadgen.com` |
| Spacemail IMAP | `appendToSent()` | Password (env var) | Saving sent emails to the Sent folder |
| Stripe | `send-invoice`, `stripe-webhook` | Secret key (env var) | Creating payment links, processing payments |
| HubSpot | `_hubspot.ts` | Bearer token (env var) | Syncing contact form submissions to CRM |
| ClickUp | `_clickup.ts` | API key (env var) | Creating onboarding tasks for new clients |
| Nimble API | `find-companies`, `research-company` | Basic auth (key:key base64) | Web scraping Google search results and company pages |
| Anthropic (Claude Haiku) | `find-companies`, `research-company` | API key (env var) | Extracting structured company data and writing personalized emails |
| Upstash Redis | `_ratelimit.ts` | REST token (env var) | Distributed rate limiting across serverless instances |
| LinkedIn / X webhooks | `approve-and-post` | URL secret (env var) | Posting approved content to social media |
