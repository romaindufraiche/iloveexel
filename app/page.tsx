import UploadCard from "@/components/UploadCard";

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
    a: "5 analyses gratuites par jour, sans création de compte. Pour un usage illimité et la personnalisation des graphiques, passez à SheetInsight Premium.",
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="5" y="11" width="14" height="9" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
        <a
          href="#premium"
          className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-200 transition"
        >
          5 analyses gratuites / jour
        </a>
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

      <section id="premium" className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Gratuit pour commencer, Premium pour aller plus loin</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-600">
            Le moteur d&apos;analyse est le même pour tout le monde. Premium débloque le volume et la personnalisation.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-bold text-gray-900">Gratuit</h3>
              <p className="mt-1 text-3xl font-extrabold text-gray-900">
                0€ <span className="text-base font-medium text-gray-500">/ toujours</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckIcon /> 5 analyses par jour
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Export PDF, PowerPoint et image
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Détection automatique des graphiques
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Aucune création de compte
                </li>
              </ul>
            </div>

            <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-sm">
              <span className="absolute -top-3 right-8 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Bientôt disponible
              </span>
              <h3 className="text-lg font-bold text-gray-900">Premium</h3>
              <p className="mt-1 text-3xl font-extrabold text-gray-900">
                <span className="text-base font-medium text-gray-500">Tarif à venir</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckIcon /> Analyses illimitées
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Personnalisez vos graphiques : déplacez, changez de type, ajoutez du texte
                </li>
                <li className="flex items-center gap-2">
                  <LockIcon /> <span className="text-gray-500">Export prioritaire et modèles de rapport</span>
                </li>
              </ul>
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-400"
              >
                Bientôt disponible
              </button>
            </div>
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
        © {new Date().getFullYear()} SheetInsight — L&apos;analyse Excel simplifiée.
      </footer>
    </main>
  );
}
