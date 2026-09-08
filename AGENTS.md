# AGENTS.md — Regole, Architettura e Aggiornamenti per Agenti AI

Questo documento contiene le direttive operative, l'architettura tecnica e il registro cronologico degli aggiornamenti per tutti gli agenti AI che interagiscono con il repository `superset-plugin-chart-kpi-comparison`.

---

## 🛑 Direttive di Sicurezza & Protocolli Globali

1. **Massima Efficienza & Autonomia Operativa**: Eseguire build, compilazioni, formattazioni e test in modo proattivo e autonomo.
2. **Safety Database `yasidb` (READ-ONLY)**:
   - Divieto assoluto di modifiche (`DELETE`, `UPDATE`, `DROP`, `TRUNCATE`) verso qualsiasi database gestionale clinico di produzione (`yasidb`).
   - Consentite esclusivamente query di lettura (`SELECT ... WITH (NOLOCK)`).
3. **Idempotenza e Integrità Superset**:
   - Qualsiasi modifica apportata ai file core di Apache Superset (es. `MainPreset.ts`) deve essere accompagnata da backup preventivo `.bak` e deve risultare strettamente idempotente (nessun duplicato di import o registrazioni).

---

## 📐 Architettura del Plugin

- **Repository**: `D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison`
- **Nome Plugin**: `superset-plugin-chart-kpi-comparison`
- **Key Registrazione**: `kpi_comparison`
- **Class Plugin**: `KPIComparisonChartPlugin`
- **Framework & Dipendenze**:
  - React 18, TypeScript (ESNext / ES2022)
  - `@superset-ui/core`, `@superset-ui/chart-controls`
  - SVG puro per sparkline ad alte prestazioni (zero librerie grafiche esterne pesanti)

### Struttura Directory
```
src/
├── components/
│   ├── KPIComparisonChart.tsx       # Componente React container principale della card
│   ├── KPIComparisonBadge.tsx       # Badge di variazione percentuale con icone semantiche
│   └── KPISparkline.tsx             # Sparkline vettoriale SVG con sfumatura
├── plugin/
│   ├── buildQuery.ts                # Gestione query (Dual Metric o Time Shift)
│   ├── controlPanel.tsx             # Pannello di configurazione Explore Superset
│   ├── transformProps.ts            # Trasformazione dati, delta %, polarità e formattazione
│   └── index.ts                     # ChartPlugin & ChartMetadata registration
├── utils/
│   └── formatters.ts                # Formattatore numeri e percentuali (standard IT)
├── types.ts                         # Tipizzazioni TypeScript complete
└── index.ts                         # Export pubblico del bundle
```

---

## 🚀 Script di Installazione e Deploy

- **`install-plugin.ps1`**:
  - Rileva automaticamente `D:\Sviluppo\superset`.
  - Compila i sorgenti (`npm run build`).
  - Sincronizza i file in `superset-frontend/plugins/superset-plugin-chart-kpi-comparison`.
  - Registra il plugin in `src/visualizations/presets/MainPreset.ts` con creazione backup `.bak`.
- **`install.bat`**:
  - Launcher interattivo Windows con menu a selezione numerata per esecuzione immediata con doppio clic.

---

## 📝 Registro Aggiornamenti Agenti (Agent Activity Log)

### [2026-09-08 10:27] — Inizializzazione Completa del Progetto
- **Agente**: Antigravity (Gemini 3.8 Flash)
- **Attività svolte**:
  1. Definizione e approvazione dell'implementation plan per il chart KPI all-in-one con confronto temporale e delta integrato per il modulo Programmazione Sanitaria di IDI.
  2. Creazione della configurazione package (`package.json`, `tsconfig.json`, `.gitignore`).
  3. Implementazione di `src/types.ts` e delle utility di formattazione italiana `src/utils/formatters.ts`.
  4. Sviluppo del componente vettoriale sparkline SVG `KPISparkline.tsx` e del badge semantico con supporto polarità invertita `KPIComparisonBadge.tsx`.
  5. Sviluppo del layout responsive `KPIComparisonChart.tsx`.
  6. Implementazione di `buildQuery.ts`, `controlPanel.tsx` e `transformProps.ts`.
  7. Creazione di `README.md`, `CHANGELOG.md` e `AGENTS.md`.
  8. Configurazione dello script di deploy PowerShell `install-plugin.ps1` e batch `install.bat`.
