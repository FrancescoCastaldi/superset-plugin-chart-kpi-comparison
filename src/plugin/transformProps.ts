import { ChartProps } from '@superset-ui/core';
import {
  BadgeStyle,
  CardAlignment,
  KPIComparisonFormData,
  KPIComparisonProps,
  TrendDirection,
} from '../types';
import {
  formatDeltaPercent,
  formatItalianNumber,
  formatMetricValue,
  parseNumericValue,
} from '../utils/formatters';

function getMetricLabel(metric: any): string {
  if (!metric) return '';
  if (typeof metric === 'string') return metric;
  return metric.label || metric.sqlExpression || '';
}

export default function transformProps(chartProps: ChartProps): KPIComparisonProps {
  const { width, height, formData, queriesData } = chartProps;
  const fd = formData as KPIComparisonFormData;

  const data = (queriesData?.[0]?.data as Array<Record<string, any>>) || [];

  // Determine calculation mode
  const calculationMode = fd.calculation_mode || 'dual_metric';
  const primaryMetricKey = getMetricLabel(fd.metric);
  const comparisonMetricKey = getMetricLabel(fd.comparison_metric);

  let primaryValue: number | null = null;
  let comparisonValue: number | null = null;
  const sparklineData: number[] = [];

  if (data.length > 0) {
    const firstRow = data[0];

    // 1. Primary Value extraction
    primaryValue = parseNumericValue(firstRow[primaryMetricKey]);
    if (primaryValue === null) {
      // Fallback: search by case-insensitive match or first numeric column
      const foundKey = Object.keys(firstRow).find(
        k => k.toLowerCase() === primaryMetricKey.toLowerCase(),
      );
      if (foundKey) {
        primaryValue = parseNumericValue(firstRow[foundKey]);
      } else {
        const firstNumKey = Object.keys(firstRow).find(k => typeof firstRow[k] === 'number');
        if (firstNumKey) {
          primaryValue = parseNumericValue(firstRow[firstNumKey]);
        }
      }
    }

    // 2. Comparison Value extraction
    if (calculationMode === 'dual_metric') {
      comparisonValue = parseNumericValue(firstRow[comparisonMetricKey]);
      if (comparisonValue === null && comparisonMetricKey) {
        const foundCompKey = Object.keys(firstRow).find(
          k => k.toLowerCase() === comparisonMetricKey.toLowerCase(),
        );
        if (foundCompKey) {
          comparisonValue = parseNumericValue(firstRow[foundCompKey]);
        }
      }
    } else {
      // Time-shift mode: inspect columns with offset suffix or second row
      const offsetKey = Object.keys(firstRow).find(
        k => k !== primaryMetricKey && (k.includes('__') || k.toLowerCase().includes('ago')),
      );
      if (offsetKey) {
        comparisonValue = parseNumericValue(firstRow[offsetKey]);
      } else if (data.length > 1) {
        comparisonValue = parseNumericValue(data[1][primaryMetricKey]);
      }
    }

    // 3. Sparkline data extraction if multiple rows present
    if (fd.show_sparkline && data.length > 1) {
      data.forEach(row => {
        const val = parseNumericValue(row[primaryMetricKey]);
        if (val !== null) {
          sparklineData.push(val);
        }
      });
    }
  }

  // Delta calculations
  let deltaAbsolute: number | null = null;
  let deltaPercent: number | null = null;
  let trendDirection: TrendDirection = 'flat';

  if (primaryValue !== null && comparisonValue !== null) {
    deltaAbsolute = primaryValue - comparisonValue;
    if (comparisonValue !== 0) {
      deltaPercent = (deltaAbsolute / Math.abs(comparisonValue)) * 100;
    }

    if (deltaPercent !== null) {
      if (deltaPercent > 0.001) {
        trendDirection = 'up';
      } else if (deltaPercent < -0.001) {
        trendDirection = 'down';
      } else {
        trendDirection = 'flat';
      }
    }
  }

  // Semantic color coding and polarity
  const invertPolarity = Boolean(fd.invert_polarity);
  let trendColor = '#64748b'; // default slate grey
  let badgeBackgroundColor = '#f1f5f9';
  let badgeTextColor = '#475569';

  const isPositiveTrend =
    (!invertPolarity && trendDirection === 'up') ||
    (invertPolarity && trendDirection === 'down');

  const isNegativeTrend =
    (!invertPolarity && trendDirection === 'down') ||
    (invertPolarity && trendDirection === 'up');

  const badgeStyle: BadgeStyle = fd.badge_style || 'pill';

  if (isPositiveTrend) {
    trendColor = '#10b981'; // emerald green
    badgeBackgroundColor = badgeStyle === 'subtle' ? 'transparent' : '#dcfce7';
    badgeTextColor = '#15803d';
  } else if (isNegativeTrend) {
    trendColor = '#ef4444'; // rose red
    badgeBackgroundColor = badgeStyle === 'subtle' ? 'transparent' : '#fee2e2';
    badgeTextColor = '#b91c1c';
  } else {
    trendColor = '#94a3b8';
    badgeBackgroundColor = badgeStyle === 'subtle' ? 'transparent' : '#f1f5f9';
    badgeTextColor = '#64748b';
  }

  // Format strings
  const formattedPrimary = formatMetricValue(primaryValue, fd.number_format);
  const formattedComparison = formatMetricValue(comparisonValue, fd.number_format);
  const formattedDeltaPercent = formatDeltaPercent(deltaPercent, 1);
  const formattedDeltaAbsolute =
    deltaAbsolute !== null
      ? `${deltaAbsolute > 0 ? '+' : ''}${formatItalianNumber(deltaAbsolute, 0)}`
      : '—';

  // Sparkline color
  let sparklineColor = '#2563eb';
  if (fd.sparkline_color) {
    const sc = fd.sparkline_color as any;
    if (typeof sc === 'string') {
      sparklineColor = sc;
    } else if (sc.r !== undefined && sc.g !== undefined && sc.b !== undefined) {
      sparklineColor = `rgba(${sc.r}, ${sc.g}, ${sc.b}, ${sc.a ?? 1})`;
    }
  }

  return {
    width,
    height,
    primaryValue,
    comparisonValue,
    deltaAbsolute,
    deltaPercent,
    formattedPrimary,
    formattedComparison,
    formattedDeltaAbsolute,
    formattedDeltaPercent,
    trendDirection,
    trendColor,
    badgeBackgroundColor,
    badgeTextColor,
    kpiTitle: fd.kpi_title || primaryMetricKey || 'KPI',
    kpiSubtitle: fd.kpi_subtitle || '',
    comparisonLabel: fd.comparison_label || 'vs Periodo Prec.',
    prefixValue: fd.prefix_value || '',
    suffixValue: fd.suffix_value || '',
    badgeStyle,
    cardAlignment: (fd.card_alignment as CardAlignment) || 'left',
    showComparisonValue: fd.show_comparison_value !== false,
    showAbsoluteDelta: fd.show_absolute_delta !== false,
    showSparkline: Boolean(fd.show_sparkline),
    sparklineData,
    sparklineColor,
    sparklineFill: fd.sparkline_fill !== false,
  };
}
