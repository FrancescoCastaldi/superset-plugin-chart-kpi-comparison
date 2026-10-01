/**
 * Format a number using Italian convention (dot as thousands separator, comma as decimal).
 */
export declare function formatItalianNumber(value: number | null | undefined, decimals?: number): string;
/**
 * Format a percentage value with sign (+/-) and 1 or 2 decimals.
 */
export declare function formatDeltaPercent(value: number | null | undefined, decimals?: number): string;
/**
 * Format a value using Superset number formatter or Italian fallback.
 */
export declare function formatMetricValue(value: number | null | undefined, formatString?: string): string;
/**
 * Parse any arbitrary Superset cell value to a number.
 */
export declare function parseNumericValue(val: any): number | null;
export declare const ITALIAN_MONTHS: string[];
export declare function getMetricLabel(metric: any): string;
export declare function formatMonthYearItalian(val: any): string;
//# sourceMappingURL=formatters.d.ts.map