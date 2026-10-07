# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.24] - 2026-10-07
### Added
- **Build Standalone**: Aggiunte le devDependencies `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@superset-ui/core` e `@superset-ui/chart-controls` con versioni allineate a `superset-frontend` 6.1.0 (React 17, @superset-ui 0.20.x): `npm run build` ora termina con exit 0 anche fuori dall'albero Superset, senza gli errori TS2307/TS2875. Aggiunto `.npmrc` con `legacy-peer-deps` per un'installazione zero-friction delle dipendenze e `package-lock.json` rigenerato con l'albero completo.
- **Suite di Unit Test Jest**: Setup jest + ts-jest (stesso pattern di superset-plugin-chart-hierarchical-table) con script `test` e `test:watch` basati sulla catena di fallback resiliente. Prima suite di 47 test verdi che copre `utils/formatters.ts` (`formatItalianNumber`, `formatDeltaPercent`, `parseNumericValue`, `getMetricLabel`, `formatMonthYearItalian`) e i rami di `plugin/buildQuery.ts` (dual-metric vs time-shift, soppressione dei time offsets senza range chiuso, metriche peak/min, sparkline e limiti di riga).
### Fixed
- **Tipizzazione `time_range`**: Il campo `time_range` e' ora dichiarato esplicitamente come opzionale nell'interfaccia `KPIComparisonFormData`, risolvendo l'errore TS2339 in `buildQuery.ts` senza alcuna modifica alla logica della query.

## [0.1.23] - 2026-10-07
### Fixed
- **Idempotenza Rigida della Registrazione in `MainPreset.ts`**: La verifica di configurazione esistente in `install-plugin.ps1` e' ora riga-esatta sulla forma canonica `new KPIComparisonChartPlugin().configure({ key: 'kpi_comparison' }),`, con controllo duplicati su import e registrazioni: le varianti legacy con `.register()` e le indentazioni anomale vengono normalizzate alla forma canonica invece di essere considerate gia' configurate.

## [0.1.22] - 2026-10-05
### Added
- **Controlli Nativi di Visibilita in Explore**: Aggiunte caselle di controllo (checkbox) indipendenti per mostrare o nascondere con un click gli elementi visivi della card direttamente da Explore:
  - `show_title` ("Mostra Titolo Superiore"): attiva o disattiva l'etichetta del titolo sopra il valore numerico principale.
  - `show_badge` ("Mostra Badge Delta % / Percentuale"): attiva o disattiva il badge percentuale in alto a destra.
  - `show_comparison_label` ("Mostra Etichetta Testo Confronto"): attiva o disattiva la dicitura descrittiva del confronto (es. "vs Mese precedente").
- **Collasso Spazi Vuoti**: Ottimizzato il calcolo delle altezze dinamiche in `KPIComparisonChart.tsx` per azzerare margini e padding orfani quando il titolo superiore o la riga inferiore di confronto sono deselezionati.
### Fixed
- **Inibizione Residui Query**: Garantita la totale soppressione di time offsets e metriche fantasma quando il confronto e disabilitato (`enable_comparison === false`).
### Fixed
- **Install Script Syntax Error**: Risolto errore di sintassi PowerShell in `install-plugin.ps1` alla riga 365 (`\[regex\]::Escape` non valido in PowerShell) sostituendolo con metodi stringa nativi `.Contains()` e `.Replace()` per la patch Geostyler di Webpack.

## [0.1.20] - 2026-10-02
### Fixed
- **Time Shift Backend Crash**: Protected backend queries against the An enclosed time range must be specified error when using Time Shift without a time range filter.
- **Time Range Control**: Added 	ime_range picker to the control panel to allow users to set the required bounded range natively on the chart.
- **Time Shift UX**: Added graceful fallback ⚠️ Richiede Filtro Temporale when comparison data is omitted due to missing time range boundaries.


## [0.1.19] - 2026-10-02
### Fixed
- **Sparkline Object Resolution**: Fixed a bug where modern column objects in 	ime_column were incorrectly parsed as strings, causing the sparkline to fail to query multiple rows and render.


## [0.1.18] - 2026-10-02

### Risolto (Fixed)
- **Risolto bug di mappatura CamelCase nelle proprietà**: Superset moderno passa la `formData` come React props formattate in CamelCase all'interno del frontend, ma il codice nativo di questo plugin andava a cercare direttamente proprietà con notazione snake_case (es. `fd.target_static_value` o `fd.target_metric`). Questo causava il fallimento silenzioso di funzionalità importanti come il **Valore Target Fisso**, la **Target Progress Bar**, il contenuto dinamico dei **Badge Percentuali** (sul totale) e la **Sparkline**, che seppur configurate non venivano renderizzate sul grafico.
- Inserita e applicata uniformemente in tutto `transformProps.ts` e `buildQuery.ts` la funzione sicura `getProp` (e `getFd`) che valuta sempre entrambe le chiavi (`camelCase` e `snake_case`) per garantire la corretta estrapolazione da `rawFormData` e `formData`.
- **Pulizia Validatori Nascosti**: Inseriti `clear_on_hide: true` e rimozione dell'obbligo di inserimento `validators: []` per i campi a tendina nascosti dalla UI, in modo che l'interfaccia di Superset non blocchi il grafico "Run Query" durante il cambio di modalità.

