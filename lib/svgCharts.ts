const PALETTE = ["#0fa968", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export { PALETTE };

// A few curated alternate palettes offered in the chart editor's color
// picker, all built by rotating the same 8 hues so any chart kind (bar,
// donut...) still gets 8 distinguishable colors.
export const PALETTE_PRESETS: { name: string; colors: string[] }[] = [
  { name: "Vert", colors: PALETTE },
  { name: "Bleu", colors: ["#2563eb", "#0fa968", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"] },
  { name: "Violet", colors: ["#8b5cf6", "#ec4899", "#0fa968", "#2563eb", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"] },
  { name: "Contrasté", colors: ["#111827", "#ef4444", "#f59e0b", "#0fa968", "#2563eb", "#8b5cf6", "#ec4899", "#06b6d4"] },
];

export const CHART_WIDTH = 520;
export const CHART_HEIGHT = 300;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function truncate(label: string, max = 12): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

// A table rendered as SVG at the same fixed canvas size as the other
// charts, so any chart kind (including "table") can be embedded uniformly
// in the single-image PNG export.
export function tableToSvg(columns: string[], rows: string[][]): string {
  const marginLeft = 12;
  const marginRight = 12;
  const marginTop = 14;
  const usableWidth = CHART_WIDTH - marginLeft - marginRight;
  const maxRows = 8;
  const shownRows = rows.slice(0, maxRows);
  const rowHeight = Math.min(28, (CHART_HEIGHT - marginTop - 24) / (shownRows.length + 1));
  const firstColWidth = Math.min(Math.max(usableWidth * 0.4, 100), 220);
  const otherColWidth = (usableWidth - firstColWidth) / Math.max(1, columns.length - 1);
  const colX = columns.map((_, i) => marginLeft + (i === 0 ? 0 : firstColWidth + (i - 1) * otherColWidth));

  let headerSvg = "";
  columns.forEach((col, i) => {
    headerSvg += `<text x="${colX[i]}" y="${marginTop + 12}" font-size="11" font-weight="bold" fill="#6b7280" font-family="Helvetica">${escapeXml(
      truncate(col, i === 0 ? 26 : 16)
    )}</text>`;
  });

  let rowsSvg = "";
  shownRows.forEach((row, r) => {
    const y = marginTop + 22 + r * rowHeight;
    if (r % 2 === 1) {
      rowsSvg += `<rect x="${marginLeft}" y="${y - rowHeight + 8}" width="${usableWidth}" height="${rowHeight - 2}" fill="#f3faf6" />`;
    }
    row.forEach((cell, i) => {
      rowsSvg += `<text x="${colX[i]}" y="${y}" font-size="10.5" fill="#111827" font-family="Helvetica">${escapeXml(
        truncate(cell, i === 0 ? 28 : 16)
      )}</text>`;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">
    <rect x="0" y="0" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="#ffffff" />
    ${headerSvg}
    <line x1="${marginLeft}" y1="${marginTop + 18}" x2="${CHART_WIDTH - marginRight}" y2="${marginTop + 18}" stroke="#e5e7eb" />
    ${rowsSvg}
  </svg>`;
}

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function barChart(labels: string[], values: number[], seriesLabel = "", palette: string[] = PALETTE): string {
  const marginLeft = 56;
  const marginRight = 20;
  const marginTop = 24;
  const marginBottom = 64;
  const plotWidth = CHART_WIDTH - marginLeft - marginRight;
  const plotHeight = CHART_HEIGHT - marginTop - marginBottom;
  const maxValue = niceMax(Math.max(...values, 1));
  const gridLines = 4;
  const barGap = plotWidth / values.length;
  const barWidth = Math.min(48, barGap * 0.6);

  let gridSvg = "";
  for (let i = 0; i <= gridLines; i++) {
    const y = marginTop + plotHeight - (i / gridLines) * plotHeight;
    const value = (i / gridLines) * maxValue;
    gridSvg += `<line x1="${marginLeft}" y1="${y}" x2="${CHART_WIDTH - marginRight}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    gridSvg += `<text x="${marginLeft - 8}" y="${y + 4}" font-size="10" fill="#6b7280" text-anchor="end" font-family="Helvetica">${escapeXml(
      formatShort(value)
    )}</text>`;
  }

  let barsSvg = "";
  values.forEach((value, i) => {
    const x = marginLeft + i * barGap + (barGap - barWidth) / 2;
    const barHeight = (value / maxValue) * plotHeight;
    const y = marginTop + plotHeight - barHeight;
    const color = palette[i % palette.length];
    barsSvg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(barHeight, 0.5)}" rx="3" fill="${color}" />`;
    barsSvg += `<text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" fill="#111827" text-anchor="middle" font-family="Helvetica">${escapeXml(
      formatShort(value)
    )}</text>`;
    const labelX = x + barWidth / 2;
    const labelY = marginTop + plotHeight + 16;
    barsSvg += `<text x="${labelX}" y="${labelY}" font-size="9.5" fill="#374151" text-anchor="middle" font-family="Helvetica" transform="rotate(20 ${labelX} ${labelY})">${escapeXml(
      truncate(labels[i], 14)
    )}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">
    <rect x="0" y="0" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="#ffffff" />
    ${gridSvg}
    ${barsSvg}
    <line x1="${marginLeft}" y1="${marginTop + plotHeight}" x2="${CHART_WIDTH - marginRight}" y2="${marginTop + plotHeight}" stroke="#9ca3af" stroke-width="1" />
  </svg>`;
}

export function lineChart(labels: string[], values: number[], seriesLabel = "", accentColor = "#0a8a54"): string {
  const marginLeft = 56;
  const marginRight = 20;
  const marginTop = 24;
  const marginBottom = 56;
  const plotWidth = CHART_WIDTH - marginLeft - marginRight;
  const plotHeight = CHART_HEIGHT - marginTop - marginBottom;
  const maxValue = niceMax(Math.max(...values, 1));
  const minValue = Math.min(0, Math.min(...values));
  const range = maxValue - minValue || 1;
  const gridLines = 4;
  const stepX = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  let gridSvg = "";
  for (let i = 0; i <= gridLines; i++) {
    const y = marginTop + plotHeight - (i / gridLines) * plotHeight;
    const value = minValue + (i / gridLines) * range;
    gridSvg += `<line x1="${marginLeft}" y1="${y}" x2="${CHART_WIDTH - marginRight}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    gridSvg += `<text x="${marginLeft - 8}" y="${y + 4}" font-size="10" fill="#6b7280" text-anchor="end" font-family="Helvetica">${escapeXml(
      formatShort(value)
    )}</text>`;
  }

  const points = values.map((v, i) => {
    const x = marginLeft + i * stepX;
    const y = marginTop + plotHeight - ((v - minValue) / range) * plotHeight;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${marginTop + plotHeight} L ${points[0].x.toFixed(1)} ${
    marginTop + plotHeight
  } Z`;

  let pointsSvg = "";
  points.forEach((p, i) => {
    pointsSvg += `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${accentColor}" />`;
    if (i % Math.ceil(points.length / 8 || 1) === 0 || i === points.length - 1) {
      const labelY = marginTop + plotHeight + 16;
      pointsSvg += `<text x="${p.x}" y="${labelY}" font-size="9.5" fill="#374151" text-anchor="middle" font-family="Helvetica" transform="rotate(20 ${p.x} ${labelY})">${escapeXml(
        truncate(labels[i], 14)
      )}</text>`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">
    <rect x="0" y="0" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="#ffffff" />
    ${gridSvg}
    <path d="${areaD}" fill="${accentColor}" fill-opacity="0.12" stroke="none" />
    <path d="${pathD}" fill="none" stroke="${accentColor}" stroke-width="2.5" />
    ${pointsSvg}
    <line x1="${marginLeft}" y1="${marginTop + plotHeight}" x2="${CHART_WIDTH - marginRight}" y2="${marginTop + plotHeight}" stroke="#9ca3af" stroke-width="1" />
  </svg>`;
}

export function donutChart(labels: string[], values: number[], palette: string[] = PALETTE): string {
  const cx = 150;
  const cy = CHART_HEIGHT / 2;
  const rOuter = 100;
  const rInner = 58;
  const total = values.reduce((a, b) => a + b, 0) || 1;

  let angleStart = -Math.PI / 2;
  let arcsSvg = "";
  const segments = values.map((v, i) => {
    const fraction = v / total;
    const angleEnd = angleStart + fraction * Math.PI * 2;
    const seg = { angleStart, angleEnd, color: palette[i % palette.length] };
    angleStart = angleEnd;
    return seg;
  });

  for (const seg of segments) {
    const largeArc = seg.angleEnd - seg.angleStart > Math.PI ? 1 : 0;
    const x1 = cx + rOuter * Math.cos(seg.angleStart);
    const y1 = cy + rOuter * Math.sin(seg.angleStart);
    const x2 = cx + rOuter * Math.cos(seg.angleEnd);
    const y2 = cy + rOuter * Math.sin(seg.angleEnd);
    const ix1 = cx + rInner * Math.cos(seg.angleEnd);
    const iy1 = cy + rInner * Math.sin(seg.angleEnd);
    const ix2 = cx + rInner * Math.cos(seg.angleStart);
    const iy2 = cy + rInner * Math.sin(seg.angleStart);
    arcsSvg += `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(
      2
    )} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${rInner} ${rInner} 0 ${largeArc} 0 ${ix2.toFixed(2)} ${iy2.toFixed(
      2
    )} Z" fill="${seg.color}" />`;
  }

  const legendX = 300;
  let legendSvg = "";
  labels.forEach((label, i) => {
    const y = 40 + i * 24;
    const pct = ((values[i] / total) * 100).toFixed(1);
    legendSvg += `<rect x="${legendX}" y="${y - 10}" width="12" height="12" rx="2" fill="${palette[i % palette.length]}" />`;
    legendSvg += `<text x="${legendX + 18}" y="${y}" font-size="11" fill="#111827" font-family="Helvetica">${escapeXml(
      truncate(label, 20)
    )} (${pct}%)</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">
    <rect x="0" y="0" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="#ffffff" />
    ${arcsSvg}
    ${legendSvg}
  </svg>`;
}

export function scatterChart(points: { x: number; y: number }[], xLabel: string, yLabel: string): string {
  const marginLeft = 60;
  const marginRight = 20;
  const marginTop = 24;
  const marginBottom = 56;
  const plotWidth = CHART_WIDTH - marginLeft - marginRight;
  const plotHeight = CHART_HEIGHT - marginTop - marginBottom;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xPad = (xMax - xMin || 1) * 0.08;
  const yPad = (yMax - yMin || 1) * 0.08;
  const xLo = xMin - xPad;
  const xHi = xMax + xPad;
  const yLo = yMin - yPad;
  const yHi = yMax + yPad;

  const toX = (v: number) => marginLeft + ((v - xLo) / (xHi - xLo || 1)) * plotWidth;
  const toY = (v: number) => marginTop + plotHeight - ((v - yLo) / (yHi - yLo || 1)) * plotHeight;

  const gridLines = 4;
  let gridSvg = "";
  for (let i = 0; i <= gridLines; i++) {
    const y = marginTop + plotHeight - (i / gridLines) * plotHeight;
    const value = yLo + (i / gridLines) * (yHi - yLo);
    gridSvg += `<line x1="${marginLeft}" y1="${y}" x2="${CHART_WIDTH - marginRight}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    gridSvg += `<text x="${marginLeft - 8}" y="${y + 4}" font-size="10" fill="#6b7280" text-anchor="end" font-family="Helvetica">${escapeXml(
      formatShort(value)
    )}</text>`;
  }
  for (let i = 0; i <= gridLines; i++) {
    const x = marginLeft + (i / gridLines) * plotWidth;
    const value = xLo + (i / gridLines) * (xHi - xLo);
    gridSvg += `<text x="${x}" y="${marginTop + plotHeight + 16}" font-size="9.5" fill="#374151" text-anchor="middle" font-family="Helvetica">${escapeXml(
      formatShort(value)
    )}</text>`;
  }

  let dotsSvg = "";
  for (const p of points) {
    dotsSvg += `<circle cx="${toX(p.x).toFixed(1)}" cy="${toY(p.y).toFixed(1)}" r="3.5" fill="#0a8a54" fill-opacity="0.55" />`;
  }

  // Simple least-squares trend line to make the relationship visible.
  const n = points.length;
  let trendSvg = "";
  if (n >= 2) {
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    if (den > 0) {
      const slope = num / den;
      const intercept = meanY - slope * meanX;
      const y1 = intercept + slope * xLo;
      const y2 = intercept + slope * xHi;
      trendSvg = `<line x1="${toX(xLo).toFixed(1)}" y1="${toY(y1).toFixed(1)}" x2="${toX(xHi).toFixed(1)}" y2="${toY(y2).toFixed(
        1
      )}" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4" />`;
    }
  }

  const axisLabelsSvg = `<text x="${marginLeft + plotWidth / 2}" y="${CHART_HEIGHT - 6}" font-size="10" fill="#374151" text-anchor="middle" font-family="Helvetica">${escapeXml(
    truncate(xLabel, 40)
  )}</text>
    <text x="14" y="${marginTop + plotHeight / 2}" font-size="10" fill="#374151" text-anchor="middle" font-family="Helvetica" transform="rotate(-90 14 ${
    marginTop + plotHeight / 2
  })">${escapeXml(truncate(yLabel, 40))}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">
    <rect x="0" y="0" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="#ffffff" />
    ${gridSvg}
    ${trendSvg}
    ${dotsSvg}
    <line x1="${marginLeft}" y1="${marginTop + plotHeight}" x2="${CHART_WIDTH - marginRight}" y2="${marginTop + plotHeight}" stroke="#9ca3af" stroke-width="1" />
    ${axisLabelsSvg}
  </svg>`;
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function heatCellColor(value: number, colorScale: "diverging" | "sequential", maxAbs: number): string {
  if (colorScale === "diverging") {
    const t = Math.max(-1, Math.min(1, maxAbs ? value / maxAbs : 0));
    const RED: [number, number, number] = [239, 68, 68];
    const WHITE: [number, number, number] = [255, 255, 255];
    const GREEN: [number, number, number] = [15, 169, 104];
    return t < 0 ? lerpColor(WHITE, RED, -t) : lerpColor(WHITE, GREEN, t);
  }
  const t = maxAbs ? Math.max(0, Math.min(1, value / maxAbs)) : 0;
  return lerpColor([243, 250, 246], [10, 138, 84], t);
}

export function heatmapChart(
  rowLabels: string[],
  colLabels: string[],
  matrix: number[][],
  displayMatrix: string[][],
  colorScale: "diverging" | "sequential"
): string {
  const marginLeft = 108;
  const marginRight = 16;
  const marginTop = 72;
  const marginBottom = 16;
  const gridWidth = CHART_WIDTH - marginLeft - marginRight;
  const gridHeight = CHART_HEIGHT - marginTop - marginBottom;
  const cols = colLabels.length;
  const rows = rowLabels.length;
  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  const flat = matrix.flat();
  const maxAbs = Math.max(...flat.map((v) => Math.abs(v)), 0.0001);

  let cellsSvg = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = marginLeft + c * cellWidth;
      const y = marginTop + r * cellHeight;
      const value = matrix[r][c];
      const color = heatCellColor(value, colorScale, maxAbs);
      const textColor = colorScale === "sequential" && Math.abs(value) / maxAbs > 0.55 ? "#ffffff" : "#111827";
      cellsSvg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellWidth.toFixed(1)}" height="${cellHeight.toFixed(
        1
      )}" fill="${color}" stroke="#ffffff" stroke-width="1.5" />`;
      cellsSvg += `<text x="${(x + cellWidth / 2).toFixed(1)}" y="${(y + cellHeight / 2 + 3.5).toFixed(
        1
      )}" font-size="9.5" fill="${textColor}" text-anchor="middle" font-family="Helvetica">${escapeXml(displayMatrix[r][c])}</text>`;
    }
  }

  let colLabelsSvg = "";
  for (let c = 0; c < cols; c++) {
    const x = marginLeft + c * cellWidth + cellWidth / 2;
    const y = marginTop - 8;
    colLabelsSvg += `<text x="${x.toFixed(1)}" y="${y}" font-size="9.5" fill="#374151" text-anchor="start" font-family="Helvetica" transform="rotate(-30 ${x.toFixed(
      1
    )} ${y})">${escapeXml(truncate(colLabels[c], 18))}</text>`;
  }

  let rowLabelsSvg = "";
  for (let r = 0; r < rows; r++) {
    const x = marginLeft - 8;
    const y = marginTop + r * cellHeight + cellHeight / 2 + 3.5;
    rowLabelsSvg += `<text x="${x}" y="${y.toFixed(1)}" font-size="9.5" fill="#374151" text-anchor="end" font-family="Helvetica">${escapeXml(
      truncate(rowLabels[r], 17)
    )}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}">
    <rect x="0" y="0" width="${CHART_WIDTH}" height="${CHART_HEIGHT}" fill="#ffffff" />
    ${cellsSvg}
    ${colLabelsSvg}
    ${rowLabelsSvg}
  </svg>`;
}

export function formatShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}
