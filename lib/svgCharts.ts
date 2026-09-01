const PALETTE = ["#0fa968", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export const CHART_WIDTH = 520;
export const CHART_HEIGHT = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(label: string, max = 12): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function barChart(labels: string[], values: number[], seriesLabel = ""): string {
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
    const color = PALETTE[i % PALETTE.length];
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

export function lineChart(labels: string[], values: number[], seriesLabel = ""): string {
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
    pointsSvg += `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#0a8a54" />`;
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
    <path d="${areaD}" fill="#0fa968" fill-opacity="0.12" stroke="none" />
    <path d="${pathD}" fill="none" stroke="#0a8a54" stroke-width="2.5" />
    ${pointsSvg}
    <line x1="${marginLeft}" y1="${marginTop + plotHeight}" x2="${CHART_WIDTH - marginRight}" y2="${marginTop + plotHeight}" stroke="#9ca3af" stroke-width="1" />
  </svg>`;
}

export function donutChart(labels: string[], values: number[]): string {
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
    const seg = { angleStart, angleEnd, color: PALETTE[i % PALETTE.length] };
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
    legendSvg += `<rect x="${legendX}" y="${y - 10}" width="12" height="12" rx="2" fill="${PALETTE[i % PALETTE.length]}" />`;
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

export function formatShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}
