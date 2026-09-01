import * as XLSX from "xlsx";
import { formatNumber } from "./format";
import { formatShort } from "./svgCharts";
import type {
  AnalysisResult,
  CategoricalStats,
  ChartSpec,
  ColumnProfile,
  ColumnStats,
  ColumnType,
  CorrelationInsight,
  DateStats,
  NumericStats,
} from "./types";

const ID_NAME_PATTERN = /(^|[_\s-])(id|no|num|number|code|ref|reference|key)($|[_\s-])/i;

const METRIC_NAME_HINTS = [
  "amount",
  "total",
  "revenue",
  "sales",
  "price",
  "cost",
  "profit",
  "quantity",
  "qty",
  "montant",
  "prix",
  "cout",
  "coût",
  "ca",
  "budget",
  "score",
  "duree",
  "durée",
  "duration",
  "value",
  "valeur",
];

const CATEGORY_NAME_HINTS = [
  "category",
  "categorie",
  "catégorie",
  "type",
  "region",
  "région",
  "product",
  "produit",
  "status",
  "statut",
  "department",
  "département",
  "name",
  "nom",
  "segment",
  "channel",
  "canal",
  "country",
  "pays",
  "city",
  "ville",
  "client",
  "customer",
];

const MONTH_LABELS_FR = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function median(sorted: number[]): number {
  return quantile(sorted, 0.5);
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function tryParseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/\s/g, "").replace(/,/g, ".").replace(/[€$%]/g, "");
    if (cleaned === "" || Number.isNaN(Number(cleaned))) return null;
    return Number(cleaned);
  }
  return null;
}

function tryParseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/\d/.test(trimmed)) return null;
    if (/^\d{1,4}([/-])\d{1,2}\1\d{1,4}$/.test(trimmed)) {
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
}

interface RawColumn {
  name: string;
  values: unknown[];
}

function extractColumns(rows: Record<string, unknown>[], headers: string[]): RawColumn[] {
  return headers.map((name) => ({
    name,
    values: rows.map((row) => row[name]),
  }));
}

function inferColumnType(values: unknown[]): ColumnType {
  const nonBlank = values.filter((v) => !isBlank(v));
  if (nonBlank.length === 0) return "text";

  const boolLike = nonBlank.filter(
    (v) =>
      typeof v === "boolean" ||
      (typeof v === "string" && ["true", "false", "yes", "no", "oui", "non"].includes(v.trim().toLowerCase()))
  );
  if (boolLike.length / nonBlank.length > 0.9) return "boolean";

  const dateLike = nonBlank.filter((v) => tryParseDate(v) !== null);
  if (dateLike.length / nonBlank.length > 0.7) return "date";

  const numLike = nonBlank.filter((v) => tryParseNumber(v) !== null);
  if (numLike.length / nonBlank.length > 0.8) return "numeric";

  const uniqueCount = new Set(nonBlank.map((v) => String(v).trim().toLowerCase())).size;
  if (uniqueCount <= Math.max(30, nonBlank.length * 0.5)) return "categorical";

  return "text";
}

function isIdLike(name: string, values: unknown[], type: ColumnType): boolean {
  if (ID_NAME_PATTERN.test(name)) return true;
  if (type !== "numeric") return false;
  const nonBlank = values.filter((v) => !isBlank(v)).map((v) => tryParseNumber(v)).filter((v): v is number => v !== null);
  if (nonBlank.length < 5) return false;
  const sorted = [...new Set(nonBlank)].sort((a, b) => a - b);
  const allIntegers = nonBlank.every((v) => Number.isInteger(v));
  if (!allIntegers || sorted.length !== nonBlank.length) return false;
  // A dense, contiguous integer range (e.g. 1..n) is the signature of an
  // auto-increment ID column, unlike a real measurement, which will have
  // unique values only by coincidence in small samples and gaps otherwise.
  const isContiguousRange = sorted[sorted.length - 1] - sorted[0] + 1 === sorted.length;
  return isContiguousRange;
}

function computeNumericStats(values: unknown[]): NumericStats {
  const parsed = values.map((v) => (isBlank(v) ? null : tryParseNumber(v)));
  const clean = parsed.filter((v): v is number => v !== null);
  const sorted = [...clean].sort((a, b) => a - b);
  const avg = mean(clean);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outlierCount = clean.filter((v) => v < lowerFence || v > upperFence).length;

  return {
    type: "numeric",
    count: clean.length,
    missing: values.length - clean.length,
    sum: clean.reduce((a, b) => a + b, 0),
    mean: avg,
    median: median(sorted),
    min: sorted.length ? sorted[0] : 0,
    max: sorted.length ? sorted[sorted.length - 1] : 0,
    stdDev: stdDev(clean, avg),
    q1,
    q3,
    outlierCount,
  };
}

