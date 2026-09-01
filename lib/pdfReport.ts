import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { barChart, donutChart, heatmapChart, lineChart, scatterChart, CHART_HEIGHT, CHART_WIDTH } from "./svgCharts";
import type { AnalysisResult, ChartSpec, NumericStats, TableChart } from "./types";
import { formatNumber } from "./format";

const BRAND_NAME = "SheetInsight";
const GREEN = "#0a8a54";
const DARK = "#111827";
const GRAY = "#6b7280";
const LIGHT_BG = "#f3faf6";

const PAGE_MARGIN = 50;

// pdfkit treats any text placed below page.height - margins.bottom as an
// overflow and silently starts a new page to fit it. Footers live in that
// margin on purpose, so the bottom margin is zeroed for the duration of the
// call — the standard workaround for footers in pdfkit.
function drawFooter(doc: PDFKit.PDFDocument, pageLabel: string) {
  const bottom = doc.page.height - 34;
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc
    .fontSize(8)
    .fillColor(GRAY)
    .text(`${BRAND_NAME} — rapport généré automatiquement`, PAGE_MARGIN, bottom, {
      width: doc.page.width - PAGE_MARGIN * 2,
      align: "left",
      lineBreak: false,
    });
  doc.text(pageLabel, PAGE_MARGIN, bottom, {
    width: doc.page.width - PAGE_MARGIN * 2,
    align: "right",
    lineBreak: false,
  });
  doc.page.margins.bottom = originalBottomMargin;
}

function drawKpiCard(doc: PDFKit.PDFDocument, x: number, y: number, width: number, label: string, value: string) {
  const height = 60;
  doc.roundedRect(x, y, width, height, 8).fill(LIGHT_BG);
  doc
    .fontSize(16)
    .fillColor(GREEN)
    .font("Helvetica-Bold")
    .text(value, x + 12, y + 11, { width: width - 24, lineBreak: false, ellipsis: true });
  doc
    .fontSize(9)
    .fillColor(GRAY)
    .font("Helvetica")
    .text(label, x + 12, y + 34, { width: width - 24, lineBreak: false, ellipsis: true });
}

const TABLE_ROW_HEIGHT = 20;

function tableColumnLayout(chart: TableChart, x: number, width: number) {
  const firstColWidth = Math.min(Math.max(width * 0.38, 120), 220);
  const otherColWidth = (width - firstColWidth) / Math.max(1, chart.columns.length - 1);
  const colWidths = chart.columns.map((_, i) => (i === 0 ? firstColWidth : otherColWidth));
  const colX = chart.columns.map((_, i) => x + (i === 0 ? 0 : firstColWidth + (i - 1) * otherColWidth));
  return { colWidths, colX };
}

function estimateTableRowsHeight(chart: TableChart): number {
  return 24 + chart.rows.length * TABLE_ROW_HEIGHT;
}

function drawTable(doc: PDFKit.PDFDocument, chart: TableChart, x: number, width: number) {
  const { colWidths, colX } = tableColumnLayout(chart, x, width);

  // A plain `lineBreak: false` doesn't reliably suppress wrapping for text
  // that overflows the column width in pdfkit — it can still wrap onto a
  // second line, which then overlaps the next row since row spacing assumes
  // a single line. Constraining `height` to exactly one line height is the
  // pattern that reliably truncates with an ellipsis instead.
  doc.fontSize(9).font("Helvetica-Bold");
  const headerLineHeight = doc.currentLineHeight();
  doc.fillColor(GRAY);
  const headerY = doc.y;
  chart.columns.forEach((colName, i) => {
    doc.text(colName, colX[i], headerY, { width: colWidths[i] - 8, height: headerLineHeight, ellipsis: true });
  });
  doc.y = headerY;
  doc.moveDown(1);
  doc
    .moveTo(x, doc.y)
    .lineTo(x + width, doc.y)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.moveDown(0.3);

  doc.font("Helvetica").fontSize(9.5);
  const rowLineHeight = doc.currentLineHeight();
  chart.rows.forEach((row, rowIndex) => {
    const rowY = doc.y;
    if (rowIndex % 2 === 1) {
      doc.rect(x, rowY - 2, width, TABLE_ROW_HEIGHT - 2).fill(LIGHT_BG);
    }
    doc.fillColor(DARK);
    row.forEach((cell, i) => {
      doc.text(cell, colX[i], rowY, { width: colWidths[i] - 8, height: rowLineHeight, ellipsis: true });
    });
    doc.y = rowY;
    doc.moveDown(1.05);
  });
}

