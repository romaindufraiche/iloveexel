import { formatNumber } from "./format";
import {
  parseBestTable,
  profileColumns,
  sumMetricByCategory,
  scoreMetricColumn,
  scoreCategoryColumn,
} from "./analyzer";
import type { ChartSpec, ColumnProfile } from "./types";
import { compareText, type CompareText } from "./compareText";
import { DEFAULT_LOCALE, type Locale } from "./i18n/config";

// Comparing two exports of the same report answers the question a monthly
// reporting loop actually asks — "what moved since last time?" — which no
// amount of charting a single file can answer.

export interface MetricChange {
  name: string;
  previous: number;
  current: number;
  delta: number;
  /** null when the previous total was zero: a percentage would be meaningless. */
  percent: number | null;
}

export type MovementStatus = "changed" | "appeared" | "disappeared";

export interface CategoryMovement {
  label: string;
  previous: number;
  current: number;
  delta: number;
  percent: number | null;
  status: MovementStatus;
}

export interface ValueDrift {
  column: string;
  appeared: string[];
  disappeared: string[];
}

export interface ComparisonResult {
  currentName: string;
  previousName: string;
  rowCount: { previous: number; current: number };
  metrics: MetricChange[];
  category: {
    name: string;
    metricName: string;
    movements: CategoryMovement[];
  } | null;
  structure: { added: string[]; removed: string[] };
  valueDrift: ValueDrift[];
  highlights: string[];
  charts: ChartSpec[];
}

const POSITIVE = "#0fa968";
const NEGATIVE = "#ef4444";
const MAX_MOVEMENTS = 10;

