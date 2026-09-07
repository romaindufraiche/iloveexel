import { barChart, donutChart, heatmapChart, lineChart, scatterChart, tableToSvg } from "./svgCharts";
import type { BarLineChart, ChartSpec, DonutChart } from "./types";

export type EditableChartKind = "bar" | "line" | "donut";

export function isTypeSwitchable(chart: ChartSpec): chart is BarLineChart | DonutChart {
  return chart.kind === "bar" || chart.kind === "line" || chart.kind === "donut";
}

export function renderChartSvg(chart: ChartSpec, typeOverride: EditableChartKind | undefined, palette: string[]): string {
  if (isTypeSwitchable(chart)) {
    const kind = typeOverride ?? chart.kind;
    const seriesLabel = "seriesLabel" in chart ? chart.seriesLabel : undefined;
    // A chart carrying its own palette means the colours are part of what it
    // says (a variation chart's red/green), so they outrank the reader's pick.
    const ownPalette = "palette" in chart ? chart.palette : undefined;
    if (kind === "line") return lineChart(chart.labels, chart.values, seriesLabel, palette[0]);
    if (kind === "donut") return donutChart(chart.labels, chart.values, palette);
    return barChart(chart.labels, chart.values, seriesLabel, ownPalette ?? palette);
  }
  if (chart.kind === "scatter") return scatterChart(chart.points, chart.xLabel, chart.yLabel);
  if (chart.kind === "heatmap") return heatmapChart(chart.rowLabels, chart.colLabels, chart.matrix, chart.displayMatrix, chart.colorScale);
  return tableToSvg(chart.columns, chart.rows);
}
