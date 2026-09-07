import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, isLocale, matchLocale } from "@/lib/i18n/config";

const LOCALE_COOKIE = "locale";

// Every page lives under /<locale>. A request without one is sent to the
// visitor's own language: their explicit choice (cookie) wins, otherwise the
// browser's Accept-Language header decides.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale) return NextResponse.next();

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  // 307 rather than a permanent redirect: the target depends on the visitor,
  // so it must never be cached as if it were the one true destination.
  const response = NextResponse.redirect(url, 307);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Skip Next internals, the API, and the SEO files that must stay at the
  // root (/robots.txt, /sitemap.xml, /opengraph-image) plus static assets.
  matcher: ["/((?!_next|api|robots.txt|sitemap.xml|opengraph-image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
