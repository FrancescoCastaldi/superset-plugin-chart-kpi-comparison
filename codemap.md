# Codemap: Modulo Funzionale: Stratum KPI Comparison Plugin

Mappa architetturale e funzionale di dettaglio per la sottocartella `03_Sviluppo_Software/Repositories/superset-plugins/superset-plugin-chart-kpi-comparison`.

---

## 🎯 Responsabilita del Modulo

Plugin di visualizzazione KPI comparativo: scostamenti percentuali e assoluti rispetto a target o periodi storici con formattazione durate.

---

## 🌳 Albero & Componenti

| Componente | Ruolo Tecnico |
|:---|:---|
| `src/components/KPIComparisonChart.tsx` | Componente React principale con scaling tipografico, delta e benchmark |
| `src/components/KPISparkline.tsx` | Sparkline vettoriale SVG con curve Bezier cubiche e marker |
| `src/utils/sparkline.ts` | Calcolo matematico puro di coordinate e path SVG spline |
| `src/plugin/controlPanel.tsx` | Controlli nativi di Explore Superset inclusa sezione Tipografia |
| `src/plugin/transformProps.ts` | Trasformazione dati, formattazione metrica e risoluzione colori |
| `dev-studio/` | Ambiente interattivo Vite + React HMR per anteprima live e test visivo |
| `test/` | Suite di 173 unit test Jest (copertura completa formattatori, trend, controlli e curve) |

---

## 🔄 Integrazione con i Moduli Genitori

Questo modulo funzionale e orchestrato e referenziato dal manifest e dalla codemap della cartella genitore.
