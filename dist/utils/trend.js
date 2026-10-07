/** Delta % magnitude at or below which the trend is reported as flat. */
export const TREND_FLAT_THRESHOLD = 0.001;
/**
 * Percentage change of `primaryValue` against `comparisonValue`, relative to
 * the absolute baseline. A zero baseline yields 0% when both values are zero
 * and +100% otherwise.
 */
export function computeDeltaPercent(primaryValue, comparisonValue) {
    const deltaAbsolute = primaryValue - comparisonValue;
    if (comparisonValue !== 0) {
        return (deltaAbsolute / Math.abs(comparisonValue)) * 100;
    }
    if (primaryValue === 0) {
        return 0;
    }
    return 100;
}
export function getTrendDirection(deltaPercent) {
    if (deltaPercent > TREND_FLAT_THRESHOLD) {
        return 'up';
    }
    if (deltaPercent < -TREND_FLAT_THRESHOLD) {
        return 'down';
    }
    return 'flat';
}
/** Absolute delta, delta % and trend direction; all empty when a value is missing. */
export function computeDelta(primaryValue, comparisonValue) {
    if (primaryValue === null || comparisonValue === null) {
        return { deltaAbsolute: null, deltaPercent: null, trendDirection: 'flat' };
    }
    const deltaPercent = computeDeltaPercent(primaryValue, comparisonValue);
    return {
        deltaAbsolute: primaryValue - comparisonValue,
        deltaPercent,
        trendDirection: getTrendDirection(deltaPercent),
    };
}
/**
 * Semantic meaning of a trend: with inverted polarity (e.g. waiting times)
 * a decrease is good and an increase is bad.
 */
export function getTrendPolarity(trendDirection, invertPolarity) {
    if (trendDirection === 'up') {
        return invertPolarity ? 'negative' : 'positive';
    }
    if (trendDirection === 'down') {
        return invertPolarity ? 'positive' : 'negative';
    }
    return 'neutral';
}
//# sourceMappingURL=trend.js.map