import { Behavior, ChartMetadata, ChartPlugin } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
import example from '../images/example.png';

const t = (str: string) => str;

const metadata = new ChartMetadata({
  name: t('KPI Comparison Card — Delta % Integrato'),
  description: t(
    'Card KPI compatta all-in-one con confronto temporale o doppia metrica, calcolo automatico del Delta %, indicatore semantico colorato, inversione polarità (es. tempi attesa/costi) e sparkline opzionale.',
  ),
  behaviors: [Behavior.InteractiveChart],
  category: t('KPI'),
  tags: [
    t('KPI'),
    t('Comparison'),
    t('Delta'),
    t('Card'),
    t('Benchmark'),
    t('Healthcare'),
    t('Trend'),
  ],
  credits: ['Francesco Castaldi'],
  exampleGallery: [{ url: example }],
  thumbnail,
});

export default class KPIComparisonChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery: buildQuery as any,
      controlPanel,
      loadChart: () => import('../components/KPIComparisonChart'),
      metadata,
      transformProps: transformProps as any,
    });
  }
}
