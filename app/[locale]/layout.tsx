import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { SITE_URL, SITE_NAME, IS_PRODUCTION_DEPLOYMENT } from "@/lib/site";
import { LOCALES, LOCALE_HREFLANG, LOCALE_OG, DEFAULT_LOCALE, isLocale, getDictionary } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HREFLANG[l], `/${l}`]));

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${dict.meta.tagline}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: dict.meta.description,
    applicationName: SITE_NAME,
    keywords: dict.meta.keywords,
    authors: [{ name: "GLM", url: "https://glmprime.com" }],
    creator: "GLM",
    publisher: "GLM",
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": `/${DEFAULT_LOCALE}` },
    },
    openGraph: {
      type: "website",
      locale: LOCALE_OG[locale],
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${dict.meta.tagline}`,
      description: dict.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${dict.meta.tagline}`,
      description: dict.meta.description,
    },
    robots: IS_PRODUCTION_DEPLOYMENT
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
      : { index: false, follow: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased text-gray-800">{children}</body>
    </html>
  );
}
