import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { barChart, donutChart, lineChart, CHART_HEIGHT, CHART_WIDTH } from "./svgCharts";
import type { AnalysisResult, ColumnProfile } from "./types";
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

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(16).fillColor(DARK).font("Helvetica-Bold").text(title, PAGE_MARGIN, doc.y, { paragraphGap: 4 });
  const y = doc.y;
  doc
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_MARGIN + 40, y)
    .lineWidth(3)
    .strokeColor(GREEN)
    .stroke();
  doc.moveDown(0.8);
}

function drawKpiCard(doc: PDFKit.PDFDocument, x: number, y: number, width: number, label: string, value: string) {
  const height = 56;
  doc.roundedRect(x, y, width, height, 8).fill(LIGHT_BG);
  doc
    .fontSize(15)
    .fillColor(GREEN)
    .font("Helvetica-Bold")
    .text(value, x + 12, y + 10, { width: width - 24 });
  doc
    .fontSize(9)
    .fillColor(GRAY)
    .font("Helvetica")
    .text(label, x + 12, y + 32, { width: width - 24 });
}

function columnTypeLabel(type: string): string {
  switch (type) {
    case "numeric":
      return "Numérique";
    case "date":
      return "Date";
    case "categorical":
      return "Catégorielle";
    case "boolean":
      return "Booléenne";
    default:
      return "Texte";
  }
}

function missingCountOf(column: ColumnProfile): number {
  return "missing" in column.stats ? column.stats.missing : 0;
}

