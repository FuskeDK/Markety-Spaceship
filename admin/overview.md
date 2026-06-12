# Markety — Codebase Overview

## What is this?

Markety is a pay-per-lead agency website for local businesses. It has:
- A **public landing site** (marketing pages, contact form)
- A **client dashboard** (clients view their own leads/stats via a token URL)
- An **admin dashboard** (internal tool for managing clients, leads, outreach, content, billing)
- A **serverless API** (Vercel functions handling all backend logic)

Hosted on **Vercel**. Database on **Supabase** (PostgreSQL). Domain: `marketyleadgen.com`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Data fetching | TanStack Query (React Query) |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | Supabase (PostgreSQL) |
| Email | Spacemail SMTP + IMAP (imapflow) |
| Payments | Stripe |
| Task tracking | ClickUp API |
| Web scraping | Nimble API |
| Analytics | Vercel Analytics + Speed Insights |

---

## Directory Structure

```
Markety2/
├── api/                    # Vercel serverless functions (backend)
│   ├── admin.ts            # Main admin API — all internal actions
│   ├── add-lead.ts         # Public endpoint — adds a lead for a client
│   ├── check-submission.ts # Checks if a contact form was already submitted
│   ├── company-info.ts     # Handles company info form submissions
│   ├── contact.ts          # Handles public contact form submissions
│   ├── dashboard-api.ts    # Client dashboard data (leads, stats)
│   ├── emails.ts           # Email utility actions
│   ├── nordic-contact.ts   # Contact handler for Nordic Solfilm project
│   ├── nordic-messages.ts  # Messages handler for Nordic Solfilm project
│   ├── queue-dm.ts         # Queues LinkedIn DMs for sending
│   ├── stats.ts            # Public stats endpoint (leads count etc.)
│   └── stripe-webhook.ts   # Handles Stripe payment webhook events
│
├── src/
│   ├── main.tsx            # App entry point
│   ├── App.tsx             # Router setup, lazy-loaded pages, providers
│   ├── index.css           # Global Tailwind + CSS variables
│   │
│   ├── pages/              # One file per route
│   │   ├── Index.tsx       # Homepage (/)
│   │   ├── About.tsx       # About page (/about)
│   │   ├── Contact.tsx     # Contact form (/contact)
│   │   ├── ContactSent.tsx # Thank-you page after contact (/contact/sent)
│   │   ├── Admin.tsx       # Internal admin dashboard (/admin)
│   │   ├── Dashboard.tsx   # Client dashboard (/dashboard/:token)
│   │   ├── Privacy.tsx     # Privacy policy (/privacy)
│   │   ├── Cookies.tsx     # Cookie policy (/cookies)
│   │   ├── Terms.tsx       # Terms of service (/terms)
│   │   ├── Springling.tsx  # Standalone landing page (/lp/springling)
│   │   ├── CompanyInfoForm.tsx   # Onboarding form for new clients
│   │   ├── CompanyInfoDone.tsx   # Confirmation after onboarding form
│   │   └── NotFound.tsx    # 404 page
│   │
│   ├── components/         # Reusable UI sections used in pages
│   │   ├── Navbar.tsx      # Sticky top navigation bar
│   │   ├── Footer.tsx      # Site footer
│   │   ├── HeroSection.tsx # Homepage hero (headline, CTA buttons)
│   │   ├── HowItWorksSection.tsx  # 4-step process section
│   │   ├── FeaturesSection.tsx    # Feature highlights
│   │   ├── BenefitsSection.tsx    # Benefits list
│   │   ├── StatsSection.tsx       # Live stats (leads count, companies)
│   │   ├── FAQSection.tsx         # Accordion FAQ
│   │   ├── CTASection.tsx         # Call-to-action banner
│   │   ├── ComparisonTable.tsx    # Markety vs agency comparison table
│   │   ├── BeforeAfterSection.tsx # Before/after visual comparison
│   │   ├── CaseStudiesSection.tsx # Client case studies
│   │   ├── DifferentiatorsSection.tsx # What makes Markety different
│   │   ├── ProductSuite.tsx       # Product/service overview
│   │   ├── AboutPreview.tsx       # Short about section on homepage
│   │   ├── BlogSection.tsx        # Blog/articles preview
│   │   ├── LogoMarquee.tsx        # Scrolling partner logos
│   │   ├── CookieBanner.tsx       # GDPR cookie consent banner
│   │   ├── ScrollToTop.tsx        # Scrolls to top on route change
│   │   ├── ErrorBoundary.tsx      # Catches React render errors
│   │   └── ui/                    # shadcn/ui primitives (button, input, etc.)
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useLeadsCount.ts        # Fetches total lead count for stats
│   │   ├── useLeadsThisYear.ts     # Leads generated this year
│   │   ├── useCompaniesCount.ts    # Number of active client companies
│   │   ├── useCompanyNames.ts      # List of company names
│   │   ├── useAvgDaysToFirstLead.ts # Average days to first lead stat
│   │   ├── useClientRetention.ts   # Client retention rate stat
│   │   ├── useTrustpilotStats.ts   # Trustpilot rating data
│   │   ├── useLocaleCurrency.ts    # Detects user locale for currency display
│   │   ├── useTheme.ts             # Light/dark theme toggle
│   │   └── use-mobile.tsx          # Detects mobile viewport
│   │
│   └── lib/                # Utilities and static content
│       ├── utils.ts         # cn() helper for Tailwind class merging
│       ├── translations.ts  # i18n strings (EN/DA)
│       ├── pageContent.tsx  # Static copy/content for landing pages
│       ├── seo.ts           # SEO meta tag helpers
│       └── seoOptimizations.ts  # Runtime SEO tweaks (schema, canonical, etc.)
│
├── public/                 # Static files served at root
│   ├── robots.txt          # Crawler rules
│   ├── sitemap.xml         # XML sitemap for SEO
│   ├── manifest.json       # PWA manifest
│   ├── BingSiteAuth.xml    # Bing domain verification
│   ├── markety-logo.png    # Square logo (favicon, og-image)
│   ├── Markety.png         # Wide logo (used in navbar)
│   └── og-image.png        # Open Graph social preview image
│
├── index.html              # HTML shell — favicon, font loading, meta tags, JSON-LD
├── vercel.json             # Routing rewrites, headers, cron jobs
├── tailwind.config.ts      # Tailwind theme (colors, fonts)
├── vite.config.ts          # Vite build config
└── package.json            # Dependencies
```

