import {
  ControlPanelConfig,
  sharedControls,
} from '@superset-ui/chart-controls';

const t = (str: string) => str;

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Filtri Temporali'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'time_range',
            config: {
              ...sharedControls.time_range,
              label: t('Filtro Temporale (Range)'),
              description: t('Obbligatorio per far funzionare il Time Shift. Specifica il periodo di indagine chiuso (inizio e fine).'),
            },
          },
        ],
      ],
    },
    {
      label: t('Configurazione Metriche & Confronto'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'enable_comparison',
            config: {
              type: 'CheckboxControl',
              label: t('Abilita Confronto / Delta %'),
              default: true,
              description: t(
                'Attiva il confronto con una seconda metrica, un target fisso o un periodo temporale. Se disattivato, la card visualizza solo il KPI principale in modalità singola pulita.',
              ),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'calculation_mode',
            config: {
              type: 'SelectControl',
              label: t('Modalità di Calcolo del Confronto'),
              default: 'dual_metric',
              choices: [
                ['dual_metric', t('Doppia Metrica Esplicita (Dataset/SQL)')],
                ['static_target', t('Valore Target Fisso (Obiettivo numerico)')],
                ['time_shift', t('Time Shift (Offset Temporale Superset)')],
              ],
              description: t(
                'Scegli se confrontare due colonne/metriche esplicite già aggregate nel dataset, impostare un target fisso, o calcolare l’offset temporale automatico.',
              ),
              clearable: false,
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
        ],
        [
          {
            name: 'metric',
            config: {
              ...sharedControls.metric,
              label: t('Metrica Principale (Obbligatoria)'),
              description: t('La metrica primaria visualizzata a caratteri grandi nella card.'),
            },
          },
        ],
        [
          {
            name: 'comparison_metric',
            config: {
              ...sharedControls.metric,
              validators: [],
              clearable: true,
              clear_on_hide: true,
              label: t('Metrica di Confronto (Opzionale)'),
              description: t(
                'La metrica di benchmark da confrontare (es. Mese Prec, Anno Prec, Budget). Lasciare vuoto se non necessaria.',
              ),
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) &&
                (!controls?.calculation_mode?.value ||
                  controls?.calculation_mode?.value === 'dual_metric'),
            },
          },
        ],
        [
          {
            name: 'time_compare',
            config: {
              type: 'SelectControl',
              label: t('Offset Temporale (Time Shift)'),
              default: '1 year ago',
              choices: [
                ['1 year ago', t('1 anno fa (Stesso periodo anno prec.)')],
                ['1 month ago', t('1 mese fa (Stesso periodo mese prec.)')],
                ['1 week ago', t('1 settimana fa')],
                ['28 days ago', t('28 giorni fa (4 settimane fa)')],
              ],
              description: t('Periodo temporale passato con cui confrontare il valore corrente.'),
              clearable: true,
              clear_on_hide: true,
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) &&
                controls?.calculation_mode?.value === 'time_shift',
            },
          },
        ],
        [
          {
            name: 'comparison_label',
            config: {
              type: 'TextControl',
              label: t('Etichetta Periodo di Confronto'),
              default: 'vs Periodo Prec.',
              description: t(
                'Testo descrittivo visualizzato accanto al valore di confronto (es. "vs Mese precedente"). Supporta segnaposto {comp_month} / {mese_prec} o risoluzione automatica.',
              ),
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
        ],
        [
          {
            name: 'time_column',
            config: {
              ...sharedControls.groupby,
              label: t('Colonna Temporale (Opzionale per Sparkline)'),
              description: t('Colonna temporale usata per ordinare e tracciare la sparkline.'),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'target_metric',
            config: {
              ...sharedControls.metric,
              validators: [],
              clearable: true,
              clear_on_hide: true,
              label: t('Metrica Target / Obiettivo (Dinamica)'),
              description: t('Seleziona una metrica per calcolare il target in modo dinamico. Se impostata, ignora il valore fisso.'),
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) &&
                (controls?.calculation_mode?.value === 'static_target' || Boolean(controls?.show_progress_bar?.value)),
            },
          },
        ],
        [
          {
            name: 'target_static_value',
            config: {
              type: 'TextControl',
              label: t('Valore Target Fisso (Opzionale)'),
              default: '',
              clear_on_hide: true,
              description: t('Inserisci un numero fisso come obiettivo (es. 150000). Verrà usato se non imposti la Metrica Target.'),
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) &&
                (controls?.calculation_mode?.value === 'static_target' || Boolean(controls?.show_progress_bar?.value)),
            },
          },
        ],
        [
          {
            name: 'show_progress_bar',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Barra di Progresso Obiettivo'),
              default: false,
              description: t('Mostra una linea sottile in basso che indica la percentuale di raggiungimento del target.'),
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
        ],
        [
          {
            name: 'badge_content',
            config: {
              type: 'SelectControl',
              label: t('Contenuto del Badge (In alto a destra)'),
              default: 'delta',
              choices: [
                ['delta', t('Delta vs Periodo Precedente')],
                ['percent_of_total', t('% sul Totale')],
                ['none', t('Nessun Badge')],
              ],
              description: t('Cosa mostrare nel badge colorato in alto a destra.'),
              renderTrigger: true,
              clearable: false,
            },
          },
        ],
        [
          {
            name: 'total_metric',
            config: {
              ...sharedControls.metric,
              validators: [],
              clearable: true,
              clear_on_hide: true,
              label: t('Metrica per il Totale'),
              description: t('Metrica da usare come denominatore per calcolare la percentuale (es. SUM(valore) OVER() o metrica custom).'),
              visibility: ({ controls }) => controls?.badge_content?.value === 'percent_of_total',
            },
          },
        ],
        [
          {
            name: 'total_badge_color',
            config: {
              type: 'ColorPickerControl',
              label: t('Colore Sfondo Badge Totale'),
              default: { r: 99, g: 102, b: 241, a: 1 }, // Indigo 500
              description: t('Colore da usare per il badge della percentuale sul totale.'),
              renderTrigger: true,
              visibility: ({ controls }) => controls?.badge_content?.value === 'percent_of_total',
            },
          },
        ],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Aspetto & Visualizzazione Card'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'show_title',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Titolo Superiore'),
              default: true,
              description: t(
                'Mostra o nasconde l’etichetta testuale del titolo sopra il valore numerico principale.',
              ),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'kpi_title',
            config: {
              type: 'TextControl',
              label: t('Titolo KPI'),
              default: '',
              description: t(
                'Titolo in evidenza sopra il valore numerico. Supporta segnaposto dinamici: {month} / {mese} e {period} / {periodo}, o risoluzione automatica da dati e filtri.',
              ),
              renderTrigger: true,
              visibility: ({ controls }) => controls?.show_title?.value !== false,
            },
          },
        ],
        [
          {
            name: 'kpi_subtitle',
            config: {
              type: 'TextControl',
              label: t('Sottotitolo / Dettaglio'),
              default: '',
              description: t(
                'Didascalia opzionale sotto il titolo. Supporta segnaposto dinamici {month}, {period} e {dynamic}.',
              ),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'dynamic_subtitle_column',
            config: {
              ...sharedControls.groupby,
              label: t('Colonna Sottotitolo Dinamico'),
              description: t(
                'Scegli una colonna del dataset per estrarre il valore del sottotitolo (es. "Settembre 2026"). Usa {dynamic} in Titolo/Sottotitolo per posizionarlo.',
              ),
              multi: false,
            },
          },
        ],

        [
          {
            name: 'card_alignment',
            config: {
              type: 'SelectControl',
              label: t('Allineamento Contenuto'),
              default: 'left',
              choices: [
                ['left', t('Allinea a Sinistra')],
                ['center', t('Centrato')],
                ['right', t('Allinea a Destra')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'prefix_value',
            config: {
              type: 'TextControl',
              label: t('Prefisso Valore (es. €)'),
              default: '',
              renderTrigger: true,
            },
          },
          {
            name: 'suffix_value',
            config: {
              type: 'TextControl',
              label: t('Suffisso Valore (es. %, gg)'),
              default: '',
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'number_format',
            config: {
              ...sharedControls.y_axis_format,
              label: t('Formattazione Numero'),
              default: 'SMART_NUMBER',
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Personalizzazione Estetica Card'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'clean_card_mode',
            config: {
              type: 'CheckboxControl',
              label: t('Modalità Clean Card (Zero Box-in-Box)'),
              default: false,
              description: t(
                'Azzera padding interno, bordi e ombre ridondanti per integrarsi perfettamente nei box standard di Superset.',
              ),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'card_bg_color',
            config: {
              type: 'ColorPickerControl',
              label: t('Colore Sfondo Card'),
              default: { r: 255, g: 255, b: 255, a: 1 },
              description: t(
                'Colore di sfondo della card KPI. Riduci alpha a 0 per sfondo trasparente.',
              ),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'card_border_radius',
            config: {
              type: 'SelectControl',
              label: t('Stile Bordo / Raggio Card'),
              default: 'square',
              choices: [
                ['square', t('Squadrato (0px)')],
                ['subtle', t('Morbido (8px)')],
                ['rounded', t('Arrotondato (14px)')],
                ['pill', t('Pillola')],
              ],
              description: t('Raggio di curvatura degli angoli della card.'),
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'card_box_shadow',
            config: {
              type: 'SelectControl',
              label: t('Ombra / Bordo Card'),
              default: 'none',
              choices: [
                ['none', t('Nessuna')],
                ['subtle', t('Ombra Leggera')],
                ['elevated', t('Ombra Pronunciata')],
                ['bordered', t('Bordo Sottile')],
              ],
              description: t('Stile dell’elevazione e dell’ombreggiatura della card.'),
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'card_border_color',
            config: {
              type: 'TextControl',
              label: t('Colore Bordo Personalizzato (es. #e2e8f0)'),
              default: '',
              renderTrigger: true,
            },
          },
          {
            name: 'card_border_width',
            config: {
              type: 'SelectControl',
              label: t('Spessore Bordo'),
              default: 1,
              choices: [
                [1, t('1 pixel (Fine)')],
                [2, t('2 pixel (Medio)')],
                [3, t('3 pixel (Evidente)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Tipografia & Personalizzazione Testo'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'kpi_font_family',
            config: {
              type: 'SelectControl',
              label: t('Famiglia Font (Font Family)'),
              default: '',
              choices: [
                ['', t('Predefinito di Sistema (UI Nativo)')],
                ['Inter', t('Inter (Pulito & Moderno)')],
                ['Roboto', t('Roboto (Material Design)')],
                ['Montserrat', t('Montserrat (Geometrico)')],
                ['Poppins', t('Poppins (Arrotondato Morbido)')],
                ['Oswald', t('Oswald (Condensato Impatto)')],
                ['JetBrains Mono', t('JetBrains Mono (Monospace Tech)')],
                ['Fira Code', t('Fira Code (Tabular Dev)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'kpi_font_size_mode',
            config: {
              type: 'SelectControl',
              label: t('Modalità Dimensione Valore Principale'),
              default: 'auto',
              choices: [
                ['auto', t('Auto-Fit Dinamico (Consigliato, scala con la card)')],
                ['small', t('Piccolo (24px)')],
                ['medium', t('Medio (36px)')],
                ['large', t('Grande (48px)')],
                ['xlarge', t('Molto Grande (64px)')],
                ['manual', t('Personalizzato in Pixel (px)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
          {
            name: 'kpi_font_size_manual',
            config: {
              type: 'TextControl',
              label: t('Dimensione Manuale (px)'),
              default: '36',
              description: t('Dimensione del font in pixel (es. 24, 36, 48, 64).'),
              renderTrigger: true,
              visibility: ({ controls }) => controls?.kpi_font_size_mode?.value === 'manual',
            },
          },
        ],
        [
          {
            name: 'kpi_font_weight',
            config: {
              type: 'SelectControl',
              label: t('Peso Font Valore Principale (Grassetto)'),
              default: '800',
              choices: [
                ['300', t('Light (300)')],
                ['400', t('Normale / Regular (400)')],
                ['500', t('Medio / Medium (500)')],
                ['600', t('Semigrassetto / Semi-Bold (600)')],
                ['700', t('Grassetto / Bold (700)')],
                ['800', t('Extra-Bold (800 - Default)')],
                ['900', t('Black Massimo (900)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
          {
            name: 'kpi_letter_spacing',
            config: {
              type: 'SelectControl',
              label: t('Spaziatura Caratteri Valore'),
              default: 'tight',
              choices: [
                ['tight', t('Stretta (-0.025em)')],
                ['normal', t('Normale (0em)')],
                ['wide', t('Larga (+0.04em)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'kpi_tabular_nums',
            config: {
              type: 'CheckboxControl',
              label: t('Allineamento Numerico Tabulare (tabular-nums)'),
              default: true,
              description: t('Garantisce larghezza uniforme a tutte le cifre per prevenire jittering.'),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'title_font_size',
            config: {
              type: 'SelectControl',
              label: t('Dimensione Titolo'),
              default: 'auto',
              choices: [
                ['auto', t('Scalato Dinamico')],
                ['small', t('Compatto (11px)')],
                ['medium', t('Medio (13px)')],
                ['large', t('Grande (15px)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
          {
            name: 'title_font_weight',
            config: {
              type: 'SelectControl',
              label: t('Peso Font Titolo'),
              default: '600',
              choices: [
                ['400', t('Normale (400)')],
                ['500', t('Medio (500)')],
                ['600', t('Semigrassetto (600)')],
                ['700', t('Grassetto (700)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'title_text_transform',
            config: {
              type: 'SelectControl',
              label: t('Trasformazione Lettere Titolo'),
              default: 'uppercase',
              choices: [
                ['uppercase', t('Tutto Maiuscolo (UPPERCASE)')],
                ['capitalize', t('Iniziali Maiuscole (Capitalize)')],
                ['none', t('Come Inserito (Nessuna)')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
          {
            name: 'comparison_font_size',
            config: {
              type: 'SelectControl',
              label: t('Dimensione Riga Confronto'),
              default: 'small',
              choices: [
                ['small', t('Compatto')],
                ['medium', t('Medio')],
                ['large', t('Grande')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Delta % & Polarità Semantica'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'invert_polarity',
            config: {
              type: 'CheckboxControl',
              label: t('Inverti Polarità Colore (Minore è Meglio)'),
              default: false,
              description: t(
                'Se attivo, una diminuzione percentuale risulterà VERDE (positiva) e un incremento ROSSO (negativo). Ideale per tempi di attesa, tasso di disdetta e costi.',
              ),
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
        ],
        [
          {
            name: 'show_badge',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Badge Delta % / Percentuale'),
              default: true,
              description: t(
                'Mostra o nasconde il badge colorato con la percentuale del confronto o sul totale.',
              ),
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) ||
                controls?.badge_content?.value === 'percent_of_total',
            },
          },
        ],
        [
          {
            name: 'badge_position',
            config: {
              type: 'SelectControl',
              label: t('Posizione del Badge Delta'),
              default: 'bottom_left',
              choices: [
                ['bottom_left', t('In basso con confronto (Default)')],
                ['inline_right', t('A fianco del Valore Principale')],
                ['top_right', t('In alto a destra')],
              ],
              clearable: false,
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) &&
                controls?.show_badge?.value !== false,
            },
          },
        ],
        [
          {
            name: 'badge_style',
            config: {
              type: 'SelectControl',
              label: t('Stile Grafico Badge Delta'),
              default: 'pill',
              choices: [
                ['pill', t('Pillola Arrotondata (Evidente)')],
                ['full', t('Riquadro Morbido')],
                ['subtle', t('Testo Minimale')],
              ],
              clearable: false,
              renderTrigger: true,
              visibility: ({ controls }) =>
                (Boolean(controls?.enable_comparison?.value) ||
                  controls?.badge_content?.value === 'percent_of_total') &&
                controls?.show_badge?.value !== false,
            },
          },
        ],
        [
          {
            name: 'show_comparison_value',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Valore Numerico di Confronto'),
              default: true,
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
          {
            name: 'show_comparison_label',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Etichetta Testo Confronto'),
              default: true,
              description: t(
                'Mostra o nasconde la dicitura descrittiva del confronto (es. "vs Mese precedente").',
              ),
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
        ],
        [
          {
            name: 'show_absolute_delta',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Delta Assoluto tra Parentesi'),
              default: true,
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.enable_comparison?.value) &&
                controls?.show_badge?.value !== false,
            },
          },
        ],
        [
          {
            name: 'apply_trend_color_to',
            config: {
              type: 'SelectControl',
              label: t('Applica Colore del Trend a:'),
              default: 'badge',
              choices: [
                ['badge', t('Solo Badge (In alto a dx)')],
                ['text', t('Testo del Valore Principale')],
                ['background', t('Sfondo intera Card (Sfumato)')],
              ],
              description: t("Determina dove applicare l'evidenziazione visiva semantica (Verde/Rosso)."),
              clearable: false,
              renderTrigger: true,
              visibility: ({ controls }) => Boolean(controls?.enable_comparison?.value),
            },
          },
        ],
      ],
    },
    {
      label: t('Interattività & Drill-through'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'click_url',
            config: {
              type: 'TextControl',
              label: t('URL di Navigazione (Drill-through)'),
              default: '',
              description: t('Inserisci un link (es. /superset/dashboard/123). Rende l\'intera card cliccabile.'),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'click_target',
            config: {
              type: 'SelectControl',
              label: t('Comportamento del Link'),
              default: '_self',
              choices: [
                ['_self', t('Apri nella stessa finestra')],
                ['_blank', t('Apri in una nuova scheda')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Trendline / Sparkline'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'show_sparkline',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Micro Sparkline in Basso'),
              default: false,
              description: t('Visualizza una linea di andamento cronologico alla base della card.'),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'sparkline_color',
            config: {
              type: 'ColorPickerControl',
              label: t('Colore Sparkline'),
              default: { r: 37, g: 99, b: 235, a: 1 },
              renderTrigger: true,
            },
          },
          {
            name: 'sparkline_fill',
            config: {
              type: 'CheckboxControl',
              label: t('Sfumatura di Riempimento'),
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'sparkline_curve',
            config: {
              type: 'SelectControl',
              label: t('Stile Curva Sparkline'),
              default: 'smooth',
              choices: [
                ['smooth', t('Curva Morbida Spline (Bezier)')],
                ['linear', t('Lineare Poligonale Standard')],
              ],
              clearable: false,
              renderTrigger: true,
            },
          },
          {
            name: 'sparkline_show_points',
            config: {
              type: 'CheckboxControl',
              label: t('Evidenzia Punto di Picco e Valore Corrente'),
              default: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
};

export default config;
