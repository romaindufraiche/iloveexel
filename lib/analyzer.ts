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

// Handles: plain numbers, thousand/decimal separators in either order
// ("1,234.56" or "1.234,56"), a lone comma as decimal ("12,5"), currency/
// percent symbols, and accounting-style negatives in parentheses ("(1 234)").
function tryParseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  let s = value.trim();
  if (s === "") return null;

  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/[€$£%\s]/g, "");
  if (s === "") return null;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // Whichever separator appears last is the decimal point; the other is
    // a thousands separator and gets stripped.
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma !== -1) {
    const decimalsLen = s.length - lastComma - 1;
    s = decimalsLen > 0 && decimalsLen <= 2 ? s.replace(",", ".") : s.replace(/,/g, "");
  }

  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return negative ? -n : n;
}

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0,
  janv: 0,
  février: 1,
  fevrier: 1,
  fév: 1,
  fev: 1,
  mars: 2,
  avril: 3,
  avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  juil: 6,
  août: 7,
  aout: 7,
  septembre: 8,
  sept: 8,
  sep: 8,
  octobre: 9,
  oct: 9,
  novembre: 10,
  nov: 10,
  décembre: 11,
  decembre: 11,
  déc: 11,
  dec: 11,
};

function tryParseFrenchTextDate(trimmed: string): Date | null {
  const match = trimmed.toLowerCase().match(/^(\d{1,2})[\s-]+([a-zéû.]+)\.?[\s-]+(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const monthKey = match[2].replace(/\.$/, "");
  const year = Number(match[3]);
  const monthIdx = FRENCH_MONTHS[monthKey];
  if (monthIdx === undefined || day < 1 || day > 31) return null;
  const date = new Date(year, monthIdx, day);
  return Number.isNaN(date.getTime()) ? null : date;
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
    const frenchDate = tryParseFrenchTextDate(trimmed);
    if (frenchDate) return frenchDate;
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

const TOTAL_ROW_PATTERN = /^(grand\s*)?(total|sous[\s-]?total|totaux|somme)s?\s*:?\s*$/i;

function isBlankRow(row: unknown[] | undefined): boolean {
  return !row || row.every((cell) => isBlank(cell));
}

// Real-world exports rarely start with a clean header on row 1: there's
// often a title, a logo caption, or a blank row or two above the actual
// table. Score each of the first ~25 rows as a header candidate and pick
// the best one instead of blindly trusting row 1.
function rowHasDataSignal(row: unknown[]): boolean {
  const filled = row.filter((c) => !isBlank(c));
  if (filled.length < 2) return false;
  return filled.some((c) => tryParseNumber(c) !== null || tryParseDate(c) !== null);
}

function findNonBlankRowIndex(raw: unknown[][], from: number, direction: 1 | -1): number {
  for (let i = from; i >= 0 && i < raw.length; i += direction) {
    if (!isBlankRow(raw[i])) return i;
  }
  return -1;
}

// Header labels are almost never literal numbers or dates, while any real
// data table eventually has a row where a cell is one. Find that first
// "data-shaped" row and treat the nearest non-blank row above it as the
// header — this survives a title row, a blank spacer row, or a header row
// with a blank/merged cell in it far better than scoring rows in isolation
// (which a plain, mostly-text data row can accidentally out-score).
function detectTableStart(raw: unknown[][]): { headerRowIndex: number | null; dataStartIndex: number } {
  const maxScan = Math.min(raw.length, 40);
  let firstDataRow = -1;
  for (let i = 0; i < maxScan; i++) {
    if (isBlankRow(raw[i])) continue;
    if (rowHasDataSignal(raw[i])) {
      firstDataRow = i;
      break;
    }
  }

  if (firstDataRow === -1) {
    // No numeric/date cell found anywhere scanned (e.g. an all-text table)
    // — fall back to "the first non-blank row is the header".
    const firstRow = findNonBlankRowIndex(raw, 0, 1);
    return firstRow === -1 ? { headerRowIndex: null, dataStartIndex: 0 } : { headerRowIndex: firstRow, dataStartIndex: firstRow + 1 };
  }

  const headerCandidate = findNonBlankRowIndex(raw, firstDataRow - 1, -1);
  if (headerCandidate === -1) {
    // Nothing plausible above the first data row — there's no header at all.
    return { headerRowIndex: null, dataStartIndex: firstDataRow };
  }
  return { headerRowIndex: headerCandidate, dataStartIndex: firstDataRow };
}

interface ExtractedTable {
  headers: string[];
  rows: Record<string, unknown>[];
  headerRowIndex: number | null;
  excludedTotalRowCount: number;
}

// Builds a clean row/column table out of a raw sheet: finds the real header
// row, names blank header cells instead of silently dropping that column's
// data, stops at the first real gap so a second, unrelated table further
// down the sheet doesn't get merged in, and drops obvious total/subtotal
// rows so they don't inflate sums and averages.
function extractTableFromSheet(sheet: XLSX.WorkSheet): ExtractedTable | null {
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null, blankrows: true });
  if (raw.length === 0 || raw.every((r) => isBlankRow(r))) return null;

  const { headerRowIndex, dataStartIndex } = detectTableStart(raw);
  const columnCount = headerRowIndex !== null ? raw[headerRowIndex].length : Math.max(...raw.slice(dataStartIndex, dataStartIndex + 20).map((r) => r.length), 1);
  const headerRow = headerRowIndex !== null ? raw[headerRowIndex] : [];

  const seen = new Map<string, number>();
  const headers = Array.from({ length: columnCount }, (_, i) => {
    const cell = headerRow[i];
    const label = isBlank(cell) ? "" : String(cell).trim();
    const base = label || `Colonne ${i + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });

  const dataRaw = raw.slice(dataStartIndex);
  let cutoff = dataRaw.length;
  let blankStreak = 0;
  for (let i = 0; i < dataRaw.length; i++) {
    if (isBlankRow(dataRaw[i])) {
      blankStreak++;
      if (blankStreak >= 2) {
        cutoff = i - blankStreak + 1;
        break;
      }
    } else {
      blankStreak = 0;
    }
  }

  const dataRows = dataRaw.slice(0, cutoff).filter((r) => !isBlankRow(r));

  let excludedTotalRowCount = 0;
  const rows: Record<string, unknown>[] = [];
  for (const r of dataRows) {
    const isTotalRow = r.some((cell) => typeof cell === "string" && TOTAL_ROW_PATTERN.test(cell.trim()));
    if (isTotalRow) {
      excludedTotalRowCount++;
      continue;
    }
    // A row with at most one filled cell in a multi-column table is almost
    // always a stray footnote/source line, not a real record — a single
    // blank row isn't always enough of a gap to have caught it above.
    const filledCount = r.filter((cell) => !isBlank(cell)).length;
    if (headers.length > 2 && filledCount <= 1) continue;

    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      row[h] = r[i] ?? null;
    });
    rows.push(row);
  }

  // SheetJS pads every row to the sheet's overall used range, which can
  // span far below/right of this table (e.g. an unrelated second table
  // further down) — drop any column that came out fully empty as a result.
  const nonEmptyHeaders = headers.filter((h) => rows.some((row) => !isBlank(row[h])));
  const trimmedRows = rows.map((row) => {
    const trimmed: Record<string, unknown> = {};
    for (const h of nonEmptyHeaders) trimmed[h] = row[h];
    return trimmed;
  });

  return { headers: nonEmptyHeaders, rows: trimmedRows, headerRowIndex, excludedTotalRowCount };
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

function scoreListColumn(profile: ColumnProfile): number {
  if (profile.type !== "categorical" || profile.isIdLike) return -Infinity;
  const stats = profile.stats as CategoricalStats;
  if (stats.uniqueCount <= 20) return -Infinity;
  return nameHintScore(profile.name, CATEGORY_NAME_HINTS) * 5 - stats.uniqueCount * 0.01;
}

// How many of the top entries (sorted descending) it takes to reach 80% of
// the total, and what share they actually hold — the concentration signal
// behind statements like "3 catégories sur 12 concentrent 82% du total".
function paretoConcentration(sortedDesc: number[], total: number): { count: number; share: number } | null {
  if (total <= 0 || sortedDesc.length === 0) return null;
  let cumulative = 0;
  let count = 0;
  for (const v of sortedDesc) {
    cumulative += v;
    count++;
    if (cumulative / total >= 0.8) break;
  }
  return { count, share: cumulative / total };
}

function classifyTrend(changePct: number): string {
  if (changePct > 30) return "en forte hausse";
  if (changePct > 10) return "en hausse";
  if (changePct < -30) return "en forte baisse";
  if (changePct < -10) return "en baisse";
  return "globalement stable";
}

function correlationStrength(coef: number): string {
  const abs = Math.abs(coef);
  if (abs > 0.8) return "forte";
  if (abs > 0.65) return "modérée";
  return "faible";
}

// Aggregates the top N entries and folds the remainder into a single
// "Autres" bucket, so a bar/pie chart always visually accounts for the
// whole total instead of silently dropping the long tail.
function bucketTopN(
  entries: [string, number][],
  n: number
): { labels: string[]; values: number[] } {
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, n);
  const rest = sorted.slice(n);
  const labels = top.map(([label]) => label);
  const values = top.map(([, v]) => v);
  if (rest.length > 0) {
    labels.push(`Autres (${rest.length})`);
    values.push(rest.reduce((a, [, v]) => a + v, 0));
  }
  return { labels, values };
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

function sumMetricByCategory(rows: Record<string, unknown>[], categoryName: string, metricName: string): [string, number][] {
  const sums = new Map<string, number>();
  for (const row of rows) {
    if (isBlank(row[categoryName])) continue;
    const v = tryParseNumber(row[metricName]);
    if (v === null) continue;
    const c = String(row[categoryName]).trim();
    sums.set(c, (sums.get(c) ?? 0) + v);
  }
  return [...sums.entries()];
}

// Rule A: a date column plus a metric answers "how is it evolving?" — a
// trend is only meaningful with several distinct periods to compare.
function buildTrendChart(primaryDate: ColumnProfile | null, metric: ColumnProfile | null, rows: Record<string, unknown>[]): ChartSpec | null {
  if (!primaryDate || !metric) return null;
  const monthly = new Map<string, number>();
  for (const row of rows) {
    const d = tryParseDate(row[primaryDate.name]);
    const v = tryParseNumber(row[metric.name]);
    if (!d || v === null) continue;
    const label = `${MONTH_LABELS_FR[d.getMonth()]} ${d.getFullYear()}`;
    monthly.set(label, (monthly.get(label) ?? 0) + v);
  }
  const sorted = [...monthly.entries()].sort((a, b) => sortKeyFromLabel(a[0]) - sortKeyFromLabel(b[0]));
  if (sorted.length < 2) return null;

  const series = sorted.map(([, v]) => v);
  const segment = Math.max(1, Math.round(series.length * 0.25));
  const firstAvg = mean(series.slice(0, segment));
  const lastAvg = mean(series.slice(-segment));
  const change = firstAvg !== 0 ? ((lastAvg - firstAvg) / Math.abs(firstAvg)) * 100 : 0;
  const peak = sorted.reduce((a, b) => (b[1] > a[1] ? b : a));
  const trough = sorted.reduce((a, b) => (b[1] < a[1] ? b : a));

  return {
    kind: "line",
    title: `Évolution de ${metric.name} dans le temps`,
    insight: `${metric.name} est ${classifyTrend(change)} sur la période (${change >= 0 ? "+" : ""}${formatNumber(change)} % entre le début et la fin). Pic en ${peak[0]} (${formatNumber(peak[1])}), creux en ${trough[0]} (${formatNumber(trough[1])}).`,
    labels: sorted.map(([label]) => label),
    values: series,
    seriesLabel: metric.name,
  };
}

// Rule B: a low-cardinality category plus a metric is a ranking question —
// bucketed to 8 bars + "Autres" so the chart stays readable and still sums
// to the true total.
function buildCategoryRankingChart(category: ColumnProfile, metric: ColumnProfile, rows: Record<string, unknown>[]): ChartSpec {
  const entries = sumMetricByCategory(rows, category.name, metric.name);
  const sortedDesc = [...entries].sort((a, b) => b[1] - a[1]);
  const total = sortedDesc.reduce((a, [, v]) => a + v, 0);
  const leader = sortedDesc[0];
  const { labels, values } = bucketTopN(entries, 8);

  const pareto = paretoConcentration(
    sortedDesc.map(([, v]) => v),
    total
  );
  const concentrationPhrase =
    pareto && sortedDesc.length >= 6 && pareto.count < sortedDesc.length
      ? ` ${pareto.count} ${category.name.toLowerCase()}(s) sur ${sortedDesc.length} concentrent ${formatNumber(pareto.share * 100)} % du total.`
      : "";

  return {
    kind: "bar",
    title: `${metric.name} par ${category.name}`,
    insight: leader
      ? `"${leader[0]}" arrive en tête avec ${formatNumber(leader[1])} (${formatNumber(total ? (leader[1] / total) * 100 : 0)} % du total).${concentrationPhrase}`
      : `Répartition de ${metric.name} par ${category.name}.`,
    labels,
    values,
    seriesLabel: metric.name,
  };
}

// Rule B (high-cardinality variant): with 20+ distinct values (client
// lists, SKUs...) a bar chart is unreadable — a ranked table answers the
// same "who/what matters most" question without the clutter.
function buildRankingTable(listColumn: ColumnProfile, metric: ColumnProfile, rows: Record<string, unknown>[]): ChartSpec {
  const entries = sumMetricByCategory(rows, listColumn.name, metric.name);
  const sortedDesc = [...entries].sort((a, b) => b[1] - a[1]);
  const total = sortedDesc.reduce((a, [, v]) => a + v, 0);
  const top10 = sortedDesc.slice(0, 10);
  const pareto = paretoConcentration(
    sortedDesc.map(([, v]) => v),
    total
  );

  return {
    kind: "table",
    title: `Top ${listColumn.name} par ${metric.name}`,
    insight:
      top10.length > 0
        ? `"${top10[0][0]}" arrive en tête avec ${formatNumber(top10[0][1])} (${formatNumber(total ? (top10[0][1] / total) * 100 : 0)} % du total sur ${sortedDesc.length} valeurs distinctes).${
            pareto && pareto.count < sortedDesc.length
              ? ` ${pareto.count} valeur(s) sur ${sortedDesc.length} concentrent ${formatNumber(pareto.share * 100)} % du total.`
              : ""
          }`
        : `Classement de ${metric.name} par ${listColumn.name}.`,
    columns: [listColumn.name, `Total ${metric.name}`, "Part du total"],
    rows: top10.map(([label, value]) => [label, formatNumber(value), `${formatNumber(total ? (value / total) * 100 : 0)} %`]),
  };
}

// Rule C: a low-cardinality category with no metric to weigh it is a pure
// composition question ("what share does each value represent?").
function buildCompositionChart(category: ColumnProfile): ChartSpec {
  const stats = category.stats as CategoricalStats;
  const total = stats.count;
  const { labels, values } = bucketTopN(
    stats.top.map((t) => [t.label, t.count] as [string, number]),
    7
  );
  return {
    kind: "donut",
    title: `Répartition par ${category.name}`,
    insight: stats.top[0]
      ? `"${stats.top[0].label}" est la valeur la plus fréquente (${formatNumber(stats.top[0].count)} occurrences, ${formatNumber(total ? (stats.top[0].count / total) * 100 : 0)} %).`
      : `Répartition des valeurs de ${category.name}.`,
    labels,
    values,
  };
}

function buildCountChart(category: ColumnProfile): ChartSpec {
  const stats = category.stats as CategoricalStats;
  const { labels, values } = bucketTopN(
    stats.top.map((t) => [t.label, t.count] as [string, number]),
    8
  );
  return {
    kind: "bar",
    title: `Répartition par ${category.name}`,
    insight: stats.top[0]
      ? `"${stats.top[0].label}" revient le plus souvent (${formatNumber(stats.top[0].count)} occurrences sur ${formatNumber(stats.count)}).`
      : `Répartition des valeurs de ${category.name}.`,
    labels,
    values,
    seriesLabel: "Nombre de lignes",
  };
}

// Rule D: two categorical dimensions crossed with a metric reveal
// interaction effects a single breakdown can't show (e.g. which
// region×product combination actually drives revenue).
function buildCrossTabHeatmap(
  catA: ColumnProfile,
  catB: ColumnProfile,
  metric: ColumnProfile,
  rows: Record<string, unknown>[]
): ChartSpec | null {
  const aStats = catA.stats as CategoricalStats;
  const bStats = catB.stats as CategoricalStats;
  if (aStats.uniqueCount > 6 || bStats.uniqueCount > 6) return null;

  const rowLabels = aStats.top.map((t) => t.label);
  const colLabels = bStats.top.map((t) => t.label);
  const matrix = rowLabels.map(() => colLabels.map(() => 0));

  for (const row of rows) {
    const a = isBlank(row[catA.name]) ? null : String(row[catA.name]).trim();
    const b = isBlank(row[catB.name]) ? null : String(row[catB.name]).trim();
    const v = tryParseNumber(row[metric.name]);
    if (a === null || b === null || v === null) continue;
    const ri = rowLabels.indexOf(a);
    const ci = colLabels.indexOf(b);
    if (ri === -1 || ci === -1) continue;
    matrix[ri][ci] += v;
  }

  let best = { value: -Infinity, r: 0, c: 0 };
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] > best.value) best = { value: matrix[r][c], r, c };
    }
  }

  return {
    kind: "heatmap",
    title: `${metric.name} : ${catA.name} × ${catB.name}`,
    insight:
      best.value > -Infinity
        ? `La combinaison "${rowLabels[best.r]}" × "${colLabels[best.c]}" génère le plus de ${metric.name} (${formatNumber(best.value)}).`
        : `Croisement de ${catA.name} et ${catB.name}.`,
    rowLabels,
    colLabels,
    matrix,
    displayMatrix: matrix.map((r) => r.map((v) => formatShort(v))),
    colorScale: "sequential",
  };
}

// Rule E: with several numeric indicators, a correlation matrix surfaces
// which ones move together — more useful than reporting a single pair.
function buildCorrelationHeatmap(numericCols: ColumnProfile[], rows: Record<string, unknown>[]): ChartSpec | null {
  const cols = [...numericCols].sort((a, b) => scoreMetricColumn(b) - scoreMetricColumn(a)).slice(0, 6);
  if (cols.length < 3) return null;

  const series = cols.map((c) => rows.map((r) => tryParseNumber(r[c.name])));
  const matrix = cols.map((_, i) =>
    cols.map((_, j) => {
      if (i === j) return 1;
      const a: number[] = [];
      const b: number[] = [];
      for (let k = 0; k < rows.length; k++) {
        if (series[i][k] !== null && series[j][k] !== null) {
          a.push(series[i][k] as number);
          b.push(series[j][k] as number);
        }
      }
      return pearson(a, b);
    })
  );

  let best = { value: 0, i: 0, j: 1 };
  for (let i = 0; i < cols.length; i++) {
    for (let j = i + 1; j < cols.length; j++) {
      if (Math.abs(matrix[i][j]) > Math.abs(best.value)) best = { value: matrix[i][j], i, j };
    }
  }
  const direction = best.value > 0 ? "évoluent dans le même sens" : "évoluent en sens opposé";

  return {
    kind: "heatmap",
    title: "Matrice de corrélation",
    insight:
      Math.abs(best.value) > 0.3
        ? `"${cols[best.i].name}" et "${cols[best.j].name}" ont la corrélation la plus marquée (${formatNumber(best.value)}) : ils ${direction} (relation ${correlationStrength(best.value)}).`
        : "Aucune corrélation forte n'a été détectée entre les indicateurs numériques.",
    rowLabels: cols.map((c) => c.name),
    colLabels: cols.map((c) => c.name),
    matrix,
    displayMatrix: matrix.map((r) => r.map((v) => formatNumber(v))),
    colorScale: "diverging",
  };
}

// Rule F: exactly two numeric indicators with a real correlation is best
// shown as a scatter plot with a trend line, not a matrix of one cell.
function buildScatterChart(colA: ColumnProfile, colB: ColumnProfile, coef: number, rows: Record<string, unknown>[]): ChartSpec {
  const points: { x: number; y: number }[] = [];
  for (const row of rows) {
    const x = tryParseNumber(row[colA.name]);
    const y = tryParseNumber(row[colB.name]);
    if (x !== null && y !== null) points.push({ x, y });
  }
  const direction = coef > 0 ? "augmente" : "diminue";
  return {
    kind: "scatter",
    title: `${colA.name} vs ${colB.name}`,
    insight: `Quand ${colA.name} augmente, ${colB.name} a tendance à ${direction} (corrélation ${correlationStrength(coef)}, coefficient de ${formatNumber(coef)}).`,
    xLabel: colA.name,
    yLabel: colB.name,
    points: points.slice(0, 500),
  };
}

// Rule G: the distribution of the primary metric — always relevant, shown
// last since ranking/trend answer the more pressing "so what" questions
// first. Extreme outliers are excluded from the binning range (but counted)
// so a handful of them don't compress every other bar into nothing.
function buildDistributionChart(metric: ColumnProfile, rows: Record<string, unknown>[]): ChartSpec {
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
  return {
    kind: "bar",
    title: `Distribution de ${metric.name}`,
    insight: `La majorité des valeurs de ${metric.name} se situe entre ${formatNumber(stats.q1)} et ${formatNumber(stats.q3)}${excluded > 0 ? ` (${excluded} valeur(s) extrême(s) exclue(s) de ce graphique pour plus de lisibilité)` : ""}.`,
    labels,
    values: counts,
    seriesLabel: "Nombre de lignes",
  };
}

// Rule H: nothing to chart at all (no usable metric, category, or date) —
// don't force a graphic that wouldn't mean anything; show the raw rows.
function buildRawPreviewTable(columns: ColumnProfile[], rows: Record<string, unknown>[]): ChartSpec {
  const shownCols = columns.slice(0, 6);
  return {
    kind: "table",
    title: "Aperçu des données",
    insight: `Aucun indicateur numérique ou regroupement clair n'a été détecté : voici un aperçu des ${Math.min(10, rows.length)} premières lignes.`,
    columns: shownCols.map((c) => c.name),
    rows: rows.slice(0, 10).map((row) => shownCols.map((c) => (isBlank(row[c.name]) ? "—" : String(row[c.name])))),
  };
}

function selectVisualizations(
  columns: ColumnProfile[],
  numericCols: ColumnProfile[],
  keyMetrics: ColumnProfile[],
  primaryCategory: ColumnProfile | null,
  secondaryCategory: ColumnProfile | null,
  listColumn: ColumnProfile | null,
  primaryDate: ColumnProfile | null,
  topCorrelation: CorrelationInsight | null,
  rows: Record<string, unknown>[]
): ChartSpec[] {
  const charts: ChartSpec[] = [];
  const metric = keyMetrics[0] ?? null;
  // Below this sample size, a cross-tab or a correlation coefficient reads
  // as far more confident than it is (e.g. r=1 from 5 points is noise, not
  // a relationship) — skip these "relational" visuals rather than overstate
  // a pattern the data can't actually support.
  const MIN_ROWS_FOR_RELATIONAL_CHARTS = 15;
  const hasEnoughRows = rows.length >= MIN_ROWS_FOR_RELATIONAL_CHARTS;

  const trend = buildTrendChart(primaryDate, metric, rows);
  if (trend) charts.push(trend);

  if (metric) {
    if (primaryCategory) charts.push(buildCategoryRankingChart(primaryCategory, metric, rows));
    else if (listColumn) charts.push(buildRankingTable(listColumn, metric, rows));

    if (primaryCategory && secondaryCategory && hasEnoughRows) {
      const crossTab = buildCrossTabHeatmap(primaryCategory, secondaryCategory, metric, rows);
      if (crossTab) charts.push(crossTab);
    }
  } else if (primaryCategory) {
    charts.push(buildCompositionChart(primaryCategory));
    if (secondaryCategory) charts.push(buildCountChart(secondaryCategory));
  }

  if (hasEnoughRows && numericCols.length >= 3) {
    const corrMatrix = buildCorrelationHeatmap(numericCols, rows);
    if (corrMatrix) charts.push(corrMatrix);
  } else if (hasEnoughRows && numericCols.length === 2 && topCorrelation) {
    const [colA, colB] = numericCols;
    charts.push(buildScatterChart(colA, colB, topCorrelation.coefficient, rows));
  }

  if (metric) charts.push(buildDistributionChart(metric, rows));

  if (charts.length === 0) charts.push(buildRawPreviewTable(columns, rows));

  return charts.slice(0, 5);
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
  let excludedTotalRowCount = 0;

  // Pick whichever sheet actually yields a usable table — not just the
  // first non-empty one, since a workbook's first tab is sometimes a cover
  // page or an instructions sheet with only a couple of stray cells.
  let bestTable: ExtractedTable | null = null;
  let bestSheetName = "";
  for (const name of workbook.SheetNames) {
    const table = extractTableFromSheet(workbook.Sheets[name]);
    if (table && table.rows.length > 0 && (!bestTable || table.rows.length > bestTable.rows.length)) {
      bestTable = table;
      bestSheetName = name;
    }
  }

  if (bestTable) {
    sheetName = bestSheetName;
    rows = bestTable.rows;
    headers = bestTable.headers;
    excludedTotalRowCount = bestTable.excludedTotalRowCount;
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
  const keyMetrics = [...numericCols]
    .sort((a, b) => scoreMetricColumn(b) - scoreMetricColumn(a))
    .filter((c) => scoreMetricColumn(c) > -Infinity)
    .slice(0, 3);

  const categoricalCols = [...columns.filter((c) => c.type === "categorical" && !c.isIdLike)].sort(
    (a, b) => scoreCategoryColumn(b) - scoreCategoryColumn(a)
  );
  const primaryCategory = categoricalCols[0] && scoreCategoryColumn(categoricalCols[0]) > -Infinity ? categoricalCols[0] : null;
  const secondaryCategory = categoricalCols[1] && scoreCategoryColumn(categoricalCols[1]) > -Infinity ? categoricalCols[1] : null;

  const listColumn =
    [...columns.filter((c) => c.type === "categorical" && !c.isIdLike)].sort(
      (a, b) => scoreListColumn(b) - scoreListColumn(a)
    )[0] ?? null;
  const validListColumn = listColumn && scoreListColumn(listColumn) > -Infinity ? listColumn : null;

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
  const charts = selectVisualizations(
    columns,
    numericCols,
    keyMetrics,
    primaryCategory,
    secondaryCategory,
    validListColumn,
    primaryDate,
    correlations[0] ?? null,
    rows
  );
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

  if (excludedTotalRowCount > 0) {
    narrative.push(
      `${formatNumber(excludedTotalRowCount)} ligne(s) de type "Total" ont été détectées et exclues des calculs pour ne pas fausser les sommes et moyennes.`
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
