import { ChartProps } from '@superset-ui/core';
import {
  BadgeStyle,
  CalculationMode,
  CardAlignment,
  CardBorderRadius,
  CardBoxShadow,
  KPIComparisonFormData,
  KPIComparisonProps,
  TrendDirection,
} from '../types';
import {
  formatDeltaPercent,
  formatItalianNumber,
  formatMetricValue,
  formatMonthYearItalian,
  getMetricLabel,
  parseNumericValue,
} from '../utils/formatters';
import {
  getContrastTextColor,
  getTrendColors,
  resolveCardBgColor,
  resolveSparklineColor,
  toRgbaString,
} from '../utils/colors';
import {
  classifyExtremeTitle,
  extractSparklineData,
  selectReferenceRow,
} from '../utils/series';
import { computeDelta, getTrendPolarity } from '../utils/trend';

export default function transformProps(chartProps: ChartProps): KPIComparisonProps {
  const { width, height, formData, queriesData } = chartProps;
  const fd = formData as KPIComparisonFormData;
  const rawFd = (chartProps.rawFormData || {}) as any;

  // Superset normalizes formData to camelCase in modern versions (ChartRenderer),
  // while explore and legacy views keep snake_case.
  // We resolve every control checking camelCase, snake_case on both formData and rawFormData.
  const getProp = <T>(camelKey: string, snakeKey: string, defaultVal: T): T => {
    const val =
      (fd as any)?.[camelKey] ??
      (fd as any)?.[snakeKey] ??
      rawFd?.[camelKey] ??
      rawFd?.[snakeKey];
    return val !== undefined && val !== null ? val : defaultVal;
  };

  const data = (queriesData?.[0]?.data as Array<Record<string, any>>) || [];

  // Determine calculation mode
  const calculationMode = getProp<CalculationMode>('calculationMode', 'calculation_mode', 'dual_metric');
  const enableComparison =
    getProp<boolean>('enableComparison', 'enable_comparison', true) &&
    calculationMode !== 'none';
  const metricProp = getProp('metric', 'metric', fd.metric);
  const comparisonMetricProp = getProp('comparisonMetric', 'comparison_metric', (fd as any)?.comparison_metric);
  const primaryMetricKey = getMetricLabel(metricProp);
  const comparisonMetricKey = getMetricLabel(comparisonMetricProp);
  const showSparkline = Boolean(getProp('showSparkline', 'show_sparkline', false));

  let primaryValue: number | null = null;
  let comparisonValue: number | null = null;
  let primaryKeyUsed: string | null = null;
  let sparklineData: number[] = [];
  let referenceRow: Record<string, any> | undefined;

  const rawTitle = getProp<string>('kpiTitle', 'kpi_title', '') || getProp<string>('sliceName', 'slice_name', '');
  const { isPeak, isMin } = classifyExtremeTitle(rawTitle);

  if (data.length > 0) {
    referenceRow = selectReferenceRow(data, primaryMetricKey, {
      isPeak,
      isMin,
      calculationMode,
      showSparkline,
    });
    const firstRow = data[0];

    // 1. Primary Value extraction
    if (primaryMetricKey && referenceRow[primaryMetricKey] !== undefined) {
      primaryValue = parseNumericValue(referenceRow[primaryMetricKey]);
      primaryKeyUsed = primaryMetricKey;
    } else if (primaryMetricKey) {
      const foundKey = Object.keys(referenceRow).find(
        k => k.toLowerCase() === primaryMetricKey.toLowerCase(),
      );
      if (foundKey) {
        primaryValue = parseNumericValue(referenceRow[foundKey]);
        primaryKeyUsed = foundKey;
      }
    }

    if (primaryValue === null) {
      // Fallback: first numeric column
      const firstNumKey = Object.keys(referenceRow).find(
        k => typeof referenceRow[k] === 'number',
      );
      if (firstNumKey) {
        primaryValue = parseNumericValue(referenceRow[firstNumKey]);
        primaryKeyUsed = firstNumKey;
      }
    }

    // 2. Comparison Value extraction
    if (!enableComparison) {
      comparisonValue = null;
    } else if (calculationMode === 'static_target') {
      const staticVal = getProp<string>('targetStaticValue', 'target_static_value', '');
      const parsedStatic = parseFloat(staticVal);
      if (!isNaN(parsedStatic)) {
        comparisonValue = parsedStatic;
      } else {
        const targetMetricProp = getProp<any>('targetMetric', 'target_metric', null);
        const targetMetricKey = getMetricLabel(targetMetricProp);
        if (targetMetricKey && referenceRow[targetMetricKey] !== undefined) {
          comparisonValue = parseNumericValue(referenceRow[targetMetricKey]);
        }
      }
    } else if (calculationMode === 'dual_metric') {
      if (comparisonMetricKey && referenceRow[comparisonMetricKey] !== undefined) {
        comparisonValue = parseNumericValue(referenceRow[comparisonMetricKey]);
      } else if (comparisonMetricKey) {
        const foundCompKey = Object.keys(referenceRow).find(
          k => k.toLowerCase() === comparisonMetricKey.toLowerCase(),
        );
        if (foundCompKey) {
          comparisonValue = parseNumericValue(referenceRow[foundCompKey]);
        }
      }

      // If comparisonMetricKey was configured but not matched directly, search for keys containing comparison keywords
      if (comparisonValue === null && comparisonMetricKey) {
        const keywordKey = Object.keys(referenceRow).find(
          k =>
            k !== primaryKeyUsed &&
            (k.toLowerCase().includes('conf') ||
              k.toLowerCase().includes('prev') ||
              k.toLowerCase().includes('comp') ||
              k.toLowerCase().includes('prec') ||
              k.toLowerCase().includes('bench')),
        );
        if (keywordKey) {
          comparisonValue = parseNumericValue(referenceRow[keywordKey]);
        }
      }
    } else if (calculationMode === 'time_shift') {
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
    if (showSparkline && data.length > 1) {
      sparklineData = extractSparklineData(data, primaryMetricKey);
    }
  }

  // Target Tracking calculations
  let targetProgressPercent: number | null = null;
  const showProgressBar = Boolean(getProp('showProgressBar', 'show_progress_bar', false));

  if (showProgressBar && primaryValue !== null) {
    let targetValue: number | null = null;
    
    // 1. Try dynamic metric from data
    const targetMetricProp = getProp<any>('targetMetric', 'target_metric', null);
    const targetMetricKey = getMetricLabel(targetMetricProp);
    if (targetMetricKey && data && data.length > 0 && typeof data[0][targetMetricKey] === 'number') {
      targetValue = parseNumericValue(data[0][targetMetricKey]);
    }
    
    // 2. Try static value if dynamic is missing or invalid
    const targetStaticVal = getProp<string>('targetStaticValue', 'target_static_value', '');
    if (targetValue === null && targetStaticVal) {
      const parsedStatic = parseFloat(targetStaticVal);
      if (!isNaN(parsedStatic)) {
        targetValue = parsedStatic;
      }
    }

    // 3. Calculate percentage
    if (targetValue !== null && targetValue > 0) {
      targetProgressPercent = (primaryValue / targetValue) * 100;
    }
  }

  // Delta calculations
  const delta = computeDelta(primaryValue, comparisonValue);
  let deltaAbsolute: number | null = delta.deltaAbsolute;
  let deltaPercent: number | null = delta.deltaPercent;
  let trendDirection: TrendDirection = delta.trendDirection;

  // Semantic color coding and polarity
  const invertPolarity = Boolean(getProp('invertPolarity', 'invert_polarity', false));
  const badgeStyle: BadgeStyle = getProp<BadgeStyle>('badgeStyle', 'badge_style', 'pill');
  const trendColors = getTrendColors(getTrendPolarity(trendDirection, invertPolarity), badgeStyle);
  const { trendColor } = trendColors;
  let { badgeBackgroundColor, badgeTextColor } = trendColors;

  // Format strings
  const numberFormat = getProp<string | undefined>('numberFormat', 'number_format', undefined);
  const formattedPrimary = formatMetricValue(primaryValue, numberFormat);
  const formattedComparison = formatMetricValue(comparisonValue, numberFormat);
  let formattedDeltaPercent = formatDeltaPercent(deltaPercent, 1);
  let formattedDeltaAbsolute =
    deltaAbsolute !== null
      ? `${deltaAbsolute > 0 ? '+' : ''}${formatItalianNumber(deltaAbsolute, 0)}`
      : '—';

  // Percent of Total override
  const badgeContent = getProp<string>('badgeContent', 'badge_content', 'delta');
  let hasPercentOfTotal = false;
  if (badgeContent === 'percent_of_total' && primaryValue !== null) {
    const totalMetric = getProp<any>('totalMetric', 'total_metric', null);
    if (totalMetric) {
      const totalMetricKey = getMetricLabel(totalMetric);
      if (totalMetricKey && data && data.length > 0 && typeof data[0][totalMetricKey] === 'number') {
        const totalValue = parseNumericValue(data[0][totalMetricKey]);
        if (totalValue !== null && totalValue !== 0) {
          const pct = (primaryValue / totalValue) * 100;
          formattedDeltaPercent = `${formatItalianNumber(pct, 1)}%`;
          formattedDeltaAbsolute = '—'; // Hide absolute delta
          trendDirection = 'none'; // Hide trend arrow
          hasPercentOfTotal = true;
          
          // Badge color from user settings
          const totalBadgeColor = getProp<any>('totalBadgeColor', 'total_badge_color', { r: 99, g: 102, b: 241, a: 1 });
          if (totalBadgeColor && totalBadgeColor.r !== undefined) {
            badgeBackgroundColor = toRgbaString(totalBadgeColor);
            badgeTextColor = getContrastTextColor(totalBadgeColor);
          }
        }
      }
    }
  }

  // Sparkline color
  const sparklineColor = resolveSparklineColor(
    getProp<any>('sparklineColor', 'sparkline_color', undefined),
  );

  // Dynamic context: extract active time range filter from dashboard
  const activeTimeRange =
    rawFd.time_range ||
    rawFd.extra_form_data?.time_range ||
    rawFd.extraFormData?.time_range;

  // --- Explicit Dynamic Subtitle Config ---
  let explicitDynamicVal: string | null = null;
  const dynamicSubtitleCol = getProp<string | undefined>('dynamicSubtitleColumn', 'dynamic_subtitle_column', undefined);
  if (dynamicSubtitleCol && referenceRow && referenceRow[dynamicSubtitleCol] !== undefined) {
    explicitDynamicVal = String(referenceRow[dynamicSubtitleCol]);
  }

  // --- Dynamic Month & Period Discovery ---
  let dynamicMonth: string | null = null;
  let dynamicCompMonth: string | null = null;
  let dynamicPeriod: string | null = null;

  // 1. Inspect referenceRow for explicit string metrics or date columns
  if (referenceRow) {
    for (const [key, val] of Object.entries(referenceRow)) {
      if (typeof val === 'string' && val.trim()) {
        const kLow = key.toLowerCase();
        if (kLow.includes('picco') || kLow.includes('peak')) {
          dynamicMonth = formatMonthYearItalian(val);
        } else if (
          kLow.includes('minimo') ||
          kLow.includes('lowest') ||
          kLow.includes('più basso') ||
          kLow.includes('piu basso')
        ) {
          dynamicMonth = formatMonthYearItalian(val);
        } else if (
          kLow.includes('corrente') ||
          kLow.includes('ultimo') ||
          kLow.includes('current')
        ) {
          if (!dynamicMonth) {
            dynamicMonth = formatMonthYearItalian(val);
          }
        } else if (
          kLow.includes('confronto') ||
          kLow.includes('prec') ||
          kLow.includes('prev') ||
          kLow.includes('comp')
        ) {
          if (!dynamicCompMonth) {
            dynamicCompMonth = formatMonthYearItalian(val);
          }
        } else if (
          kLow.includes('periodo') ||
          kLow.includes('mesi') ||
          kLow.includes('finestra')
        ) {
          if (!dynamicPeriod) {
            dynamicPeriod = val.trim();
          }
        } else if (
          kLow.includes('mese') ||
          kLow.includes('month') ||
          kLow.includes('data') ||
          kLow.includes('date')
        ) {
          if (!dynamicMonth) {
            dynamicMonth = formatMonthYearItalian(val);
          }
        }
      }
    }
  }

  // 2. If data has multiple rows (series/sparkline/monthly groups), detect from rows
  if (data.length > 1) {
    const timeColumnCfg = getProp<string | undefined>('timeColumn', 'time_column', undefined);
    const dateCol = Object.keys(data[0]).find(k => {
      const kLow = k.toLowerCase();
      return (
        k === timeColumnCfg ||
        kLow.includes('mese') ||
        kLow.includes('month') ||
        kLow.includes('data') ||
        kLow.includes('date')
      );
    });

    if (dateCol) {
      // Only the explicit KPI title counts here: a peak/min slice name alone
      // still labels the card with the latest row month.
      const { isPeak, isMin } = classifyExtremeTitle(getProp<string>('kpiTitle', 'kpi_title', ''));

      if (isPeak) {
        let maxVal = -Infinity;
        let peakRow = data[0];
        data.forEach(r => {
          const v = parseNumericValue(r[primaryKeyUsed || primaryMetricKey]);
          if (v !== null && v > maxVal) {
            maxVal = v;
            peakRow = r;
          }
        });
        if (peakRow && peakRow[dateCol]) {
          dynamicMonth = formatMonthYearItalian(String(peakRow[dateCol]));
        }
      } else if (isMin) {
        let minVal = Infinity;
        let minRow = data[0];
        data.forEach(r => {
          const v = parseNumericValue(r[primaryKeyUsed || primaryMetricKey]);
          if (v !== null && v < minVal) {
            minVal = v;
            minRow = r;
          }
        });
        if (minRow && minRow[dateCol]) {
          dynamicMonth = formatMonthYearItalian(String(minRow[dateCol]));
        }
      } else {
        const lastRow = data[data.length - 1];
        if (lastRow && lastRow[dateCol]) {
          dynamicMonth = formatMonthYearItalian(String(lastRow[dateCol]));
        }
        if (data.length > 1) {
          const prevRow = data[data.length - 2];
          if (prevRow && prevRow[dateCol]) {
            dynamicCompMonth = formatMonthYearItalian(String(prevRow[dateCol]));
          }
        }
      }
    }
  }

  // 3. Fallback from activeTimeRange if month or period still unknown
  if (activeTimeRange && activeTimeRange !== 'No filter') {
    const rangeMatch = activeTimeRange.match(
      /(\d{4}-\d{2}-\d{2})\s*:\s*(\d{4}-\d{2}-\d{2})?/,
    );
    if (rangeMatch) {
      const startFmt = formatMonthYearItalian(rangeMatch[1]);
      const endFmt = rangeMatch[2] ? formatMonthYearItalian(rangeMatch[2]) : null;
      if (!dynamicPeriod) {
        dynamicPeriod = endFmt ? `${startFmt} - ${endFmt}` : `dal ${startFmt}`;
      }
      if (!dynamicMonth && endFmt) {
        dynamicMonth = endFmt;
      }
    } else if (activeTimeRange.toLowerCase().includes('last 12 months')) {
      if (!dynamicPeriod) dynamicPeriod = '12 mesi';
    } else if (activeTimeRange.toLowerCase().includes('last 6 months')) {
      if (!dynamicPeriod) dynamicPeriod = '6 mesi';
    }
  }

  // Dynamic subtitle resolution
  let dynamicSubtitle = getProp<string>('kpiSubtitle', 'kpi_subtitle', '');
  
  if (explicitDynamicVal) {
    if (dynamicSubtitle && dynamicSubtitle.includes('{dynamic}')) {
      dynamicSubtitle = dynamicSubtitle.replace(/{dynamic}/gi, explicitDynamicVal);
    } else if (!dynamicSubtitle) {
      dynamicSubtitle = explicitDynamicVal;
    }
  }

  if (!dynamicSubtitle && activeTimeRange && activeTimeRange !== 'No filter') {
    dynamicSubtitle = `Periodo: ${dynamicPeriod || activeTimeRange}`;
  } else if (dynamicSubtitle) {
    if (dynamicPeriod) {
      dynamicSubtitle = dynamicSubtitle.replace(/{period}|{periodo}/gi, dynamicPeriod);
    }
    if (dynamicMonth) {
      dynamicSubtitle = dynamicSubtitle.replace(/{month}|{mese}/gi, dynamicMonth);
    }
    if (explicitDynamicVal && dynamicSubtitle.includes('{dynamic}')) {
      dynamicSubtitle = dynamicSubtitle.replace(/{dynamic}/gi, explicitDynamicVal);
    }
  }

  // Dynamic comparison label resolution
  let resolvedComparisonLabel = getProp<string | undefined>('comparisonLabel', 'comparison_label', undefined);
  if (dynamicCompMonth) {
    if (
      !resolvedComparisonLabel ||
      resolvedComparisonLabel === 'vs Mese precedente' ||
      resolvedComparisonLabel === 'vs Mese Prec.' ||
      resolvedComparisonLabel === 'vs Periodo Prec.' ||
      resolvedComparisonLabel === 'vs Confronto' ||
      resolvedComparisonLabel.startsWith('vs Mese') ||
      resolvedComparisonLabel.startsWith('vs Agosto') ||
      resolvedComparisonLabel.startsWith('vs Settembre')
    ) {
      resolvedComparisonLabel = `vs ${dynamicCompMonth}`;
    } else if (
      resolvedComparisonLabel.includes('{comp_month}') ||
      resolvedComparisonLabel.includes('{mese_prec}')
    ) {
      resolvedComparisonLabel = resolvedComparisonLabel.replace(
        /{comp_month}|{mese_prec}/gi,
        dynamicCompMonth,
      );
    }
  } else if (
    !resolvedComparisonLabel ||
    resolvedComparisonLabel === 'vs Periodo Prec.' ||
    resolvedComparisonLabel === 'vs Benchmark'
  ) {
    if (calculationMode === 'static_target') {
      resolvedComparisonLabel = 'vs Obiettivo';
    } else if (calculationMode === 'time_shift') {
      if (comparisonValue === null) {
        resolvedComparisonLabel = '⚠️ Richiede Filtro Temporale';
      } else {
        const shift = getProp<string>('timeCompare', 'time_compare', '1 year ago');
        switch (shift) {
          case '1 year ago':
            resolvedComparisonLabel = 'vs Stesso Periodo Anno Prec.';
            break;
          case '1 month ago':
            resolvedComparisonLabel = 'vs Mese Prec.';
            break;
          case '1 week ago':
            resolvedComparisonLabel = 'vs Settimana Prec.';
            break;
          case '28 days ago':
            resolvedComparisonLabel = 'vs 4 Settimane Fa';
            break;
          default:
            resolvedComparisonLabel = `vs ${shift}`;
        }
      }
    } else if (
      comparisonMetricKey &&
      !comparisonMetricKey.toLowerCase().includes('conf')
    ) {
      resolvedComparisonLabel = `vs ${comparisonMetricKey}`;
    } else {
      resolvedComparisonLabel = 'vs Confronto';
    }
  }

  // Dynamic title resolution
  let resolvedTitle = getProp<string>('kpiTitle', 'kpi_title', '');

  if (resolvedTitle) {
    // 1. Template replacement if placeholders present
    if (explicitDynamicVal && resolvedTitle.includes('{dynamic}')) {
      resolvedTitle = resolvedTitle.replace(/{dynamic}/gi, explicitDynamicVal);
    }
    if (
      dynamicMonth &&
      (resolvedTitle.includes('{month}') || resolvedTitle.includes('{mese}'))
    ) {
      resolvedTitle = resolvedTitle.replace(/{month}|{mese}/gi, dynamicMonth);
    }
    if (
      dynamicPeriod &&
      (resolvedTitle.includes('{period}') || resolvedTitle.includes('{periodo}'))
    ) {
      resolvedTitle = resolvedTitle.replace(/{period}|{periodo}/gi, dynamicPeriod);
    }

    // 2. Automatic smart append/update if title is standard pattern without template token
    const tLow = resolvedTitle.toLowerCase().trim();
    if (dynamicMonth) {
      if (tLow === 'mese di picco' || tLow === 'picco') {
        resolvedTitle = `Picco · ${dynamicMonth}`;
      } else if (
        tLow.startsWith('picco:') ||
        tLow.startsWith('picco :') ||
        tLow.startsWith('picco ·')
      ) {
        resolvedTitle = `Picco · ${dynamicMonth}`;
      } else if (
        tLow === 'mese più basso' ||
        tLow === 'mese piu basso' ||
        tLow === 'minimo'
      ) {
        resolvedTitle = `Minimo · ${dynamicMonth}`;
      } else if (
        tLow.startsWith('minimo:') ||
        tLow.startsWith('minimo :') ||
        tLow.startsWith('minimo ·')
      ) {
        resolvedTitle = `Minimo · ${dynamicMonth}`;
      } else if (
        tLow === 'richieste ultimo mese' ||
        tLow === 'ultimo mese' ||
        tLow === 'richieste mese corrente' ||
        tLow === 'richieste'
      ) {
        resolvedTitle = `Richieste · ${dynamicMonth}`;
      } else if (
        tLow.startsWith('richieste ·') ||
        tLow.startsWith('richieste:')
      ) {
        resolvedTitle = `Richieste · ${dynamicMonth}`;
      }
    }
    if (isPeak || isMin) {
      resolvedTitle = '';
      if (dynamicMonth) {
        dynamicSubtitle = dynamicMonth;
      }
    }
  } else {
    resolvedTitle = '';
  }

  const showTitle = getProp<boolean>('showTitle', 'show_title', true) !== false;
  if (!showTitle) {
    resolvedTitle = '';
  }

  // If Peak or Min or comparison disabled, comparison is strictly disabled
  if (isPeak || isMin || !enableComparison) {
    comparisonValue = null;
    deltaAbsolute = null;
    deltaPercent = null;
    if (dynamicMonth) {
      dynamicSubtitle = dynamicMonth;
    }
  }

  const isBadgeNone = badgeContent === 'none';

  const hasComparison =
    !isBadgeNone &&
    !isPeak &&
    !isMin &&
    primaryValue !== null &&
    ((enableComparison && comparisonValue !== null && deltaPercent !== null) || hasPercentOfTotal);

  // Aesthetic Customization
  const cardBgColor = resolveCardBgColor(getProp<any>('cardBgColor', 'card_bg_color', undefined));

  const cardBorderRadius: CardBorderRadius = getProp<CardBorderRadius>('cardBorderRadius', 'card_border_radius', 'square');
  const cardBoxShadow: CardBoxShadow = getProp<CardBoxShadow>('cardBoxShadow', 'card_box_shadow', 'none');
  const prefixValue = getProp<string>('prefixValue', 'prefix_value', '');
  const suffixValue = getProp<string>('suffixValue', 'suffix_value', '');
  const cardAlignment = getProp<CardAlignment>('cardAlignment', 'card_alignment', 'left');
  const showComparisonValue = getProp<boolean>('showComparisonValue', 'show_comparison_value', true);
  const showComparisonLabel = getProp<boolean>('showComparisonLabel', 'show_comparison_label', true);
  const showBadge = getProp<boolean>('showBadge', 'show_badge', true);
  const showAbsoluteDelta = getProp<boolean>('showAbsoluteDelta', 'show_absolute_delta', true);
  const sparklineFill = getProp<boolean>('sparklineFill', 'sparkline_fill', true);

  return {
    width,
    height,
    primaryValue,
    comparisonValue,
    hasComparison,
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
    kpiTitle: resolvedTitle,
    kpiSubtitle: dynamicSubtitle,
    comparisonLabel: resolvedComparisonLabel,
    prefixValue,
    suffixValue,
    cardBgColor,
    cardBorderRadius,
    cardBoxShadow,
    badgeStyle,
    cardAlignment,
    showTitle: showTitle !== false,
    showBadge: showBadge !== false,
    showComparisonValue: showComparisonValue !== false,
    showComparisonLabel: showComparisonLabel !== false,
    showAbsoluteDelta: showAbsoluteDelta !== false,
    showSparkline,
    sparklineData,
    sparklineColor,
    sparklineFill: sparklineFill !== false,
    showProgressBar,
    targetProgressPercent,
    applyTrendColorTo: getProp<'badge' | 'text' | 'background'>('applyTrendColorTo', 'apply_trend_color_to', 'badge'),
    clickUrl: getProp<string>('clickUrl', 'click_url', ''),
    clickTarget: getProp<'_blank' | '_self'>('clickTarget', 'click_target', '_self'),
  };
}
