import { ChartProps } from '@superset-ui/core';
import {
  BadgeStyle,
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
  let primaryKeyUsed: string | null = null;
  const sparklineData: number[] = [];
  let referenceRow: Record<string, any> | undefined;

  if (data.length > 0) {
    // v0.1.4: con sparkline attiva in modalita' dual_metric la query viene
    // ordinata in ordine crescente sulla colonna temporale (row_limit 50):
    // il valore primario e il confronto sono letti dall'ULTIMA riga (periodo
    // piu' recente), mentre la sparkline usa l'intera serie. Senza sparkline
    // (row_limit 1) il comportamento resta identico (prima riga). Il ramo
    // time-shift (else) non viene toccato.
    referenceRow =
      calculationMode === 'dual_metric' &&
      fd.show_sparkline &&
      data.length > 1
        ? data[data.length - 1]
        : data[0];
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
    if (calculationMode === 'dual_metric') {
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

      // Robust fallback 1: search for keys containing comparison keywords
      if (comparisonValue === null) {
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

      // Robust fallback 2: take any second numeric column in referenceRow that is not primaryKeyUsed
      if (comparisonValue === null) {
        const nextNumKey = Object.keys(referenceRow).find(
          k => k !== primaryKeyUsed && typeof referenceRow[k] === 'number',
        );
        if (nextNumKey) {
          comparisonValue = parseNumericValue(referenceRow[nextNumKey]);
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
    } else if (primaryValue === 0) {
      deltaPercent = 0;
    } else {
      deltaPercent = 100;
    }

    if (deltaPercent > 0.001) {
      trendDirection = 'up';
    } else if (deltaPercent < -0.001) {
      trendDirection = 'down';
    } else {
      trendDirection = 'flat';
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

  // Dynamic context: extract active time range filter from dashboard
  const rawFd = (chartProps.rawFormData || {}) as any;
  const activeTimeRange =
    rawFd.time_range ||
    rawFd.extra_form_data?.time_range ||
    rawFd.extraFormData?.time_range;

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
    const dateCol = Object.keys(data[0]).find(k => {
      const kLow = k.toLowerCase();
      return (
        k === fd.time_column ||
        kLow.includes('mese') ||
        kLow.includes('month') ||
        kLow.includes('data') ||
        kLow.includes('date')
      );
    });

    if (dateCol) {
      const titleLower = (fd.kpi_title || '').toLowerCase();
      const isPeak = titleLower.includes('picco') || titleLower.includes('peak');
      const isMin =
        titleLower.includes('minimo') ||
        titleLower.includes('basso') ||
        titleLower.includes('lowest');

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
  let dynamicSubtitle = fd.kpi_subtitle || '';
  if (!dynamicSubtitle && activeTimeRange && activeTimeRange !== 'No filter') {
    dynamicSubtitle = `Periodo: ${dynamicPeriod || activeTimeRange}`;
  } else if (dynamicSubtitle) {
    if (dynamicPeriod) {
      dynamicSubtitle = dynamicSubtitle.replace(/{period}|{periodo}/gi, dynamicPeriod);
    }
    if (dynamicMonth) {
      dynamicSubtitle = dynamicSubtitle.replace(/{month}|{mese}/gi, dynamicMonth);
    }
  }

  // Dynamic comparison label resolution
  let resolvedComparisonLabel = fd.comparison_label;
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
    if (calculationMode === 'time_shift') {
      const shift = fd.time_compare || '1 year ago';
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
  let resolvedTitle = fd.kpi_title || '';

  if (resolvedTitle) {
    // 1. Template replacement if placeholders present
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
    if (
      dynamicPeriod &&
      (tLow === 'media mensile' ||
        tLow.startsWith('media mensile ·') ||
        tLow.startsWith('media mensile ('))
    ) {
      resolvedTitle = `Media mensile · ${dynamicPeriod}`;
    }
  } else {
    // If no title configured, use smart defaults
    if (primaryMetricKey) {
      const pLow = primaryMetricKey.toLowerCase();
      if (pLow.includes('picco')) {
        resolvedTitle = dynamicMonth ? `Picco · ${dynamicMonth}` : 'Mese di picco';
      } else if (pLow.includes('minimo') || pLow.includes('basso')) {
        resolvedTitle = dynamicMonth ? `Minimo · ${dynamicMonth}` : 'Mese più basso';
      } else if (pLow.includes('ultimo') || pLow.includes('corrente')) {
        resolvedTitle = dynamicMonth
          ? `Richieste · ${dynamicMonth}`
          : 'Richieste ultimo mese';
      } else if (pLow.includes('media')) {
        resolvedTitle = dynamicPeriod
          ? `Media mensile · ${dynamicPeriod}`
          : 'Media mensile';
      } else {
        resolvedTitle = dynamicMonth
          ? `${primaryMetricKey} · ${dynamicMonth}`
          : primaryMetricKey;
      }
    } else {
      resolvedTitle = dynamicMonth ? `KPI · ${dynamicMonth}` : 'KPI';
    }
  }


  // Aesthetic Customization
  let cardBgColor = '#ffffff';
  if (fd.card_bg_color) {
    const bg = fd.card_bg_color as any;
    if (typeof bg === 'string') {
      cardBgColor = bg;
    } else if (bg.r !== undefined && bg.g !== undefined && bg.b !== undefined) {
      if (bg.a === 0) {
        cardBgColor = 'transparent';
      } else {
        cardBgColor = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a ?? 1})`;
      }
    }
  }

  const cardBorderRadius: CardBorderRadius = fd.card_border_radius || 'subtle';
  const cardBoxShadow: CardBoxShadow = fd.card_box_shadow || 'none';

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
    kpiTitle: resolvedTitle,
    kpiSubtitle: dynamicSubtitle,
    comparisonLabel: resolvedComparisonLabel,
    prefixValue: fd.prefix_value || '',
    suffixValue: fd.suffix_value || '',
    cardBgColor,
    cardBorderRadius,
    cardBoxShadow,
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
