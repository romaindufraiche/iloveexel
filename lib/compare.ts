import { formatNumber } from "./format";
import {
  parseBestTable,
  profileColumns,
  sumMetricByCategory,
  scoreMetricColumn,
  scoreCategoryColumn,
} from "./analyzer";
import type { ChartSpec, ColumnProfile } from "./types";

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

function signed(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function signedPercent(percent: number | null): string {
  return percent === null ? "n/a" : `${percent >= 0 ? "+" : ""}${formatNumber(percent)} %`;
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

function buildVariationChart(movements: CategoryMovement[], categoryName: string, metricName: string): ChartSpec | null {
  const shown = movements.slice(0, 8).filter((m) => m.delta !== 0);
  if (shown.length === 0) return null;

  const leader = shown[0];
  return {
    kind: "bar",
    title: `Variation de ${metricName} par ${categoryName}`,
    insight:
      leader.status === "appeared"
        ? `"${leader.label}" apparaît dans le fichier récent (${formatNumber(leader.current)}).`
        : leader.status === "disappeared"
          ? `"${leader.label}" a disparu du fichier récent (${formatNumber(leader.previous)} auparavant).`
          : `"${leader.label}" explique le plus gros écart : ${signed(leader.delta)} (${signedPercent(leader.percent)}).`,
    labels: shown.map((m) => m.label),
    values: shown.map((m) => m.delta),
    seriesLabel: `Écart de ${metricName}`,
    palette: shown.map((m) => (m.delta >= 0 ? POSITIVE : NEGATIVE)),
  };
}

function buildSideBySideTable(movements: CategoryMovement[], categoryName: string, metricName: string): ChartSpec {
  const shown = movements.slice(0, MAX_MOVEMENTS);
  return {
    kind: "table",
    title: `${metricName} : avant / après par ${categoryName}`,
    insight: `Les ${shown.length} plus gros mouvements, du plus important au plus faible.`,
    columns: [categoryName, "Avant", "Après", "Écart", "%"],
    rows: shown.map((m) => [
      m.status === "appeared" ? `${m.label} (nouveau)` : m.status === "disappeared" ? `${m.label} (disparu)` : m.label,
      formatNumber(m.previous),
      formatNumber(m.current),
      signed(m.delta),
      signedPercent(m.percent),
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

function buildHighlights(result: Omit<ComparisonResult, "highlights" | "charts">): string[] {
  const highlights: string[] = [];
  const { rowCount, metrics, category, structure } = result;

  const rowDelta = rowCount.current - rowCount.previous;
  highlights.push(
    rowDelta === 0
      ? `Les deux fichiers comptent ${formatNumber(rowCount.current)} lignes.`
      : `Le fichier récent compte ${formatNumber(rowCount.current)} lignes, soit ${signed(rowDelta)} par rapport au précédent.`
  );

  for (const metric of metrics.slice(0, 3)) {
    const direction = metric.delta > 0 ? "progresse" : metric.delta < 0 ? "recule" : "est stable";
    highlights.push(
      metric.delta === 0
        ? `${metric.name} est stable à ${formatNumber(metric.current)}.`
        : `${metric.name} ${direction} de ${signedPercent(metric.percent)} (${signed(metric.delta)}), passant de ${formatNumber(metric.previous)} à ${formatNumber(metric.current)}.`
    );
  }

  if (category) {
    const appeared = category.movements.filter((m) => m.status === "appeared");
    const disappeared = category.movements.filter((m) => m.status === "disappeared");
    const top = category.movements.find((m) => m.status === "changed" && m.delta !== 0);

    if (top) {
      highlights.push(
        `Sur ${category.name.toLowerCase()}, "${top.label}" pèse le plus dans l'écart : ${signed(top.delta)} (${signedPercent(top.percent)}).`
      );
    }
    if (appeared.length > 0) {
      highlights.push(
        `${appeared.length} valeur(s) de ${category.name.toLowerCase()} apparaissent dans le fichier récent : ${appeared.slice(0, 3).map((m) => `"${m.label}"`).join(", ")}.`
      );
    }
    if (disappeared.length > 0) {
      highlights.push(
        `${disappeared.length} valeur(s) de ${category.name.toLowerCase()} ont disparu : ${disappeared.slice(0, 3).map((m) => `"${m.label}"`).join(", ")}.`
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
        `Nouvelles valeurs dans "${drift.column}" : ${drift.appeared.slice(0, 4).map((v) => `"${v}"`).join(", ")}${drift.appeared.length > 4 ? "…" : ""}.`
      );
    }
    if (drift.disappeared.length > 0) {
      highlights.push(
        `Valeurs absentes du fichier récent dans "${drift.column}" : ${drift.disappeared.slice(0, 4).map((v) => `"${v}"`).join(", ")}${drift.disappeared.length > 4 ? "…" : ""}.`
      );
    }
  }

  // Structural drift matters: a renamed or dropped column silently changes
  // what the figures above even mean.
  if (structure.added.length > 0) {
    highlights.push(`Colonne(s) présente(s) uniquement dans le fichier récent : ${structure.added.join(", ")}.`);
  }
  if (structure.removed.length > 0) {
    highlights.push(`Colonne(s) présente(s) uniquement dans le fichier précédent : ${structure.removed.join(", ")}.`);
  }

  return highlights;
}

export async function compareWorkbooks(
  previousBuffer: Buffer,
  currentBuffer: Buffer,
  previousName: string,
  currentName: string
): Promise<ComparisonResult> {
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
    throw new Error(
      "Ces deux fichiers n'ont aucune colonne en commun : la comparaison n'a pas de sens. Vérifiez qu'il s'agit bien du même export à deux périodes."
    );
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

    const variation = buildVariationChart(movements, category.name, metric.name);
    if (variation) charts.push(variation);
    if (movements.length > 0) charts.push(buildSideBySideTable(movements, category.name, metric.name));
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

  return { ...base, highlights: buildHighlights(base), charts };
}
