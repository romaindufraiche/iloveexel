import type { Locale } from "./i18n/config";

// The comparison report's prose. Kept beside the engine rather than in the UI
// dictionary because these are sentences the engine composes from computed
// values, not labels the interface displays.
export interface CompareText {
  reportTitle: (previous: string, current: string) => string;
  generatedOn: (date: string) => string;
  summaryTitle: string;
  totalsTitle: string;
  sameRowCount: (rows: string) => string;
  rowCountChanged: (rows: string, delta: string) => string;
  metricStable: (metric: string, value: string) => string;
  metricMoved: (metric: string, direction: string, percent: string, delta: string, before: string, after: string) => string;
  up: string;
  down: string;
  topMover: (category: string, label: string, delta: string, percent: string) => string;
  appearedInCategory: (count: number, category: string, labels: string) => string;
  disappearedInCategory: (count: number, category: string, labels: string) => string;
  newValues: (column: string, labels: string, more: boolean) => string;
  missingValues: (column: string, labels: string, more: boolean) => string;
  columnsAdded: (columns: string) => string;
  columnsRemoved: (columns: string) => string;
  variationTitle: (metric: string, category: string) => string;
  variationSeries: (metric: string) => string;
  leaderExplains: (label: string, delta: string, percent: string) => string;
  leaderAppeared: (label: string, value: string) => string;
  leaderDisappeared: (label: string, value: string) => string;
  beforeAfterTitle: (metric: string, category: string) => string;
  beforeAfterInsight: (count: number) => string;
  tableColumns: { before: string; after: string; delta: string; percent: string };
  markerNew: string;
  markerGone: string;
  noSharedColumns: string;
}

const FR: CompareText = {
  reportTitle: (previous, current) => `Ce qui a changé — de ${previous} à ${current}`,
  generatedOn: (date) => `Comparaison générée le ${date}`,
  summaryTitle: "En résumé",
  totalsTitle: "Totaux",
  sameRowCount: (rows) => `Les deux fichiers comptent ${rows} lignes.`,
  rowCountChanged: (rows, delta) => `Le fichier récent compte ${rows} lignes, soit ${delta} par rapport au précédent.`,
  metricStable: (metric, value) => `${metric} est stable à ${value}.`,
  metricMoved: (metric, direction, percent, delta, before, after) =>
    `${metric} ${direction} de ${percent} (${delta}), passant de ${before} à ${after}.`,
  up: "progresse",
  down: "recule",
  topMover: (category, label, delta, percent) =>
    `Sur ${category}, "${label}" pèse le plus dans l'écart : ${delta} (${percent}).`,
  appearedInCategory: (count, category, labels) =>
    `${count} valeur(s) de ${category} apparaissent dans le fichier récent : ${labels}.`,
  disappearedInCategory: (count, category, labels) => `${count} valeur(s) de ${category} ont disparu : ${labels}.`,
  newValues: (column, labels, more) => `Nouvelles valeurs dans "${column}" : ${labels}${more ? "…" : ""}.`,
  missingValues: (column, labels, more) => `Valeurs absentes du fichier récent dans "${column}" : ${labels}${more ? "…" : ""}.`,
  columnsAdded: (columns) => `Colonne(s) présente(s) uniquement dans le fichier récent : ${columns}.`,
  columnsRemoved: (columns) => `Colonne(s) présente(s) uniquement dans le fichier précédent : ${columns}.`,
  variationTitle: (metric, category) => `Variation de ${metric} par ${category}`,
  variationSeries: (metric) => `Écart de ${metric}`,
  leaderExplains: (label, delta, percent) => `"${label}" explique le plus gros écart : ${delta} (${percent}).`,
  leaderAppeared: (label, value) => `"${label}" apparaît dans le fichier récent (${value}).`,
  leaderDisappeared: (label, value) => `"${label}" a disparu du fichier récent (${value} auparavant).`,
  beforeAfterTitle: (metric, category) => `${metric} : avant / après par ${category}`,
  beforeAfterInsight: (count) => `Les ${count} plus gros mouvements, du plus important au plus faible.`,
  tableColumns: { before: "Avant", after: "Après", delta: "Écart", percent: "%" },
  markerNew: "nouveau",
  markerGone: "disparu",
  noSharedColumns:
    "Ces deux fichiers n'ont aucune colonne en commun : la comparaison n'a pas de sens. Vérifiez qu'il s'agit bien du même export à deux périodes.",
};

const EN: CompareText = {
  reportTitle: (previous, current) => `What changed — from ${previous} to ${current}`,
  generatedOn: (date) => `Comparison generated on ${date}`,
  summaryTitle: "In short",
  totalsTitle: "Totals",
  sameRowCount: (rows) => `Both files hold ${rows} rows.`,
  rowCountChanged: (rows, delta) => `The recent file holds ${rows} rows, ${delta} compared with the earlier one.`,
  metricStable: (metric, value) => `${metric} is flat at ${value}.`,
  metricMoved: (metric, direction, percent, delta, before, after) =>
    `${metric} is ${direction} ${percent} (${delta}), from ${before} to ${after}.`,
  up: "up",
  down: "down",
  topMover: (category, label, delta, percent) => `On ${category}, "${label}" accounts for most of the gap: ${delta} (${percent}).`,
  appearedInCategory: (count, category, labels) => `${count} ${category} value(s) appear in the recent file: ${labels}.`,
  disappearedInCategory: (count, category, labels) => `${count} ${category} value(s) are gone: ${labels}.`,
  newValues: (column, labels, more) => `New values in "${column}": ${labels}${more ? "…" : ""}.`,
  missingValues: (column, labels, more) => `Values missing from the recent file in "${column}": ${labels}${more ? "…" : ""}.`,
  columnsAdded: (columns) => `Column(s) only in the recent file: ${columns}.`,
  columnsRemoved: (columns) => `Column(s) only in the earlier file: ${columns}.`,
  variationTitle: (metric, category) => `Change in ${metric} by ${category}`,
  variationSeries: (metric) => `Change in ${metric}`,
  leaderExplains: (label, delta, percent) => `"${label}" explains the largest gap: ${delta} (${percent}).`,
  leaderAppeared: (label, value) => `"${label}" appears in the recent file (${value}).`,
  leaderDisappeared: (label, value) => `"${label}" is gone from the recent file (${value} before).`,
  beforeAfterTitle: (metric, category) => `${metric}: before / after by ${category}`,
  beforeAfterInsight: (count) => `The ${count} largest movements, biggest first.`,
  tableColumns: { before: "Before", after: "After", delta: "Change", percent: "%" },
  markerNew: "new",
  markerGone: "gone",
  noSharedColumns:
    "These two files share no columns, so comparing them means nothing. Check that both are the same export from two different periods.",
};

const TEXTS: Record<Locale, CompareText> = { fr: FR, en: EN };

export function compareText(locale: Locale): CompareText {
  return TEXTS[locale];
}
