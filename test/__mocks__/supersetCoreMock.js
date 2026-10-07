/**
 * Standalone test double for `@superset-ui/core` (v0.20.4).
 *
 * Why this mock exists: the published 0.20.x core package ships ECMAScript
 * modules in its `lib` entry point without a CommonJS `exports` map, so jest
 * in CommonJS mode cannot load it outside the Superset webpack tree. The
 * same jest `moduleNameMapper` pattern is already used by
 * superset-plugin-chart-stratum-bar (test/__mocks__/supersetCoreMock.js).
 *
 * The mock replicates the runtime semantics of the core APIs consumed by
 * the modules under test (`src/plugin/buildQuery.ts`,
 * `src/utils/formatters.ts`), mirroring `buildQueryContext` /
 * `buildQueryObject` from @superset-ui/core 0.20.4:
 *
 * - Base query object: `time_range` passthrough, numeric `row_limit`,
 *   `columns` extracted from formData `columns` + `groupby` (groupby is
 *   normalized to columns, empty strings dropped, duplicates dropped by
 *   column label), `metrics` extracted from formData `metrics` + `metric`
 *   (duplicates dropped by metric label), `orderby` passthrough.
 * - Context wrapper: datasource `{ id, type }` parsed from the `<id>__<type>`
 *   key, `force`, `form_data`, `result_format` and `result_type` defaults.
 *
 * `getNumberFormatter` (consumed at runtime by `formatMetricValue`, i.e. by
 * `src/plugin/transformProps.ts`) mirrors NumberFormatterRegistry +
 * NumberFormatter + createD3NumberFormatter/createSmartNumberFormatter from
 * @superset-ui/core 0.20.4:
 *
 * - null/undefined/'' format id resolves to the default key `SMART_NUMBER`;
 *   `SMART_NUMBER` and `SMART_NUMBER_SIGNED` are pre-registered adaptive
 *   formatters (SI `.3~s` with G->B above 1000, `.2~f`, `.4~f`, micro).
 * - any other id is trimmed and compiled with d3-format v1 (the version core
 *   itself depends on, resolved from core's own install location because the
 *   hoisted d3-format v3 is ESM-only) using the DEFAULT_D3_FORMAT locale
 *   (`.` decimal, `,` thousands, `$` currency); invalid specifiers produce
 *   `"<value> (Invalid format: <id>)"` instead of throwing.
 * - the formatter wrapper returns `${value}` for null/undefined/NaN and
 *   `∞`/`-∞` for infinities before delegating to the format function.
 *
 * `ChartProps` / `QueryFormData` / `DataRecord` are type-only imports in the
 * plugin and are therefore not provided.
 *
 * Intentionally NOT replicated (never exercised by this plugin's unit
 * tests): the x_axis/normalizeTimeColumn query mutator and the
 * post_processing filter of the upstream `buildQueryContext`, and runtime
 * locale overrides through `setD3Format` (Superset's D3_FORMAT config).
 */

const path = require('path');

const d3Format = require(
  require.resolve('d3-format', {
    paths: [path.join(__dirname, '..', '..', 'node_modules', '@superset-ui', 'core')],
  }),
);

const DEFAULT_D3_FORMAT = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['$', ''],
};

const createNumberFormatter = (formatFunc) => (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return `${value}`;
  }
  if (value === Number.POSITIVE_INFINITY) return '∞';
  if (value === Number.NEGATIVE_INFINITY) return '-∞';
  return formatFunc(value);
};

const smartSiFormatter = d3Format.format('.3~s');
const smartFloat2PointFormatter = d3Format.format('.2~f');
const smartFloat4PointFormatter = d3Format.format('.4~f');

const formatSmartValue = (value) => {
  if (value === 0) return '0';
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1000) return smartSiFormatter(value).replace('G', 'B');
  if (absoluteValue >= 1) return smartFloat2PointFormatter(value);
  if (absoluteValue >= 0.001) return smartFloat4PointFormatter(value);
  if (absoluteValue > 0.000001) return `${smartSiFormatter(value * 1000000)}µ`;
  return smartSiFormatter(value);
};

const createSmartNumberFormatter = (signed) =>
  createNumberFormatter(
    value => `${signed && value > 0 ? '+' : ''}${formatSmartValue(value)}`,
  );

const createD3NumberFormatter = (formatString) => {
  let formatFunc;
  try {
    formatFunc = d3Format.formatLocale(DEFAULT_D3_FORMAT).format(formatString);
  } catch (error) {
    formatFunc = value => `${value} (Invalid format: ${formatString})`;
  }
  return createNumberFormatter(formatFunc);
};

const numberFormatterRegistry = new Map([
  ['SMART_NUMBER', createSmartNumberFormatter(false)],
  ['SMART_NUMBER_SIGNED', createSmartNumberFormatter(true)],
]);

const getNumberFormatter = (formatterId) => {
  const targetFormat = `${
    formatterId === null || typeof formatterId === 'undefined' || formatterId === ''
      ? 'SMART_NUMBER'
      : formatterId
  }`.trim();
  if (!numberFormatterRegistry.has(targetFormat)) {
    numberFormatterRegistry.set(targetFormat, createD3NumberFormatter(targetFormat));
  }
  return numberFormatterRegistry.get(targetFormat);
};

const getMetricLabel = (metric) => {
  if (!metric) return '';
  if (typeof metric === 'string') return metric;
  return (
    metric.label ||
    metric.metric_name ||
    metric.verbose_name ||
    metric.sqlExpression ||
    (metric.column && metric.column.column_name) ||
    metric.optionName ||
    ''
  );
};

const getColumnLabel = (column) => {
  if (typeof column === 'string') return column;
  if (column && typeof column.column_name === 'string') return column.column_name;
  return column;
};

const removeDuplicates = (items, hash) => {
  if (hash) {
    const seen = new Set();
    return items.filter(x => {
      const itemHash = hash(x);
      if (seen.has(itemHash)) return false;
      seen.add(itemHash);
      return true;
    });
  }
  return [...new Set(items)];
};

const baseQueryObject = (formData) => {
  const columns = [];
  [formData.columns, formData.groupby].forEach(value => {
    if (Array.isArray(value)) {
      columns.push(...value);
    } else if (value != null && value !== '') {
      columns.push(value);
    }
  });

  const metrics = [];
  [formData.metrics, formData.metric].forEach(value => {
    if (value == null) return;
    metrics.push(...(Array.isArray(value) ? value : [value]));
  });

  const numericRowLimit = Number(formData.row_limit);

  return {
    time_range: formData.time_range || undefined,
    granularity: formData.granularity || undefined,
    columns: removeDuplicates(columns.filter(col => col !== ''), getColumnLabel),
    metrics: removeDuplicates(metrics, getMetricLabel),
    orderby: formData.orderby || undefined,
    row_limit:
      formData.row_limit == null || Number.isNaN(numericRowLimit)
        ? undefined
        : numericRowLimit,
  };
};

module.exports = {
  buildQueryContext: (formData, buildQueryFn) => ({
    datasource: {
      id: parseInt(String(formData.datasource).split('__')[0], 10),
      type:
        String(formData.datasource).split('__')[1] === 'query'
          ? 'query'
          : 'table',
    },
    force: formData.force || false,
    queries: buildQueryFn(baseQueryObject(formData)),
    form_data: formData,
    result_format: formData.result_format || 'json',
    result_type: formData.result_type || 'full',
  }),
  ensureIsArray: value => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  },
  getNumberFormatter,
};
