import { QueryFormData } from '@superset-ui/core';

export type CalculationMode = 'none' | 'dual_metric' | 'static_target' | 'time_shift';
export type BadgeStyle = 'pill' | 'subtle' | 'full';
export type CardAlignment = 'left' | 'center' | 'right';
export type TrendDirection = 'up' | 'down' | 'flat' | 'none';
export type CardBorderRadius = 'square' | 'subtle' | 'rounded' | 'pill';
export type CardBoxShadow = 'none' | 'subtle' | 'elevated' | 'bordered';

export interface KPIComparisonFormData extends QueryFormData {
  enable_comparison?: boolean;
  calculation_mode?: CalculationMode;
  metric?: any;
  comparison_metric?: any;
  time_compare?: string;
  time_range?: string;
  comparison_label?: string;
  time_column?: string;

  // Header & Display
  show_title?: boolean;
  kpi_title?: string;
  kpi_subtitle?: string;
  dynamic_subtitle_column?: string;
  prefix_value?: string;
  suffix_value?: string;
  number_format?: string;

  // Aesthetic Customization
  card_bg_color?: any;
  card_border_radius?: CardBorderRadius;
  card_box_shadow?: CardBoxShadow;
  card_border_color?: string;
  card_border_width?: number;

  // Typography Customization
  kpi_font_family?: string;
  kpi_font_size_mode?: 'auto' | 'manual';
  kpi_font_size_manual?: number;
  kpi_font_weight?: string | number;
  kpi_letter_spacing?: 'normal' | 'tight' | 'wide' | string;
  kpi_tabular_nums?: boolean;
  kpi_color?: string;
  title_font_size?: 'auto' | 'small' | 'medium' | 'large' | string;
  title_font_weight?: string | number;
  title_color?: string;
  title_text_transform?: 'uppercase' | 'capitalize' | 'none';
  subtitle_font_size?: 'small' | 'medium' | 'large' | string;
  subtitle_font_weight?: string | number;
  subtitle_color?: string;
  comparison_font_size?: 'small' | 'medium' | 'large' | string;
  comparison_font_weight?: string | number;
  comparison_color?: string;

  // Semantic & Polarity
  invert_polarity?: boolean;
  badge_style?: BadgeStyle;
  card_alignment?: CardAlignment;
  show_badge?: boolean;
  show_comparison_value?: boolean;
  show_comparison_label?: boolean;
  show_absolute_delta?: boolean;

  // Sparkline
  show_sparkline?: boolean;
  sparkline_color?: string;
  sparkline_fill?: boolean;
  sparkline_curve?: 'smooth' | 'linear';
  sparkline_show_points?: boolean;

  // Target Tracking
  target_metric?: any;
  target_static_value?: string;
  show_progress_bar?: boolean;

  // Percent of Total
  badge_content?: 'delta' | 'percent_of_total';
  total_metric?: any;
  total_badge_color?: any;

  // Formatting & Interactivity
  apply_trend_color_to?: 'badge' | 'text' | 'background';
  click_url?: string;
  click_target?: '_blank' | '_self';
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

  // Advanced Typography Props
  kpiFontFamily?: string;
  kpiFontSizeMode?: 'auto' | 'manual';
  kpiFontSizeManual?: number;
  kpiFontWeight?: string | number;
  kpiLetterSpacing?: string;
  kpiTabularNums?: boolean;
  kpiColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string | number;
  titleColor?: string;
  titleTextTransform?: 'uppercase' | 'capitalize' | 'none';
  subtitleFontSize?: string;
  subtitleFontWeight?: string | number;
  subtitleColor?: string;
  comparisonFontSize?: string;
  comparisonFontWeight?: string | number;
  comparisonColor?: string;

  // Aesthetic Customization
  cardBgColor: string;
  cardBorderRadius: CardBorderRadius;
  cardBoxShadow: CardBoxShadow;
  cardBorderColor?: string;
  cardBorderWidth?: number;

  // Config Flags
  showTitle?: boolean;
  hasComparison?: boolean;
  showBadge?: boolean;
  showComparisonLabel?: boolean;
  badgeStyle: BadgeStyle;
  cardAlignment: CardAlignment;
  showComparisonValue: boolean;
  showAbsoluteDelta: boolean;

  // Sparkline
  showSparkline: boolean;
  sparklineData: number[];
  sparklineColor: string;
  sparklineFill: boolean;
  sparklineCurve?: 'smooth' | 'linear';
  sparklineShowPoints?: boolean;

  // Target Tracking
  showProgressBar?: boolean;
  targetProgressPercent?: number | null;

  // Interactivity & Theming
  applyTrendColorTo?: 'badge' | 'text' | 'background';
  clickUrl?: string;
  clickTarget?: '_blank' | '_self';
}
