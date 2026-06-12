import { NextRequest, NextResponse } from "next/server";

const LOCALE_RE = /^\/(da-DK|de-DE|sv-SE|nb-NO|fr-FR|es-ES|nl-NL|it-IT|pt-PT|pl-PL|fi-FI|ru-RU|ja-JP|zh-CN|ko-KR|ar-SA|tr-TR|hi-IN)(\/.*)?$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = LOCALE_RE.exec(pathname);
  if (!match) return NextResponse.next();

  const locale = match[1];
  const rest = match[2] ?? "/";

  const rewritten = req.nextUrl.clone();
  rewritten.pathname = rest || "/";

  // Pass locale to server components via request header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  const res = NextResponse.rewrite(rewritten, {
    request: { headers: requestHeaders },
  });
  // Also store in cookie for client components
  res.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 365 * 24 * 3600 });
  return res;
}

export const config = {
  matcher: [
    "/(da-DK|de-DE|sv-SE|nb-NO|fr-FR|es-ES|nl-NL|it-IT|pt-PT|pl-PL|fi-FI|ru-RU|ja-JP|zh-CN|ko-KR|ar-SA|tr-TR|hi-IN)/:path*",
  ],
};
