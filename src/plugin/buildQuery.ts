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
    dynamic_subtitle_column,
    show_sparkline,
    target_metric,
    columns: fdColumns,
    groupby: fdGroupby,
  } = fd;

  return buildQueryContext(formData as any, (baseQueryObject: any) => {
    const isDual = calculation_mode === 'dual_metric';

    // In dual metric mode, request primary, comparison and any configured extra metrics
    let metrics: any[] = [];
    const titleLow = String(fd.kpi_title || fd.slice_name || '').toLowerCase();
    const isPeakOrMin =
      titleLow.includes('picco') ||
      titleLow.includes('peak') ||
      titleLow.includes('minimo') ||
      titleLow.includes('basso') ||
      titleLow.includes('lowest');

    if (isPeakOrMin) {
      metrics = metric ? [metric] : (Array.isArray(fdMetrics) && fdMetrics.length > 0 ? [fdMetrics[0]] : []);
    } else if (Array.isArray(fdMetrics) && fdMetrics.length > 0) {
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

    if (target_metric && !metrics.some(m => getMetricLabel(m) === getMetricLabel(target_metric))) {
      metrics.push(target_metric);
    }

    // Normalize time_column if passed as an array or empty string
    const rawTimeCol = Array.isArray(time_column) ? time_column[0] : time_column;
    const validTimeCol = typeof rawTimeCol === 'string' && rawTimeCol.trim().length > 0 ? rawTimeCol.trim() : null;
    const isSparklineActive = Boolean(show_sparkline && validTimeCol);

    const baseExtraCols = Array.isArray(fdColumns)
      ? fdColumns
      : Array.isArray(fdGroupby)
      ? fdGroupby
      : [];
    
    const extraCols = [...baseExtraCols];
    if (dynamic_subtitle_column && typeof dynamic_subtitle_column === 'string' && !extraCols.includes(dynamic_subtitle_column)) {
      extraCols.push(dynamic_subtitle_column);
    }

    const rawColumns = isSparklineActive && validTimeCol
      ? [validTimeCol, ...extraCols.filter((c: string) => c !== validTimeCol)]
      : extraCols;

    // Strict sanitization of columns to prevent Superset's get_column_name from throwing 'Missing label'
    const sanitizeColumn = (col: any): any => {
      if (typeof col === 'string') {
        const trimmed = col.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (col && typeof col === 'object' && !Array.isArray(col)) {
        if (typeof col.label === 'string' && col.label.trim()) return col;
        if (typeof col.sqlExpression === 'string' && col.sqlExpression.trim()) return col;
        if (typeof col.column_name === 'string' && col.column_name.trim()) return col.column_name.trim();
      }
      return null;
    };

    const finalColumns = (rawColumns || [])
      .map(sanitizeColumn)
      .filter((c: any) => c !== null);

    const isMultiRow = isSparklineActive || isPeakOrMin;

    // Ensure metrics are non-empty and sanitized
    const sanitizeMetric = (m: any): any => {
      if (typeof m === 'string') {
        const trimmed = m.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (m && typeof m === 'object' && !Array.isArray(m)) {
        if (typeof m.label === 'string' && m.label.trim()) return m;
        if (typeof m.metric_name === 'string' && m.metric_name.trim()) return m.metric_name.trim();
        if (typeof m.sqlExpression === 'string' && m.sqlExpression.trim()) return m;
      }
      return null;
    };

    let cleanMetrics = (metrics || [])
      .map(sanitizeMetric)
      .filter((m: any) => m !== null);

    if (cleanMetrics.length === 0) {
      if (metric) cleanMetrics = [metric];
      else cleanMetrics = ['richieste_corr'];
    }

    // Clean baseQueryObject.columns to avoid polluted default groupby controls
    const cleanBaseColumns = (Array.isArray(baseQueryObject.columns) ? baseQueryObject.columns : [])
      .map(sanitizeColumn)
      .filter((c: any) => c !== null);

    const mergedColumns = Array.from(new Set([...cleanBaseColumns, ...finalColumns]));

    const query: any = {
      ...baseQueryObject,
      columns: mergedColumns,
      metrics: cleanMetrics,
      row_limit: isMultiRow ? 50 : (baseQueryObject.row_limit || 1),
    };

    if (isSparklineActive && validTimeCol) {
      query.orderby = [[validTimeCol, true]];
    }

    // In time shift mode, apply Superset's native time offset query
    if (!isDual && time_compare) {
      query.time_offsets = ensureIsArray(time_compare);
    }

    return [query];
  });
}

