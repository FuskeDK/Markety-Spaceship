// Detects the visitor's locale from the browser and converts USD prices to
// their local currency for display on the marketing site. Resolves currency
// first by region tag (e.g. "da-DK" → DKK), then by base language ("da" → DKK),
// defaulting to USD. Provides a `format(usdAmount)` helper that multiplies by
// a hardcoded exchange rate and formats with Intl.NumberFormat.
// Note: rates are hardcoded approximations - update periodically or replace
// with a live FX API if precision becomes important.
// Used by: src/components/HeroSection.tsx and any component showing pricing.
import { useState, useEffect } from "react";

const REGION_TO_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", AU: "AUD", CA: "CAD", NZ: "NZD",
  JP: "JPY", CN: "CNY", KR: "KRW", IN: "INR", SG: "SGD",
  BR: "BRL", MX: "MXN", ZA: "ZAR", RU: "RUB", PL: "PLN",
  CZ: "CZK", HU: "HUF", SE: "SEK", NO: "NOK", DK: "DKK",
  CH: "CHF", IL: "ILS", TR: "TRY", TH: "THB", MY: "MYR",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", PT: "EUR", FI: "EUR", IE: "EUR",
  GR: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR",
  LT: "EUR", LU: "EUR", MT: "EUR", CY: "EUR",
};

const LANG_TO_CURRENCY: Record<string, string> = {
  da: "DKK", sv: "SEK", no: "NOK", nb: "NOK", nn: "NOK",
  ja: "JPY", zh: "CNY", ko: "KRW", ru: "RUB", pl: "PLN",
  tr: "TRY", th: "THB",
  de: "EUR", fr: "EUR", it: "EUR", es: "EUR", nl: "EUR", pt: "EUR",
  en: "USD",
};

const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, AUD: 1.53, CAD: 1.36, NZD: 1.64,
  JPY: 149, CNY: 7.24, KRW: 1330, INR: 83, SGD: 1.34, BRL: 4.97,
  MXN: 17.2, ZAR: 18.7, RUB: 92, PLN: 3.97, CZK: 22.9, HUF: 358,
  SEK: 10.5, NOK: 10.6, DKK: 6.89, CHF: 0.90, ILS: 3.7, TRY: 32.3,
  THB: 35.1, MYR: 4.72,
};

function resolveCurrency(lang: string): string {
  const parts = lang.split("-");
  const region = parts[1]?.toUpperCase();
  const base = parts[0].toLowerCase();
  if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region];
  return LANG_TO_CURRENCY[base] ?? "USD";
}

function getActiveLang(): string {
  if (typeof document !== "undefined" && document.documentElement?.lang) {
    return document.documentElement.lang;
  }

  if (typeof navigator !== "undefined") {
    return navigator.language || (navigator as any).userLanguage || "en-US";
  }

  return "en-US";
}

export function useLocaleCurrency() {
  const [lang, setLang] = useState(getActiveLang);

  useEffect(() => {
    if (typeof window === "undefined" || typeof MutationObserver === "undefined") return;

    const observer = new MutationObserver(() => setLang(getActiveLang()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const currency = resolveCurrency(lang);
  const rate = USD_RATES[currency] ?? 1;

  function format(usdAmount: number): string {
    const amount = usdAmount * rate;

    try {
      return new Intl.NumberFormat(lang, {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
      }).format(amount);
    } catch (error) {
      console.error("Failed to format currency", { error, lang, currency, amount });
      return `${currency} ${amount.toFixed(currency === "JPY" || currency === "KRW" ? 0 : 2)}`;
    }
  }

  return { currency, locale: lang, rate, format };
}
