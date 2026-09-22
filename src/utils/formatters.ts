import { getNumberFormatter, NumberFormatter } from '@superset-ui/core';

/**
 * Format a number using Italian convention (dot as thousands separator, comma as decimal).
 */
export function formatItalianNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const parts = value.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (parts.length > 1) {
    return parts.join(',');
  }
  return parts[0];
}

/**
 * Format a percentage value with sign (+/-) and 1 or 2 decimals.
 */
export function formatDeltaPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—%';
  }

  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  const formatted = formatItalianNumber(value, decimals);
  return `${sign}${formatted}%`;
}

/**
 * Format a value using Superset number formatter or Italian fallback.
 */
export function formatMetricValue(
  value: number | null | undefined,
  formatString?: string,
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  if (formatString) {
    try {
      const formatter = getNumberFormatter(formatString);
      return formatter(value);
    } catch {
      // Fallback if formatter string is not standard
    }
  }

  // Automatic heuristic: if integer, 0 decimals; if float, 2 decimals
  const isInteger = Math.abs(value % 1) < 0.0001;
  return formatItalianNumber(value, isInteger ? 0 : 2);
}

/**
 * Parse any arbitrary Superset cell value to a number.
 */
export function parseNumericValue(val: any): number | null {
  if (val === null || val === undefined || val === '') {
    return null;
  }
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

export const ITALIAN_MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export function getMetricLabel(metric: any): string {
  if (!metric) return '';
  if (typeof metric === 'string') return metric;
  return (
    metric.label ||
    metric.metric_name ||
    metric.verbose_name ||
    metric.sqlExpression ||
    metric.column?.column_name ||
    metric.optionName ||
    ''
  );
}

export function formatMonthYearItalian(val: any): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const matchIdx = ITALIAN_MONTHS.findIndex(
      m => m.toLowerCase() === parts[0].toLowerCase(),
    );
    if (matchIdx !== -1) {
      return `${ITALIAN_MONTHS[matchIdx]} ${parts.slice(1).join(' ')}`;
    }
  }

  const m = trimmed.match(/^(\d{4})-(\d{1,2})/);
  if (m) {
    const year = m[1];
    const monthIdx = parseInt(m[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${ITALIAN_MONTHS[monthIdx]} ${year}`;
    }
  }

  return trimmed;
}

