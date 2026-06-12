"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const DISMISSED_KEY = "markety_lang_banner_dismissed";

type LangEntry = {
  enQuestion: string;
  question: string;
  yes: string;
  no: string;
  locale: string;
};

const LANGS: Record<string, LangEntry> = {
  da: { enQuestion: "Do you want to switch to Danish?",     question: "Vil du skifte sproget til dansk?",          yes: "Ja",    no: "Nej",    locale: "da-DK" },
  de: { enQuestion: "Do you want to switch to German?",     question: "Möchten Sie auf Deutsch wechseln?",         yes: "Ja",    no: "Nein",   locale: "de-DE" },
  sv: { enQuestion: "Do you want to switch to Swedish?",    question: "Vill du byta till svenska?",                yes: "Ja",    no: "Nej",    locale: "sv-SE" },
  nb: { enQuestion: "Do you want to switch to Norwegian?",  question: "Vil du bytte til norsk?",                   yes: "Ja",    no: "Nei",    locale: "nb-NO" },
  no: { enQuestion: "Do you want to switch to Norwegian?",  question: "Vil du bytte til norsk?",                   yes: "Ja",    no: "Nei",    locale: "nb-NO" },
  fr: { enQuestion: "Do you want to switch to French?",     question: "Voulez-vous passer en français ?",          yes: "Oui",   no: "Non",    locale: "fr-FR" },
  es: { enQuestion: "Do you want to switch to Spanish?",    question: "¿Deseas cambiar al español?",               yes: "Sí",    no: "No",     locale: "es-ES" },
  nl: { enQuestion: "Do you want to switch to Dutch?",      question: "Wilt u overschakelen naar het Nederlands?", yes: "Ja",    no: "Nee",    locale: "nl-NL" },
  it: { enQuestion: "Do you want to switch to Italian?",    question: "Vuoi passare all'italiano?",                yes: "Sì",    no: "No",     locale: "it-IT" },
  pt: { enQuestion: "Do you want to switch to Portuguese?", question: "Deseja mudar para português?",              yes: "Sim",   no: "Não",    locale: "pt-PT" },
  pl: { enQuestion: "Do you want to switch to Polish?",     question: "Chcesz przełączyć na polski?",              yes: "Tak",   no: "Nie",    locale: "pl-PL" },
  fi: { enQuestion: "Do you want to switch to Finnish?",    question: "Haluatko vaihtaa suomeksi?",                yes: "Kyllä", no: "Ei",     locale: "fi-FI" },
  ru: { enQuestion: "Do you want to switch to Russian?",    question: "Хотите переключиться на русский?",          yes: "Да",    no: "Нет",    locale: "ru-RU" },
  ja: { enQuestion: "Do you want to switch to Japanese?",   question: "日本語に切り替えますか？",                      yes: "はい",  no: "いいえ", locale: "ja-JP" },
  zh: { enQuestion: "Do you want to switch to Chinese?",    question: "是否切换到中文？",                             yes: "是",    no: "否",     locale: "zh-CN" },
  ko: { enQuestion: "Do you want to switch to Korean?",     question: "한국어로 전환하시겠습니까?",                    yes: "예",    no: "아니요", locale: "ko-KR" },
  ar: { enQuestion: "Do you want to switch to Arabic?",     question: "هل تريد التبديل إلى العربية؟",              yes: "نعم",   no: "لا",     locale: "ar-SA" },
  tr: { enQuestion: "Do you want to switch to Turkish?",    question: "Türkçeye geçmek ister misiniz?",            yes: "Evet",  no: "Hayır",  locale: "tr-TR" },
  hi: { enQuestion: "Do you want to switch to Hindi?",      question: "क्या आप हिंदी में बदलना चाहते हैं?",        yes: "हाँ",   no: "नहीं",   locale: "hi-IN" },
};

// IP country → language code
const COUNTRY_LANG: Record<string, string> = {
  DK: "da", DE: "de", AT: "de", CH: "de", SE: "sv", NO: "no", FR: "fr", BE: "fr",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
  NL: "nl", IT: "it", PT: "pt", BR: "pt", PL: "pl", FI: "fi",
  RU: "ru", UA: "ru", JP: "ja", CN: "zh", TW: "zh", HK: "zh",
  KR: "ko", SA: "ar", AE: "ar", EG: "ar", TR: "tr", IN: "hi",
};

export function LangBanner() {
  const [entry, setEntry] = useState<LangEntry | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const resolve = (code: string) => {
      if (!code || code === "en") return;
      const match = LANGS[code.toLowerCase()];
      if (match) setEntry(match);
    };

    // Try browser language first
    const browserCode = navigator.language.split("-")[0].toLowerCase();
    if (browserCode !== "en" && LANGS[browserCode]) {
      resolve(browserCode);
      return;
    }

    // Fall back to IP geolocation for users with English browsers
    fetch("https://ipapi.co/json/", { cache: "force-cache" })
      .then(r => r.json())
      .then(d => {
        const countryCode = d?.country_code as string | undefined;
        if (countryCode) resolve(COUNTRY_LANG[countryCode] ?? "");
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setEntry(null);
  };

  const switchLang = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    const base = window.location.pathname === "/" ? "" : window.location.pathname;
    router.push(`/${entry!.locale}${base}`);
  };

  if (!entry) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-white border border-gray-200 shadow-xl rounded-2xl px-5 py-3.5 max-w-[94vw] w-max">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm text-gray-500">{entry.enQuestion}</span>
          <span className="text-sm font-semibold text-gray-900">{entry.question}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2 mt-0.5">
          <button
            onClick={switchLang}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
          >
            {entry.yes}
          </button>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-700 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
          >
            {entry.no}
          </button>
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
