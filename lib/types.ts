export type ColumnType = "numeric" | "date" | "categorical" | "text" | "boolean";

export interface NumericStats {
  type: "numeric";
  count: number;
  missing: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  q1: number;
  q3: number;
  outlierCount: number;
}

export interface CategoricalStats {
  type: "categorical";
  count: number;
  missing: number;
  uniqueCount: number;
  top: { label: string; count: number }[];
}

export interface DateStats {
  type: "date";
  count: number;
  missing: number;
  min: Date;
  max: Date;
  spanDays: number;
  perMonth: { label: string; count: number }[];
}

export interface TextStats {
  type: "text";
  count: number;
  missing: number;
  uniqueCount: number;
}

export interface BooleanStats {
  type: "boolean";
  count: number;
  missing: number;
  trueCount: number;
  falseCount: number;
}

export type ColumnStats = NumericStats | CategoricalStats | DateStats | TextStats | BooleanStats;

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  isIdLike: boolean;
  stats: ColumnStats;
}

export interface CorrelationInsight {
  columnA: string;
  columnB: string;
  coefficient: number;
}

export interface BarLineChart {
  kind: "bar" | "line";
  title: string;
  insight: string;
  labels: string[];
  values: number[];
  seriesLabel?: string;
}

export interface DonutChart {
  kind: "donut";
  title: string;
  insight: string;
  labels: string[];
  values: number[];
}

export interface ScatterChart {
  kind: "scatter";
  title: string;
  insight: string;
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
}

export interface HeatmapChart {
  kind: "heatmap";
  title: string;
  insight: string;
  rowLabels: string[];
  colLabels: string[];
  matrix: number[][];
  // Text shown in each cell, pre-formatted (same shape as matrix).
  displayMatrix: string[][];
  // "diverging" for correlation matrices (-1..1, red/green), "sequential"
  // for magnitude cross-tabs (0..max, single hue).
  colorScale: "diverging" | "sequential";
}

export interface TableChart {
  kind: "table";
  title: string;
  insight: string;
  columns: string[];
  rows: string[][];
}

export type ChartSpec = BarLineChart | DonutChart | ScatterChart | HeatmapChart | TableChart;

export interface AnalysisResult {
  fileName: string;
  sheetName: string;
  rowCount: number;
  columnCount: number;
  duplicateRowCount: number;
  datasetTopic: string;
  columns: ColumnProfile[];
  keyMetrics: ColumnProfile[];
  primaryCategory: ColumnProfile | null;
  primaryDate: ColumnProfile | null;
  correlations: CorrelationInsight[];
  charts: ChartSpec[];
  narrative: string[];
  recommendations: string[];
  generatedAt: Date;
}
