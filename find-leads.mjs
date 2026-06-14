// Kør: node find-leads.mjs

import fs from "fs";

// Læs .env.local automatisk
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !key.startsWith("#")) {
      process.env[key.trim()] ??= rest.join("=").trim();
    }
  }
}

const SERPER_KEY = process.env.SERPER_KEY || process.env.SERPER_API_KEY;
if (!SERPER_KEY) {
  console.error("Mangler SERPER_API_KEY i .env.local — tilføj den på serper.dev/api-key");
  process.exit(1);
}

const SKIP_DOMAINS = [
  "yelp.com","yell.com","checkatrade.com","bark.com","trustpilot.com",
  "google.com","facebook.com","linkedin.com","wikipedia.org","yellowpages",
  "cylex.co.uk","freeindex.co.uk","hotfrog.co.uk","thomsonlocal.com",
  "rated.people.com","mybuilder.com","tradesman.com","local.com",
  "businessmagnet.co.uk","scoot.co.uk","192.com","bing.com",
];

// Læs allerede-sete domæner fra seen-domains.txt (persistens på tværs af kørsler)
const alreadySeenDomains = new Set(
  fs.existsSync("seen-domains.txt")
    ? fs.readFileSync("seen-domains.txt", "utf8").split("\n").filter(Boolean)
    : []
);

if (alreadySeenDomains.size > 0) {
  console.log(`⏭️  Springer ${alreadySeenDomains.size} kendte domæner over\n`);
}

const QUERIES = [
  "plumber Newcastle UK contact email",
  "plumbing company Cardiff UK contact email",
  "plumber Southampton UK contact email",
  "plumbing services Leicester UK contact email",
  "plumber Coventry UK contact email",
  "plumbing company Belfast UK contact email",
  "plumber Derby UK contact email",
  "plumbing services Reading UK contact email",
  "plumber Brighton UK contact email",
  "plumber Oxford UK contact email",
];

function extractEmail(text) {
  const match = text?.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function extractPhone(text) {
  const match = text?.match(/(?:0|\+44)[0-9\s\-]{9,13}/);
  return match ? match[0].trim() : null;
}

function cleanName(name) {
  return name
    .replace(/\s*[-|–]\s*.*/g, "")
    .replace(/\s*(Ltd|Limited|plc|LLP)\.?$/i, "")
    .trim();
}

function isDirectory(url) {
  return SKIP_DOMAINS.some((d) => url.includes(d));
}

async function searchSerper(query) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": SERPER_KEY,
    },
    body: JSON.stringify({ q: query, gl: "gb", hl: "en", num: 10 }),
  });
  return res.json();
}

async function scrapeEmail(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    clearTimeout(timeout);
    const html = await res.text();
    return extractEmail(html);
  } catch {
    return null;
  }
}

async function main() {
  const leads = [];
  const seen = new Set();

  for (const query of QUERIES) {
    if (leads.length >= 50) break;
    console.log(`Søger: ${query}...`);

    let data;
    try {
      data = await searchSerper(query);
    } catch (e) {
      console.error("Serper fejl:", e.message);
      continue;
    }

    const results = data.organic ?? [];

    for (const r of results) {
      if (leads.length >= 50) break;
      if (!r.link || isDirectory(r.link)) continue;

      const domain = new URL(r.link).hostname.replace("www.", "");
      if (seen.has(domain)) continue;
      if (alreadySeenDomains.has(domain)) continue;
      seen.add(domain);
      fs.appendFileSync("seen-domains.txt", domain + "\n");

      const name = cleanName(r.title ?? domain);
      let email = extractEmail(r.snippet) || extractEmail(r.title);

      if (!email) {
        console.log(`  Tjekker hjemmeside for email: ${domain}`);
        email = await scrapeEmail(r.link);
        if (!email) {
          email = await scrapeEmail(`https://${domain}/contact`);
        }
        if (!email) {
          email = await scrapeEmail(`https://${domain}/contact-us`);
        }
      }

      const phone = extractPhone(r.snippet);

      leads.push({
        name,
        email: email ?? "",
        phone: phone ?? "",
        website: domain,
        city: query.split(" ")[1] ?? "",
      });

      console.log(`  ✓ ${name} | ${email ?? "ingen email"} | ${domain}`);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  // Gem som CSV
  const header = "name,email,phone,website,city";
  const rows = leads.map(
    (l) =>
      `"${l.name}","${l.email}","${l.phone}","${l.website}","${l.city}"`
  );
  const csv = [header, ...rows].join("\n");
  fs.writeFileSync("leads.csv", csv, "utf8");

  // Gem som email-klar liste til afsendelse
  const emailList = leads.map((l) => ({
    ...l,
    subject: `Free website + leads for your plumbing business`,
    body: `Hi ${l.name},\n\nI help plumbers get more clients through Google and Facebook ads.\n\nAs part of the deal, we build you a brand new website and landing page - included for free as long as you're running leads with us.\n\nYou only pay per enquiry you receive (pay-per-lead), so no fixed monthly price and no risk.\n\nThe first 30 days are completely free.\n\nFeel free to reply if this sounds interesting.\n\nBest,\nKare\nMarkety`,
  }));
  fs.writeFileSync("leads-ready.json", JSON.stringify(emailList, null, 2), "utf8");

  console.log(`\n✅ Færdig! ${leads.length} leads fundet.`);
  console.log("📄 leads.csv — ret navne og tjek emails her");
  console.log("📧 leads-ready.json — bruges til afsendelse når du siger go");
}

main();
