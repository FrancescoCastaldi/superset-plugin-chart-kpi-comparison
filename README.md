# Apache Superset Plugin — Chart KPI Card con Confronto Temporale (Delta % Integrato)

[![Apache Superset](https://img.shields.io/badge/Apache%20Superset-6.1%2B-blue.svg)](https://superset.apache.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

Plugin custom per **Apache Superset** progettato per visualizzare in un'unica **Card KPI compatta all-in-one**:
* **Valore principale in grande evidenza** (Periodo di riferimento / Attuale).
* **Valore di confronto** (Periodo precedente / Budget / Benchmark).
* **Delta assoluto** ($\text{Rif} - \text{Conf}$) e **Delta percentuale integrato** ($\Delta\% = \frac{\text{Rif} - \text{Conf}}{\text{Conf}} \times 100$).
* **Badge semantico colorato con icona di variazione** (▲ / ▼ / =).
* **Inversione di polarità colore** (*"Minore è Meglio"*): fondamentale per indicatori sanitari e gestionali dove una diminuzione è positiva (es. tempi di attesa, tasso di disdetta, costi, no-show).
* **Sparkline temporale opzionale** ad alta risoluzione (vettoriale SVG puro, senza librerie pesanti).
* **Supporto formattazione italiana**: separatore migliaia punto (`12.450`), decimali virgola (`12,4%`), prefissi (es. `€`) e suffissi.
* **Auto-Fit Fluido & Responsive Anti-Collasso**: Ridimensionamento fluido automatico di numeri, titoli e badge con protezione da collasso a 0px; omissione automatica titolo interno su card ultra-compatte (< 90px).
* **Personalizzazione Estetica Completa**: Selezione colore di sfondo (anche trasparente), raggio di curvatura (squadrato, morbido 8px, arrotondato 14px, pillola) e ombreggiatura/bordo (nessuna, leggera, pronunciata, bordo sottile).

Elimina la necessità di occupare intere righe di dashboard con chart separati solo per mostrare le variazioni percentuali rispetto all'anno precedente o al mese scorso.

---

## 📸 Anteprima Grafica della Card

```text
┌────────────────────────────────────────────────────────┐
│  VISITE AMBULATORIALI TOTALI                           │
│  Presidio Sanitario IDI - Anno 2026                    │
│                                                        │
│  27.140                                                │
│                                                        │
│  ▲ +10,8% (+2.640)   vs Anno Prec: 24.500              │
│                                                        │
│  ▅▆▇██▇▆▅▄▆▇ (Sparkline temporale integrata)           │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Modalità di Calcolo del Delta

Il plugin offre una **modalità ibrida flessibile** selezionabile direttamente dal pannello Explore:

1. **Doppia Metrica Esplicita (Dataset/SQL)**:
   - Utilizza due colonne o aggregazioni presenti nel dataset (es. `Totale 2026` e `Totale 2025`, oppure `Eseguito` e `Budget`).
   - Calcolo istantaneo del delta senza richiedere query complesse o sotto-query temporali.
   - Perfetto per i dataset analitici ospedalieri (come il `dataset 68` su `kpi-yasi-clinika.idi.lan`).

2. **Time Shift (Offset Temporale Nativo Superset)**:
   - Seleziona una sola metrica e attiva l'offset temporale automatico (`1 year ago`, `1 month ago`, `1 week ago`, ecc.).
   - Superset recupera i dati storici dal database ed elabora il confronto in automatico.

---

## ⚡ Installazione Rapida in Apache Superset

### Metodo 1: Doppio Clic (Windows Batch Launcher)
Fai doppio clic sul file:
```cmd
install.bat
```
Si aprirà un menu interattivo: premi `[1]` per eseguire l'installazione automatica standard.

### Metodo 2: PowerShell
Esegui dalla cartella del plugin:
```powershell
powershell -ExecutionPolicy Bypass -File .\install-plugin.ps1
```

Per forzare la re-installazione pulita e la ricompilazione del frontend Superset:
```powershell
.\install-plugin.ps1 -CleanReinstall -RebuildFrontend
```

Lo script si occupa in automatico di:
1. Verificare l'installazione di Apache Superset (in `D:\Sviluppo\superset` o nei percorsi configurati).
2. Compilare il codice TypeScript (`tsc --build`).
3. Sincronizzare i file in `superset-frontend/plugins/superset-plugin-chart-kpi-comparison`.
4. Creare una copia di backup di sicurezza `MainPreset.ts.bak`.
5. Registrare in modo sicuro ed idempotente il plugin in `MainPreset.ts`:
   ```typescript
   import { KPIComparisonChartPlugin } from '../../../plugins/superset-plugin-chart-kpi-comparison/src';
   ...
   new KPIComparisonChartPlugin().configure({ key: 'kpi_comparison' }).register(),
   ```
6. Svuotare la cache di Webpack per garantire l'immediata disponibilità nella chart gallery.

---

## 📊 Configurazione nel Pannello Explore di Superset

| Sezione | Controllo | Descrizione |
| :--- | :--- | :--- |
| **Metriche & Confronto** | *Modalità di Calcolo* | Scegli tra `Doppia Metrica Esplicita` o `Time Shift`. |
| | *Metrica Principale* | La metrica principale visualizzata in grande (es. `SUM(visite_attuali)`). |
| | *Metrica di Confronto* | La metrica di confronto (es. `SUM(visite_anno_prec)`). |
| | *Etichetta Confronto* | Testo descrittivo del confronto (es. `"vs Anno Prec."`, `"vs Budget"`). |
| | *Colonna Temporale* | Campo data usato per ordinare i dati cronologici della sparkline. |
| **Aspetto Card** | *Titolo KPI* | Intestazione in alto (es. `"VISITE TOTALI"`). |
| | *Sottotitolo* | Didascalia o filtro di contesto (es. `"Regime SSN"`). |
| | *Allineamento* | Sinistra, Centrato o Destra. |
| | *Prefisso / Suffisso* | Simboli valuta (`€`) o unità di misura (`%`, `gg`, `pz`). |
| | *Formato Numero* | Formattatore d3 standard o rilevamento automatico italiano (`.`, `,`). |
| **Delta % & Polarità** | *Inverti Polarità Colore* | **Attiva per tempi di attesa/costi/disdette**: un decremento sarà **Verde** e un aumento sarà **Rosso**. |
| | *Stile Badge Delta* | Scelta tra *Pillola arrotondata*, *Riquadro morbido* o *Testo minimale*. |
| | *Delta Assoluto* | Visualizza la differenza assoluta tra parentesi (es. `(+2.640)`). |
| **Personalizzazione Estetica** | *Colore Sfondo Card* | Selettore colore RGBA per impostare sfondo personalizzato o trasparente. |
| | *Stile Bordo / Raggio* | Raggio angoli: `Squadrato (0px)`, `Morbido (8px)`, `Arrotondato (14px)`, `Pillola (24px)`. |
| | *Ombra / Bordo Card* | Elevazione: `Nessuna`, `Ombra Leggera`, `Ombra Pronunciata`, `Bordo Sottile`. |
| **Sparkline** | *Mostra Sparkline* | Attiva la visualizzazione della trendline vettoriale alla base della card. |
| | *Colore & Sfumatura* | Personalizzazione colore linea e gradiente d'area sottostante. |

---

## 🐳 Aggiornamento in Ambienti Docker Non-Dev

Se Superset è in esecuzione tramite container Docker (es. in `C:\Users\admmaps\superset_6_1_0\superset`):

```cmd
:: 1. Aggiorna il codice del plugin da Git
cd C:\Users\admmaps\superset-plugin-chart-kpi-comparison
git pull origin main

:: 2. Sincronizza i file compilati dentro superset-frontend/plugins
powershell -ExecutionPolicy Bypass -File .\install-plugin.ps1 -SupersetPath "C:\Users\admmaps\superset_6_1_0\superset" -Force

:: 3. Ricompila e riavvia il container Superset
cd C:\Users\admmaps\superset_6_1_0\superset
docker compose -f docker-compose-non-dev.yml up -d --build superset
```
*(In alternativa, esegui `install.bat` e seleziona l'opzione `[4]`)*.

---

## 💻 Sviluppo e Compilazione Locale

```bash
# Repository ufficiale pubblico
git clone https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison.git
cd superset-plugin-chart-kpi-comparison

# Installazione dipendenze
npm install

# Compilazione TypeScript
npm run build

# Pulizia build
npm run clean
```

---

## 📄 Licenza
Rilasciato sotto licenza Apache 2.0.  
Repository: [https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison](https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison)  
Autore: Francesco Castaldi.

