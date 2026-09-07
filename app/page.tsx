import Link from "next/link";
import UploadCard from "@/components/UploadCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrivacyBadges from "@/components/PrivacyBadges";
import PrivacySection from "@/components/PrivacySection";
import PositioningSection from "@/components/PositioningSection";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import { USE_CASES } from "@/lib/useCases";

const STEPS = [
  {
    title: "1. Déposez votre fichier",
    description: "Glissez-déposez votre fichier Excel (.xlsx, .xls, .csv) ou sélectionnez-le depuis votre ordinateur.",
    icon: (
      <path d="M12 16V4m0 0L7 9m5-5l5 5M20 16.5v2A2.5 2.5 0 0117.5 21h-11A2.5 2.5 0 014 18.5v-2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "2. Notre moteur analyse vos données",
    description: "Nous détectons vos indicateurs clés, choisissons les bons graphiques et interprétons les résultats — sans configuration.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "3. Téléchargez votre rapport",
    description: "PDF, PowerPoint éditable ou image à partager : recevez un rapport clair avec graphiques et synthèse.",
    icon: <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18v1a2 2 0 002 2h12a2 2 0 002-2v-1" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

const FAQ = [
  {
    q: "Ai-je besoin de savoir utiliser Excel ?",
    a: "Non. C'est justement le principe : vous déposez votre fichier, notre moteur comprend vos données, choisit les bons graphiques et rédige l'interprétation à votre place.",
  },
  {
    q: "Quels formats sont acceptés en entrée, et en sortie ?",
    a: "En entrée : .xlsx, .xls, .xlsm et .csv jusqu'à 20 Mo. En sortie : PDF, PowerPoint (.pptx, avec des graphiques natifs modifiables) ou une image PNG prête à partager.",
  },
  {
    q: "Combien d'analyses puis-je faire gratuitement ?",
    a: "5 analyses par jour, sans création de compte, avec personnalisation complète des graphiques. Besoin de plus de volume, de la recherche par période ou de l'accès API ? Les forfaits Analyste et Expert les débloquent, avec un tarif Étudiant à -50 % sur justificatif.",
  },
  {
    q: "Mes données sont-elles conservées ?",
    a: "Non, jamais. Votre fichier est lu en mémoire le temps de calculer les graphiques, puis il disparaît : il n'est écrit sur aucun disque, enregistré dans aucune base de données, et son contenu n'est ni réutilisé, ni transmis à un tiers, ni exploité pour entraîner quoi que ce soit. Nous ne faisons que mettre en forme vos chiffres.",
  },
  {
    q: "Qui est derrière l'outil ?",
    a: "SheetInsight est développé par des data analystes, pour les professionnels dont ce n'est pas le métier de construire des graphiques mais qui ont besoin de s'appuyer sur leurs chiffres. C'est un produit GLM.",
  },
];

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2}>
        {children}
      </svg>
    </div>
  );
}

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    inLanguage: "fr",
    publisher: { "@type": "Organization", name: "GLM", url: "https://glmprime.com" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      description: "5 analyses gratuites par jour, sans création de compte.",
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Transformez votre fichier Excel en <span className="text-brand-600">rapport d&apos;analyse</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Pas besoin d&apos;être analyste. Déposez votre fichier, nous détectons ce qui compte et générons votre rapport avec les bons
          graphiques — en PDF, PowerPoint ou image.
        </p>

        <div className="mt-10">
          <UploadCard />
          <PrivacyBadges />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Comment ça marche</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="text-center">
                <StepIcon>{step.icon}</StepIcon>
                <h3 className="text-base font-semibold text-brand-700">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PositioningSection />

      <PrivacySection />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Quel est votre type de fichier ?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Un fichier de ventes, un budget, un inventaire ou un questionnaire ne se lisent pas de la même façon. Le moteur reconnaît la
            nature de vos colonnes et adapte les indicateurs comme les graphiques. Choisissez le cas qui ressemble au vôtre pour voir
            précisément ce qu&apos;il en tire.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <Link
                key={useCase.slug}
                href={`/analyse/${useCase.slug}`}
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
                <span className="mt-3 text-xs font-semibold text-brand-700 group-hover:underline">Voir ce que ça donne →</span>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Votre cas n&apos;est pas dans la liste ? Déposez quand même votre fichier : le moteur s&apos;adapte au contenu, pas à un
            modèle prédéfini.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Questions fréquentes</h2>
          <div className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-800">{item.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
