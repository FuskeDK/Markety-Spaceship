"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISSED_KEY = "markety_lang_banner_dismissed";

const LANGS: Record<string, { question: string; yes: string; no: string; gtCode: string }> = {
  da: { question: "Vil du skifte sproget til dansk?",            yes: "Ja",    no: "Nej",    gtCode: "da" },
  de: { question: "Möchten Sie auf Deutsch wechseln?",           yes: "Ja",    no: "Nein",   gtCode: "de" },
  sv: { question: "Vill du byta till svenska?",                  yes: "Ja",    no: "Nej",    gtCode: "sv" },
  nb: { question: "Vil du bytte til norsk?",                     yes: "Ja",    no: "Nei",    gtCode: "no" },
  no: { question: "Vil du bytte til norsk?",                     yes: "Ja",    no: "Nei",    gtCode: "no" },
  fr: { question: "Voulez-vous passer en français ?",            yes: "Oui",   no: "Non",    gtCode: "fr" },
  es: { question: "¿Deseas cambiar al español?",                 yes: "Sí",    no: "No",     gtCode: "es" },
  nl: { question: "Wilt u overschakelen naar het Nederlands?",   yes: "Ja",    no: "Nee",    gtCode: "nl" },
  it: { question: "Vuoi passare all'italiano?",                  yes: "Sì",    no: "No",     gtCode: "it" },
  pt: { question: "Deseja mudar para português?",                yes: "Sim",   no: "Não",    gtCode: "pt" },
  pl: { question: "Chcesz przełączyć na polski?",                yes: "Tak",   no: "Nie",    gtCode: "pl" },
  fi: { question: "Haluatko vaihtaa suomeksi?",                  yes: "Kyllä", no: "Ei",     gtCode: "fi" },
  ru: { question: "Хотите переключиться на русский?",            yes: "Да",    no: "Нет",    gtCode: "ru" },
  ja: { question: "日本語に切り替えますか？",                        yes: "はい",  no: "いいえ", gtCode: "ja" },
  zh: { question: "是否切换到中文？",                               yes: "是",    no: "否",     gtCode: "zh" },
  ko: { question: "한국어로 전환하시겠습니까?",                      yes: "예",    no: "아니요", gtCode: "ko" },
  ar: { question: "هل تريد التبديل إلى العربية؟",               yes: "نعم",   no: "لا",     gtCode: "ar" },
  tr: { question: "Türkçeye geçmek ister misiniz?",              yes: "Evet",  no: "Hayır",  gtCode: "tr" },
  hi: { question: "क्या आप हिंदी में बदलना चाहते हैं?",          yes: "हाँ",   no: "नहीं",   gtCode: "hi" },
};

export function LangBanner() {
  const [entry, setEntry] = useState<(typeof LANGS)[string] | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    const code = navigator.language.split("-")[0].toLowerCase();
    if (code === "en") return;
    const match = LANGS[code];
    if (match) setEntry(match);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setEntry(null);
  };

  const switchLang = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    const target = `https://translate.google.com/translate?sl=en&tl=${entry!.gtCode}&u=${encodeURIComponent(window.location.href)}`;
    window.location.href = target;
  };

  if (!entry) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 text-sm max-w-[92vw] w-max">
      <span className="text-gray-800 font-medium">{entry.question}</span>
      <button
        onClick={switchLang}
        className="ml-1 shrink-0 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1.5 font-semibold transition-colors"
      >
        {entry.yes}
      </button>
      <button
        onClick={dismiss}
        className="shrink-0 text-gray-400 hover:text-gray-700 rounded-lg px-2 py-1.5 font-medium transition-colors"
      >
        {entry.no}
      </button>
      <button onClick={dismiss} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
