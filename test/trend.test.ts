import {
  computeDelta,
  computeDeltaPercent,
  getTrendDirection,
  getTrendPolarity,
  TREND_FLAT_THRESHOLD,
} from '../src/utils/trend';

describe('KPI Comparison trend utils', () => {
  describe('computeDeltaPercent', () => {
    it('computes the relative change against the baseline', () => {
      expect(computeDeltaPercent(120, 100)).toBe(20);
      expect(computeDeltaPercent(80, 100)).toBe(-20);
    });

    it('divides by the absolute value of a negative baseline', () => {
      expect(computeDeltaPercent(-50, -100)).toBe(50);
      expect(computeDeltaPercent(-150, -100)).toBe(-50);
    });

    it('returns 0 when both values are zero', () => {
      expect(computeDeltaPercent(0, 0)).toBe(0);
    });

    it('returns +100 for any non-zero value against a zero baseline', () => {
      expect(computeDeltaPercent(5, 0)).toBe(100);
      expect(computeDeltaPercent(-5, 0)).toBe(100);
    });
  });

  describe('getTrendDirection', () => {
    it('reports up and down outside the flat threshold', () => {
      expect(getTrendDirection(0.0011)).toBe('up');
      expect(getTrendDirection(-0.0011)).toBe('down');
    });

    it('reports flat at or inside the threshold', () => {
      expect(TREND_FLAT_THRESHOLD).toBe(0.001);
      expect(getTrendDirection(0)).toBe('flat');
      expect(getTrendDirection(0.001)).toBe('flat');
      expect(getTrendDirection(-0.001)).toBe('flat');
    });

    it('reports flat for NaN', () => {
      expect(getTrendDirection(NaN)).toBe('flat');
    });
  });

  describe('computeDelta', () => {
    it('returns absolute delta, percent and direction', () => {
      expect(computeDelta(1200, 1000)).toEqual({
        deltaAbsolute: 200,
        deltaPercent: 20,
        trendDirection: 'up',
      });
      expect(computeDelta(900, 1000)).toEqual({
        deltaAbsolute: -100,
        deltaPercent: -10,
        trendDirection: 'down',
      });
    });

    it('returns empty values when either side is missing', () => {
      const empty = { deltaAbsolute: null, deltaPercent: null, trendDirection: 'flat' };
      expect(computeDelta(null, 1000)).toEqual(empty);
      expect(computeDelta(1000, null)).toEqual(empty);
      expect(computeDelta(null, null)).toEqual(empty);
    });

    it('treats a zero comparison as a valid baseline', () => {
      expect(computeDelta(0, 0)).toEqual({ deltaAbsolute: 0, deltaPercent: 0, trendDirection: 'flat' });
      expect(computeDelta(3, 0)).toEqual({ deltaAbsolute: 3, deltaPercent: 100, trendDirection: 'up' });
    });
  });

  describe('getTrendPolarity', () => {
    it('maps up to positive and down to negative with normal polarity', () => {
      expect(getTrendPolarity('up', false)).toBe('positive');
      expect(getTrendPolarity('down', false)).toBe('negative');
    });

    it('swaps the meaning with inverted polarity', () => {
      expect(getTrendPolarity('up', true)).toBe('negative');
      expect(getTrendPolarity('down', true)).toBe('positive');
    });

    it('keeps flat and none neutral regardless of polarity', () => {
      expect(getTrendPolarity('flat', false)).toBe('neutral');
      expect(getTrendPolarity('flat', true)).toBe('neutral');
      expect(getTrendPolarity('none', false)).toBe('neutral');
      expect(getTrendPolarity('none', true)).toBe('neutral');
    });
  });
});
