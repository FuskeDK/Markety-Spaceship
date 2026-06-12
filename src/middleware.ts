import { NextRequest, NextResponse } from "next/server";

// Supported locale prefixes in the URL (e.g. /da-DK, /de-DE)
const LOCALE_RE = /^\/(da-DK|de-DE|sv-SE|nb-NO|fr-FR|es-ES|nl-NL|it-IT|pt-PT|pl-PL|fi-FI|ru-RU|ja-JP|zh-CN|ko-KR|ar-SA|tr-TR|hi-IN)(\/.*)?$/;

// Map locale → Google Translate lang code
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

  // Redirect to Google Translate proxy which preserves the feel of the site
  const origin = req.nextUrl.origin;
  const targetUrl = `${origin}${rest}`;
  const gtUrl = `https://translate.google.com/translate?sl=en&tl=${gtCode}&u=${encodeURIComponent(targetUrl)}`;

  return NextResponse.redirect(gtUrl, { status: 302 });
}

export const config = {
  matcher: [
    "/(da-DK|de-DE|sv-SE|nb-NO|fr-FR|es-ES|nl-NL|it-IT|pt-PT|pl-PL|fi-FI|ru-RU|ja-JP|zh-CN|ko-KR|ar-SA|tr-TR|hi-IN)/:path*",
  ],
};
