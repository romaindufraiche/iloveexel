import PptxGenJS from "pptxgenjs";
import type { AnalysisResult, ChartSpec } from "./types";
import { formatNumber } from "./format";
import { buildKpis } from "./kpis";

const BRAND_NAME = "SheetInsight";
const GREEN = "0a8a54";
const DARK = "111827";
const GRAY = "6b7280";
const LIGHT_BG = "f3faf6";
const PALETTE = ["0fa968", "2563eb", "f59e0b", "ef4444", "8b5cf6", "06b6d4", "ec4899", "84cc16"];

const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.5;
const CONTENT_W = SLIDE_W - MARGIN * 2;

function hexToDiverging(value: number, maxAbs: number): string {
  const t = Math.max(-1, Math.min(1, maxAbs ? value / maxAbs : 0));
  const lerp = (a: number[], b: number[], f: number) => a.map((c, i) => Math.round(c + (b[i] - c) * f));
  const RED = [239, 68, 68];
  const WHITE = [255, 255, 255];
  const GREEN_RGB = [15, 169, 104];
  const rgb = t < 0 ? lerp(WHITE, RED, -t) : lerp(WHITE, GREEN_RGB, t);
  return rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

function hexToSequential(value: number, maxAbs: number): string {
  const t = maxAbs ? Math.max(0, Math.min(1, value / maxAbs)) : 0;
  const from = [243, 250, 246];
  const to = [10, 138, 84];
  const rgb = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

// Bar/line/donut/scatter map to native, still-editable PowerPoint charts.
// Heatmaps and tables become native PPTX tables (with per-cell fill for the
// heatmap) since PowerPoint has no built-in heatmap chart type.
function addChartOrTableToSlide(pptx: PptxGenJS, slide: PptxGenJS.Slide, chart: ChartSpec, y: number, h: number) {
  const opts = { x: MARGIN, y, w: CONTENT_W, h };

  switch (chart.kind) {
    case "bar":
      slide.addChart(
        pptx.ChartType.bar,
        [{ name: chart.seriesLabel ?? chart.title, labels: chart.labels, values: chart.values }],
        { ...opts, chartColors: PALETTE, showLegend: false, showValue: true, dataLabelColor: DARK }
      );
      break;
    case "line":
      slide.addChart(
        pptx.ChartType.line,
        [{ name: chart.seriesLabel ?? chart.title, labels: chart.labels, values: chart.values }],
        { ...opts, chartColors: [GREEN], showLegend: false, lineSize: 2.5, lineSmooth: false }
      );
      break;
    case "donut":
      slide.addChart(pptx.ChartType.doughnut, [{ name: chart.title, labels: chart.labels, values: chart.values }], {
        ...opts,
        chartColors: PALETTE,
        showLegend: true,
        legendPos: "r",
        showPercent: true,
      });
      break;
    case "scatter":
      slide.addChart(
        pptx.ChartType.scatter,
        [
          { name: chart.xLabel, values: chart.points.map((p) => p.x) },
          { name: chart.yLabel, values: chart.points.map((p) => p.y) },
        ],
        { ...opts, chartColors: [GREEN], showLegend: false, lineSize: 0 }
      );
      break;
    case "heatmap": {
      const flat = chart.matrix.flat();
      const maxAbs = Math.max(...flat.map((v) => Math.abs(v)), 0.0001);
      const colorFor = (v: number) => (chart.colorScale === "diverging" ? hexToDiverging(v, maxAbs) : hexToSequential(v, maxAbs));
      const headerRow: PptxGenJS.TableRow = [
        { text: "", options: { fill: { color: "FFFFFF" } } },
        ...chart.colLabels.map((label): PptxGenJS.TableCell => ({
          text: label,
          options: { bold: true, color: GRAY, fill: { color: "FFFFFF" }, fontSize: 11 },
        })),
      ];
      const dataRows: PptxGenJS.TableRow[] = chart.rowLabels.map((rowLabel, r) => [
        { text: rowLabel, options: { bold: true, color: DARK, fill: { color: "FFFFFF" }, fontSize: 11 } },
        ...chart.matrix[r].map((v, c): PptxGenJS.TableCell => {
          const bg = colorFor(v);
          const brightness = parseInt(bg.slice(0, 2), 16);
          return {
            text: chart.displayMatrix[r][c],
            options: { fill: { color: bg }, color: brightness < 140 ? "FFFFFF" : DARK, fontSize: 11, align: "center" },
          };
        }),
      ]);
      slide.addTable([headerRow, ...dataRows], { x: MARGIN, y, w: CONTENT_W, h, fontFace: "Helvetica", valign: "middle" });
      break;
    }
    case "table": {
      const headerRow: PptxGenJS.TableRow = chart.columns.map((col): PptxGenJS.TableCell => ({
        text: col,
        options: { bold: true, color: GRAY, fill: { color: LIGHT_BG }, fontSize: 11 },
      }));
      const dataRows: PptxGenJS.TableRow[] = chart.rows.map((row, i): PptxGenJS.TableRow =>
        row.map((cell): PptxGenJS.TableCell => ({
          text: cell,
          options: { color: DARK, fill: { color: i % 2 === 1 ? LIGHT_BG : "FFFFFF" }, fontSize: 11 },
        }))
      );
      slide.addTable([headerRow, ...dataRows], { x: MARGIN, y, w: CONTENT_W, h, fontFace: "Helvetica", valign: "middle" });
      break;
    }
  }
}

export async function generatePptxReport(analysis: AnalysisResult): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "SHEETINSIGHT_16X9", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "SHEETINSIGHT_16X9";
  pptx.author = BRAND_NAME;
  pptx.title = `Rapport d'analyse — ${analysis.fileName}`;

  // ---------- Title slide ----------
  const cover = pptx.addSlide();
  cover.background = { color: GREEN };
  cover.addText(BRAND_NAME.toUpperCase(), {
    x: MARGIN,
    y: 0.4,
    w: CONTENT_W,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: "d6f9e2",
    charSpacing: 2,
    fontFace: "Helvetica",
  });
  cover.addText(`Rapport d'analyse — ${analysis.fileName}`, {
    x: MARGIN,
    y: 0.9,
    w: CONTENT_W,
    h: 1,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fontFace: "Helvetica",
  });
  cover.addText(
    `Feuille "${analysis.sheetName}"  •  ${formatNumber(analysis.rowCount)} lignes analysées  •  Généré le ${analysis.generatedAt.toLocaleDateString("fr-FR")}`,
    { x: MARGIN, y: 1.9, w: CONTENT_W, h: 0.5, fontSize: 14, color: "eafff4", fontFace: "Helvetica" }
  );

  const kpis = buildKpis(analysis);
  const kpiGap = 0.2;
  const kpiY = 2.9;
  const kpiH = 1.2;
  const kpiWidth = (CONTENT_W - kpiGap * (kpis.length - 1)) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = MARGIN + i * (kpiWidth + kpiGap);
    cover.addShape(pptx.ShapeType.roundRect, {
      x,
      y: kpiY,
      w: kpiWidth,
      h: kpiH,
      rectRadius: 0.08,
      fill: { color: LIGHT_BG },
      line: { color: LIGHT_BG },
    });
    cover.addText(kpi.value, {
      x: x + 0.15,
      y: kpiY + 0.12,
      w: kpiWidth - 0.3,
      h: 0.55,
      fontSize: 18,
      bold: true,
      color: GREEN,
      fontFace: "Helvetica",
      fit: "shrink",
    });
    cover.addText(kpi.label, {
      x: x + 0.15,
      y: kpiY + 0.68,
      w: kpiWidth - 0.3,
      h: 0.45,
      fontSize: 10,
      color: GRAY,
      fontFace: "Helvetica",
      fit: "shrink",
    });
  });

  // ---------- One slide per chart/table ----------
  for (const chart of analysis.charts) {
    const slide = pptx.addSlide();
    slide.addText(chart.title, {
      x: MARGIN,
      y: 0.35,
      w: CONTENT_W,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: DARK,
      fontFace: "Helvetica",
    });

    const chartTop = 1.05;
    const chartHeight = SLIDE_H - chartTop - 1.1;
    addChartOrTableToSlide(pptx, slide, chart, chartTop, chartHeight);

    slide.addText(chart.insight, {
      x: MARGIN,
      y: SLIDE_H - 1.0,
      w: CONTENT_W,
      h: 0.8,
      fontSize: 13,
      italic: true,
      color: GRAY,
      fontFace: "Helvetica",
    });
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(output) ? output : Buffer.from(output as ArrayBuffer);
}
