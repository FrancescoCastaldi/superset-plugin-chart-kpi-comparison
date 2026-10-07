import transformProps from '../src/plugin/transformProps';

type Row = Record<string, any>;

const run = (
  formData: Record<string, any>,
  data: Row[] = [],
  rawFormData: Record<string, any> = {},
) =>
  transformProps({
    width: 320,
    height: 160,
    formData,
    rawFormData,
    queriesData: [{ data }],
  } as any);

const dualMetric = {
  calculation_mode: 'dual_metric',
  metric: 'sum_richieste',
  comparison_metric: 'sum_richieste_conf',
};

const monthlyRows: Row[] = [
  { mese: '2026-01', sum_richieste: 10, sum_richieste_conf: 8 },
  { mese: '2026-02', sum_richieste: 50, sum_richieste_conf: 40 },
  { mese: '2026-03', sum_richieste: 30, sum_richieste_conf: 20 },
];

const NEUTRAL = {
  trendColor: '#94a3b8',
  badgeBackgroundColor: '#f1f5f9',
  badgeTextColor: '#64748b',
};
const POSITIVE = {
  trendColor: '#10b981',
  badgeBackgroundColor: '#dcfce7',
  badgeTextColor: '#15803d',
};
const NEGATIVE = {
  trendColor: '#ef4444',
  badgeBackgroundColor: '#fee2e2',
  badgeTextColor: '#b91c1c',
};

