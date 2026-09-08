import { QueryFormData } from '@superset-ui/core';

export type CalculationMode = 'dual_metric' | 'time_shift';
export type BadgeStyle = 'pill' | 'subtle' | 'full';
export type CardAlignment = 'left' | 'center' | 'right';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface KPIComparisonFormData extends QueryFormData {
  calculation_mode?: CalculationMode;
  metric?: any;
  comparison_metric?: any;
  time_compare?: string;
  comparison_label?: string;
  time_column?: string;

  // Header & Display
  kpi_title?: string;
  kpi_subtitle?: string;
  prefix_value?: string;
  suffix_value?: string;
  number_format?: string;

  // Semantic & Polarity
  invert_polarity?: boolean;
  badge_style?: BadgeStyle;
  card_alignment?: CardAlignment;
  show_comparison_value?: boolean;
  show_absolute_delta?: boolean;

  // Sparkline
  show_sparkline?: boolean;
  sparkline_color?: string;
  sparkline_fill?: boolean;
}

export interface KPIComparisonProps {
  width: number;
  height: number;

  // Values
  primaryValue: number | null;
  comparisonValue: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;

  // Formatted Strings
  formattedPrimary: string;
  formattedComparison: string;
  formattedDeltaAbsolute: string;
  formattedDeltaPercent: string;

  // Visuals & Trends
  trendDirection: TrendDirection;
  trendColor: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;

  // Labels & Typography
  kpiTitle: string;
  kpiSubtitle: string;
  comparisonLabel: string;
  prefixValue: string;
  suffixValue: string;

  // Config Flags
  badgeStyle: BadgeStyle;
  cardAlignment: CardAlignment;
  showComparisonValue: boolean;
  showAbsoluteDelta: boolean;

  // Sparkline
  showSparkline: boolean;
  sparklineData: number[];
  sparklineColor: string;
  sparklineFill: boolean;
}
