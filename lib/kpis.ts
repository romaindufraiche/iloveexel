import type { AnalysisResult, NumericStats } from "./types";
import { formatNumber } from "./format";

export interface Kpi {
  label: string;
  value: string;
}

// The handful of direct, labeled numbers shown up top in every export
// format (PDF, PPTX, PNG) — e.g. "Total Montant_Total: 412 344" — instead
// of generic row/column counts, so the reader sees the answer immediately.
export function buildKpis(analysis: AnalysisResult): Kpi[] {
  const kpis: Kpi[] = [{ label: "Lignes analysées", value: formatNumber(analysis.rowCount) }];

  for (const metric of analysis.keyMetrics.slice(0, 3)) {
    const stats = metric.stats as NumericStats;
    kpis.push({ label: `Total ${metric.name}`, value: formatNumber(stats.sum) });
  }
  if (kpis.length < 3 && analysis.keyMetrics[0]) {
    const stats = analysis.keyMetrics[0].stats as NumericStats;
    kpis.push({ label: `Moyenne ${analysis.keyMetrics[0].name}`, value: formatNumber(stats.mean) });
  }
  if (kpis.length < 3) {
    kpis.push({ label: "Colonnes", value: String(analysis.columnCount) });
  }

  return kpis.slice(0, 4);
}
