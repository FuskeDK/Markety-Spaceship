import { NextRequest, NextResponse } from "next/server";

const LOCALE_RE = /^\/(da-DK|de-DE|sv-SE|nb-NO|fr-FR|es-ES|nl-NL|it-IT|pt-PT|pl-PL|fi-FI|ru-RU|ja-JP|zh-CN|ko-KR|ar-SA|tr-TR|hi-IN)(\/.*)?$/;

const GT_CODES: Record<string, string> = {
  "da-DK": "da", "de-DE": "de", "sv-SE": "sv", "nb-NO": "no",
  "fr-FR": "fr", "es-ES": "es", "nl-NL": "nl", "it-IT": "it",
  "pt-PT": "pt", "pl-PL": "pl", "fi-FI": "fi", "ru-RU": "ru",
  "ja-JP": "ja", "zh-CN": "zh-CN", "ko-KR": "ko", "ar-SA": "ar",
  "tr-TR": "tr", "hi-IN": "hi",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = LOCALE_RE.exec(pathname);
  if (!match) return NextResponse.next();

  const locale = match[1];
  const rest = match[2] ?? "/";
  const gtCode = GT_CODES[locale];

  // Rewrite internally — URL in browser stays /da-DK/... but page content
  // is served from the base path. The googtrans cookie triggers the
  // Google Translate widget to auto-translate the page on load.
  const rewritten = req.nextUrl.clone();
  rewritten.pathname = rest || "/";

  const res = NextResponse.rewrite(rewritten);
  res.cookies.set("googtrans", `/en/${gtCode}`, { path: "/" });
  res.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 365 * 24 * 3600 });
  return res;
}

export const config = {
  matcher: [
    "/(da-DK|de-DE|sv-SE|nb-NO|fr-FR|es-ES|nl-NL|it-IT|pt-PT|pl-PL|fi-FI|ru-RU|ja-JP|zh-CN|ko-KR|ar-SA|tr-TR|hi-IN)/:path*",
  ],
};
