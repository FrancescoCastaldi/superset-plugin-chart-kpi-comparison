# Apache Superset Plugin — KPI Comparison Card Chart (Integrated Delta %)

[![Apache Superset](https://img.shields.io/badge/Apache%20Superset-6.1%2B-blue.svg)](https://superset.apache.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

A custom **Apache Superset** plugin designed to display an **all-in-one compact KPI Card** featuring:
* **Prominent Primary Value** (Current / Reference period).
* **Comparison Benchmark Value** (Prior period / Budget / Target).
* **Absolute Delta** ($\text{Ref} - \text{Comp}$) and **Integrated Percentage Delta** ($\Delta\% = \frac{\text{Ref} - \text{Comp}}{\text{Comp}} \times 100$).
* **Semantic Trend Badge** with directional icons (▲ / ▼ / =).
* **Color Polarity Inversion** (*"Lower is Better"*): essential for healthcare, operations, and cost metrics where a decrease represents positive performance (e.g., patient wait times, cancellation rates, no-shows, operational costs).
* **Optional High-Resolution Sparkline** (pure SVG vector rendering, zero heavy external charting dependencies).
* **Number & Currency Formatting Support**: d3-format presets, locale formatting (e.g., thousands and decimals), custom prefixes (e.g. `$`, `€`) and suffixes (e.g. `%`, `days`).
* **Dynamic Fluid Auto-Fit & Anti-Collapse Protection**: Real-time fluid scaling of primary number, titles, and badges without 0px collapse on narrow screens or multi-line container titles; automatic omission of redundant internal title on ultra-compact cards (< 90px height).
* **Comprehensive Aesthetic Customization**: Card background color picker (with alpha/transparency support), border radius presets (square 0px, subtle 8px, rounded 14px, pill 24px), and elevation/border styling (none, subtle shadow, elevated shadow, thin border).

Eliminates the need to occupy multiple dashboard rows with separate charts just to display period-over-period percentage variations.

---

## 📸 Card Visual Preview

```text
┌────────────────────────────────────────────────────────┐
│  TOTAL OUTPATIENT VISITS                               │
│  Clinical Department - FY 2026                         │
│                                                        │
│  27,140                                                │
│                                                        │
│  ▲ +10.8% (+2,640)   vs Prior Year: 24,500             │
│                                                        │
│  ▅▆▇██▇▆▅▄▆▇ (Integrated Vector Sparkline)             │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Delta Calculation Modes

The plugin offers a **flexible dual-mode calculation engine** selectable directly within the Superset Explore control panel:

1. **Dual Metric Mode (Dataset / Pre-aggregated SQL)**:
   - Compares two columns or aggregations directly from the dataset (e.g., `Current Year Requests` vs `Comparison Year Requests`, or `Actual` vs `Budget`).
   - Instant delta calculation without requiring complex sub-queries or time-shift database overhead.
   - Ideal for healthcare and analytical warehouse datasets (such as pre-aggregated metrics).

2. **Time Shift Mode (Native Superset Temporal Offset)**:
   - Select a single metric and configure a native temporal offset (`1 year ago`, `1 month ago`, `1 week ago`, etc.).
   - Superset queries historical data from the underlying database and computes the comparison automatically.

---

## ⚡ Quick Installation in Apache Superset

### Method 1: Double-Click Batch Launcher (Windows)
Double-click:
```cmd
install.bat
```
An interactive menu will open: press `[1]` to run the automated standard installation.

### Method 2: PowerShell Script
Run from the plugin root directory:
```powershell
powershell -ExecutionPolicy Bypass -File .\install-plugin.ps1
```

To force a clean re-installation and rebuild the Superset frontend:
```powershell
.\install-plugin.ps1 -CleanReinstall -RebuildFrontend
```

The script automatically:
1. Detects the Apache Superset root directory (`D:\Sviluppo\superset` or configured paths).
2. Compiles TypeScript sources (`tsc --build`).
3. Syncs files into `superset-frontend/plugins/superset-plugin-chart-kpi-comparison`.
4. Creates a safety backup of `MainPreset.ts.bak`.
5. Safely and idempotently registers the plugin in `MainPreset.ts`:
   ```typescript
   import { KPIComparisonChartPlugin } from '../../../plugins/superset-plugin-chart-kpi-comparison/src';
   ...
   new KPIComparisonChartPlugin().configure({ key: 'kpi_comparison' }).register(),
   ```
6. Clears the Webpack cache to ensure immediate availability in the Superset chart gallery.

---

## 📊 Explore Control Panel Reference

| Section | Control | Description |
| :--- | :--- | :--- |
| **Metrics & Comparison** | *Calculation Mode* | Choose between `Dual Metric` or `Time Shift`. |
| | *Primary Metric* | Main prominent metric (e.g. `SUM(current_visits)`). |
| | *Comparison Metric* | Baseline/comparison metric (e.g. `SUM(prior_visits)`). |
| | *Comparison Label* | Descriptive label (e.g., `"vs Prior Year"`, `"vs Target"`). |
| | *Time Column* | Date/time column used to chronologically sort the sparkline. |
| **Card Appearance** | *KPI Title* | Top uppercase heading (e.g., `"TOTAL VISITS"`). |
| | *Subtitle* | Optional caption or context (e.g., `"SSN Regime"`). |
| | *Card Alignment* | Left, Center, or Right alignment. |
| | *Prefix / Suffix* | Currency symbols (`$`, `€`) or measurement units (`%`, `days`). |
| | *Number Format* | Standard d3-format strings or smart number formatting. |
| **Delta % & Polarity** | *Invert Color Polarity* | **Enable for wait times / costs / cancellations**: a decrease becomes **Green** and an increase becomes **Red**. |
| | *Badge Style* | Choose between *Rounded Pill*, *Full Box*, or *Subtle Text*. |
| | *Absolute Delta* | Show absolute difference in parentheses (e.g., `(+2,640)`). |
| **Aesthetic Customization** | *Card Background Color* | RGBA color picker for custom or transparent background. |
| | *Card Border Radius* | Corner radius presets: `Square (0px)`, `Subtle (8px)`, `Rounded (14px)`, `Pill (24px)`. |
| | *Card Elevation / Border* | Visual elevation: `None`, `Subtle Shadow`, `Elevated Shadow`, `Thin Border`. |
| **Sparkline** | *Show Sparkline* | Display vector trendline at the bottom of the card. |
| | *Color & Fill* | Line color and optional area gradient fill below the curve. |

---

## 🐳 Updating in Non-Dev Docker Environments

When Superset runs in Docker (e.g. in `C:\Users\admmaps\superset_6_1_0\superset`):

```cmd
:: 1. Pull the latest plugin version from Git
cd C:\Users\admmaps\superset-plugin-chart-kpi-comparison
git pull origin main

:: 2. Sync compiled files into superset-frontend/plugins
powershell -ExecutionPolicy Bypass -File .\install-plugin.ps1 -SupersetPath "C:\Users\admmaps\superset_6_1_0\superset" -Force

:: 3. Rebuild and restart the Superset container
cd C:\Users\admmaps\superset_6_1_0\superset
docker compose -f docker-compose-non-dev.yml up -d --build superset
```
*(Alternatively, run `install.bat` and choose option `[4]`)*.

---

## 💻 Local Development & Build

```bash
# Clone the repository
git clone https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison.git
cd superset-plugin-chart-kpi-comparison

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Clean build artifacts
npm run clean
```

---

## 📄 License
Released under the Apache License 2.0.  
Repository: [https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison](https://github.com/FrancescoCastaldi/superset-plugin-chart-kpi-comparison)  
Author: Francesco Castaldi.


