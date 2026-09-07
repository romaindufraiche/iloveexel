import Link from "next/link";
import { notFound } from "next/navigation";
import UploadCard from "@/components/UploadCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrivacyBadges from "@/components/PrivacyBadges";
import PrivacySection from "@/components/PrivacySection";
import PositioningSection from "@/components/PositioningSection";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getUseCases } from "@/lib/useCases";
import { LOCALES, isLocale, getDictionary } from "@/lib/i18n";

const STEP_ICONS = [
  <path
    key="upload"
    d="M12 16V4m0 0L7 9m5-5l5 5M20 16.5v2A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5v-2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  <g key="search">
    <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
  </g>,
  <path key="download" d="M12 4v12m0 0l-4-4m4 4l4-4M4 18v1a2 2 0 002 2h12a2 2 0 002-2v-1" strokeLinecap="round" strokeLinejoin="round" />,
];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2}>
        {children}
      </svg>
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const useCases = getUseCases(locale);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: dict.meta.description,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: "GLM", url: "https://glmprime.com" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      <SiteHeader locale={locale} />

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {dict.hero.titleStart} <span className="text-brand-600">{dict.hero.titleAccent}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">{dict.hero.subtitle}</p>

        <div className="mt-10">
          <UploadCard locale={locale} />
          <PrivacyBadges locale={locale} />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">{dict.steps.title}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {dict.steps.items.map((step, i) => (
              <div key={step.title} className="text-center">
                <StepIcon>{STEP_ICONS[i]}</StepIcon>
                <h3 className="text-base font-semibold text-brand-700">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PositioningSection locale={locale} />

      <PrivacySection locale={locale} />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">{dict.useCasesSection.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">{dict.useCasesSection.intro}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/${locale}/analyse/${useCase.slug}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <h3 className="font-semibold text-brand-700">{useCase.h1}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">{useCase.intro}</p>
                <ul className="mt-3 space-y-1">
                  {useCase.detects.slice(0, 3).map((detect) => (
                    <li key={detect.column} className="truncate text-xs text-gray-500">
                      <span className="text-brand-600">•</span> {detect.column}
                    </li>
                  ))}
                </ul>
                <span className="mt-3 text-xs font-semibold text-brand-700 group-hover:underline">{dict.useCasesSection.cardCta}</span>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">{dict.useCasesSection.fallback}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">{dict.faq.title}</h2>
          <div className="mt-8 space-y-6">
            {dict.faq.items.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-800">{item.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
