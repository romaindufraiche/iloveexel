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

export interface ChartSpec {
  kind: "bar" | "line" | "donut";
  title: string;
  insight: string;
  labels: string[];
  values: number[];
  seriesLabel?: string;
}

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
