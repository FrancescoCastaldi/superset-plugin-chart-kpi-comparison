import { KPIComparisonFormData, KPIComparisonProps } from '../src/types';

describe('Typography & Aesthetic Types Contracts', () => {
  it('should allow complete typography and aesthetic form data configuration', () => {
    const formData: KPIComparisonFormData = {
      datasource: '1__table',
      viz_type: 'kpi_comparison',
      metric: 'visits',
      // Typography
      kpi_font_family: 'Inter',
      kpi_font_size_mode: 'manual',
      kpi_font_size_manual: 42,
      kpi_font_weight: '700',
      kpi_letter_spacing: 'tight',
      kpi_tabular_nums: true,
      kpi_color: '#0f172a',
      title_font_size: 'medium',
      title_font_weight: '600',
      title_color: '#475569',
      title_text_transform: 'uppercase',
      subtitle_font_size: 'small',
      subtitle_font_weight: '400',
      subtitle_color: '#94a3b8',
      comparison_font_size: 'medium',
      comparison_font_weight: '600',
      comparison_color: '#334155',
      // Aesthetics
      card_border_radius: 'rounded',
      card_box_shadow: 'elevated',
      card_border_color: '#e2e8f0',
      card_border_width: 1,
      sparkline_curve: 'smooth',
      sparkline_show_points: true,
    };

    expect(formData.kpi_font_family).toBe('Inter');
    expect(formData.kpi_font_size_mode).toBe('manual');
    expect(formData.kpi_font_size_manual).toBe(42);
    expect(formData.kpi_font_weight).toBe('700');
    expect(formData.sparkline_curve).toBe('smooth');
  });

  it('should satisfy transformed props contract with typography and styling props', () => {
    const props: Partial<KPIComparisonProps> = {
      width: 300,
      height: 150,
      formattedPrimary: '27.140',
      kpiFontFamily: 'Inter',
      kpiFontSizeMode: 'auto',
      kpiFontSizeManual: 36,
      kpiFontWeight: '800',
      kpiLetterSpacing: 'tight',
      kpiTabularNums: true,
      kpiColor: '#0f172a',
      titleFontSize: 'medium',
      titleFontWeight: '600',
      titleColor: '#475569',
      titleTextTransform: 'uppercase',
      subtitleFontSize: 'small',
      subtitleFontWeight: '400',
      subtitleColor: '#94a3b8',
      comparisonFontSize: 'medium',
      comparisonFontWeight: '600',
      comparisonColor: '#334155',
      cardBorderColor: '#e2e8f0',
      cardBorderWidth: 1,
      sparklineCurve: 'smooth',
      sparklineShowPoints: true,
    };

    expect(props.kpiFontFamily).toBe('Inter');
    expect(props.kpiTabularNums).toBe(true);
    expect(props.sparklineCurve).toBe('smooth');
  });
});
