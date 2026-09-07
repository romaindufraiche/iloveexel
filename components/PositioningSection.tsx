const PILLARS = [
  {
    title: "De la donnée brute à un indicateur",
    body: "Un export de 3 000 lignes devient un total, une part, un classement. Vous n'avez plus une colonne à faire défiler : vous avez un chiffre à annoncer, et le graphique qui le porte.",
  },
  {
    title: "De quoi parler avec vos chiffres",
    body: "Chaque graphique est accompagné de sa lecture en français : la tendance sur la période, qui arrive en tête, sur quoi se concentre l'essentiel. De quoi défendre un point en réunion sans être analyste.",
  },
  {
    title: "L'interprétation reste la vôtre",
    body: "L'outil calcule et propose une lecture, mais c'est vous qui connaissez votre activité. Tout reste modifiable — titres, textes, type de graphique — pour que la conclusion soit la vôtre, pas celle d'une machine.",
  },
];

export default function PositioningSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-brand-700">
          Conçu par des data analystes
        </p>
        <h2 className="mt-3 text-center text-2xl font-bold text-gray-900">
          Pour celles et ceux dont ce n&apos;est pas le métier de faire des graphiques
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Le métier d&apos;analyste, c&apos;est surtout savoir quoi regarder dans un tableau. Nous avons mis ce savoir-faire dans un
          outil, pour les professionnels qui ont besoin de s&apos;appuyer sur leurs chiffres pour décider et pour convaincre — sans
          passer une demi-journée sur des tableaux croisés dynamiques.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-bold text-gray-900">{pillar.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{pillar.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:flex sm:items-center sm:gap-8">
          <div className="sm:flex-1">
            <h3 className="font-bold text-gray-900">Pensé pour le business…</h3>
            <p className="mt-1 text-sm text-gray-600">
              Dirigeants, commerçants, indépendants, chefs de projet, associations : tous ceux qui ont des exports à exploiter et pas
              d&apos;équipe data pour les traiter.
            </p>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6 sm:mt-0 sm:flex-1 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <h3 className="font-bold text-gray-900">…et utile aux étudiants</h3>
            <p className="mt-1 text-sm text-gray-600">
              Mémoires, rapports de stage, projets de recherche : des graphiques justes et une lecture correcte des corrélations, avec
              un tarif étudiant à -50 % sur justificatif.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