## [0.1.17] - 2026-10-02

### Added
- **Opzione Disattivazione Confronto (`enable_comparison`)**: Introdotto un nuovo toggle esplicito `Abilita Confronto / Delta %` nel pannello di controllo. Se disattivato, la card opera in modalità KPI singolo puro, nascondendo tutti i controlli e le etichette relative al delta.
- **Supporto Target Fisso Diretto (`static_target`)**: Aggiunta la modalità `Valore Target Fisso (Obiettivo numerico)` tra le scelte principali di calcolo, consentendo di confrontare la metrica primaria direttamente contro un valore target inserito manualmente (con label automatica `vs Obiettivo`).
- **Scelta `Nessun Badge` (`badge_content: 'none'`)**: Aggiunta la possibilità di disabilitare esplicitamente il badge in alto a destra per una card minimale.

### Changed
- **Controlli Condizionali Dinamici**: I controlli secondari (`comparison_metric`, `time_compare`, `comparison_label`, `target_metric`, `target_static_value`, `show_progress_bar`, `Delta % & Polarità Semantica`) ora compaiono solo se il confronto è effettivamente abilitato (`enable_comparison === true`).
- **Rimozione Vincolo di Obbligatorietà su Metrica di Confronto**: Rimosso il validatore `validateNonEmpty` da `comparison_metric` e abilitato `clearable: true`. Non appare più il punto esclamativo rosso di errore quando la seconda metrica non è valorizzata.

### Fixed
- **Eliminazione Fallback Hardcoded SQL**: Rimossi i fallback storici `richieste_conf` e `richieste_corr` da `buildQuery.ts` che causavano errori di query SQL su dataset privi di tali colonne quando la metrica di confronto veniva omessa.
- **Risoluzione Sicura del Confronto**: Se `enable_comparison` è falso o non è configurata una metrica di confronto, `comparisonValue` rimane rigorosamente `null` ed evita fallback non deterministici su altre colonne numeriche del dataset.

## [0.1.16] - 2026-10-02

### Added
- **Global Theme Support**: The plugin now utilizes Superset's global semantic JSON theme tokens (`theme.colors.success`, `theme.colors.error`) instead of hardcoded hex values, ensuring perfect visual sync with custom dashboard themes.
- **Advanced Conditional Formatting**: Added a new configuration `applyTrendColorTo` which allows users to decide if the semantic trend color should be applied exclusively to the Badge, applied to the Main Number text, or painted over the entire Card Background using subtle variants.
- **Interactive Drill-through**: The card can now be turned into a clickable hyperlink. Added a dedicated "Interattività" tab to configure a URL and a navigation target (`_self` or `_blank`).

## [0.1.15] - 2026-10-02

### Added
- **Percent of Total Badge**: Added the ability to swap the Delta Badge in the top right with a "Percent of Total" badge. Users can now select a `Total Metric` denominator and a custom background color for the badge. When active, it displays the incidence percentage without trend arrows.

## [0.1.14] - 2026-10-02

### Added
- **Target / Goal Tracking Progress Bar**: Added a sleek progress bar at the bottom of the card to track KPI performance against a goal. The target can be defined dynamically via a metric column or as a static absolute number. If the goal is exceeded, the bar fills 100% and changes color to Gold, with text explicitly noting `>100% del Target`.

## [0.1.13] - 2026-10-02

### Changed
- **Data Panel UI Optimization**: Cleaned up the chart configuration panel to reduce cognitive load on initial setup. Renamed `Metrica Principale` to explicitly say `(Obbligatoria)` and `Metrica di Confronto` to `(Opzionale)`.
- **Collapsed Advanced Panels**: The highly detailed configuration panels (`Aspetto & Visualizzazione Card`, `Personalizzazione Estetica Card`, `Delta % & Polarità Semantica`) are now collapsed by default (`expanded: false`). This provides a much cleaner, streamlined UI for users configuring the basics, while keeping advanced visual options available on click.

### Fixed
- Fixed TypeScript compile error related to `useId` by replacing it with a generated UUID via `useMemo` for broader React legacy compatibility.

## [0.1.12] - 2026-10-01

### Fixed
- **Sanitizzazione Rigorosa Colonne & Risoluzione Errore "Missing label (Issue 1011)"**: Risolto bug critico per cui l'apertura in modalità Explore o il rendering della card scatenava l'eccezione backend `ValueError("Missing label")` (`get_column_name` in `superset/utils/core.py`).
- **Normalizzazione `time_column`**: Gestito il caso in cui `time_column` viene salvato o passato come array vuoto `[]` dal controllo di frontend, evitando che un tipo non stringa venga propagato nell'array `columns` della query.
- **Filtro `sanitizeColumn` e `sanitizeMetric` in `buildQuery.ts`**: Implementata validazione e pulizia a monte sia su `columns` che su `baseQueryObject.columns` per garantire che vengano passati esclusivamente nomi di colonna/metriche stringa validi o oggetti ad-hoc completi di `label`/`sqlExpression`.

