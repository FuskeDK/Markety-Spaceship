---
name: find-clients
description: Find nye engelske VVS/håndværker-kunder til Markety outreach. Kør find-leads.mjs scriptet i projektmappen.
---

# Find Clients

Når brugeren skriver `/find-clients`, kør følgende:

## Trin 1 — spørg om industri og by (hvis ikke angivet)

Hvis brugeren ikke har angivet industri eller by, spørg:
- "Hvilken branche? (fx plumber, electrician, roofer, builder)"
- "Hvilke byer? (lad være tom for standard London/Manchester/Birmingham/Leeds/Bristol)"

## Trin 2 — opdater queries i find-leads.mjs hvis nødvendigt

Hvis brugeren angiver en anden branche end plumber, opdater `QUERIES`-arrayet i `find-leads.mjs`:
```js
const QUERIES = [
  "[branche] [by1] contact email",
  "[branche] [by2] contact email",
  // osv.
];
```

## Trin 3 — kør scriptet

```bash
cd ~/Desktop/websites/template && node find-leads.mjs
```

## Trin 4 — vis resultat

Vis brugeren en opsummering:
- Hvor mange leads der blev fundet
- Hvor mange har email
- Sig at de skal tjekke `leads.csv` og rette navne/emails inden de sender

## Vigtige filer
- `find-leads.mjs` — scriptet der finder leads via Serper.dev Google Search
- `leads.csv` — output med navn, email, telefon, website, by
- `.env.local` — indeholder SERPER_API_KEY (skal udfyldes hvis tom)

## Hvis SERPER_API_KEY mangler
Sig til brugeren: "Tilføj din Serper API-nøgle i `.env.local` — find den på serper.dev/api-key"