function chartToSvg(chart: ChartSpec): string {
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
      throw new Error("table charts are drawn directly, not as SVG");
  }
}

export async function generatePdfReport(analysis: AnalysisResult): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const contentWidth = doc.page.width - PAGE_MARGIN * 2;

  // ---------- Compact header ----------
  doc
    .fontSize(10)
    .fillColor(GREEN)
    .font("Helvetica-Bold")
    .text(BRAND_NAME.toUpperCase(), PAGE_MARGIN, PAGE_MARGIN, { characterSpacing: 1.5, continued: false });
  doc
    .fontSize(19)
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .text(`Rapport d'analyse — ${analysis.fileName}`, PAGE_MARGIN, doc.y + 4, { width: contentWidth });
  doc
    .fontSize(10)
    .fillColor(GRAY)
    .font("Helvetica")
    .text(
      `Feuille "${analysis.sheetName}"  •  ${formatNumber(analysis.rowCount)} lignes analysées  •  Généré le ${analysis.generatedAt.toLocaleDateString("fr-FR")}`,
      PAGE_MARGIN,
      doc.y + 2,
      { width: contentWidth }
    );
  doc
    .moveTo(PAGE_MARGIN, doc.y + 10)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.y + 10)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.y += 24;

  // ---------- Direct KPIs: the numbers that matter, spelled out ----------
  type Kpi = { label: string; value: string };
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
  const shownKpis = kpis.slice(0, 4);

  const kpiGap = 12;
  const kpiWidth = (contentWidth - kpiGap * (shownKpis.length - 1)) / shownKpis.length;
  const kpiY = doc.y;
  shownKpis.forEach((kpi, i) => {
    drawKpiCard(doc, PAGE_MARGIN + i * (kpiWidth + kpiGap), kpiY, kpiWidth, kpi.label, kpi.value);
  });
  doc.y = kpiY + 60 + 20;

  // ---------- Charts & tables ----------
  const scale = contentWidth / CHART_WIDTH;
  const renderedHeight = CHART_HEIGHT * scale;
  let pageIndex = 1;
  let chartOnPage = 0;
  for (const chart of analysis.charts) {
    // Measure this block precisely before drawing anything: pdfkit silently
    // starts a new page mid-draw if content overflows, which desyncs our
    // own page/footer numbering. Deciding up front avoids that.
    doc.fontSize(13).font("Helvetica-Bold");
    const titleHeight = doc.heightOfString(chart.title, { width: contentWidth });
    doc.fontSize(10).font("Helvetica-Oblique");
    const insightHeight = doc.heightOfString(chart.insight, { width: contentWidth, lineGap: 2 });
    const bodyHeight = chart.kind === "table" ? estimateTableRowsHeight(chart) : renderedHeight;
    const blockHeight = titleHeight + 5 + bodyHeight + 8 + insightHeight + 15 + 10;

    const availableHeight = doc.page.height - doc.page.margins.bottom - doc.y;
    if (chartOnPage > 0 && (chartOnPage >= 2 || blockHeight > availableHeight)) {
      drawFooter(doc, `Page ${pageIndex}`);
      pageIndex++;
      doc.addPage();
      chartOnPage = 0;
    }

    doc.fontSize(13).font("Helvetica-Bold").fillColor(DARK).text(chart.title, PAGE_MARGIN, doc.y, { width: contentWidth });
    doc.moveDown(0.3);

    if (chart.kind === "table") {
      drawTable(doc, chart, PAGE_MARGIN, contentWidth);
      doc.y += 8;
    } else {
      const svg = chartToSvg(chart);
      SVGtoPDF(doc, svg, PAGE_MARGIN, doc.y, { width: contentWidth, height: renderedHeight, preserveAspectRatio: "xMidYMid meet" });
      doc.y += renderedHeight + 8;
    }

    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .fillColor(GRAY)
      .text(chart.insight, PAGE_MARGIN, doc.y, { width: contentWidth, lineGap: 2 });
    doc.moveDown(1.2);

    chartOnPage++;
  }
  if (chartOnPage !== 0) {
    drawFooter(doc, `Page ${pageIndex}`);
  }

  doc.end();
  return done;
}
