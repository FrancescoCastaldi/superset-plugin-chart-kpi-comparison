export function ensureIsArray<T>(val: T | T[] | null | undefined): T[] {
  if (val === null || val === undefined) return [];
  return Array.isArray(val) ? val : [val];
}

export function getNumberFormatter(formatString?: string) {
  return (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);

    if (!formatString || formatString === 'SMART_NUMBER') {
      const abs = Math.abs(num);
      if (abs >= 1_000_000) return `${(num / 1_000_000).toLocaleString('it-IT', { maximumFractionDigits: 1 })}M`;
      if (abs >= 1_000) return `${(num / 1_000).toLocaleString('it-IT', { maximumFractionDigits: 1 })}k`;
      return num.toLocaleString('it-IT', { maximumFractionDigits: 2 });
    }

    if (formatString === ',.0f') return num.toLocaleString('it-IT', { maximumFractionDigits: 0 });
    if (formatString === ',.1f') return num.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (formatString === ',.2f') return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (formatString === '.1%') return `${(num * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    if (formatString === '.2%') return `${(num * 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
    if (formatString === '$,.2f' || formatString === '€,.2f') return `€ ${num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return num.toLocaleString('it-IT');
  };
}

export class ChartMetadata {
  constructor(public config: any = {}) {}
}

export class ChartPlugin {
  constructor(public config: any = {}) {}
  configure() { return this; }
  register() { return this; }
}

export const Behavior = {
  INTERACTIVE_CHART: 'INTERACTIVE_CHART',
  DRILL_TO_DETAIL: 'DRILL_TO_DETAIL',
  DRILL_BY: 'DRILL_BY',
};

export type DataRecord = Record<string, any>;
export type QueryContext = any;
export type ChartProps = any;
export type QueryFormData = Record<string, any>;

export function buildQueryContext() {
  return {};
}