function computeCategoricalStats(values: unknown[]): CategoricalStats {
  const clean = values.filter((v) => !isBlank(v)).map((v) => String(v).trim());
  const counts = new Map<string, number>();
  for (const v of clean) counts.set(v, (counts.get(v) ?? 0) + 1);
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }));

  return {
    type: "categorical",
    count: clean.length,
    missing: values.length - clean.length,
    uniqueCount: counts.size,
    top,
  };
}

function computeDateStats(values: unknown[]): DateStats {
  const clean = values.map((v) => (isBlank(v) ? null : tryParseDate(v))).filter((v): v is Date => v !== null);
  const sorted = [...clean].sort((a, b) => a.getTime() - b.getTime());
  const monthCounts = new Map<string, number>();
  for (const d of clean) {
    const label = `${MONTH_LABELS_FR[d.getMonth()]} ${d.getFullYear()}`;
    monthCounts.set(label, (monthCounts.get(label) ?? 0) + 1);
  }
  const perMonth = [...monthCounts.entries()]
    .map(([label, count]) => ({ label, count, sortKey: sortKeyFromLabel(label) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ label, count }) => ({ label, count }));

  const min = sorted[0] ?? new Date();
  const max = sorted[sorted.length - 1] ?? new Date();

  return {
    type: "date",
    count: clean.length,
    missing: values.length - clean.length,
    min,
    max,
    spanDays: Math.round((max.getTime() - min.getTime()) / 86400000),
    perMonth,
  };
}

function sortKeyFromLabel(label: string): number {
  const [monthAbbrev, yearStr] = label.split(" ");
  const monthIdx = MONTH_LABELS_FR.indexOf(monthAbbrev);
  return Number(yearStr) * 12 + monthIdx;
}

function computeStats(type: ColumnType, values: unknown[]): ColumnStats {
  if (type === "numeric") return computeNumericStats(values);
  if (type === "date") return computeDateStats(values);
  if (type === "categorical") return computeCategoricalStats(values);
  if (type === "boolean") {
    const clean = values.filter((v) => !isBlank(v));
    const trueCount = clean.filter(
      (v) => v === true || (typeof v === "string" && ["true", "yes", "oui"].includes(v.trim().toLowerCase()))
    ).length;
    return {
      type: "boolean",
      count: clean.length,
      missing: values.length - clean.length,
      trueCount,
      falseCount: clean.length - trueCount,
    };
  }
  const clean = values.filter((v) => !isBlank(v));
  return {
    type: "text",
    count: clean.length,
    missing: values.length - clean.length,
    uniqueCount: new Set(clean.map((v) => String(v).trim())).size,
  };
}

function nameHintScore(name: string, hints: string[]): number {
  const lower = name.toLowerCase();
  return hints.some((h) => lower.includes(h)) ? 1 : 0;
}

function scoreMetricColumn(profile: ColumnProfile): number {
  if (profile.type !== "numeric" || profile.isIdLike) return -Infinity;
  const stats = profile.stats as NumericStats;
  if (stats.count === 0) return -Infinity;
  const variability = stats.stdDev / (Math.abs(stats.mean) + 1);
  const magnitude = Math.log10(Math.abs(stats.sum) + 1);
  return nameHintScore(profile.name, METRIC_NAME_HINTS) * 5 + variability + magnitude * 0.5;
}

function scoreCategoryColumn(profile: ColumnProfile): number {
  if (profile.type !== "categorical" || profile.isIdLike) return -Infinity;
  const stats = profile.stats as CategoricalStats;
  if (stats.uniqueCount < 2 || stats.uniqueCount > 20) return -Infinity;
  return nameHintScore(profile.name, CATEGORY_NAME_HINTS) * 5 + (10 - Math.abs(stats.uniqueCount - 6));
}

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 3) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