export async function generatePdfReport(analysis: AnalysisResult): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const contentWidth = doc.page.width - PAGE_MARGIN * 2;

  // ---------- Cover page ----------
  doc.rect(0, 0, doc.page.width, 230).fill(GREEN);
  doc
    .fontSize(12)
    .fillColor("#d6f9e2")
    .font("Helvetica-Bold")
    .text(BRAND_NAME.toUpperCase(), PAGE_MARGIN, 60, { characterSpacing: 2 });
  doc
    .fontSize(28)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text("Rapport d'analyse de données", PAGE_MARGIN, 90, { width: contentWidth });
  doc
    .fontSize(12)
    .fillColor("#eafff4")
    .font("Helvetica")
    .text(`Fichier analysé : ${analysis.fileName}`, PAGE_MARGIN, 160, { width: contentWidth });
  doc.text(`Feuille : ${analysis.sheetName}  •  Généré le ${analysis.generatedAt.toLocaleDateString("fr-FR")}`, PAGE_MARGIN, doc.y, {
    width: contentWidth,
  });

  const kpiY = 260;
  const kpiWidth = (contentWidth - 24) / 3;
  drawKpiCard(doc, PAGE_MARGIN, kpiY, kpiWidth, "Lignes analysées", formatNumber(analysis.rowCount));
  drawKpiCard(doc, PAGE_MARGIN + kpiWidth + 12, kpiY, kpiWidth, "Colonnes", String(analysis.columnCount));
  drawKpiCard(
    doc,
    PAGE_MARGIN + (kpiWidth + 12) * 2,
    kpiY,
    kpiWidth,
    "Indicateurs clés détectés",
    String(analysis.keyMetrics.length)
  );

  doc.y = kpiY + 80;
  drawSectionTitle(doc, "Résumé");
  doc
    .fontSize(11)
    .fillColor(DARK)
    .font("Helvetica")
    .text(
      `Ce rapport a été généré automatiquement à partir de votre fichier Excel. Notre moteur d'analyse a identifié le type de chaque colonne, détecté les indicateurs les plus pertinents, et sélectionné les graphiques les plus adaptés pour comprendre vos données — sans configuration de votre part.`,
      PAGE_MARGIN,
      doc.y,
      { width: contentWidth, lineGap: 3 }
    );
  drawFooter(doc, "Page 1");

  // ---------- Executive summary ----------
  doc.addPage();
  drawSectionTitle(doc, "Points clés");
  doc.fontSize(11).font("Helvetica").fillColor(DARK);
  for (const line of analysis.narrative) {
    doc.circle(PAGE_MARGIN + 3, doc.y + 6, 2).fill(GREEN);
    doc.fillColor(DARK).text(line, PAGE_MARGIN + 14, doc.y - 2, { width: contentWidth - 14, lineGap: 2 });
    doc.moveDown(0.4);
  }

  doc.moveDown(0.8);
  drawSectionTitle(doc, "Recommandations");
  doc.fontSize(11).font("Helvetica");
  for (const rec of analysis.recommendations) {
    doc.circle(PAGE_MARGIN + 3, doc.y + 6, 2).fill("#f59e0b");
    doc.fillColor(DARK).text(rec, PAGE_MARGIN + 14, doc.y - 2, { width: contentWidth - 14, lineGap: 2 });
    doc.moveDown(0.4);
  }
  drawFooter(doc, "Page 2");

  // ---------- Charts ----------
  let pageIndex = 3;
  let chartOnPage = 0;
  for (const chart of analysis.charts) {
    if (chartOnPage === 0) {
      doc.addPage();
    }
    const svg =
      chart.kind === "bar"
        ? barChart(chart.labels, chart.values, chart.seriesLabel)
        : chart.kind === "line"
          ? lineChart(chart.labels, chart.values, chart.seriesLabel)
          : donutChart(chart.labels, chart.values);

    doc.fontSize(13).font("Helvetica-Bold").fillColor(DARK).text(chart.title, PAGE_MARGIN, doc.y, { width: contentWidth });
    doc.moveDown(0.3);
    const scale = contentWidth / CHART_WIDTH;
    const renderedHeight = CHART_HEIGHT * scale;
    SVGtoPDF(doc, svg, PAGE_MARGIN, doc.y, { width: contentWidth, height: renderedHeight, preserveAspectRatio: "xMidYMid meet" });
    doc.y += renderedHeight + 8;
    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .fillColor(GRAY)
      .text(chart.insight, PAGE_MARGIN, doc.y, { width: contentWidth, lineGap: 2 });
    doc.moveDown(1.2);

    chartOnPage++;
    if (chartOnPage >= 2 || doc.y > doc.page.height - 260) {
      drawFooter(doc, `Page ${pageIndex}`);
      pageIndex++;
      chartOnPage = 0;
    }
  }
  if (chartOnPage !== 0) {
    drawFooter(doc, `Page ${pageIndex}`);
    pageIndex++;
  }

  // ---------- Column detail / data quality ----------
  doc.addPage();
  drawSectionTitle(doc, "Qualité des données par colonne");
  const colX = [PAGE_MARGIN, PAGE_MARGIN + 190, PAGE_MARGIN + 290, PAGE_MARGIN + 390];
  doc.fontSize(9).font("Helvetica-Bold").fillColor(GRAY);
  const headerY = doc.y;
  doc.text("Colonne", colX[0], headerY, { width: 180, lineBreak: false });
  doc.text("Type", colX[1], headerY, { width: 90, lineBreak: false });
  doc.text("Manquantes", colX[2], headerY, { width: 100, lineBreak: false });
  doc.text("Uniques", colX[3], headerY, { width: contentWidth - (colX[3] - PAGE_MARGIN), lineBreak: false });
  doc.y = headerY;
  doc.moveDown(1);
  doc
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(PAGE_MARGIN + contentWidth, doc.y)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.moveDown(0.3);

  doc.font("Helvetica").fontSize(9.5).fillColor(DARK);
  for (const col of analysis.columns) {
    if (doc.y > doc.page.height - 90) {
      drawFooter(doc, `Page ${pageIndex}`);
      pageIndex++;
      doc.addPage();
      drawSectionTitle(doc, "Qualité des données par colonne (suite)");
      doc.font("Helvetica").fontSize(9.5).fillColor(DARK);
    }
    const missing = missingCountOf(col);
    const missingPct = analysis.rowCount ? formatNumber((missing / analysis.rowCount) * 100) : "0";
    const unique =
      col.stats.type === "categorical" || col.stats.type === "text" ? String(col.stats.uniqueCount) : "—";
    const y = doc.y;
    doc.text(col.name.length > 30 ? `${col.name.slice(0, 29)}…` : col.name, colX[0], y, { width: 180, lineBreak: false });
    doc.text(columnTypeLabel(col.type), colX[1], y, { width: 90, lineBreak: false });
    doc.text(`${missing} (${missingPct}%)`, colX[2], y, { width: 100, lineBreak: false });
    doc.text(unique, colX[3], y, { width: contentWidth - (colX[3] - PAGE_MARGIN), lineBreak: false });
    doc.moveDown(1.1);
  }
  drawFooter(doc, `Page ${pageIndex}`);

  doc.end();
  return done;
}
