import { buildQueryContext, QueryContext, ensureIsArray } from '@superset-ui/core';
import { KPIComparisonFormData } from '../types';
import { getMetricLabel } from '../utils/formatters';

export default function buildQuery(formData: KPIComparisonFormData): QueryContext {
  const fd: any = formData || {};
  const {
    calculation_mode = 'dual_metric',
    metric,
    comparison_metric,
    metrics: fdMetrics,
    time_compare,
    time_column,
    show_sparkline,
    columns: fdColumns,
    groupby: fdGroupby,
  } = fd;

  return buildQueryContext(formData as any, (baseQueryObject: any) => {
    const isDual = calculation_mode === 'dual_metric';

    // In dual metric mode, request primary, comparison and any configured extra metrics
    let metrics: any[] = [];
    if (Array.isArray(fdMetrics) && fdMetrics.length > 0) {
      metrics = [...fdMetrics];
      if (metric && !metrics.some(m => getMetricLabel(m) === getMetricLabel(metric))) {
        metrics.unshift(metric);
      }
      if (
        isDual &&
        comparison_metric &&
        !metrics.some(m => getMetricLabel(m) === getMetricLabel(comparison_metric))
      ) {
        metrics.push(comparison_metric);
      }
    } else if (isDual) {
      if (metric && comparison_metric) {
        metrics = [metric, comparison_metric];
      } else if (metric) {
        metrics = [metric, comparison_metric || 'richieste_conf'].filter(Boolean);
      }
    } else {
      metrics = metric ? [metric] : [];
    }

    const isSparklineActive = Boolean(show_sparkline && time_column);
    const extraCols = Array.isArray(fdColumns)
      ? fdColumns
      : Array.isArray(fdGroupby)
      ? fdGroupby
      : [];
    const columns = isSparklineActive
      ? [time_column, ...extraCols.filter((c: string) => c !== time_column)]
      : extraCols;

    const query: any = {
      ...baseQueryObject,
      columns,
      metrics,
      row_limit: isSparklineActive ? 50 : (baseQueryObject.row_limit || 1),
    };

    if (isSparklineActive) {
      query.orderby = [[time_column, true]];
    }

    // In time shift mode, apply Superset's native time offset query
    if (!isDual && time_compare) {
      query.time_offsets = ensureIsArray(time_compare);
    }

    return [query];
  });
}

