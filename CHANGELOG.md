# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.3] - 2026-09-08

### Risolto (Fixed)
- **Auto-Fit Fluido Dinamico & Prevenzione Collasso a 0px**: Risolto bug critico di overflow in cui, al ridursi dell'altezza (es. titolo slice Superset su 2 righe) o larghezza della card, la sezione inferiore andava a capo occupando tutto lo spazio verticale e facendo collassare a 0px il contenitore del numero principale. Applicato `flexShrink: 0`, `minHeight: 0`, e dimensionamento fluido dei font basato proporzionalmente sia su larghezza che altezza (`primaryFontSizePx`).
- **Gestione Intelligente Titolo Interno**: Quando l'altezza scende sotto i 90px (o larghezza < 180px), il titolo interno e sottotitolo vengono omessi automaticamente per dedicare il 100% dello spazio al Numero Principale e al Delta %, mantenendo il titolo completo nel tooltip nativo (`title`).
- **Prevenzione Wrapping Forzato Badge**: In modalità compatta (altezza < 135px), la riga inferiore mantiene `flexWrap: 'nowrap'` con `flexShrink: 0` sul badge delta e troncamento morbido (`text-overflow: ellipsis`) sulla stringa di confronto secondaria.

### Aggiunto (Added)
- **Sezione Personalizzazione Estetica Card**: Aggiunta la sezione dedicata nel Control Panel di Superset:
  - `card_bg_color`: Colore di sfondo personalizzabile tramite ColorPicker (incluso supporto trasparente con alpha = 0).
  - `card_border_radius`: Raggio di curvatura angoli con opzioni squadrato (0px), morbido (8px), arrotondato (14px) o pillola.
  - `card_box_shadow`: Ombra / bordo con opzioni nessuna, leggera, pronunciata o bordo sottile.

---

## [0.1.2] - 2026-09-08

### Risolto (Fixed)
- **Estrazione Metrica di Confronto da Dataset Superset**: Risolto bug critico in `transformProps.ts` dove `getMetricLabel` estraeva solo `metric.label` invece di `metric_name` / `verbose_name`. Ciò causava la mancata estrazione del benchmark (`comparisonMetricKey = ""`), facendo ricadere la card sul fallback statico `vs Benchmark: —` con delta `—%`.
- **Doppio Fallback Difensivo per `comparisonValue`**: Aggiunta la ricerca euristica per keyword (`conf`, `prev`, `comp`, `prec`, `bench`) e il fallback automatico su qualsiasi colonna numerica secondaria presente in riga, garantendo al 100% l'estrazione del valore di confronto in modalità `dual_metric`.
- **Visibilità Controllo in Explore**: Risolto bug in `controlPanel.tsx` dove `comparison_metric` risultava nascosto di default all'apertura in Explore prima della selezione esplicita di `calculation_mode`.
- **Robustezza Query Builder**: In `buildQuery.ts`, garantita la corretta inclusione di entrambe le metriche nella query sia da `metric`/`comparison_metric` sia da array `metrics`.
- **Etichetta Dinamica Intelligente**: Sostituito il fallback di default `'vs Benchmark'` con `'vs Confronto'` e impostato il titolo di default su `'Richieste in attesa'` in luogo della stringa grezza `richieste_corr`.

---

## [0.1.1] - 2026-09-08

### Modificato (Changed)
- **Risoluzione Bug Layout GUI**: Corretto l'ordine di docking WinForms (`headerPanel.SendToBack()`) in `KPIComparisonInstallerGUI.cs` che causava la sovrapposizione dell'header e il taglio della sezione 1 (Path Superset).
- **Allineamento e Margini**: Applicato padding orizzontale coerente (`padX = 24`) a tutti i controlli, etichette e log box.
- **Supporto Nativo Docker Non-Dev**: Integrata l'opzione dedicata per `docker compose -f docker-compose-non-dev.yml up -d --build superset` sia nell'eseguibile GUI che in `install.bat`.
- **Visibilità Repository**: Repository GitHub impostato su **Pubblico**: `https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison`.

---

## [0.1.0] - 2026-09-08

### Aggiunto (Added)
- **Architettura Plugin Ufficiale**: Inizializzazione del plugin `superset-plugin-chart-kpi-comparison` per Apache Superset conforme allo standard `@superset-ui/core`.
- **Card KPI All-in-One**: Visualizzazione compatta con metrica primaria in risalto, valore di confronto, delta assoluto e delta percentuale integrato ($\Delta\%$).
- **Modalità di Calcolo Ibrida**:
  - `Doppia Metrica Esplicita`: Calcolo diretto $\Delta\% = \frac{\text{Rif} - \text{Conf}}{\text{Conf}} \times 100$ per dataset già aggregati (es. dataset 68 IDI).
  - `Time Shift`: Supporto per offset temporale nativo Superset (`1 year ago`, `1 month ago`, `1 week ago`, ecc.).
- **Semantica dei Colori e Polarità Invertita**:
  - Polarità standard: incremento in Verde (`#10b981`), decremento in Rosso (`#ef4444`).
  - Polarità invertita (`invert_polarity`): decremento in Verde e incremento in Rosso (fondamentale in ambito sanitario per tempi di attesa, tasso di disdetta, no-show e costi).
- **Stili Badge Delta**: Selezione tra badge a pillola arrotondata (`pill`), riquadro compatto (`full`) o testo sobrio minimale (`subtle`).
- **Formattazione Italiana dei Numeri**: Utility dedicata per separatore delle migliaia (punto) e decimali (virgola), con supporto prefissi (es. `€`) e suffissi (es. `%`, `pz`).
- **Sparkline Temporale Integrata**: Componente pure-SVG ad alta efficienza per tracciare la linea di tendenza con riempimento sfumato opzionale alla base della card.
- **Control Panel Superset**: Sezioni Explore per configurazione query, tipografia, allineamento (sinistra, centro, destra), polarità e opzioni grafiche.
- **Automazione e Deploy**:
  - Script PowerShell `install-plugin.ps1` con rilevamento automatico directory Superset, copia sincronizzata, backup di sicurezza ed aggiornamento idempotente di `MainPreset.ts`.
  - Launcher interattivo Windows con doppio clic `install.bat`.
  - Documentazione `README.md` e tracking direttive in `AGENTS.md`.