function guessDatasetTopic(columnNames: string[]): string {
  const lower = columnNames.map((c) => c.toLowerCase()).join(" | ");
  const topics: [RegExp, string][] = [
    [/(order|commande|invoice|facture)/, "de commandes / facturation"],
    [/(sale|vente|revenue|chiffre|montant|produit|quantite|quantité|prix)/, "de ventes"],
    [/(customer|client)/, "clients"],
    [/(employee|salari|hr|rh)/, "ressources humaines"],
    [/(stock|inventory|inventaire)/, "de gestion de stock"],
    [/(budget|expense|depense|dépense|cost)/, "financières / budgétaires"],
    [/(campaign|marketing|clic|impression)/, "marketing"],
    [/(project|projet|task|tâche)/, "de gestion de projet"],
  ];
  for (const [pattern, label] of topics) {
    if (pattern.test(lower)) return label;
  }
  return "tabulaires";
}

function buildCharts(
  columns: ColumnProfile[],
  keyMetrics: ColumnProfile[],
  primaryCategory: ColumnProfile | null,
  secondaryCategory: ColumnProfile | null,
  primaryDate: ColumnProfile | null,
  rows: Record<string, unknown>[]
): ChartSpec[] {
  const charts: ChartSpec[] = [];
  const metric = keyMetrics[0] ?? null;

  if (primaryDate && metric) {
    const dateValues = rows.map((r) => tryParseDate(r[primaryDate.name]));
    const metricValues = rows.map((r) => tryParseNumber(r[metric.name]));
    const monthly = new Map<string, number>();
    for (let i = 0; i < rows.length; i++) {
      const d = dateValues[i];
      const v = metricValues[i];
      if (!d || v === null) continue;
      const label = `${MONTH_LABELS_FR[d.getMonth()]} ${d.getFullYear()}`;
      monthly.set(label, (monthly.get(label) ?? 0) + v);
    }
    const sorted = [...monthly.entries()].sort((a, b) => sortKeyFromLabel(a[0]) - sortKeyFromLabel(b[0]));
    if (sorted.length >= 2) {
      const series = sorted.map(([, v]) => v);
      const segment = Math.max(1, Math.round(series.length * 0.25));
      const firstAvg = mean(series.slice(0, segment));
      const lastAvg = mean(series.slice(-segment));
      const change = firstAvg !== 0 ? ((lastAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;
      const trendWord = change > 10 ? "en hausse" : change < -10 ? "en baisse" : "globalement stable";
      charts.push({
        kind: "line",
        title: `Évolution de ${metric.name} dans le temps`,
        insight: `${metric.name} est ${trendWord} sur la période (${change >= 0 ? "+" : ""}${formatNumber(change)} % entre le début et la fin de la période observée).`,
        labels: sorted.map(([label]) => label),
        values: sorted.map(([, v]) => v),
        seriesLabel: metric.name,
      });
    }
  }

  if (primaryCategory) {
    const catStats = primaryCategory.stats as CategoricalStats;
    if (metric) {
      const metricValues = rows.map((r) => tryParseNumber(r[metric.name]));
      const catValues = rows.map((r) => (isBlank(r[primaryCategory.name]) ? null : String(r[primaryCategory.name]).trim()));
      const sums = new Map<string, number>();
      for (let i = 0; i < rows.length; i++) {
        const c = catValues[i];
        const v = metricValues[i];
        if (c === null || v === null) continue;
        sums.set(c, (sums.get(c) ?? 0) + v);
      }
      const sorted = [...sums.entries()].sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 8);
      const total = sorted.reduce((a, [, v]) => a + v, 0);
      const leader = top[0];
      charts.push({
        kind: "bar",
        title: `${metric.name} par ${primaryCategory.name}`,
        insight: leader
          ? `"${leader[0]}" arrive en tête avec ${formatNumber(leader[1])} (${formatNumber(total ? (leader[1] / total) * 100 : 0)} % du total pour ${primaryCategory.name}).`
          : `Répartition de ${metric.name} par ${primaryCategory.name}.`,
        labels: top.map(([label]) => label),
        values: top.map(([, v]) => v),
        seriesLabel: metric.name,
      });
    } else {
      const top = catStats.top.slice(0, 8);
      const total = catStats.count;
      charts.push({
        kind: "donut",
        title: `Répartition par ${primaryCategory.name}`,
        insight: top[0]
          ? `"${top[0].label}" est la valeur la plus fréquente (${formatNumber(top[0].count)} occurrences, ${formatNumber(total ? (top[0].count / total) * 100 : 0)} %).`
          : `Répartition des valeurs de ${primaryCategory.name}.`,
        labels: top.map((t) => t.label),
        values: top.map((t) => t.count),
      });

      if (secondaryCategory) {
        const secStats = secondaryCategory.stats as CategoricalStats;
        const secTop = secStats.top.slice(0, 8);
        charts.push({
          kind: "bar",
          title: `Répartition par ${secondaryCategory.name}`,
          insight: secTop[0]
            ? `"${secTop[0].label}" revient le plus souvent (${formatNumber(secTop[0].count)} occurrences sur ${formatNumber(secStats.count)}).`
            : `Répartition des valeurs de ${secondaryCategory.name}.`,
          labels: secTop.map((t) => t.label),
          values: secTop.map((t) => t.count),
          seriesLabel: "Nombre de lignes",
        });
      }
    }
  }

  if (metric) {
    const stats = metric.stats as NumericStats;
    const iqr = stats.q3 - stats.q1;
    const lowerFence = Math.max(stats.min, stats.q1 - 1.5 * iqr);
    const upperFence = Math.min(stats.max, stats.q3 + 1.5 * iqr);
    const bins = 6;
    const range = upperFence - lowerFence || 1;
    const binSize = range / bins;
    const counts = new Array(bins).fill(0);
    const values = rows.map((r) => tryParseNumber(r[metric.name])).filter((v): v is number => v !== null);
    let excluded = 0;
    for (const v of values) {
      if (v < lowerFence || v > upperFence) {
        excluded++;
        continue;
      }
      const idx = Math.min(bins - 1, Math.floor((v - lowerFence) / binSize));
      counts[idx]++;
    }
    const labels = new Array(bins).fill(0).map((_, i) => {
      const lo = lowerFence + i * binSize;
      const hi = lowerFence + (i + 1) * binSize;
      return `${formatShort(lo)}-${formatShort(hi)}`;
    });
    charts.push({
      kind: "bar",
      title: `Distribution de ${metric.name}`,
      insight: `La majorité des valeurs de ${metric.name} se situe entre ${formatNumber(stats.q1)} et ${formatNumber(stats.q3)}${excluded > 0 ? ` (${excluded} valeur(s) extrême(s) exclue(s) de ce graphique pour plus de lisibilité)` : ""}.`,
      labels,
      values: counts,
      seriesLabel: "Nombre de lignes",
    });
  }

  return charts.slice(0, 4);
}

function buildNarrative(
  fileName: string,
  rowCount: number,
  columns: ColumnProfile[],
  keyMetrics: ColumnProfile[],
  primaryCategory: ColumnProfile | null,
  primaryDate: ColumnProfile | null,
  duplicateRowCount: number,
  datasetTopic: string
): { narrative: string[]; recommendations: string[] } {
  const narrative: string[] = [];
  const recommendations: string[] = [];

  narrative.push(
    `Le fichier "${fileName}" contient ${formatNumber(rowCount)} lignes et ${columns.length} colonnes de données ${datasetTopic}.`
  );

  for (const metric of keyMetrics.slice(0, 3)) {
    const stats = metric.stats as NumericStats;
    narrative.push(
      `${metric.name} : total de ${formatNumber(stats.sum)}, moyenne de ${formatNumber(stats.mean)} par ligne (min ${formatNumber(stats.min)}, max ${formatNumber(stats.max)}).`
    );
    if (stats.outlierCount > 0 && stats.outlierCount / stats.count <= 0.15) {
      recommendations.push(
        `Vérifier les ${stats.outlierCount} valeur(s) atypique(s) dans la colonne "${metric.name}" : elles peuvent indiquer des erreurs de saisie ou des cas exceptionnels à analyser séparément.`
      );
    }
  }

  if (primaryCategory) {
    const stats = primaryCategory.stats as CategoricalStats;
    const top = stats.top[0];
    if (top) {
      narrative.push(
        `La colonne "${primaryCategory.name}" comporte ${stats.uniqueCount} catégories distinctes ; "${top.label}" est la plus représentée (${formatNumber(top.count)} occurrences).`
      );
    }
  }

  if (primaryDate) {
    const stats = primaryDate.stats as DateStats;
    narrative.push(
      `Les données couvrent une période de ${formatNumber(stats.spanDays)} jours, du ${stats.min.toLocaleDateString("fr-FR")} au ${stats.max.toLocaleDateString("fr-FR")}.`
    );
  }

  if (duplicateRowCount > 0) {
    narrative.push(`${formatNumber(duplicateRowCount)} ligne(s) en double ont été détectées dans le fichier.`);
    recommendations.push(
      `Supprimer ou vérifier les ${formatNumber(duplicateRowCount)} ligne(s) en double afin de fiabiliser les totaux et moyennes.`
    );
  }

  const highMissingCols = columns.filter((c) => {
    const missing = "missing" in c.stats ? c.stats.missing : 0;
    return missing / rowCount > 0.2;
  });
  for (const col of highMissingCols.slice(0, 3)) {
    const missing = (col.stats as { missing: number }).missing;
    const pct = formatNumber((missing / rowCount) * 100);
    narrative.push(`La colonne "${col.name}" comporte ${pct} % de valeurs manquantes.`);
    recommendations.push(`Compléter ou fiabiliser la collecte de données pour la colonne "${col.name}" (${pct} % de valeurs manquantes).`);
  }

  if (recommendations.length === 0) {
    recommendations.push("Aucune anomalie majeure détectée : les données semblent complètes et cohérentes.");
  }

  return { narrative, recommendations };
}

export async function analyzeWorkbook(buffer: Buffer, fileName: string): Promise<AnalysisResult> {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

  let sheetName = "";
  let rows: Record<string, unknown>[] = [];
  let headers: string[] = [];

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const asRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: true,
    });
    if (asRows.length > 0) {
      sheetName = name;
      rows = asRows;
      headers = Object.keys(asRows[0]).filter((h) => !h.startsWith("__EMPTY"));
      break;
    }
  }

  if (rows.length === 0) {
    throw new Error("Aucune donnée exploitable n'a été trouvée dans ce fichier Excel.");
  }

  const rawColumns = extractColumns(rows, headers);

  const columns: ColumnProfile[] = rawColumns.map(({ name, values }) => {
    const type = inferColumnType(values);
    const idLike = isIdLike(name, values, type);
    return {
      name,
      type,
      isIdLike: idLike,
      stats: computeStats(type, values),
    };
  });

  const seenRows = new Set<string>();
  let duplicateRowCount = 0;
  for (const row of rows) {
    const key = JSON.stringify(headers.map((h) => row[h]));
    if (seenRows.has(key)) duplicateRowCount++;
    else seenRows.add(key);
  }

  const numericCols = columns.filter((c) => c.type === "numeric" && !c.isIdLike);
  const keyMetrics = [...numericCols].sort((a, b) => scoreMetricColumn(b) - scoreMetricColumn(a)).slice(0, 3);

  const categoricalCols = [...columns.filter((c) => c.type === "categorical" && !c.isIdLike)].sort(
    (a, b) => scoreCategoryColumn(b) - scoreCategoryColumn(a)
  );
  const primaryCategory = categoricalCols[0] ?? null;
  const secondaryCategory = categoricalCols[1] && scoreCategoryColumn(categoricalCols[1]) > -Infinity ? categoricalCols[1] : null;

  const dateCols = columns.filter((c) => c.type === "date");
  const primaryDate = dateCols[0] ?? null;

  const correlations: CorrelationInsight[] = [];
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const a = rows.map((r) => tryParseNumber(r[numericCols[i].name])).filter((v): v is number => v !== null);
      const b = rows.map((r) => tryParseNumber(r[numericCols[j].name])).filter((v): v is number => v !== null);
      const len = Math.min(a.length, b.length);
      if (len < 3) continue;
      const coef = pearson(a.slice(0, len), b.slice(0, len));
      if (Math.abs(coef) > 0.5) {
        correlations.push({ columnA: numericCols[i].name, columnB: numericCols[j].name, coefficient: coef });
      }
    }
  }
  correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

  const datasetTopic = guessDatasetTopic(headers);
  const charts = buildCharts(columns, keyMetrics, primaryCategory, secondaryCategory, primaryDate, rows);
  const { narrative, recommendations } = buildNarrative(
    fileName,
    rows.length,
    columns,
    keyMetrics,
    primaryCategory,
    primaryDate,
    duplicateRowCount,
    datasetTopic
  );

  if (correlations.length > 0) {
    const top = correlations[0];
    const direction = top.coefficient > 0 ? "positivement" : "négativement";
    narrative.push(
      `Corrélation notable : "${top.columnA}" et "${top.columnB}" varient ${direction} ensemble (coefficient de ${formatNumber(top.coefficient)}).`
    );
  }

  return {
    fileName,
    sheetName,
    rowCount: rows.length,
    columnCount: headers.length,
    duplicateRowCount,
    datasetTopic,
    columns,
    keyMetrics,
    primaryCategory,
    primaryDate,
    correlations: correlations.slice(0, 3),
    charts,
    narrative,
    recommendations,
    generatedAt: new Date(),
  };
}