function percentChange(previous: number, current: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function signed(value: number, locale: Locale): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, locale)}`;
}

function signedPercent(percent: number | null, locale: Locale): string {
  return percent === null ? "n/a" : `${percent >= 0 ? "+" : ""}${formatNumber(percent, locale)} %`;
}

function totalFor(rows: Record<string, unknown>[], name: string): number {
  let sum = 0;
  for (const row of rows) {
    const raw = row[name];
    const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(/[^\d.,-]/g, "").replace(",", "."));
    if (Number.isFinite(n)) sum += n;
  }
  return sum;
}

function bestOf(columns: ColumnProfile[], score: (c: ColumnProfile) => number): ColumnProfile | null {
  let best: ColumnProfile | null = null;
  let bestScore = -Infinity;
  for (const column of columns) {
    const value = score(column);
    if (value > bestScore) {
      bestScore = value;
      best = column;
    }
  }
  return bestScore > -Infinity ? best : null;
}

function buildMovements(
  category: ColumnProfile,
  metric: ColumnProfile,
  previousRows: Record<string, unknown>[],
  currentRows: Record<string, unknown>[]
): CategoryMovement[] {
  const previous = new Map(sumMetricByCategory(previousRows, category.name, metric.name));
  const current = new Map(sumMetricByCategory(currentRows, category.name, metric.name));

  const labels = new Set([...previous.keys(), ...current.keys()]);
  const movements: CategoryMovement[] = [];

  for (const label of labels) {
    const before = previous.get(label) ?? 0;
    const after = current.get(label) ?? 0;
    if (before === 0 && after === 0) continue;

    movements.push({
      label,
      previous: before,
      current: after,
      delta: after - before,
      percent: percentChange(before, after),
      status: !previous.has(label) ? "appeared" : !current.has(label) ? "disappeared" : "changed",
    });
  }

  // Biggest absolute movements first — that's what actually explains the
  // change in the total, regardless of how large a percentage looks on a
  // small base.
  return movements.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function buildVariationChart(
  movements: CategoryMovement[],
  categoryName: string,
  metricName: string,
  locale: Locale,
  text: CompareText
): ChartSpec | null {
  const shown = movements.slice(0, 8).filter((m) => m.delta !== 0);
  if (shown.length === 0) return null;

  const leader = shown[0];
  return {
    kind: "bar",
    title: text.variationTitle(metricName, categoryName),
    insight:
      leader.status === "appeared"
        ? text.leaderAppeared(leader.label, formatNumber(leader.current, locale))
        : leader.status === "disappeared"
          ? text.leaderDisappeared(leader.label, formatNumber(leader.previous, locale))
          : text.leaderExplains(leader.label, signed(leader.delta, locale), signedPercent(leader.percent, locale)),
    labels: shown.map((m) => m.label),
    values: shown.map((m) => m.delta),
    seriesLabel: text.variationSeries(metricName),
    palette: shown.map((m) => (m.delta >= 0 ? POSITIVE : NEGATIVE)),
  };
}

function buildSideBySideTable(
  movements: CategoryMovement[],
  categoryName: string,
  metricName: string,
  locale: Locale,
  text: CompareText
): ChartSpec {
  const shown = movements.slice(0, MAX_MOVEMENTS);
  return {
    kind: "table",
    title: text.beforeAfterTitle(metricName, categoryName),
    insight: text.beforeAfterInsight(shown.length),
    columns: [categoryName, text.tableColumns.before, text.tableColumns.after, text.tableColumns.delta, text.tableColumns.percent],
    rows: shown.map((m) => [
      m.status === "appeared"
        ? `${m.label} (${text.markerNew})`
        : m.status === "disappeared"
          ? `${m.label} (${text.markerGone})`
          : m.label,
      formatNumber(m.previous, locale),
      formatNumber(m.current, locale),
      signed(m.delta, locale),
      signedPercent(m.percent, locale),
    ]),
  };
}

// Only worth scanning columns with a bounded set of values: a column of
// invoice numbers "gains" thousands of values every month, which says
// nothing, while a region or status list changing is a real event.
const MAX_DRIFT_CARDINALITY = 40;

function distinctValues(rows: Record<string, unknown>[], name: string): Set<string> {
  const values = new Set<string>();
  for (const row of rows) {
    const raw = row[name];
    if (raw === null || raw === undefined) continue;
    const text = String(raw).trim();
    if (text !== "") values.add(text);
  }
  return values;
}

function buildValueDrift(
  sharedCategories: ColumnProfile[],
  previousRows: Record<string, unknown>[],
  currentRows: Record<string, unknown>[]
): ValueDrift[] {
  const drift: ValueDrift[] = [];

  for (const column of sharedCategories) {
    const before = distinctValues(previousRows, column.name);
    const after = distinctValues(currentRows, column.name);
    if (before.size > MAX_DRIFT_CARDINALITY || after.size > MAX_DRIFT_CARDINALITY) continue;

    const appeared = [...after].filter((v) => !before.has(v));
    const disappeared = [...before].filter((v) => !after.has(v));
    if (appeared.length > 0 || disappeared.length > 0) {
      drift.push({ column: column.name, appeared, disappeared });
    }
  }

  return drift;
}

function buildHighlights(
  result: Omit<ComparisonResult, "highlights" | "charts">,
  locale: Locale,
  text: CompareText
): string[] {
  const highlights: string[] = [];
  const { rowCount, metrics, category, structure } = result;

  const rowDelta = rowCount.current - rowCount.previous;
  highlights.push(
    rowDelta === 0
      ? text.sameRowCount(formatNumber(rowCount.current, locale))
      : text.rowCountChanged(formatNumber(rowCount.current, locale), signed(rowDelta, locale))
  );

  for (const metric of metrics.slice(0, 3)) {
    highlights.push(
      metric.delta === 0
        ? text.metricStable(metric.name, formatNumber(metric.current, locale))
        : text.metricMoved(
            metric.name,
            metric.delta > 0 ? text.up : text.down,
            signedPercent(metric.percent, locale),
            signed(metric.delta, locale),
            formatNumber(metric.previous, locale),
            formatNumber(metric.current, locale)
          )
    );
  }

  if (category) {
    const appeared = category.movements.filter((m) => m.status === "appeared");
    const disappeared = category.movements.filter((m) => m.status === "disappeared");
    const top = category.movements.find((m) => m.status === "changed" && m.delta !== 0);

    if (top) {
      highlights.push(
        text.topMover(category.name.toLowerCase(), top.label, signed(top.delta, locale), signedPercent(top.percent, locale))
      );
    }
    if (appeared.length > 0) {
      highlights.push(
        text.appearedInCategory(
          appeared.length,
          category.name.toLowerCase(),
          appeared.slice(0, 3).map((m) => `"${m.label}"`).join(", ")
        )
      );
    }
    if (disappeared.length > 0) {
      highlights.push(
        text.disappearedInCategory(
          disappeared.length,
          category.name.toLowerCase(),
          disappeared.slice(0, 3).map((m) => `"${m.label}"`).join(", ")
        )
      );
    }
  }

  // Values that vanish or show up matter whichever column they live in — a
  // whole region dropping out of the file is worth flagging even when the
  // headline breakdown was built on another column.
  for (const drift of result.valueDrift) {
    // The headline column already had its own appeared/disappeared lines.
    if (category && drift.column === category.name) continue;
    if (drift.appeared.length > 0) {
      highlights.push(
        text.newValues(drift.column, drift.appeared.slice(0, 4).map((v) => `"${v}"`).join(", "), drift.appeared.length > 4)
      );
    }
    if (drift.disappeared.length > 0) {
      highlights.push(
        text.missingValues(drift.column, drift.disappeared.slice(0, 4).map((v) => `"${v}"`).join(", "), drift.disappeared.length > 4)
      );
    }
  }

  // Structural drift matters: a renamed or dropped column silently changes
  // what the figures above even mean.
  if (structure.added.length > 0) {
    highlights.push(text.columnsAdded(structure.added.join(", ")));
  }
  if (structure.removed.length > 0) {
    highlights.push(text.columnsRemoved(structure.removed.join(", ")));
  }

  return highlights;
}

export async function compareWorkbooks(
  previousBuffer: Buffer,
  currentBuffer: Buffer,
  previousName: string,
  currentName: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<ComparisonResult> {
  const text = compareText(locale);
  const previous = parseBestTable(previousBuffer);
  const current = parseBestTable(currentBuffer);

  const previousColumns = profileColumns(previous.rows, previous.headers);
  const currentColumns = profileColumns(current.rows, current.headers);

  const previousNames = new Set(previous.headers);
  const currentNames = new Set(current.headers);
  const structure = {
    added: current.headers.filter((h) => !previousNames.has(h)),
    removed: previous.headers.filter((h) => !currentNames.has(h)),
  };

  const shared = currentColumns.filter((c) => previousNames.has(c.name));
  if (shared.length === 0) {
    throw new Error(text.noSharedColumns);
  }

  const sharedMetrics = shared.filter((c) => c.type === "numeric" && !c.isIdLike);
  const metrics: MetricChange[] = sharedMetrics
    .slice()
    .sort((a, b) => scoreMetricColumn(b) - scoreMetricColumn(a))
    .slice(0, 4)
    .map((column) => {
      const before = totalFor(previous.rows, column.name);
      const after = totalFor(current.rows, column.name);
      return { name: column.name, previous: before, current: after, delta: after - before, percent: percentChange(before, after) };
    });

  const sharedCategories = shared.filter((c) => c.type === "categorical" && !c.isIdLike);
  const category = bestOf(sharedCategories, scoreCategoryColumn);
  const metric = bestOf(sharedMetrics, scoreMetricColumn);

  const charts: ChartSpec[] = [];
  let categoryBlock: ComparisonResult["category"] = null;

  if (category && metric) {
    const movements = buildMovements(category, metric, previous.rows, current.rows);
    categoryBlock = { name: category.name, metricName: metric.name, movements };

    const variation = buildVariationChart(movements, category.name, metric.name, locale, text);
    if (variation) charts.push(variation);
    if (movements.length > 0) charts.push(buildSideBySideTable(movements, category.name, metric.name, locale, text));
  }

  const base = {
    currentName,
    previousName,
    rowCount: { previous: previous.rows.length, current: current.rows.length },
    metrics,
    category: categoryBlock,
    structure,
    valueDrift: buildValueDrift(sharedCategories, previous.rows, current.rows),
  };

  return { ...base, highlights: buildHighlights(base, locale, text), charts };
}
