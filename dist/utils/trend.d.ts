import { TrendDirection } from '../types';
/** Delta % magnitude at or below which the trend is reported as flat. */
export declare const TREND_FLAT_THRESHOLD = 0.001;
export type TrendPolarity = 'positive' | 'negative' | 'neutral';
export interface DeltaResult {
    deltaAbsolute: number | null;
    deltaPercent: number | null;
    trendDirection: TrendDirection;
}
/**
 * Percentage change of `primaryValue` against `comparisonValue`, relative to
 * the absolute baseline. A zero baseline yields 0% when both values are zero
 * and +100% otherwise.
 */
export declare function computeDeltaPercent(primaryValue: number, comparisonValue: number): number;
export declare function getTrendDirection(deltaPercent: number): TrendDirection;
/** Absolute delta, delta % and trend direction; all empty when a value is missing. */
export declare function computeDelta(primaryValue: number | null, comparisonValue: number | null): DeltaResult;
/**
 * Semantic meaning of a trend: with inverted polarity (e.g. waiting times)
 * a decrease is good and an increase is bad.
 */
export declare function getTrendPolarity(trendDirection: TrendDirection, invertPolarity: boolean): TrendPolarity;
//# sourceMappingURL=trend.d.ts.map