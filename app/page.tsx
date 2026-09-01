import UploadCard from "@/components/UploadCard";

const STEPS = [
  {
    title: "1. Déposez votre fichier",
    description: "Glissez-déposez votre fichier Excel (.xlsx, .xls, .csv) ou sélectionnez-le depuis votre ordinateur.",
  },
  {
    title: "2. Notre moteur analyse vos données",
    description:
      "Nous détectons automatiquement vos indicateurs clés, vos catégories importantes et vos tendances — sans aucune configuration.",
  },
  {
    title: "3. Téléchargez votre rapport PDF",
    description: "Recevez un rapport clair avec les bons graphiques, une synthèse et des recommandations concrètes.",
  },
];

const FAQ = [
  {
    q: "Ai-je besoin de savoir utiliser Excel ?",
    a: "Non. C'est justement le principe : vous déposez votre fichier, notre moteur comprend vos données et choisit les bonnes analyses à votre place.",
  },
  {
    q: "Quels formats sont acceptés ?",
    a: "Les fichiers .xlsx, .xls, .xlsm et .csv jusqu'à 20 Mo.",
  },
  {
    q: "Mes données sont-elles conservées ?",
    a: "Non. Votre fichier est analysé à la volée pour générer votre rapport PDF, puis n'est pas conservé sur nos serveurs.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">S</div>
          <span className="text-lg font-bold text-gray-800">SheetInsight</span>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Gratuit pendant la bêta</span>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Transformez votre fichier Excel en <span className="text-brand-600">rapport d&apos;analyse</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Pas besoin d&apos;être analyste. Déposez votre fichier, nous détectons ce qui compte et générons votre rapport PDF avec les bons graphiques.
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
                <h3 className="text-base font-semibold text-brand-700">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
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