---

## Pages & Routes

| URL | File | Who sees it |
|---|---|---|
| `/` | `Index.tsx` | Public — main landing page |
| `/about` | `About.tsx` | Public |
| `/contact` | `Contact.tsx` | Public — contact form |
| `/contact/sent` | `ContactSent.tsx` | Public — after form submit |
| `/admin` | `Admin.tsx` | Internal only — password protected |
| `/dashboard/:token` | `Dashboard.tsx` | Clients — unique token per client |
| `/lp/springling` | `Springling.tsx` | Standalone campaign landing page |
| `/privacy` | `Privacy.tsx` | Public — noindex |
| `/cookies` | `Cookies.tsx` | Public — noindex |
| `/terms` | `Terms.tsx` | Public — noindex |

---

## Admin Dashboard (`/admin`)

Password-protected internal tool. All tabs live inside `src/pages/Admin.tsx`.

| Tab | What it does |
|---|---|
| **Dashboard** | KPI overview: active clients, leads this month, revenue, pipeline |
| **Clients** | List of all clients — add, edit, delete, view leads, manage onboarding |
| **Leads** | All leads across all clients — filter, update status, delete |
| **Contacts** | Inbound contact form submissions — reply by email, delete, pipeline status |
| **Outreach** | Cold outreach tool — find companies via CVR API, research via Nimble, send personalized emails |
| **Content** | LinkedIn post queue — generate posts from templates, approve, post to LinkedIn via Buffer |
| **Billing** | Invoice queue — send invoices, mark paid, send payment reminders |

---

## API — `api/admin.ts`

Single entry point for all admin actions. Authenticated via `x-admin-password` header.

### Cron jobs (run automatically via Vercel scheduler)

| Action | Schedule | What it does |
|---|---|---|
| `cron-invoice` | 1st of month, 07:00 | Auto-generates invoices for active clients |
| `cron-followup` | Daily 09:00 | Sends follow-up emails to overdue leads |
| `cron-cleanup` | 1st of month, 03:00 | Archives old data |

### Client management

| Action | Method | What it does |
|---|---|---|
| `clients` | GET | List all clients |
| `add-client` | POST | Create new client record |
| `update-client` | POST | Edit client fields |
| `delete-client` | POST | Remove client |
| `reactivate-client` | POST | Re-activate a paused client |
| `remove-cap` | POST | Remove lead cap from client |

