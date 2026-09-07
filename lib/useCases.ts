// Long-tail landing pages. Each one targets a real search intent ("analyser
// un fichier Excel de ventes") and describes what the engine actually does
// with that kind of file — the content is deliberately specific per page,
// since near-duplicate doorway pages get demoted rather than ranked.

export interface UseCase {
  slug: string;
  navLabel: string;
  h1: string;
  title: string;
  metaDescription: string;
  intro: string;
  detects: { column: string; role: string }[];
  outputs: string[];
  faq: { q: string; a: string }[];
}

export const USE_CASES: UseCase[] = [
  {
    slug: "fichier-de-ventes",
    navLabel: "Fichier de ventes",
    h1: "Analyser un fichier Excel de ventes",
    title: "Analyser un fichier Excel de ventes — rapport automatique | SheetInsight",
    metaDescription:
      "Déposez votre export de ventes (.xlsx ou .csv) : SheetInsight calcule le chiffre d'affaires total, classe vos meilleurs produits et régions, et trace l'évolution dans le temps. Rapport PDF en quelques secondes, sans inscription.",
    intro:
      "Un export de ventes contient presque toujours les mêmes ingrédients : une date, un montant, un produit et une zone géographique ou un commercial. SheetInsight les reconnaît tout seul et en tire le rapport que vous auriez construit à la main : le total sur la période, qui tire le chiffre d'affaires vers le haut, et comment la courbe évolue mois après mois.",
    detects: [
      { column: "Montant, CA, Prix, Total", role: "l'indicateur principal, dont on calcule le total et la moyenne" },
      { column: "Date, Date de commande", role: "l'axe temporel, agrégé par mois pour la courbe d'évolution" },
      { column: "Produit, Référence, Catégorie", role: "le classement des meilleures ventes" },
      { column: "Région, Client, Commercial", role: "la répartition du chiffre d'affaires" },
    ],
    outputs: [
      "Le chiffre d'affaires total et le nombre de lignes analysées, affichés directement en haut du rapport",
      "Une courbe d'évolution mensuelle, avec la tendance sur la période et le repérage du pic et du creux",
      "Un classement des produits ou régions, avec la part de chacun dans le total",
      "Une analyse de concentration : combien de produits font réellement l'essentiel du chiffre d'affaires",
    ],
    faq: [
      {
        q: "Mon fichier contient plusieurs années de ventes, est-ce un problème ?",
        a: "Non. La courbe est agrégée par mois, donc elle reste lisible même sur plusieurs années. Vous pouvez aussi demander un graphique sur une période précise (par exemple le 1er semestre 2026) depuis la barre de recherche de l'éditeur.",
      },
      {
        q: "Et si mes colonnes n'ont pas des noms standards ?",
        a: "Le moteur ne se fie pas uniquement aux noms : il analyse le contenu réel de chaque colonne pour deviner son type. Il sait aussi retrouver la ligne d'en-tête quand le fichier commence par un titre ou des lignes vides, et il exclut automatiquement les lignes de total.",
      },
    ],
  },
  {
    slug: "chiffre-affaires-mensuel",
    navLabel: "CA mensuel",
    h1: "Créer un rapport de chiffre d'affaires mensuel depuis Excel",
    title: "Rapport de chiffre d'affaires mensuel depuis Excel — automatique | SheetInsight",
    metaDescription:
      "Transformez votre tableau Excel en rapport de CA mensuel : total de la période, courbe d'évolution, tendance et comparaison entre mois. Export PDF ou PowerPoint prêt à présenter.",
    intro:
      "Le reporting mensuel est la tâche Excel la plus répétitive qui soit : les mêmes tableaux croisés dynamiques, les mêmes graphiques, tous les mois. SheetInsight lit votre fichier et reconstruit ce rapport automatiquement, avec l'interprétation écrite en français — pas seulement les courbes.",
    detects: [
      { column: "Date, Mois, Période", role: "le regroupement mensuel du rapport" },
      { column: "CA, Montant HT, Facturation", role: "l'indicateur suivi mois par mois" },
      { column: "Entité, Agence, Canal", role: "la comparaison entre segments sur la période" },
    ],
    outputs: [
      "Le total de la période affiché en évidence, sans avoir à lire un tableau",
      "La courbe mensuelle avec le pourcentage d'évolution entre le début et la fin de la période",
      "Une phrase d'interprétation en français : tendance à la hausse, stable ou en baisse, avec les mois remarquables",
      "Un export PowerPoint avec des graphiques natifs, modifiables dans vos propres slides",
    ],
    faq: [
      {
        q: "Puis-je reprendre le rapport dans ma présentation d'entreprise ?",
        a: "Oui. L'export PowerPoint contient de vrais graphiques PowerPoint (pas des images) : vous pouvez changer les couleurs, retoucher les libellés et les coller dans votre modèle de slides habituel.",
      },
      {
        q: "Les chiffres sont-ils recalculés ou repris tels quels ?",
        a: "Ils sont recalculés à partir de vos lignes brutes. Les lignes de total déjà présentes dans le fichier sont détectées et exclues pour ne pas compter deux fois le même montant.",
      },
    ],
  },
  {
    slug: "budget",
    navLabel: "Budget",
    h1: "Analyser un budget ou un suivi de dépenses Excel",
    title: "Analyser un budget Excel — répartition et postes de dépense | SheetInsight",
    metaDescription:
      "Déposez votre suivi de budget Excel : SheetInsight calcule le total dépensé, classe les postes par poids et montre la répartition. Rapport clair en PDF, gratuit et sans compte.",
    intro:
      "Un fichier de budget répond toujours à deux questions : combien a-t-on dépensé au total, et où part l'argent. SheetInsight y répond directement, en identifiant vos postes de dépense et en montrant lesquels pèsent réellement — au lieu de vous laisser lire une colonne de 300 lignes.",
    detects: [
      { column: "Montant, Dépense, Coût, Budget", role: "le montant agrégé et réparti" },
      { column: "Poste, Catégorie, Nature", role: "la répartition des dépenses" },
      { column: "Service, Projet, Département", role: "la comparaison entre équipes ou projets" },
      { column: "Date", role: "l'évolution des dépenses dans le temps" },
    ],
    outputs: [
      "Le total dépensé et le nombre de postes, affichés dès le haut du rapport",
      "Un camembert ou un diagramme en barres de la répartition par poste, selon ce qui est le plus lisible",
      "L'identification des postes qui concentrent l'essentiel du budget",
      "Le repérage des montants atypiques, qui méritent une vérification",
    ],
    faq: [
      {
        q: "Mes montants sont écrits avec des symboles € et des espaces, est-ce gênant ?",
        a: "Non. Le moteur nettoie les symboles monétaires, les séparateurs de milliers et les virgules décimales. Il comprend aussi les montants négatifs écrits entre parenthèses, comme en comptabilité.",
      },
      {
        q: "Mon fichier a plusieurs onglets, lequel est analysé ?",
        a: "Celui qui contient le plus de données exploitables. Les onglets de garde, de notice ou de paramètres sont ignorés automatiquement.",
      },
    ],
  },
  {
    slug: "fichier-csv",
    navLabel: "Fichier CSV",
    h1: "Analyser un fichier CSV en ligne, sans logiciel",
    title: "Analyser un fichier CSV en ligne — graphiques automatiques | SheetInsight",
    metaDescription:
      "Ouvrez et analysez un fichier CSV directement dans votre navigateur : détection des colonnes, graphiques adaptés et rapport téléchargeable. Sans installation, sans inscription.",
    intro:
      "Les exports CSV de vos outils (CRM, boutique en ligne, logiciel de caisse, base de données) sont illisibles tels quels. Plutôt que de les ouvrir dans Excel et de tout reconstruire, déposez-les ici : le fichier est analysé à la volée et vous récupérez un rapport lisible, sans rien installer.",
    detects: [
      { column: "Colonnes numériques", role: "les indicateurs à totaliser et à distribuer" },
      { column: "Colonnes de dates", role: "les évolutions dans le temps, y compris les dates au format texte" },
      { column: "Colonnes de texte répétitives", role: "les catégories utilisées pour les classements" },
      { column: "Identifiants et références", role: "détectés puis exclus, car les additionner n'a aucun sens" },
    ],
    outputs: [
      "Une lecture immédiate du contenu : nombre de lignes, colonnes reconnues et indicateurs clés",
      "Le graphique le plus adapté à chaque question, choisi automatiquement",
      "Un tableau de classement quand les valeurs sont trop nombreuses pour un graphique lisible",
      "Un export en PDF, PowerPoint ou image",
    ],
    faq: [
      {
        q: "Mon fichier est-il envoyé quelque part ou conservé ?",
        a: "Votre fichier est analysé à la volée pour produire le rapport, puis il n'est pas conservé sur nos serveurs. Aucune donnée n'est stockée après la génération.",
      },
      {
        q: "Quelle taille de fichier est acceptée ?",
        a: "Jusqu'à 20 Mo, aux formats .csv, .xlsx, .xls et .xlsm.",
      },
    ],
  },
  {
    slug: "graphiques-automatiques",
    navLabel: "Graphiques auto",
    h1: "Créer automatiquement les bons graphiques à partir d'un fichier Excel",
    title: "Créer des graphiques Excel automatiquement — le bon type à chaque fois | SheetInsight",
    metaDescription:
      "Ne choisissez plus votre type de graphique : SheetInsight décide entre courbe, barres, camembert, nuage de points, matrice ou tableau selon la nature de vos données, et écrit l'interprétation.",
    intro:
      "Choisir le bon graphique est le vrai savoir-faire d'un analyste : une courbe pour le temps, des barres pour comparer, un camembert seulement quand les parts ont un sens. SheetInsight applique ces règles à votre place, puis écrit ce que le graphique raconte.",
    detects: [
      { column: "Date + indicateur", role: "une courbe d'évolution, avec la tendance calculée" },
      { column: "Catégorie + indicateur", role: "un diagramme en barres classé, regroupé en « Autres » au-delà de 8 valeurs" },
      { column: "Catégorie seule", role: "un camembert de répartition" },
      { column: "Deux indicateurs corrélés", role: "un nuage de points avec la droite de tendance" },
      { column: "Trois indicateurs ou plus", role: "une matrice de corrélation" },
      { column: "Beaucoup de valeurs distinctes", role: "un tableau classé, plus lisible qu'un graphique surchargé" },
    ],
    outputs: [
      "Le type de graphique choisi en fonction de la question posée par les données, pas d'un réglage par défaut",
      "Une interprétation écrite sous chaque graphique : tendance, leader, concentration, corrélation",
      "La possibilité de changer le type, les couleurs et les textes ensuite, gratuitement",
      "Une barre de recherche pour demander un graphique précis, en français",
    ],
    faq: [
      {
        q: "Puis-je changer le graphique proposé si je préfère un autre type ?",
        a: "Oui. Après la génération, le bouton « Modifier » ouvre l'éditeur : vous pouvez passer d'un diagramme en barres à un camembert ou une courbe, changer la palette de couleurs, réécrire les titres et ajouter du texte. C'est gratuit.",
      },
      {
        q: "Et si le graphique généré n'est pas celui que j'attendais ?",
        a: "La barre de recherche de l'éditeur permet de le demander en français, par exemple « le montant total par région ». Le moteur retrouve les colonnes correspondantes dans votre fichier et trace le graphique demandé.",
      },
    ],
  },
  {
    slug: "donnees-rh",
    navLabel: "Données RH",
    h1: "Analyser un fichier RH Excel : effectifs, absences, recrutement",
    title: "Analyser un fichier RH Excel — effectifs et absences | SheetInsight",
    metaDescription:
      "Déposez votre tableau RH Excel : répartition des effectifs par service, suivi des absences, analyse des recrutements. Rapport clair en PDF, sans inscription.",
    intro:
      "Les fichiers RH sont rarement numériques : beaucoup de colonnes de texte (service, contrat, statut) et peu de montants. SheetInsight sait traiter ce cas — quand il n'y a rien à additionner, il bascule sur des analyses de répartition et de croisement plutôt que d'afficher des totaux qui n'auraient aucun sens.",
    detects: [
      { column: "Service, Département, Équipe", role: "la répartition des effectifs" },
      { column: "Type de contrat, Statut", role: "la composition des effectifs" },
      { column: "Jours d'absence, Ancienneté, Âge", role: "les indicateurs à distribuer et à moyenner" },
      { column: "Date d'entrée, Date de sortie", role: "l'évolution des arrivées et des départs" },
    ],
    outputs: [
      "La répartition des effectifs par service et par type de contrat",
      "Un croisement de deux critères (par exemple service × type de contrat) sous forme de matrice",
      "La distribution des valeurs numériques quand il y en a : ancienneté, absences",
      "Un rapport présentable, sans avoir à construire de tableau croisé dynamique",
    ],
    faq: [
      {
        q: "Mon fichier ne contient que du texte, sans chiffres. Ça fonctionne ?",
        a: "Oui. En l'absence de colonne numérique exploitable, le rapport se concentre sur les répartitions et les croisements de catégories, qui sont les analyses pertinentes pour ce type de fichier.",
      },
      {
        q: "Les données personnelles sont-elles protégées ?",
        a: "Le fichier est analysé le temps de générer le rapport puis n'est pas conservé sur nos serveurs. Rien n'est stocké et rien n'est réutilisé.",
      },
    ],
  },
];

export function findUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((useCase) => useCase.slug === slug);
}
