import UploadCard from "@/components/UploadCard";
import AccountButton from "@/components/AccountButton";

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
    a: "5 analyses gratuites par jour, sans création de compte, avec personnalisation complète des graphiques. Besoin de plus de volume ou de l'accès API ? Connectez-vous pour découvrir nos offres Analyste et Expert.",
  },
  {
    q: "Mes données sont-elles conservées ?",
    a: "Non. Votre fichier est analysé à la volée pour générer votre rapport, puis n'est pas conservé sur nos serveurs.",
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
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">S</div>
          <span className="text-lg font-bold text-gray-800">SheetInsight</span>
        </div>
        <AccountButton variant="icon" />
      </header>

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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Questions fréquentes</h2>
          <div className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="font-semibold text-gray-800">{item.q}</p>
                <p className="mt-1 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} SheetInsight — un produit{" "}
          <a href="https://glmprime.com" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-600 hover:underline">
            GLM
          </a>
          .
        </p>
        <p className="mt-1">
          <a href="https://glmprime.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
            glmprime.com
          </a>{" "}
          · <AccountButton variant="link" />
        </p>
      </footer>
    </main>
  );
}
