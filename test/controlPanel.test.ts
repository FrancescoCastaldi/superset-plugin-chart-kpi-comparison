import config from '../src/plugin/controlPanel';

describe('KPI Comparison Explore ControlPanel Config', () => {
  it('should export valid ControlPanelConfig with all required sections', () => {
    expect(config).toBeDefined();
    expect(config.controlPanelSections).toBeInstanceOf(Array);

    const sectionLabels = config.controlPanelSections.map((s: any) => s.label);
    expect(sectionLabels).toContain('Filtri Temporali');
    expect(sectionLabels).toContain('Configurazione Metriche & Confronto');
    expect(sectionLabels).toContain('Personalizzazione Estetica Card');
    expect(sectionLabels).toContain('Tipografia & Personalizzazione Testo');
    expect(sectionLabels).toContain('Delta % & Polarità Semantica');
    expect(sectionLabels).toContain('Trendline / Sparkline');
  });

  it('should include typography controls for font family, size mode and weight', () => {
    const typoSection = config.controlPanelSections.find(
      (s: any) => s.label === 'Tipografia & Personalizzazione Testo'
    );
    expect(typoSection).toBeDefined();

    const controlNames: string[] = [];
    typoSection.controlSetRows.forEach((row: any[]) => {
      row.forEach((ctrl: any) => {
        if (ctrl && ctrl.name) controlNames.push(ctrl.name);
      });
    });

    expect(controlNames).toContain('kpi_font_family');
    expect(controlNames).toContain('kpi_font_size_mode');
    expect(controlNames).toContain('kpi_font_weight');
    expect(controlNames).toContain('kpi_letter_spacing');
    expect(controlNames).toContain('kpi_tabular_nums');
    expect(controlNames).toContain('title_font_size');
    expect(controlNames).toContain('title_font_weight');
  });
});
