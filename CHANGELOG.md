# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.6] - 2026-09-21

### Risolto (Fixed)
- **Installer allineato allo stratum-bar per l'installazione dipendenze**:
  `npm install` ora viene eseguito con `--legacy-peer-deps` (il client falliva
  con ERESOLVE sul conflitto di peer `@testing-library/dom` tra
  `@superset-ui/chart-controls` e `@testing-library/jest-dom`). L'installazione
  parte quando manca `node_modules/typescript/lib/tsc.js` (non solo quando
  manca l'intera cartella `node_modules`, evitando ripartenze parziali).
- **TypeScript locale pinnato `~5.9.2` in devDependencies**: sul client non
  esiste `tsc` globale e la catena di fallback del build terminava con
  MODULE_NOT_FOUND. Con typescript locale il build usa il compilatore 5.9
  (compatibile col tsconfig, senza gli errori TS5107/TS5101 della v6).

---

## [0.1.5] - 2026-09-21

### Modificato (Changed)
- **`install.bat` allineato a quello del plugin StratumBar**: rimosso il menù
  interattivo (opzioni 1-5, GUI, clean reinstall, docker) e sostituito con il
  runner diretto che esegue `install-plugin.ps1` passando gli eventuali
  argomenti (`%*`) e attende Invio. Comportamento identico al `install.bat`
  dello stratum-bar, evitando errori/blocchi sul client in esecuzione
  non interattiva.

---

## [0.1.4] - 2026-09-21

### Risolto (Fixed)
- **Valore Primario con Sparkline letta dall'Ultima Riga**: In modalita'
  `dual_metric` con sparkline attiva, la query viene ordinata in ordine
  crescente sulla colonna temporale (`time_column`) con `row_limit` 50; il
  valore primario e il confronto erano letti dalla PRIMA riga (periodo piu'
  remoto), sbagliando numero grande e delta percentuale. Ora, con sparkline
  attiva, sono letti dall'ULTIMA riga (periodo piu' recente); senza sparkline
  (row_limit 1) il comportamento resta identico (prima riga). Il ramo
  `time_shift` non viene toccato.
- Serve al KPI "Richieste · mese corrente" della Dashboard 29 IDI (Tab 4:
  numero grande = mese corrente, confronto = mese precedente, sparkline =
  serie mensile 12 mesi sulla coppia lag-1 della vista).

---

## [0.1.3] - 2026-09-08

### Risolto (Fixed)
- **Auto-Fit Fluido Dinamico & Prevenzione Collasso a 0px**: Risolto bug critico di overflow in cui, al ridursi dell'altezza (es. titolo slice Superset su 2 righe) o larghezza della card, la sezione inferiore andava a capo occupando tutto lo spazio verticale e facendo collassare a 0px il contenitore del numero principale. Applicato `flexShrink: 0`, `minHeight: 0` e `minWidth: 0` per garantire il funzionamento reale di `text-overflow: ellipsis` nel layout flexbox.
- **Calcolo Dinamico dei Font Continuo (Clamped [13px, 64px])**: Eliminato il tetto rigido a scaglioni prefissati (`targetBaseFont`) che bloccava il font a 18px anche con 400px di larghezza disponibile; introdotto calcolo matematico continuo basato sull'effettivo ingombro orizzontale e verticale con scaling fluido in base ai caratteri effettivi.
- **Disaccoppiamento Vincoli Dimensionali & Gestione Titolo**: Disaccoppiati i vincoli di altezza (`isVerticalCompact`, `isVerticalUltraCompact`) da quelli di larghezza (`isHorizontalCompact`, `isHorizontalUltraCompact`). Se l'altezza scende sotto i 90px, il titolo interno viene omesso per dare priorità assoluta al Numero Principale e al Delta %, mantenendo il titolo completo nel tooltip nativo (`title`); con altezze >= 90px e larghezze strette (< 180px) il titolo viene scalato in formato compatto maiuscolo con ellissi senza scomparire arbitrariamente.
- **Prevenzione Wrapping Bottom & Delta Assoluto Intelligente**: Riga inferiore bloccata a riga singola permanente (`flexWrap: 'nowrap'`) con `text-overflow: ellipsis` sulla metrica di confronto secondaria per eliminare ogni rischio di salto verticale di layout. L'indicatore delta assoluto secondario `(+123)` viene omesso dal badge solo quando la larghezza orizzontale è inferiore a 220px (e preservato nel tooltip del badge), permettendo la piena visualizzazione in card larghe anche se basse.
- **Resilienza Sparkline**: La sparkline si adatta ad altezze >= 125px indipendentemente dalla larghezza della card.

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
