---
name: send-email
description: Send outreach emails til alle godkendte leads i leads.csv via Spacemail. Kør send-leads.mjs scriptet. Springer allerede-sendte emails over automatisk via sent-log.txt.
---

# Send Email

Når brugeren skriver `/send-email` eller siger "go" efter at have tjekket leads.csv, kør følgende:

## Trin 1 — tjek leads.csv eksisterer

```bash
ls ~/Desktop/websites/template/leads.csv
```

Hvis den ikke findes: "Kør `/find-clients` først for at finde leads."

## Trin 2 — kør scriptet med det samme

Send uden at spørge om bekræftelse.

```bash
cd ~/Desktop/websites/template && node send-leads.mjs
```

## Trin 4 — vis resultat

Vis brugeren:
- Hvor mange emails der blev sendt
- Eventuelle fejl
- "Tjek Sent-mappen på mail.spacemail.com"

## Vigtige filer
- `send-leads.mjs` — sender emails via Spacemail SMTP + gemmer i IMAP Sent-mappe
- `leads.csv` — listen over modtagere (rediger navne og tjek emails her)
- `sent-log.txt` — holder styr på hvem der allerede har fået en email (aldrig dobbelt-send)
- `.env.local` — indeholder SPACEMAIL_PASSWORD (allerede sat)

## Email-skabelon der bruges
Fra: Markety <info@marketyleadgen.com>
Emne: Free website + leads for your plumbing business

Hi,

I help plumbing companies get more clients through Google and Facebook ads.

As part of the deal, we build you a brand new website and landing page - included for free as long as you're running leads with us.

You only pay per enquiry you receive (pay-per-lead), so no fixed monthly price and no risk.

The first 30 days are completely free.

Feel free to reply if this sounds interesting.

Markety
marketyleadgen.com | info@marketyleadgen.com

## Ny runde
Vil brugeren sende til en ny liste, sig: "Slet `sent-log.txt` og opdater `leads.csv` med nye leads, kør så `/send-email` igen."
