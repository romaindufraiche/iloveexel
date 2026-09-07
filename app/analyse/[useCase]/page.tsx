import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UploadCard from "@/components/UploadCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { USE_CASES, findUseCase } from "@/lib/useCases";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return USE_CASES.map((useCase) => ({ useCase: useCase.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ useCase: string }> }): Promise<Metadata> {
  const { useCase: slug } = await params;
  const useCase = findUseCase(slug);
  if (!useCase) return {};

  const url = `${SITE_URL}/analyse/${useCase.slug}`;
  return {
    title: { absolute: useCase.title },
    description: useCase.metaDescription,
    alternates: { canonical: `/analyse/${useCase.slug}` },
    openGraph: { type: "article", url, title: useCase.title, description: useCase.metaDescription },
    twitter: { card: "summary_large_image", title: useCase.title, description: useCase.metaDescription },
  };
}

export default async function UseCasePage({ params }: { params: Promise<{ useCase: string }> }) {
  const { useCase: slug } = await params;
  const useCase = findUseCase(slug);
  if (!useCase) notFound();

  const otherUseCases = USE_CASES.filter((u) => u.slug !== useCase.slug);

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
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: useCase.h1, item: `${SITE_URL}/analyse/${useCase.slug}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pt-8 pb-14">
        <nav aria-label="Fil d'Ariane" className="text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-700 hover:underline">
            Accueil
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700">{useCase.navLabel}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{useCase.h1}</h1>
        <p className="mt-4 text-lg text-gray-600">{useCase.intro}</p>

        <div className="mt-10">
          <UploadCard />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900">Ce que le moteur reconnaît dans ce type de fichier</h2>
          <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {useCase.detects.map((item) => (
              <div key={item.column} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
                <dt className="font-semibold text-brand-700 sm:w-2/5">{item.column}</dt>
                <dd className="text-sm text-gray-600 sm:w-3/5">{item.role}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 text-2xl font-bold text-gray-900">Ce que vous obtenez</h2>
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

      <section className="py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-gray-900">Questions fréquentes</h2>
          <div className="mt-6 space-y-4">
            {useCase.faq.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-800">{item.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-bold text-gray-900">Autres types de fichiers</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {otherUseCases.map((other) => (
              <Link
                key={other.slug}
                href={`/analyse/${other.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
              >
                <p className="font-semibold text-brand-700">{other.h1}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{other.intro}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
