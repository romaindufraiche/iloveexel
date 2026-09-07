import type { Dictionary } from "./types";

export const fr: Dictionary = {
  meta: {
    tagline: "Analysez votre fichier Excel en un clic",
    description:
      "Déposez votre fichier Excel ou CSV : SheetInsight détecte automatiquement vos indicateurs clés, choisit les bons graphiques et vous renvoie un rapport prêt à présenter en PDF, PowerPoint ou image. Gratuit, sans inscription.",
    keywords: [
      "analyser fichier Excel",
      "rapport Excel automatique",
      "graphique Excel automatique",
      "analyser CSV en ligne",
      "tableau de bord Excel",
      "rapport PDF depuis Excel",
      "analyse de données sans Excel",
    ],
  },

  header: { login: "Se connecter", language: "Langue" },

  footer: {
    useCasesLabel: "Cas d'usage",
    product: "un produit",
    api: "Accès API",
  },

  hero: {
    titleStart: "Transformez votre fichier Excel en",
    titleAccent: "rapport d'analyse",
    subtitle:
      "Pas besoin d'être analyste. Déposez votre fichier, nous détectons ce qui compte et générons votre rapport avec les bons graphiques — en PDF, PowerPoint ou image.",
  },

  upload: {
    dropTitle: "Glissez-déposez votre fichier Excel ici",
    dropHint: "ou cliquez pour parcourir vos fichiers — .xlsx, .xls, .xlsm, .csv",
    selectFile: "Sélectionner un fichier",
    formats: { pdf: "PDF", pptx: "PowerPoint", png: "Image" },
    formatHints: { pdf: "Rapport complet", pptx: "Slides éditables", png: "À partager" },
    analyzing: "Analyse de",
    analyzingHint: "Notre moteur détecte vos indicateurs clés et construit vos graphiques.",
    readyTitle: "Votre rapport est prêt !",
    readyHint: "Le téléchargement a démarré automatiquement.",
    previewLoading: "Génération de l'aperçu…",
    download: { pdf: "Télécharger le PDF", pptx: "Télécharger le PowerPoint", png: "Télécharger l'image" },
    edit: "Modifier",
    editLoading: "Chargement…",
    another: "Analyser un autre fichier",
    errorTitle: "Oups, une erreur est survenue",
    retry: "Réessayer",
    limitTitle: "Limite gratuite atteinte pour aujourd'hui",
    limitHint: "Vous avez utilisé vos analyses gratuites du jour. Revenez demain, ou connectez-vous pour plus de volume.",
    limitCta: "Voir les offres",
  },

  errors: {
    unsupportedFormat: "Format non supporté. Utilisez un fichier .xlsx, .xls, .xlsm ou .csv.",
    tooLarge: "Le fichier dépasse la taille maximale autorisée (20 Mo).",
    generic: "Une erreur est survenue lors de l'analyse du fichier.",
    network: "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.",
    editorOpen: "Impossible d'ouvrir l'éditeur pour ce fichier.",
    server: "Impossible de contacter le serveur.",
  },

  privacy: {
    badges: ["Fichier jamais stocké", "Supprimé après le rapport", "Aucun compte requis"],
    note: "Votre fichier sert uniquement à calculer vos graphiques, puis il est supprimé. Rien n'est conservé, rien n'est transmis.",
    sectionTitle: "Vos données restent les vôtres",
    sectionIntro:
      "SheetInsight ne fait qu'une chose : mettre en forme vos chiffres pour en sortir des graphiques. Votre fichier est lu le temps du calcul, puis il disparaît. Il n'est stocké nulle part, et son contenu n'est exploité pour rien d'autre que votre propre rapport.",
    weDoTitle: "Ce que nous faisons",
    weDo: [
      "Lire votre fichier en mémoire, le temps de calculer les totaux et de tracer les graphiques",
      "Vous renvoyer le rapport dans le format demandé",
      "Puis oublier le fichier : il n'existe plus une fois le rapport généré",
    ],
    weDontTitle: "Ce que nous ne faisons pas",
    weDont: [
      "Enregistrer votre fichier sur un serveur ou dans une base de données",
      "Conserver son contenu après la génération du rapport",
      "L'utiliser pour entraîner un modèle ou alimenter une quelconque analyse",
      "Le transmettre, le revendre ou le partager avec un tiers",
    ],
    footnote:
      "Concrètement : aucune base de données ne contient vos lignes, et aucun fichier n'est écrit sur disque. Sans compte, il n'y a même rien à quoi rattacher vos données.",
  },

  positioning: {
    eyebrow: "Conçu par des data analystes",
    title: "Pour celles et ceux dont ce n'est pas le métier de faire des graphiques",
    intro:
      "Le métier d'analyste, c'est surtout savoir quoi regarder dans un tableau. Nous avons mis ce savoir-faire dans un outil, pour les professionnels qui ont besoin de s'appuyer sur leurs chiffres pour décider et pour convaincre — sans passer une demi-journée sur des tableaux croisés dynamiques.",
    pillars: [
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
    ],
    businessTitle: "Pensé pour le business…",
    businessBody:
      "Dirigeants, commerçants, indépendants, chefs de projet, associations : tous ceux qui ont des exports à exploiter et pas d'équipe data pour les traiter.",
    studentTitle: "…et utile aux étudiants",
    studentBody:
      "Mémoires, rapports de stage, projets de recherche : des graphiques justes et une lecture correcte des corrélations, avec un tarif étudiant à -50 % sur justificatif.",
  },

  steps: {
    title: "Comment ça marche",
    items: [
      {
        title: "1. Déposez votre fichier",
        description: "Glissez-déposez votre fichier Excel (.xlsx, .xls, .csv) ou sélectionnez-le depuis votre ordinateur.",
      },
      {
        title: "2. Notre moteur analyse vos données",
        description:
          "Nous détectons vos indicateurs clés, choisissons les bons graphiques et interprétons les résultats — sans configuration.",
      },
      {
        title: "3. Téléchargez votre rapport",
        description: "PDF, PowerPoint éditable ou image à partager : recevez un rapport clair avec graphiques et synthèse.",
      },
    ],
  },

  useCasesSection: {
    title: "Quel est votre type de fichier ?",
    intro:
      "Un fichier de ventes, un budget, un inventaire ou un questionnaire ne se lisent pas de la même façon. Le moteur reconnaît la nature de vos colonnes et adapte les indicateurs comme les graphiques. Choisissez le cas qui ressemble au vôtre pour voir précisément ce qu'il en tire.",
    cardCta: "Voir ce que ça donne →",
    fallback:
      "Votre cas n'est pas dans la liste ? Déposez quand même votre fichier : le moteur s'adapte au contenu, pas à un modèle prédéfini.",
  },

  useCasePage: {
    breadcrumbHome: "Accueil",
    detectsTitle: "Ce que le moteur reconnaît dans ce type de fichier",
    outputsTitle: "Ce que vous obtenez",
    faqTitle: "Questions fréquentes",
    othersTitle: "Autres types de fichiers",
  },

  faq: {
    title: "Questions fréquentes",
    items: [
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
    ],
  },

  editor: {
    title: "Édition",
    sheet: "Feuille",
    rows: "lignes",
    download: "Télécharger",
    close: "Fermer l'édition",
    searchLabel: "Pas le bon graphique ? Décrivez ce que vous cherchez",
    searchPlaceholder: 'ex : "le montant par région pour le 1er semestre 2026" (période = Premium)',
    searchButton: "Générer",
    searchLoading: "Recherche…",
    searchEmpty: "Aucun graphique trouvé pour cette demande.",
    searchAdded: "Graphique ajouté.",
    xAxis: "Abscisse (X)",
    yAxis: "Ordonnée (Y)",
    axisAuto: "Choix automatique",
    axisNone: "Aucune (répartition)",
    delete: "Supprimer",
    addNote: "+ Ajouter un bloc de texte",
    notePlaceholder: "Votre texte ici...",
    chartTypes: { bar: "Barres", line: "Courbe", donut: "Camembert" },
  },

  compare: {
    cta: "Comparer à une autre période",
    ctaHint: "Déposez l'export de la période précédente pour voir ce qui a changé.",
    loading: "Comparaison…",
    reportTitle: "Ce qui a changé",
    previousLabel: "Avant :",
    currentLabel: "après :",
    whatChanged: "En résumé",
    totals: "Totaux",
    was: "auparavant",
    close: "Fermer la comparaison",
    download: "Télécharger cette comparaison (PDF)",
    downloading: "Génération…",
  },

  plans: {
    reasons: {
      download: {
        badge: "Compte requis",
        heading: "Le téléchargement de ce rapport personnalisé nécessite un compte",
        description: "Vous pouvez continuer à personnaliser votre rapport gratuitement — pour le télécharger, connectez-vous.",
      },
      account: {
        badge: "Bientôt disponible",
        heading: "Connectez-vous pour aller plus loin",
        description: "Plus de volume et l'accès API, dès que vous en avez besoin.",
      },
      query: {
        badge: "Compte requis",
        heading: "Interroger vos données par période nécessite un compte",
        description:
          'Demander un graphique sur une période précise ("1er semestre 2026", "T3 2024"...) au sein d\'un fichier de plusieurs années est une fonctionnalité Analyste et Expert.',
      },
    },
    list: [
      {
        name: "Étudiant",
        tagline: "Avec une adresse universitaire",
        badge: "-50 %",
        benefits: ["50 générations par jour", "Tous les avantages du plan Analyste", "Sur justificatif de scolarité"],
      },
      {
        name: "Analyste",
        tagline: "Connecté",
        benefits: ["50 générations par jour", "Recherche par période", "Téléchargement des rapports personnalisés"],
        highlighted: true,
      },
      {
        name: "Expert",
        tagline: "Connecté",
        benefits: ["Générations illimitées", "Accès API", "Tous les avantages du plan Analyste"],
      },
    ],
    cta: "Se connecter — bientôt disponible",
    close: "Fermer",
  },
};
