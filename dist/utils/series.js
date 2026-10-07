import { parseNumericValue } from './formatters';
/** Peak/minimum cards are recognised from keywords in the (Italian or English) title. */
export function classifyExtremeTitle(title) {
    const titleLower = title.toLowerCase();
    return {
        isPeak: titleLower.includes('picco') || titleLower.includes('peak'),
        isMin: titleLower.includes('minimo') ||
            titleLower.includes('basso') ||
            titleLower.includes('lowest'),
    };
}
const rowPrimaryValue = (row, primaryMetricKey) => parseNumericValue(primaryMetricKey ? row[primaryMetricKey] : null) ??
    parseNumericValue(Object.values(row).find(val => typeof val === 'number'));
/**
 * Row the KPI value is read from: the max/min row for peak/minimum cards,
 * the latest row of a dual-metric sparkline series, otherwise the first row.
 */
export function selectReferenceRow(data, primaryMetricKey, { isPeak, isMin, calculationMode, showSparkline }) {
    if (isPeak) {
        let maxVal = -Infinity;
        let peakRow = data[0];
        data.forEach(r => {
            const v = rowPrimaryValue(r, primaryMetricKey);
            if (v !== null && v > maxVal) {
                maxVal = v;
                peakRow = r;
            }
        });
        return peakRow;
    }
    if (isMin) {
        let minVal = Infinity;
        let minRow = data[0];
        data.forEach(r => {
            const v = rowPrimaryValue(r, primaryMetricKey);
            if (v !== null && v < minVal) {
                minVal = v;
                minRow = r;
            }
        });
        return minRow;
    }
    return calculationMode === 'dual_metric' && showSparkline && data.length > 1
        ? data[data.length - 1]
        : data[0];
}
/** Numeric series of the primary metric across rows, skipping non-numeric cells. */
export function extractSparklineData(data, primaryMetricKey) {
    const sparklineData = [];
    data.forEach(row => {
        const val = parseNumericValue(row[primaryMetricKey]);
        if (val !== null) {
            sparklineData.push(val);
        }
    });
    return sparklineData;
}
//# sourceMappingURL=series.js.map