### Leads

| Action | Method | What it does |
|---|---|---|
| `delete-lead` | POST | Delete a lead record |
| `update-lead` | POST | Update lead status/notes |
| `update-onboarding-steps` | POST | Update client onboarding checklist |
| `update-deal-value` | POST | Set deal value on client |

### Billing

| Action | Method | What it does |
|---|---|---|
| `invoice` | POST | Create invoice record |
| `send-invoice` | POST | Email invoice to client |
| `invoice-queue` | GET | List unpaid invoices |
| `toggle-invoice-paid` | POST | Mark invoice paid/unpaid |
| `generate-payment-link` | POST | Create Stripe payment link |
| `check-reminders` | GET | List overdue invoices needing reminders |
| `send-payment-reminder` | POST | Email payment reminder to client |

### Contacts & outreach

| Action | Method | What it does |
|---|---|---|
| `list-contacts` | GET | List inbound contact form submissions |
| `reply-contact` | POST | Reply to a contact by email |
| `delete-contact` | POST | Delete a contact submission |
| `update-contact-pipeline` | POST | Move contact through pipeline stages |
| `send-outreach` | POST | Send cold outreach email |
| `find-companies` | GET | Search CVR (Danish company registry) for prospects |
| `research-company` | POST | Scrape company homepage via Nimble + write personalized email via Claude Haiku |

### Content

| Action | Method | What it does |
|---|---|---|
| `list-content` | GET | List all content items |
| `generate-content` | POST | Pick a LinkedIn post from template pool (32 templates, deduplicates against recent DB entries) |
| `insert-content` | POST | Manually insert a content item |
| `update-content-status` | POST | Approve / reject / mark as posted |
| `approve-and-post` | POST | Approve + publish via Buffer API |
| `bulk-approve-content` | POST | Approve multiple items at once |
| `delete-content` | POST | Delete a content item |

### Auth & misc

| Action | Method | What it does |
|---|---|---|
| `login` | POST | Validate admin password (rate-limited: 5 attempts per 15 min per IP) |
| `stats` | GET | Returns aggregate stats for admin dashboard |
| `reset-client-password` | POST | Regenerate client dashboard token |

---

## Other API Files

| File | What it does |
|---|---|
| `api/add-lead.ts` | Public endpoint called by landing pages or Zapier to add a lead to a client |
| `api/dashboard-api.ts` | Serves data to the client dashboard — leads list, stats, filtered by token |
| `api/contact.ts` | Handles the public contact form — saves to `contact_submissions`, sends email notification |
| `api/check-submission.ts` | Prevents duplicate contact form submissions (checks by email) |
| `api/stats.ts` | Public stats used in landing page (total leads, companies count) |
| `api/stripe-webhook.ts` | Listens for Stripe events (payment completed) — marks invoice paid |
| `api/company-info.ts` | Handles onboarding form when a new client fills in their company details |
| `api/queue-dm.ts` | Queues a LinkedIn DM for later sending |
| `api/emails.ts` | Shared email utility actions |

---

## Database (Supabase)

Five tables:

### `clients`
Stores every Markety client.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Company name |
| email | text | Contact email |
| dashboard_token | text | Unique token for `/dashboard/:token` URL |
| lead_price | numeric | Price per lead (DKK) |
| lead_cap | int | Max leads per month |
| status | text | `active`, `paused`, `churned` |
| deal_value | numeric | Estimated deal value |
| onboarding_steps | jsonb | Checklist of onboarding tasks |
| created_at | timestamptz | |

### `leads`
One row per lead delivered to a client.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| client_id | uuid | FK → clients |
| name | text | Lead's name |
| email | text | |
| phone | text | |
| message | text | |
| lead_status | text | `new`, `contacted`, `qualified`, `closed`, `lost` |
| lead_notes | text | Internal notes |
| created_at | timestamptz | |

### `invoices`
One row per invoice.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| client_id | uuid | FK → clients |
| amount | numeric | Total DKK |
| paid | boolean | |
| sent_at | timestamptz | When invoice email was sent |
| due_date | timestamptz | |
| stripe_payment_link | text | Stripe-hosted payment URL |

### `contact_submissions`
Inbound contact form submissions from the public website.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| name | text | |
| email | text | |
| company | text | |
| message | text | |
| pipeline_status | text | `new`, `contacted`, `qualified`, `converted`, `rejected` |
| created_at | timestamptz | |