describe('KPI Comparison transformProps', () => {
  describe('full output shape', () => {
    it('maps a dual-metric single row to the complete props contract', () => {
      expect(run(dualMetric, [{ sum_richieste: 1200, sum_richieste_conf: 1000 }])).toEqual({
        width: 320,
        height: 160,
        primaryValue: 1200,
        comparisonValue: 1000,
        hasComparison: true,
        deltaAbsolute: 200,
        deltaPercent: 20,
        formattedPrimary: '1.200',
        formattedComparison: '1.000',
        formattedDeltaAbsolute: '+200',
        formattedDeltaPercent: '+20,0%',
        trendDirection: 'up',
        ...POSITIVE,
        kpiTitle: '',
        kpiSubtitle: '',
        comparisonLabel: 'vs Confronto',
        prefixValue: '',
        suffixValue: '',
        cardBgColor: 'transparent',
        cardBorderRadius: 'square',
        cardBoxShadow: 'none',
        badgeStyle: 'pill',
        cardAlignment: 'left',
        showTitle: true,
        showBadge: true,
        showComparisonValue: true,
        showComparisonLabel: true,
        showAbsoluteDelta: true,
        showSparkline: false,
        sparklineData: [],
        sparklineColor: '#2563eb',
        sparklineFill: true,
        showProgressBar: false,
        targetProgressPercent: null,
        applyTrendColorTo: 'badge',
        clickUrl: '',
        clickTarget: '_self',
      });
    });

    it('returns empty placeholders when the query returns no rows', () => {
      const props = run(dualMetric, []);
      expect(props.primaryValue).toBeNull();
      expect(props.comparisonValue).toBeNull();
      expect(props.deltaPercent).toBeNull();
      expect(props.formattedPrimary).toBe('—');
      expect(props.formattedComparison).toBe('—');
      expect(props.formattedDeltaPercent).toBe('—%');
      expect(props.formattedDeltaAbsolute).toBe('—');
      expect(props.trendDirection).toBe('flat');
      expect(props).toMatchObject(NEUTRAL);
      expect(props.hasComparison).toBe(false);
    });

    it('treats a missing queriesData payload as no rows', () => {
      const props = transformProps({ width: 1, height: 1, formData: dualMetric } as any);
      expect(props.primaryValue).toBeNull();
      expect(props.sparklineData).toEqual([]);
    });
  });

  describe('control resolution (camelCase / snake_case / rawFormData)', () => {
    it('prefers camelCase formData keys over snake_case ones', () => {
      const props = run(
        {
          ...dualMetric,
          calculationMode: 'static_target',
          targetStaticValue: '1000',
        },
        [{ sum_richieste: 900, sum_richieste_conf: 10 }],
      );
      expect(props.comparisonValue).toBe(1000);
      expect(props.comparisonLabel).toBe('vs Obiettivo');
    });

    it('falls back to rawFormData when formData lacks the control', () => {
      const props = run(
        dualMetric,
        [{ sum_richieste: 1200, sum_richieste_conf: 1000 }],
        { invert_polarity: true, prefix_value: '€ ' },
      );
      expect(props).toMatchObject(NEGATIVE);
      expect(props.prefixValue).toBe('€ ');
    });

    it('maps the aesthetic and interactivity controls through', () => {
      const props = run(
        {
          ...dualMetric,
          card_border_radius: 'rounded',
          card_box_shadow: 'elevated',
          card_alignment: 'center',
          suffix_value: ' pz',
          show_title: false,
          show_badge: false,
          show_comparison_value: false,
          show_comparison_label: false,
          show_absolute_delta: false,
          sparkline_fill: false,
          apply_trend_color_to: 'background',
          click_url: 'https://example.org',
          click_target: '_blank',
        },
        [{ sum_richieste: 1, sum_richieste_conf: 1 }],
      );
      expect(props).toMatchObject({
        cardBorderRadius: 'rounded',
        cardBoxShadow: 'elevated',
        cardAlignment: 'center',
        suffixValue: ' pz',
        showTitle: false,
        showBadge: false,
        showComparisonValue: false,
        showComparisonLabel: false,
        showAbsoluteDelta: false,
        sparklineFill: false,
        applyTrendColorTo: 'background',
        clickUrl: 'https://example.org',
        clickTarget: '_blank',
      });
    });
  });

  describe('primary value extraction', () => {
    it('matches the primary metric key case-insensitively', () => {
      const props = run({ ...dualMetric, metric: 'SUM_RICHIESTE' }, [{ sum_richieste: 7 }]);
      expect(props.primaryValue).toBe(7);
    });

    it('resolves adhoc metric objects through their label', () => {
      const props = run(
        { ...dualMetric, metric: { label: 'Richieste', sqlExpression: 'SUM(x)' } },
        [{ Richieste: 42, sum_richieste_conf: 21 }],
      );
      expect(props.primaryValue).toBe(42);
      expect(props.deltaPercent).toBe(100);
    });

    it('falls back to the first numeric column when the metric is not found', () => {
      const props = run({ ...dualMetric, metric: 'missing' }, [{ label: 'x', value: 42 }]);
      expect(props.primaryValue).toBe(42);
    });

    it('parses Italian-formatted numeric strings', () => {
      const props = run(dualMetric, [{ sum_richieste: '12,5', sum_richieste_conf: '10' }]);
      expect(props.primaryValue).toBe(12.5);
      expect(props.comparisonValue).toBe(10);
      expect(props.formattedPrimary).toBe('12,50');
    });
  });

  describe('comparison value by calculation mode', () => {
    it('finds the comparison metric through keyword fallback in dual-metric mode', () => {
      const props = run({ ...dualMetric, comparison_metric: 'cmp_x' }, [
        { sum_richieste: 10, valore_prev: 8 },
      ]);
      expect(props.comparisonValue).toBe(8);
    });

    it('labels a non-"conf" comparison metric with its own name', () => {
      const props = run({ ...dualMetric, comparison_metric: 'benchmark' }, [
        { sum_richieste: 10, benchmark: 8 },
      ]);
      expect(props.comparisonLabel).toBe('vs benchmark');
    });

    it('uses the static target value in static_target mode', () => {
      const props = run(
        { calculation_mode: 'static_target', metric: 'sum_richieste', target_static_value: '1000' },
        [{ sum_richieste: 900 }],
      );
      expect(props.comparisonValue).toBe(1000);
      expect(props.deltaAbsolute).toBe(-100);
      expect(props.deltaPercent).toBe(-10);
      expect(props.formattedDeltaAbsolute).toBe('-100');
      expect(props.formattedDeltaPercent).toBe('-10,0%');
      expect(props.trendDirection).toBe('down');
      expect(props).toMatchObject(NEGATIVE);
      expect(props.comparisonLabel).toBe('vs Obiettivo');
    });

    it('falls back to the target metric column when the static value is not numeric', () => {
      const props = run(
        { calculation_mode: 'static_target', metric: 'sum_richieste', target_metric: 'obiettivo' },
        [{ sum_richieste: 900, obiettivo: 1000 }],
      );
      expect(props.comparisonValue).toBe(1000);
    });

    it('reads the offset column in time_shift mode', () => {
      const props = run({ calculation_mode: 'time_shift', metric: 'sum_richieste' }, [
        { sum_richieste: 110, 'sum_richieste__1 year ago': 100 },
      ]);
      expect(props.comparisonValue).toBe(100);
      expect(props.deltaPercent).toBeCloseTo(10, 10);
      expect(props.comparisonLabel).toBe('vs Stesso Periodo Anno Prec.');
    });

    it.each([
      ['1 month ago', 'vs Mese Prec.'],
      ['1 week ago', 'vs Settimana Prec.'],
      ['28 days ago', 'vs 4 Settimane Fa'],
      ['2 years ago', 'vs 2 years ago'],
    ])('labels the %s time shift as "%s"', (shift, label) => {
      const props = run(
        { calculation_mode: 'time_shift', metric: 'sum_richieste', time_compare: shift },
        [{ sum_richieste: 110, [`sum_richieste__${shift}`]: 100 }],
      );
      expect(props.comparisonLabel).toBe(label);
    });

    it('uses the second row in time_shift mode when no offset column exists', () => {
      const props = run({ calculation_mode: 'time_shift', metric: 'sum_richieste' }, [
        { sum_richieste: 110 },
        { sum_richieste: 100 },
      ]);
      expect(props.comparisonValue).toBe(100);
    });

    it('warns about the missing time filter when time_shift has no comparison data', () => {
      const props = run({ calculation_mode: 'time_shift', metric: 'sum_richieste' }, [
        { sum_richieste: 110 },
      ]);
      expect(props.comparisonValue).toBeNull();
      expect(props.comparisonLabel).toBe('⚠️ Richiede Filtro Temporale');
      expect(props.hasComparison).toBe(false);
      expect(props.formattedDeltaPercent).toBe('—%');
      expect(props).toMatchObject(NEUTRAL);
    });

    it.each([
      ['enable_comparison disabled', { ...dualMetric, enable_comparison: false }],
      ['calculation_mode none', { ...dualMetric, calculation_mode: 'none' }],
    ])('drops comparison and deltas with %s', (_name, formData) => {
      const props = run(formData, [{ sum_richieste: 1200, sum_richieste_conf: 1000 }]);
      expect(props.comparisonValue).toBeNull();
      expect(props.deltaAbsolute).toBeNull();
      expect(props.deltaPercent).toBeNull();
      expect(props.hasComparison).toBe(false);
      expect(props.formattedComparison).toBe('—');
      expect(props.trendDirection).toBe('flat');
    });
  });

  describe('delta, polarity and badge colors', () => {
    it('reports +100% when the comparison is zero and the primary is not', () => {
      const props = run(dualMetric, [{ sum_richieste: 5, sum_richieste_conf: 0 }]);
      expect(props.deltaPercent).toBe(100);
      expect(props.trendDirection).toBe('up');
    });

    it('reports 0% flat when both values are zero', () => {
      const props = run(dualMetric, [{ sum_richieste: 0, sum_richieste_conf: 0 }]);
      expect(props.deltaPercent).toBe(0);
      expect(props.trendDirection).toBe('flat');
      expect(props).toMatchObject(NEUTRAL);
    });

    it('divides by the absolute comparison value for negative baselines', () => {
      const props = run(dualMetric, [{ sum_richieste: -50, sum_richieste_conf: -100 }]);
      expect(props.deltaPercent).toBe(50);
      expect(props.trendDirection).toBe('up');
    });

    it('treats sub-threshold deltas as flat', () => {
      const props = run(dualMetric, [{ sum_richieste: 1000.005, sum_richieste_conf: 1000 }]);
      expect(props.trendDirection).toBe('flat');
    });

    it('turns a decrease green when polarity is inverted', () => {
      const props = run({ ...dualMetric, invert_polarity: true }, [
        { sum_richieste: 900, sum_richieste_conf: 1000 },
      ]);
      expect(props.trendDirection).toBe('down');
      expect(props).toMatchObject(POSITIVE);
    });

    it('uses a transparent badge background with the subtle badge style', () => {
      const props = run({ ...dualMetric, badge_style: 'subtle' }, [
        { sum_richieste: 900, sum_richieste_conf: 1000 },
      ]);
      expect(props.badgeStyle).toBe('subtle');
      expect(props.badgeBackgroundColor).toBe('transparent');
      expect(props.badgeTextColor).toBe('#b91c1c');
    });

    it('hides the comparison block when badge content is none', () => {
      const props = run({ ...dualMetric, badge_content: 'none' }, [
        { sum_richieste: 1200, sum_richieste_conf: 1000 },
      ]);
      expect(props.deltaPercent).toBe(20);
      expect(props.hasComparison).toBe(false);
    });
  });

  describe('percent of total badge', () => {
    const totalFd = { ...dualMetric, badge_content: 'percent_of_total', total_metric: 'totale' };
    const totalRow = [{ sum_richieste: 250, sum_richieste_conf: 200, totale: 1000 }];

    it('replaces the delta badge with the share of the total and the default indigo color', () => {
      const props = run(totalFd, totalRow);
      expect(props.formattedDeltaPercent).toBe('25,0%');
      expect(props.formattedDeltaAbsolute).toBe('—');
      expect(props.trendDirection).toBe('none');
      expect(props.badgeBackgroundColor).toBe('rgba(99, 102, 241, 1)');
      expect(props.badgeTextColor).toBe('#ffffff');
      expect(props.trendColor).toBe('#10b981');
      expect(props.hasComparison).toBe(true);
    });

    it('picks dark text on a light custom badge color', () => {
      const props = run(
        { ...totalFd, total_badge_color: { r: 254, g: 240, b: 138, a: 0.5 } },
        totalRow,
      );
      expect(props.badgeBackgroundColor).toBe('rgba(254, 240, 138, 0.5)');
      expect(props.badgeTextColor).toBe('#0f172a');
    });

    it('keeps the delta badge when the total is zero', () => {
      const props = run(totalFd, [{ sum_richieste: 250, sum_richieste_conf: 200, totale: 0 }]);
      expect(props.formattedDeltaPercent).toBe('+25,0%');
      expect(props.trendDirection).toBe('up');
    });

    it('keeps percent of total even when comparison is disabled', () => {
      const props = run({ ...totalFd, enable_comparison: false }, totalRow);
      expect(props.hasComparison).toBe(true);
      expect(props.formattedDeltaPercent).toBe('25,0%');
    });
  });

  describe('sparkline and multi-row series', () => {
    it('uses the last row as reference and collects the non-null series values', () => {
      const rows = [
        { mese: '2026-01', sum_richieste: 10, sum_richieste_conf: 8 },
        { mese: '2026-02', sum_richieste: null, sum_richieste_conf: 9 },
        { mese: '2026-03', sum_richieste: 30, sum_richieste_conf: 20 },
      ];
      const props = run({ ...dualMetric, show_sparkline: true, kpi_title: 'Richieste' }, rows);
      expect(props.showSparkline).toBe(true);
      expect(props.sparklineData).toEqual([10, 30]);
      expect(props.primaryValue).toBe(30);
      expect(props.comparisonValue).toBe(20);
      expect(props.deltaPercent).toBe(50);
      expect(props.kpiTitle).toBe('Richieste · Marzo 2026');
      expect(props.comparisonLabel).toBe('vs Febbraio 2026');
    });

    it('uses the first row as reference when the sparkline is off', () => {
      const props = run(dualMetric, monthlyRows);
      expect(props.primaryValue).toBe(10);
      expect(props.sparklineData).toEqual([]);
    });

    it('does not build a sparkline from a single row', () => {
      const props = run({ ...dualMetric, show_sparkline: true }, [
        { sum_richieste: 10, sum_richieste_conf: 8 },
      ]);
      expect(props.sparklineData).toEqual([]);
    });

    it('uses the first row as reference outside dual-metric mode', () => {
      const props = run(
        { calculation_mode: 'time_shift', metric: 'sum_richieste', show_sparkline: true },
        monthlyRows,
      );
      expect(props.primaryValue).toBe(10);
      expect(props.sparklineData).toEqual([10, 50, 30]);
    });

    it.each([
      ['#ff0000', '#ff0000'],
      [{ r: 1, g: 2, b: 3 }, 'rgba(1, 2, 3, 1)'],
      [{ r: 1, g: 2, b: 3, a: 0.4 }, 'rgba(1, 2, 3, 0.4)'],
      [{ r: 1, g: 2 }, '#2563eb'],
    ])('resolves sparkline color %p to %p', (cfg, expected) => {
      const props = run({ ...dualMetric, sparkline_color: cfg }, [{ sum_richieste: 1 }]);
      expect(props.sparklineColor).toBe(expected);
    });
  });

  describe('peak and minimum cards', () => {
    it('selects the peak row and moves the month into the subtitle', () => {
      const props = run({ ...dualMetric, kpi_title: 'Mese di picco' }, monthlyRows);
      expect(props.primaryValue).toBe(50);
      expect(props.comparisonValue).toBeNull();
      expect(props.deltaPercent).toBeNull();
      expect(props.deltaAbsolute).toBeNull();
      expect(props.kpiTitle).toBe('');
      expect(props.kpiSubtitle).toBe('Febbraio 2026');
      expect(props.hasComparison).toBe(false);
    });

    it('selects the minimum row for "più basso" titles', () => {
      const props = run({ ...dualMetric, kpi_title: 'Mese più basso' }, monthlyRows);
      expect(props.primaryValue).toBe(10);
      expect(props.kpiTitle).toBe('');
      expect(props.kpiSubtitle).toBe('Gennaio 2026');
    });

    it('detects a peak card from the slice name but labels it with the last row month', () => {
      const props = run({ ...dualMetric, slice_name: 'Picco richieste' }, monthlyRows);
      expect(props.primaryValue).toBe(50);
      expect(props.comparisonValue).toBeNull();
      expect(props.kpiSubtitle).toBe('Marzo 2026');
    });
  });

  describe('target progress bar', () => {
    it('computes progress against the static target', () => {
      const props = run(
        { ...dualMetric, show_progress_bar: true, target_static_value: '2000' },
        [{ sum_richieste: 1500 }],
      );
      expect(props.showProgressBar).toBe(true);
      expect(props.targetProgressPercent).toBe(75);
    });

    it('prefers the numeric target metric from the first row', () => {
      const props = run(
        {
          ...dualMetric,
          show_progress_bar: true,
          target_metric: 'obiettivo',
          target_static_value: '2000',
        },
        [{ sum_richieste: 1500, obiettivo: 3000 }],
      );
      expect(props.targetProgressPercent).toBe(50);
    });

    it('leaves progress empty for a non-positive target', () => {
      const props = run(
        { ...dualMetric, show_progress_bar: true, target_static_value: '0' },
        [{ sum_richieste: 1500 }],
      );
      expect(props.targetProgressPercent).toBeNull();
    });
  });

  describe('subtitle, title and comparison label templating', () => {
    it('builds a period subtitle from a closed dashboard time range', () => {
      const props = run(dualMetric, [{ sum_richieste: 1 }], {
        time_range: '2026-01-01 : 2026-06-30',
      });
      expect(props.kpiSubtitle).toBe('Periodo: Gennaio 2026 - Giugno 2026');
    });

    it('reads the time range from extra_form_data and maps relative ranges', () => {
      const props = run(dualMetric, [{ sum_richieste: 1 }], {
        extra_form_data: { time_range: 'Last 12 months' },
      });
      expect(props.kpiSubtitle).toBe('Periodo: 12 mesi');
    });

    it('ignores the "No filter" time range', () => {
      const props = run(dualMetric, [{ sum_richieste: 1 }], { time_range: 'No filter' });
      expect(props.kpiSubtitle).toBe('');
    });

    it('replaces month and period placeholders in the subtitle and title', () => {
      const props = run(
        {
          ...dualMetric,
          kpi_title: 'Richieste {mese}',
          kpi_subtitle: '{period} / {month}',
        },
        [{ sum_richieste: 1 }],
        { time_range: '2026-01-01 : 2026-06-30' },
      );
      expect(props.kpiSubtitle).toBe('Gennaio 2026 - Giugno 2026 / Giugno 2026');
      expect(props.kpiTitle).toBe('Richieste Giugno 2026');
    });

    it('fills the {dynamic} placeholder from the dynamic subtitle column', () => {
      const props = run(
        {
          ...dualMetric,
          dynamic_subtitle_column: 'reparto',
          kpi_subtitle: 'Reparto {dynamic}',
          kpi_title: 'Accessi {dynamic}',
        },
        [{ sum_richieste: 1, reparto: 'Cardiologia' }],
      );
      expect(props.kpiSubtitle).toBe('Reparto Cardiologia');
      expect(props.kpiTitle).toBe('Accessi Cardiologia');
    });

    it('uses the dynamic column value as subtitle when none is configured', () => {
      const props = run(
        { ...dualMetric, dynamic_subtitle_column: 'reparto' },
        [{ sum_richieste: 1, reparto: 'Cardiologia' }],
      );
      expect(props.kpiSubtitle).toBe('Cardiologia');
    });

    it('replaces the {comp_month} placeholder in a custom comparison label', () => {
      const props = run(
        { ...dualMetric, comparison_label: 'rispetto a {comp_month}' },
        monthlyRows,
      );
      expect(props.comparisonLabel).toBe('rispetto a Febbraio 2026');
    });

    it('keeps a custom comparison label without placeholders', () => {
      const props = run({ ...dualMetric, comparison_label: 'Benchmark regionale' }, monthlyRows);
      expect(props.comparisonLabel).toBe('Benchmark regionale');
    });

    it('clears the title when show_title is disabled', () => {
      const props = run({ ...dualMetric, kpi_title: 'Richieste', show_title: false }, [
        { sum_richieste: 1 },
      ]);
      expect(props.kpiTitle).toBe('');
      expect(props.showTitle).toBe(false);
    });
  });

  describe('number formatting and card background', () => {
    it('formats values through the Superset SMART_NUMBER formatter', () => {
      const props = run({ ...dualMetric, number_format: 'SMART_NUMBER' }, [
        { sum_richieste: 1200, sum_richieste_conf: 1000 },
      ]);
      expect(props.formattedPrimary).toBe('1.2k');
      expect(props.formattedComparison).toBe('1k');
      expect(props.formattedDeltaAbsolute).toBe('+200');
    });

    it('formats values through a d3 format string', () => {
      const props = run({ ...dualMetric, number_format: ',.2f' }, [
        { sum_richieste: 1234.5, sum_richieste_conf: 1000 },
      ]);
      expect(props.formattedPrimary).toBe('1,234.50');
    });

    it.each([
      ['#ffffff', '#ffffff'],
      [{ r: 10, g: 20, b: 30 }, 'rgba(10, 20, 30, 1)'],
      [{ r: 10, g: 20, b: 30, a: 0 }, 'transparent'],
      [{ r: 10, g: 20, b: 30, a: 0.8 }, 'rgba(10, 20, 30, 0.8)'],
    ])('resolves card background %p to %p', (cfg, expected) => {
      const props = run({ ...dualMetric, card_bg_color: cfg }, [{ sum_richieste: 1 }]);
      expect(props.cardBgColor).toBe(expected);
    });
  });
});