## [0.1.11] - 2026-09-30

### Added
- **Mese e Anno Dinamici per KPI Picco e Minimo**: Introdotto il calcolo automatico su serie multi-riga del valore di picco (massimo) e valore più basso (minimo) con determinazione automatica del mese/anno di riferimento (`dynamicMonth`).
- **Render Condizionale Bottom Section**: Quando un KPI è utilizzato in modalità a metrica singola o per picco/minimo senza confronto (`hasComparison = false`), il badge delta (`■ --%`) e la dicitura `vs Confronto:` vengono automaticamente soppressi, visualizzando sotto il numero grande un'etichetta pulita ed elegante contenente il mese e l'anno di riferimento (es. "Settembre 2026").

## [0.1.10] - 2026-09-30

### Added
- **Sottotitolo e Titolo Dinamici (Data-Driven KPI)**: Introdotta la nuova configurazione `dynamic_subtitle_column` ("Colonna Sottotitolo Dinamico") nel pannello "Aspetto & Visualizzazione Card". Permette di estrarre e renderizzare come sottotitolo (o all'interno di `kpi_title` e `kpi_subtitle` tramite il segnaposto `{dynamic}`) il valore effettivo testuale o numerico ritornato dalla query SQL al variare dei filtri, superando i limiti delle descrizioni hardcoded (es. "Mese di picco: Settembre 2026").

## [0.1.9] - 2026-09-29

### Fixed
- **Supporto Dual-Casing (`camelCase` & `snake_case`) per Controlli e Form Data**: Risolto bug critico per cui in Apache Superset 4.x (`ChartRenderer` / `SuperChart`) i parametri di configurazione della card (`suffix_value`, `number_format`, `prefix_value`, `kpi_title`, `card_alignment`, ecc.) venivano convertiti in camelCase (`suffixValue`, `numberFormat`), risultando `null`/`undefined` all'interno di `transformProps.ts`. Introdotto resolver trasparente `getProp` che ispeziona sia `formData` che `rawFormData` in entrambi i formati di naming.
- **Visualizzazione Simbolo Percentuale (`%`) e Unità di Misura**: Ripristinata la corretta renderizzazione di `suffixValue` sia accanto al valore primario che nella riga del valore di confronto (`vs Confronto: X%`).
- **Formattazione Decimale Precisa (`number_format`)**: Ripristinata l'applicazione della stringa di formato configurata (es. `.1f` -> `90,0%`, `99,4%`), prevenendo il fallback errato all'euristica interi/float non formattati.
- **Selezionabilità e Copia del Testo con Unità**: Rimosso `userSelect: 'none'` dagli `span` del prefisso e del suffisso, permettendo la selezione con mouse e la copia negli appunti dell'intero valore corredato della relativa unità di misura (es. `90%`).

---

## [0.1.8] - 2026-09-28

### Fixed
- **Eliminazione Titoli Interni Indesiderati ("RICHIESTE_CORR" / "Richieste ecc")**: Rimosso il fallback automatico che generava titoli interni derivati dal nome della metrica quando `kpi_title` non è valorizzato. Quando nessun titolo è specificato, la card non mostra alcun testo ridondante all'interno, lasciando pieno risalto al numero primario e al delta.
- **Risoluzione Effetto "Box nel Box"**: Impostato `cardBorderRadius` di default a `square` (0px), `cardBgColor` a `transparent` e `cardBoxShadow` a `none` per un'integrazione fluida e nativa all'interno dei contenitori di dashboard Superset senza doppi bordi o cornici interne.

---

## [0.1.7] - 2026-09-22

### Added
- **Risoluzione Dinamica del Mese e Periodo nei Titoli Card**: Introdotto supporto per segnaposto dinamici nei campi `kpi_title`, `kpi_subtitle` e `comparison_label`:
  - `{month}` / `{mese}`: sostituito con il mese effettivo del dato (es. "Settembre 2026", "Ottobre 2025").
  - `{period}` / `{periodo}`: sostituito con l'estensione temporale effettiva (es. "12 mesi", "6 mesi", "Ottobre 2025 - Settembre 2026").
  - `{comp_month}` / `{mese_prec}`: sostituito con il mese di confronto effettivo (es. "Agosto 2026").
- **Auto-Discovery Intelligente del Mese**: Se il titolo è configurato con diciture standard ("Mese di picco", "Mese più basso", "Richieste ultimo mese", "Media mensile"), il plugin estrae automaticamente il mese/periodo reale dalle metriche descrittive della riga (es. `mese_picco`, `mese_minimo`, `mese_corrente`, `mese_confronto`, `periodo_mesi`), dalle serie multi-riga o dal filtro temporale attivo, formattandolo in italiano con iniziale maiuscola.

### Changed
- **Preservazione Metriche Extra e Colonne in `buildQuery`**: `buildQuery` non sovrascrive più arbitrariamente la lista delle metriche con la sola coppia `[metric, comparison_metric]`, consentendo l'inclusione di metriche descrittive (stringhe/date) nel QueryContext senza generare duplicati di label.

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
