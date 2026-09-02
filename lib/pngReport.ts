import sharp from "sharp";
import type { AnalysisResult, ChartSpec } from "./types";
import { formatNumber } from "./format";
import { buildKpis } from "./kpis";
import {
  barChart,
  donutChart,
  escapeXml,
  heatmapChart,
  lineChart,
  scatterChart,
  tableToSvg,
  CHART_HEIGHT,
  CHART_WIDTH,
} from "./svgCharts";

const BRAND_NAME = "SheetInsight";
const GREEN = "#0a8a54";
const DARK = "#111827";
const GRAY = "#6b7280";
const LIGHT_BG = "#f3faf6";

const IMG_WIDTH = 900;
const MARGIN = 40;
const CONTENT_WIDTH = IMG_WIDTH - MARGIN * 2;
const HEADER_HEIGHT = 160;

// Chart generators return a standalone `<svg ...>...</svg>` document; strip
// the outer tag so the markup can be embedded inside our own positioned
// `<svg x y width height viewBox>` wrapper instead of nesting two <svg>
// root elements.
function stripSvgWrapper(svg: string): string {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

function chartToSvgAnyKind(chart: ChartSpec): string {
  switch (chart.kind) {
    case "bar":
      return barChart(chart.labels, chart.values, chart.seriesLabel);
    case "line":
      return lineChart(chart.labels, chart.values, chart.seriesLabel);
    case "donut":
      return donutChart(chart.labels, chart.values);
    case "scatter":
      return scatterChart(chart.points, chart.xLabel, chart.yLabel);
    case "heatmap":
      return heatmapChart(chart.rowLabels, chart.colLabels, chart.matrix, chart.displayMatrix, chart.colorScale);
    case "table":
      return tableToSvg(chart.columns, chart.rows);
  }
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// A single shareable image (KPIs + the most important chart) — meant for
// dropping into Slack/WhatsApp/email, not a substitute for the full
// multi-chart PDF report.
export async function generatePngReport(analysis: AnalysisResult): Promise<Buffer> {
  const kpis = buildKpis(analysis);
  const primaryChart = analysis.charts[0];

  const kpiY = HEADER_HEIGHT + 30;
  const kpiHeight = 78;
  const kpiGap = 14;
  const kpiWidth = (CONTENT_WIDTH - kpiGap * (kpis.length - 1)) / kpis.length;

  let kpiSvg = "";
  kpis.forEach((kpi, i) => {
    const x = MARGIN + i * (kpiWidth + kpiGap);
    kpiSvg += `<rect x="${x}" y="${kpiY}" width="${kpiWidth}" height="${kpiHeight}" rx="10" fill="${LIGHT_BG}" />`;
    kpiSvg += `<text x="${x + 16}" y="${kpiY + 32}" font-size="20" font-weight="bold" fill="${GREEN}" font-family="Helvetica">${escapeXml(
      kpi.value
    )}</text>`;
    kpiSvg += `<text x="${x + 16}" y="${kpiY + 56}" font-size="12" fill="${GRAY}" font-family="Helvetica">${escapeXml(
      kpi.label
    )}</text>`;
  });

  const chartTitleY = kpiY + kpiHeight + 44;
  const chartY = chartTitleY + 16;
  const chartScale = CONTENT_WIDTH / CHART_WIDTH;
  const chartRenderedHeight = CHART_HEIGHT * chartScale;

  const insightLines = primaryChart ? wrapText(primaryChart.insight, 95) : [];
  const insightY = chartY + chartRenderedHeight + 34;
  const insightSvg = insightLines
    .map(
      (line, i) =>
        `<text x="${MARGIN}" y="${insightY + i * 20}" font-size="14" font-style="italic" fill="${GRAY}" font-family="Helvetica">${escapeXml(
          line
        )}</text>`
    )
    .join("");

  const footerY = insightY + insightLines.length * 20 + 30;
  const totalHeight = footerY + 30;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_WIDTH}" height="${totalHeight}" viewBox="0 0 ${IMG_WIDTH} ${totalHeight}">
    <rect x="0" y="0" width="${IMG_WIDTH}" height="${totalHeight}" fill="#ffffff" />
    <rect x="0" y="0" width="${IMG_WIDTH}" height="${HEADER_HEIGHT}" fill="${GREEN}" />
    <text x="${MARGIN}" y="40" font-size="13" font-weight="bold" fill="#d6f9e2" font-family="Helvetica" letter-spacing="2">${escapeXml(
      BRAND_NAME.toUpperCase()
    )}</text>
    <text x="${MARGIN}" y="76" font-size="24" font-weight="bold" fill="#ffffff" font-family="Helvetica">${escapeXml(
      `Rapport d'analyse — ${analysis.fileName}`
    )}</text>
    <text x="${MARGIN}" y="106" font-size="13" fill="#eafff4" font-family="Helvetica">${escapeXml(
      `Feuille "${analysis.sheetName}" • ${formatNumber(analysis.rowCount)} lignes • Généré le ${analysis.generatedAt.toLocaleDateString("fr-FR")}`
    )}</text>
    ${kpiSvg}
    ${
      primaryChart
        ? `<text x="${MARGIN}" y="${chartTitleY}" font-size="17" font-weight="bold" fill="${DARK}" font-family="Helvetica">${escapeXml(
            primaryChart.title
          )}</text>
    <svg x="${MARGIN}" y="${chartY}" width="${CONTENT_WIDTH}" height="${chartRenderedHeight}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">${stripSvgWrapper(
            chartToSvgAnyKind(primaryChart)
          )}</svg>`
        : ""
    }
    ${insightSvg}
    <text x="${MARGIN}" y="${footerY}" font-size="11" fill="${GRAY}" font-family="Helvetica">${escapeXml(
      `${BRAND_NAME} — rapport généré automatiquement`
    )}</text>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
