import {
  ControlPanelConfig,
  sharedControls,
} from '@superset-ui/chart-controls';

const t = (str: string) => str;

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Configurazione Metriche & Confronto'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'calculation_mode',
            config: {
              type: 'SelectControl',
              label: t('Modalità di Calcolo del Delta'),
              default: 'dual_metric',
              choices: [
                ['dual_metric', t('Doppia Metrica Esplicita (Dataset/SQL)')],
                ['time_shift', t('Time Shift (Offset Temporale Superset)')],
              ],
              description: t(
                'Scegli se confrontare due colonne/metriche esplicite già aggregate nel dataset (es. Anno Corrente vs Anno Prec) o calcolare l’offset temporale automatico.',
              ),
              clearable: false,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'metric',
            config: {
              ...sharedControls.metric,
              label: t('Metrica Principale (Periodo di Riferimento)'),
              description: t('La metrica primaria visualizzata a caratteri grandi nella card.'),
            },
          },
        ],
        [
          {
            name: 'comparison_metric',
            config: {
              ...sharedControls.metric,
              label: t('Metrica di Confronto (Periodo Precedente o Target)'),
              description: t(
                'La metrica di benchmark da confrontare (es. Mese Prec, Anno Prec, Budget).',
              ),
              visibility: ({ controls }) =>
                !controls?.calculation_mode?.value ||
                controls?.calculation_mode?.value === 'dual_metric',
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
              clearable: false,
              visibility: ({ controls }) =>
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
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Aspetto & Visualizzazione Card'),
      expanded: true,
      controlSetRows: [
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
                'Didascalia opzionale sotto il titolo. Supporta segnaposto dinamici {month} e {period}.',
              ),
              renderTrigger: true,
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
      expanded: true,
      controlSetRows: [
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
              default: 'subtle',
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
      ],
    },
    {
      label: t('Delta % & Polarità Semantica'),
      expanded: true,
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
            },
          },
          {
            name: 'show_absolute_delta',
            config: {
              type: 'CheckboxControl',
              label: t('Mostra Delta Assoluto tra Parentesi'),
              default: true,
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
      ],
    },
  ],
};

export default config;
