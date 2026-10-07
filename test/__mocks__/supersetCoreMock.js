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
 * Intentionally NOT replicated (never exercised by this plugin's unit
 * tests): the x_axis/normalizeTimeColumn query mutator and the
 * post_processing filter of the upstream `buildQueryContext`.
 */

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
  getNumberFormatter: () => value =>
    typeof value === 'number' ? String(value) : '',
};
