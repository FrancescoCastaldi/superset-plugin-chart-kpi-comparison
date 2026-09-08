import { buildQueryContext, QueryContext, ensureIsArray } from '@superset-ui/core';
import { KPIComparisonFormData } from '../types';

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
  } = fd;

  return buildQueryContext(formData as any, (baseQueryObject: any) => {
    const isDual = calculation_mode === 'dual_metric';

    // In dual metric mode, request both primary and comparison metrics
    let metrics: any[] = [];
    if (isDual) {
      if (metric && comparison_metric) {
        metrics = [metric, comparison_metric];
      } else if (Array.isArray(fdMetrics) && fdMetrics.length >= 2) {
        metrics = fdMetrics;
      } else if (metric) {
        metrics = [metric, comparison_metric || 'richieste_conf'].filter(Boolean);
      }
    } else {
      metrics = metric ? [metric] : [];
    }

    const isSparklineActive = Boolean(show_sparkline && time_column);
    const columns = isSparklineActive ? [time_column] : [];

    const query: any = {
      ...baseQueryObject,
      columns,
      metrics,
      row_limit: isSparklineActive ? 50 : 1,
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