### `content_approvals`
LinkedIn/X posts in the content approval queue.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| type | text | `linkedin_post`, `linkedin_dm`, `x_post`, `email` |
| content | text | Post body text |
| status | text | `pending`, `approved`, `posted`, `rejected` |
| posted_at | timestamptz | When it was published |
| created_at | timestamptz | |

---

## Environment Variables

Set in Vercel dashboard under Settings → Environment Variables.

| Variable | Used by | What it is |
|---|---|---|
| `SUPABASE_URL` | All API files | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | All API files | Supabase service role key (bypasses RLS) |
| `ADMIN_PASSWORD` | `api/admin.ts` | Password to access /admin |
| `SPACEMAIL_PASSWORD` | `api/admin.ts` | Spacemail SMTP/IMAP password for info@marketyleadgen.com |
| `STRIPE_SECRET_KEY` | `api/admin.ts`, `api/stripe-webhook.ts` | Stripe API key |
| `CRON_SECRET` | `api/admin.ts` | Secret to authenticate Vercel cron calls |
| `NIMBLE_API_KEY` | `api/admin.ts` | Nimble web scraping API key |
| `ANTHROPIC_API_KEY` | `api/admin.ts` | Claude API key (used in research-company action) |
| `CLICKUP_ONBOARDING_LIST` | `api/admin.ts` | ClickUp list ID for new client onboarding tasks |

---

## How Key Flows Work

### New contact form submission
1. Visitor fills out `/contact`
2. `Contact.tsx` POSTs to `api/contact.ts`
3. `api/contact.ts` saves to `contact_submissions` table + sends email to info@marketyleadgen.com
4. Admin sees it in the **Contacts** tab in `/admin`
5. Admin can reply directly from the admin dashboard (sends email via Spacemail SMTP, saves to Sent folder via IMAP)

### New lead added
1. External source (landing page, Zapier, webhook) POSTs to `api/add-lead.ts`
2. Lead saved to `leads` table with `client_id`
3. Client sees it on their `/dashboard/:token` page
4. Admin sees it in the **Leads** tab

### Cold outreach flow
1. Admin opens **Outreach** tab in `/admin`
2. Clicks "Find random company" → hits CVR API to find a Danish company
3. Optionally clicks "Research & personalize" → Nimble scrapes the company homepage → Claude Haiku writes a personalized email body
4. Admin edits/approves the email and clicks Send → `send-outreach` action emails via Spacemail SMTP

### Content generation flow
1. Admin clicks LinkedIn button in **Content** tab
2. Calls `generate-content` action → picks from pool of 32 templates, deduplicates against recently used posts
3. Post appears in queue with `pending` status
4. Admin reviews → clicks Approve → `approve-and-post` action publishes via Buffer API
5. If Buffer fails, admin gets manual copy/paste fallback with a direct link to LinkedIn

### Client billing flow
1. Monthly cron (`cron-invoice`) runs on 1st of month → auto-creates invoices for active clients
2. Admin reviews in **Billing** tab → clicks "Send invoice" → emails invoice with Stripe payment link
3. Client pays via Stripe → `stripe-webhook.ts` receives event → marks invoice as paid

### Client dashboard
1. Each client has a unique `dashboard_token` stored in `clients` table
2. URL is `/dashboard/{token}` — no login required, token is the auth
3. `api/dashboard-api.ts` verifies token, returns leads and stats for that client only

---

## Vercel Cron Jobs

Defined in `vercel.json`:

| Cron | Schedule | Action |
|---|---|---|
| Monthly invoice | `0 7 1 * *` (07:00 on 1st) | `cron-invoice` |
| Daily follow-up | `0 9 * * *` (09:00 daily) | `cron-followup` |
| Monthly cleanup | `0 3 1 * *` (03:00 on 1st) | `cron-cleanup` |

---

## SEO Setup

- `index.html` — title, meta description, Open Graph, Twitter Card, JSON-LD schema (WebSite, Organization, FAQPage, HowTo, BreadcrumbList)
- `public/robots.txt` — allows all crawlers except `/admin` and `/dashboard`
- `public/sitemap.xml` — lists all public URLs
- `vercel.json` — `X-Robots-Tag: noindex` headers on `/privacy`, `/cookies`, `/terms`, `/admin`, `/dashboard`
- `src/lib/seoOptimizations.ts` — runtime SEO tweaks applied on each route change
