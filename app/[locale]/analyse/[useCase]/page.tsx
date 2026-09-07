import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UploadCard from "@/components/UploadCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrivacyBadges from "@/components/PrivacyBadges";
import PrivacySection from "@/components/PrivacySection";
import { getUseCases, findUseCase, findUseCaseByKey } from "@/lib/useCases";
import { SITE_URL } from "@/lib/site";
import { LOCALES, LOCALE_HREFLANG, DEFAULT_LOCALE, isLocale, getDictionary } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getUseCases(locale).map((useCase) => ({ locale, useCase: useCase.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; useCase: string }> }): Promise<Metadata> {
  const { locale, useCase: slug } = await params;
  if (!isLocale(locale)) return {};

  const useCase = findUseCase(locale, slug);
  if (!useCase) return {};

  const path = `/${locale}/analyse/${useCase.slug}`;

  // Slugs differ per language, so each translation has to be looked up by key
  // rather than by reusing this page's own path.
  const languages: Record<string, string> = {};
  for (const other of LOCALES) {
    const translated = findUseCaseByKey(other, useCase.key);
    if (translated) languages[LOCALE_HREFLANG[other]] = `/${other}/analyse/${translated.slug}`;
  }
  const defaultTranslation = findUseCaseByKey(DEFAULT_LOCALE, useCase.key);
  if (defaultTranslation) languages["x-default"] = `/${DEFAULT_LOCALE}/analyse/${defaultTranslation.slug}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: useCase.title },
    description: useCase.metaDescription,
    alternates: { canonical: path, languages },
    openGraph: { type: "article", url: `${SITE_URL}${path}`, title: useCase.title, description: useCase.metaDescription },
    twitter: { card: "summary_large_image", title: useCase.title, description: useCase.metaDescription },
  };
}

export default async function UseCasePage({ params }: { params: Promise<{ locale: string; useCase: string }> }) {
  const { locale, useCase: slug } = await params;
  if (!isLocale(locale)) notFound();

  const useCase = findUseCase(locale, slug);
  if (!useCase) notFound();

  const dict = getDictionary(locale);
  const t = dict.useCasePage;
  const otherUseCases = getUseCases(locale).filter((u) => u.slug !== useCase.slug);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: useCase.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.breadcrumbHome, item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: useCase.h1, item: `${SITE_URL}/${locale}/analyse/${useCase.slug}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <SiteHeader locale={locale} />

      <section className="mx-auto max-w-3xl px-6 pt-8 pb-14">
        <nav aria-label={t.breadcrumbHome} className="text-xs text-gray-500">
          <Link href={`/${locale}`} className="hover:text-brand-700 hover:underline">
            {t.breadcrumbHome}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700">{useCase.navLabel}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{useCase.h1}</h1>
        <p className="mt-4 text-lg text-gray-600">{useCase.intro}</p>

        <div className="mt-10">
          <UploadCard locale={locale} />
          <PrivacyBadges locale={locale} />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.detectsTitle}</h2>
          <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {useCase.detects.map((item) => (
              <div key={item.column} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
                <dt className="font-semibold text-brand-700 sm:w-2/5">{item.column}</dt>
                <dd className="text-sm text-gray-600 sm:w-3/5">{item.role}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 text-2xl font-bold text-gray-900">{t.outputsTitle}</h2>
          <ul className="mt-6 space-y-3">
            {useCase.outputs.map((output) => (
              <li key={output} className="flex items-start gap-3 text-gray-700">
                <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 flex-shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {output}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PrivacySection locale={locale} />

      <section className="py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.faqTitle}</h2>
          <div className="mt-6 space-y-4">
            {useCase.faq.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-800">{item.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-bold text-gray-900">{t.othersTitle}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {otherUseCases.map((other) => (
              <Link
                key={other.slug}
                href={`/${locale}/analyse/${other.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
              >
                <p className="font-semibold text-brand-700">{other.h1}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{other.intro}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
