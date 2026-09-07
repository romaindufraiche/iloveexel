const WE_DO = [
  "Lire votre fichier en mémoire, le temps de calculer les totaux et de tracer les graphiques",
  "Vous renvoyer le rapport dans le format demandé",
  "Puis oublier le fichier : il n'existe plus une fois le rapport généré",
];

const WE_DONT = [
  "Enregistrer votre fichier sur un serveur ou dans une base de données",
  "Conserver son contenu après la génération du rapport",
  "L'utiliser pour entraîner un modèle ou alimenter une quelconque analyse",
  "Le transmettre, le revendre ou le partager avec un tiers",
];

function Item({ children, positive }: { children: React.ReactNode; positive: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-700">
      <svg
        viewBox="0 0 24 24"
        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${positive ? "text-brand-600" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        {positive ? (
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {children}
    </li>
  );
}

export default function PrivacySection() {
  return (
    <section className="bg-brand-50 py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">Vos données restent les vôtres</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          SheetInsight ne fait qu&apos;une chose : mettre en forme vos chiffres pour en sortir des graphiques. Votre fichier est lu le
          temps du calcul, puis il disparaît. Il n&apos;est stocké nulle part, et son contenu n&apos;est exploité pour rien d&apos;autre
          que votre propre rapport.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-200 bg-white p-6">
            <h3 className="text-base font-bold text-brand-700">Ce que nous faisons</h3>
            <ul className="mt-4 space-y-3">
              {WE_DO.map((item) => (
                <Item key={item} positive>
                  {item}
                </Item>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-bold text-gray-900">Ce que nous ne faisons pas</h3>
            <ul className="mt-4 space-y-3">
              {WE_DONT.map((item) => (
                <Item key={item} positive={false}>
                  {item}
                </Item>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Concrètement : aucune base de données ne contient vos lignes, et aucun fichier n&apos;est écrit sur disque. Sans compte, il
          n&apos;y a même rien à quoi rattacher vos données.
        </p>
      </div>
    </section>
  );
}
