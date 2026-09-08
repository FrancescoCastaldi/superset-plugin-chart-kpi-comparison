# Original User Request

## Initial Request — 2026-09-08T08:11:33Z

Sviluppo del plugin custom ufficiale per Apache Superset: **Chart KPI Card con Confronto Temporale (Delta % integrato)**, dotato di installer automatico PowerShell, integrazione nativa sia per doppie metriche esplicite (Riferimento vs Confronto) sia per time-shift temporale, e repository Git locale dedicato in `D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison`.

Working directory: `D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison`
Integrity mode: development

## Reference Materials
- Template e standard architetturali dei plugin custom già funzionanti:
  - `D:\Sviluppo\superset-plugins\superset-plugin-chart-stratum-heatmap`
  - `D:\Sviluppo\superset-plugins\superset-plugin-chart-calendar-filter`
  - `D:\Sviluppo\superset-plugins\superset-plugin-chart-hierarchical-table`
- Directory sorgenti e build Apache Superset: `D:\Sviluppo\superset`
- Dataset di riferimento IDI con colonne di confronto già presenti (`dataset 68` su `https://kpi-yasi-clinika.idi.lan`)

## Requirements

### R1. Architettura e Componenti UI del Plugin (TypeScript / React)
Costruire un plugin custom conforme a `@superset-ui/core`:
- **Card KPI compatta all-in-one**: Visualizzazione in un singolo riquadro del valore principale, valore di confronto, variazione percentuale ($\Delta\%$) con icona e colorazione semantica (verde/rosso/grigio neutro), label del periodo e sparkline/trendline opzionale.
- **Control Panel Superset**: Controlli nell'Explore per selezionare la modalità di calcolo (Doppia metrica esplicita o Time-shift temporale), metrica primaria, metrica di confronto, formattazione del valore (es. `27,1k`, decimali), prefissi/suffissi, opzione "Inverti polarità colore" (utile per metriche di costo/tempo di attesa dove una diminuzione è positiva).

### R2. Modalità di Calcolo del Delta (Ibrida Flessibile)
- **Modalità Doppia Metrica**: Calcolo diretto $\Delta\% = \frac{\text{Metrica Rif} - \text{Metrica Conf}}{\text{Metrica Conf}} \times 100$, compatibile con i dataset aggregati correnti (come `dataset 68` di IDI).
- **Modalità Time-Shift**: Calcolo della metrica su periodo di riferimento e recupero del medesimo valore spostato nel tempo in base al filtro temporale configurato.

### R3. Repository Git e Installer Automatico Funzionante
- Inizializzazione repository Git pulito con `.gitignore`, `package.json`, `tsconfig.json`, `README.md` dettagliato.
- Script PowerShell `install-plugin.ps1` (e file batch `.bat` per esecuzione immediata con doppio clic):
  - Verifica prerequisiti Node.js / npm.
  - Compilazione TypeScript del plugin (`npm run build`).
  - Registrazione della dipendenza nel frontend di Superset (`D:\Sviluppo\superset\superset-frontend`).
  - Registrazione del preset in `MainPreset.js` / plugin registry di Superset.
  - Ricompilazione e verifica bundle.

## Acceptance Criteria

### Resa Visiva & UX
- [ ] Il componente visualizza valore principale e confronto percentuale in un'unica card compatta, eliminando la necessità di creare chart o righe separate per i delta.
- [ ] Supporta l'inversione di polarità dei colori e la formattazione custom (es. formato italiano con virgola).

### Funzionamento Dati
- [ ] Funziona correttamente sia con due metriche selezionate manualmente che con filtri nativi di dashboard.

### Build & Deploy
- [ ] `npm run build` nel plugin termina con codice di uscita 0 e genera la directory `esm/` o `lib/`.
- [ ] `install-plugin.ps1` completa l'integrazione in `D:\Sviluppo\superset` senza errori bloccanti.
