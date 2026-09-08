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
