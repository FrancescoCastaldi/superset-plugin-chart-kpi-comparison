import { useState, useMemo } from 'react';
import transformProps from '@/plugin/transformProps';
import { KPIComparisonChart } from '@/components/KPIComparisonChart';
import { SCENARIOS } from './mockData';

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sc = params.get('scenario');
      if (sc && SCENARIOS.some((s) => s.id === sc)) return sc;
    } catch {}
    return SCENARIOS[0].id;
  });
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0],
    [selectedScenarioId]
  );

  // Dimension states
  const [width, setWidth] = useState<number>(() => {
    try {
      const w = Number(new URLSearchParams(window.location.search).get('w'));
      if (w >= 180 && w <= 800) return w;
    } catch {}
    return 340;
  });
  const [height, setHeight] = useState<number>(() => {
    try {
      const h = Number(new URLSearchParams(window.location.search).get('h'));
      if (h >= 100 && h <= 500) return h;
    } catch {}
    return 170;
  });
  const [canvasBg, setCanvasBg] = useState<'dark' | 'light' | 'white'>(() => {
    try {
      const bg = new URLSearchParams(window.location.search).get('bg');
      if (bg === 'light' || bg === 'white' || bg === 'dark') return bg;
    } catch {}
    return 'dark';
  });

  // Control state derived from scenario
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const sc = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];
    return { ...sc.formData };
  });
  const [activeTab, setActiveTab] = useState<'typography' | 'aesthetic' | 'sparkline' | 'comparison' | 'json'>(() => {
    try {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'aesthetic' || tab === 'sparkline' || tab === 'comparison' || tab === 'json' || tab === 'typography') return tab as any;
    } catch {}
    return 'typography';
  });

  // Sync formData when scenario changes
  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const newSc = SCENARIOS.find((s) => s.id === scenarioId);
    if (newSc) {
      setFormData({ ...newSc.formData });
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Compute transformed props via official plugin transformProps
  const transformedProps = useMemo(() => {
    const chartProps: any = {
      width,
      height,
      formData: { ...formData },
      rawFormData: { ...formData },
      queriesData: [
        {
          data: scenario.data,
        },
      ],
    };
    return transformProps(chartProps);
  }, [width, height, formData, scenario.data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0f172a', color: '#f8fafc' }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #1e293b',
        background: '#090d16',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#fff',
          }}>
            Δ
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              KPI Comparison Card <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 500 }}>Dev Studio Live</span>
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
              Apache Superset Custom Plugin Workbench (Vite + React HMR)
            </p>
          </div>
        </div>

        {/* Scenario Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => handleScenarioChange(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Canvas theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1e293b', padding: '3px', borderRadius: '6px' }}>
            {(['dark', 'light', 'white'] as const).map((bg) => (
              <button
                key={bg}
                onClick={() => setCanvasBg(bg)}
                style={{
                  background: canvasBg === bg ? '#3b82f6' : 'transparent',
                  color: canvasBg === bg ? '#fff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout: Controls (Left) | Canvas (Center/Right) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Explore Control Panel */}
        <div style={{
          width: '380px',
          borderRight: '1px solid #1e293b',
          background: '#0d131f',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#090d16' }}>
            {[
              { id: 'typography', label: '🔠 Font' },
              { id: 'aesthetic', label: '🎨 Stile' },
              { id: 'sparkline', label: '📈 Trend' },
              { id: 'comparison', label: '🔄 Delta' },
              { id: 'json', label: '{ } JSON' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  background: activeTab === tab.id ? '#1e293b' : 'transparent',
                  color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. TYPOGRAPHY TAB */}
            {activeTab === 'typography' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Famiglia Font (Font Family)</label>
                  <select
                    value={formData.kpi_font_family || 'Inter'}
                    onChange={(e) => updateFormData('kpi_font_family', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="Inter">Inter (Consigliato pulito UI)</option>
                    <option value="Roboto">Roboto (Google Material)</option>
                    <option value="Montserrat">Montserrat (Modern Geometric)</option>
                    <option value="Poppins">Poppins (Morbido arrotondato)</option>
                    <option value="Oswald">Oswald (Compatto impatto)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Monospace tech)</option>
                    <option value="Fira Code">Fira Code (Tabular dev)</option>
                    <option value="-apple-system, BlinkMacSystemFont, sans-serif">Sistema Operativo (Default)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Modalità Dimensione Testo</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateFormData('kpi_font_size_mode', 'auto')}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        background: (formData.kpi_font_size_mode || 'auto') === 'auto' ? '#3b82f6' : '#1e293b',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Auto-Fit Fluido
                    </button>
                    <button
                      onClick={() => updateFormData('kpi_font_size_mode', 'manual')}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        background: formData.kpi_font_size_mode === 'manual' ? '#3b82f6' : '#1e293b',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Dimensione Fissa (px)
                    </button>
                  </div>
                </div>

                {formData.kpi_font_size_mode === 'manual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                      <span>Dimensione Valore Principale</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{formData.kpi_font_size_manual || 36}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="84"
                      value={formData.kpi_font_size_manual || 36}
                      onChange={(e) => updateFormData('kpi_font_size_manual', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Peso Font / Grassetto (Font Weight)</label>
                  <select
                    value={formData.kpi_font_weight || '800'}
                    onChange={(e) => updateFormData('kpi_font_weight', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular Normale (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold Grassetto (700)</option>
                    <option value="800">Extra-Bold (800 - Default)</option>
                    <option value="900">Black Massimo (900)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Spaziatura Lettere (Letter Spacing)</label>
                  <select
                    value={formData.kpi_letter_spacing || 'tight'}
                    onChange={(e) => updateFormData('kpi_letter_spacing', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="tight">Stretta (-0.025em per grandi numeri)</option>
                    <option value="normal">Normale (0em)</option>
                    <option value="wide">Larga (+0.04em)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="tabularNums"
                    checked={formData.kpi_tabular_nums !== false}
                    onChange={(e) => updateFormData('kpi_tabular_nums', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="tabularNums" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                    Allineamento Numerico Tabulare (tabular-nums)
                  </label>
                </div>

                <hr style={{ borderColor: '#1e293b', margin: '4px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Titolo Superiore (KPI Title)</label>
                  <input
                    type="text"
                    value={formData.kpi_title || ''}
                    onChange={(e) => updateFormData('kpi_title', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Dimensione Titolo</label>
                    <select
                      value={formData.title_font_size || 'auto'}
                      onChange={(e) => updateFormData('title_font_size', e.target.value)}
                      style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '6px', fontSize: '12px' }}
                    >
                      <option value="auto">Scalato Dinamico</option>
                      <option value="small">Piccolo (11px)</option>
                      <option value="medium">Medio (13px)</option>
                      <option value="large">Grande (15px)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Peso Titolo</label>
                    <select
                      value={formData.title_font_weight || '600'}
                      onChange={(e) => updateFormData('title_font_weight', e.target.value)}
                      style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '6px', fontSize: '12px' }}
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold (700)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Trasformazione Testo Titolo</label>
                  <select
                    value={formData.title_text_transform || 'uppercase'}
                    onChange={(e) => updateFormData('title_text_transform', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="uppercase">Tutto Maiuscolo (UPPERCASE)</option>
                    <option value="capitalize">Iniziali Maiuscole (Capitalize)</option>
                    <option value="none">Come Inserito (Nessuna)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Sottotitolo Dettaglio</label>
                  <input
                    type="text"
                    value={formData.kpi_subtitle || ''}
                    onChange={(e) => updateFormData('kpi_subtitle', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Dimensione Riga Confronto</label>
                  <select
                    value={formData.comparison_font_size || 'small'}
                    onChange={(e) => updateFormData('comparison_font_size', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="small">Compatto</option>
                    <option value="medium">Medio Leggibile</option>
                    <option value="large">Grande Evidente</option>
                  </select>
                </div>
              </>
            )}

            {/* 2. AESTHETIC TAB */}
            {activeTab === 'aesthetic' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Stile & Bordo Card</label>
                  <select
                    value={formData.card_border_radius || 'rounded'}
                    onChange={(e) => updateFormData('card_border_radius', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="square">Squadrato (0px)</option>
                    <option value="subtle">Morbido (8px)</option>
                    <option value="rounded">Arrotondato Moderno (14px)</option>
                    <option value="pill">Pillola Morbida (24px)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Elevazione / Ombra Card</label>
                  <select
                    value={formData.card_box_shadow || 'subtle'}
                    onChange={(e) => updateFormData('card_box_shadow', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="none">Piatta (Nessuna ombra)</option>
                    <option value="subtle">Ombra Leggera Soffusa</option>
                    <option value="elevated">Ombra Pronunciata Executive</option>
                    <option value="bordered">Bordo Pulito (Clean Border)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Colore Bordo Custom</label>
                    <input
                      type="text"
                      placeholder="es. #e2e8f0 o #334155"
                      value={formData.card_border_color || ''}
                      onChange={(e) => updateFormData('card_border_color', e.target.value)}
                      style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '6px', fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Spessore</label>
                    <select
                      value={formData.card_border_width || 1}
                      onChange={(e) => updateFormData('card_border_width', Number(e.target.value))}
                      style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '6px', fontSize: '12px' }}
                    >
                      <option value="1">1 px</option>
                      <option value="2">2 px</option>
                      <option value="3">3 px</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Allineamento Contenuto</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => updateFormData('card_alignment', align)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #334155',
                          background: (formData.card_alignment || 'left') === align ? '#3b82f6' : '#1e293b',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Colore Sfondo Card</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value="#ffffff"
                      onChange={(e) => {
                        const hex = e.target.value;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        updateFormData('card_bg_color', { r, g, b, a: formData.card_bg_color?.a ?? 1 });
                      }}
                      style={{ cursor: 'pointer', width: '36px', height: '36px', borderRadius: '4px', border: 'none' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Opacità Alpha</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.card_bg_color?.a ?? 1}
                        onChange={(e) => {
                          const a = Number(e.target.value);
                          const current = formData.card_bg_color || { r: 255, g: 255, b: 255 };
                          updateFormData('card_bg_color', { ...current, a });
                        }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 3. SPARKLINE & TARGET TAB */}
            {activeTab === 'sparkline' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="showSparkline"
                    checked={Boolean(formData.show_sparkline)}
                    onChange={(e) => updateFormData('show_sparkline', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="showSparkline" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                    Mostra Sparkline Vettoriale SVG
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Stile Curva Sparkline</label>
                  <select
                    value={formData.sparkline_curve || 'smooth'}
                    onChange={(e) => updateFormData('sparkline_curve', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="smooth">Curva Morbida Spline (Bezier)</option>
                    <option value="linear">Lineare Poligonale</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="showPoints"
                    checked={Boolean(formData.sparkline_show_points)}
                    onChange={(e) => updateFormData('sparkline_show_points', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="showPoints" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                    Evidenzia Punto di Picco e Valore Corrente
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="showProgressBar"
                    checked={Boolean(formData.show_progress_bar)}
                    onChange={(e) => updateFormData('show_progress_bar', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="showProgressBar" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                    Mostra Barra Avanzamento Target / Goal
                  </label>
                </div>
              </>
            )}

            {/* 4. COMPARISON TAB */}
            {activeTab === 'comparison' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="enableComp"
                    checked={Boolean(formData.enable_comparison)}
                    onChange={(e) => updateFormData('enable_comparison', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="enableComp" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                    Abilita Confronto / Delta %
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <input
                    type="checkbox"
                    id="invertPolarity"
                    checked={Boolean(formData.invert_polarity)}
                    onChange={(e) => updateFormData('invert_polarity', e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="invertPolarity" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                    Inverti Polarità (Minore è Meglio)
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Stile Badge Delta</label>
                  <select
                    value={formData.badge_style || 'pill'}
                    onChange={(e) => updateFormData('badge_style', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  >
                    <option value="pill">Pillola Evidente (Default)</option>
                    <option value="full">Riquadro Morbido</option>
                    <option value="subtle">Testo Minimale Senza Sfondo</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Etichetta Confronto</label>
                  <input
                    type="text"
                    value={formData.comparison_label || ''}
                    onChange={(e) => updateFormData('comparison_label', e.target.value)}
                    style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                  />
                </div>
              </>
            )}

            {/* 5. JSON CONFIG TAB */}
            {activeTab === 'json' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Configurazione Explore FormData (Pronta per Superset):</span>
                <textarea
                  readOnly
                  value={JSON.stringify(formData, null, 2)}
                  style={{
                    width: '100%',
                    height: '350px',
                    background: '#090d16',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Preview Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: canvasBg === 'dark' ? '#0b1120' : canvasBg === 'light' ? '#f1f5f9' : '#ffffff',
          overflow: 'hidden',
          transition: 'background 0.2s',
        }}>
          {/* Canvas Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderBottom: '1px solid #1e293b',
            background: '#090d16',
          }}>
            {/* Quick Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Preset Dimensioni:</span>
              {[
                { label: 'Standard (320x160)', w: 320, h: 160 },
                { label: 'Compact (240x110)', w: 240, h: 110 },
                { label: 'Micro (180x75)', w: 180, h: 75 },
                { label: 'Banner (500x130)', w: 500, h: 130 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  style={{
                    background: width === p.w && height === p.h ? '#3b82f6' : '#1e293b',
                    color: width === p.w && height === p.h ? '#fff' : '#cbd5e1',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sliders for W x H */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>W:</span>
                <input
                  type="range"
                  min="140"
                  max="700"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  style={{ width: '100px', cursor: 'pointer' }}
                />
                <span style={{ color: '#38bdf8', fontWeight: 600, width: '38px' }}>{width}px</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>H:</span>
                <input
                  type="range"
                  min="60"
                  max="350"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{ width: '100px', cursor: 'pointer' }}
                />
                <span style={{ color: '#38bdf8', fontWeight: 600, width: '38px' }}>{height}px</span>
              </div>
            </div>
          </div>

          {/* Centered Card Rendering Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            position: 'relative',
            overflow: 'auto',
          }}>
            {/* Visual boundary container */}
            <div
              id="kpi-card-container"
              style={{
                position: 'relative',
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                outline: '1px dashed rgba(56, 189, 248, 0.35)',
                outlineOffset: '2px',
                transition: 'all 0.1s ease-out',
              }}
            >
              {/* THE CHART COMPONENT */}
              <KPIComparisonChart {...transformedProps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
