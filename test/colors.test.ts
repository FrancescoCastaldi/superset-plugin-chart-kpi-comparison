import {
  BRIGHTNESS_CONTRAST_THRESHOLD,
  DARK_TEXT_COLOR,
  DEFAULT_SPARKLINE_COLOR,
  getContrastTextColor,
  getPerceivedBrightness,
  getTrendColors,
  LIGHT_TEXT_COLOR,
  resolveCardBgColor,
  resolveSparklineColor,
  toRgbaString,
} from '../src/utils/colors';

describe('KPI Comparison color utils', () => {
  describe('getPerceivedBrightness', () => {
    it('applies the (R*299 + G*587 + B*114) / 1000 weighting', () => {
      expect(getPerceivedBrightness({ r: 0, g: 0, b: 0 })).toBe(0);
      expect(getPerceivedBrightness({ r: 255, g: 255, b: 255 })).toBe(255);
      expect(getPerceivedBrightness({ r: 255, g: 0, b: 0 })).toBeCloseTo(76.245, 10);
      expect(getPerceivedBrightness({ r: 0, g: 255, b: 0 })).toBeCloseTo(149.685, 10);
      expect(getPerceivedBrightness({ r: 0, g: 0, b: 255 })).toBeCloseTo(29.07, 10);
    });

    it('computes the default indigo badge brightness', () => {
      expect(getPerceivedBrightness({ r: 99, g: 102, b: 241, a: 1 })).toBeCloseTo(116.949, 10);
    });

    it('ignores the alpha channel', () => {
      expect(getPerceivedBrightness({ r: 10, g: 20, b: 30, a: 0 })).toBe(
        getPerceivedBrightness({ r: 10, g: 20, b: 30, a: 1 }),
      );
    });
  });

  describe('getContrastTextColor', () => {
    it('uses white text on dark backgrounds', () => {
      expect(getContrastTextColor({ r: 99, g: 102, b: 241 })).toBe(LIGHT_TEXT_COLOR);
      expect(getContrastTextColor({ r: 0, g: 0, b: 0 })).toBe('#ffffff');
    });

    it('uses dark slate text on light backgrounds', () => {
      expect(getContrastTextColor({ r: 254, g: 240, b: 138 })).toBe(DARK_TEXT_COLOR);
      expect(getContrastTextColor({ r: 255, g: 255, b: 255 })).toBe('#0f172a');
    });

    it('keeps white text at exactly the threshold and switches just above it', () => {
      expect(BRIGHTNESS_CONTRAST_THRESHOLD).toBe(125);
      expect(getContrastTextColor({ r: 125, g: 125, b: 125 })).toBe(LIGHT_TEXT_COLOR);
      expect(getContrastTextColor({ r: 126, g: 126, b: 126 })).toBe(DARK_TEXT_COLOR);
    });
  });

  describe('toRgbaString', () => {
    it('serializes the color with opaque alpha by default', () => {
      expect(toRgbaString({ r: 1, g: 2, b: 3 })).toBe('rgba(1, 2, 3, 1)');
    });

    it('keeps an explicit alpha, including zero', () => {
      expect(toRgbaString({ r: 1, g: 2, b: 3, a: 0.25 })).toBe('rgba(1, 2, 3, 0.25)');
      expect(toRgbaString({ r: 1, g: 2, b: 3, a: 0 })).toBe('rgba(1, 2, 3, 0)');
    });
  });

  describe('getTrendColors', () => {
    it('returns the green palette for positive trends', () => {
      expect(getTrendColors('positive', 'pill')).toEqual({
        trendColor: '#10b981',
        badgeBackgroundColor: '#dcfce7',
        badgeTextColor: '#15803d',
      });
    });

    it('returns the red palette for negative trends', () => {
      expect(getTrendColors('negative', 'full')).toEqual({
        trendColor: '#ef4444',
        badgeBackgroundColor: '#fee2e2',
        badgeTextColor: '#b91c1c',
      });
    });

    it('returns the slate palette for neutral trends', () => {
      expect(getTrendColors('neutral', 'pill')).toEqual({
        trendColor: '#94a3b8',
        badgeBackgroundColor: '#f1f5f9',
        badgeTextColor: '#64748b',
      });
    });

    it('drops the badge background with the subtle style only', () => {
      (['positive', 'negative', 'neutral'] as const).forEach(polarity => {
        const subtle = getTrendColors(polarity, 'subtle');
        const pill = getTrendColors(polarity, 'pill');
        expect(subtle.badgeBackgroundColor).toBe('transparent');
        expect(subtle.trendColor).toBe(pill.trendColor);
        expect(subtle.badgeTextColor).toBe(pill.badgeTextColor);
      });
    });
  });

  describe('resolveSparklineColor', () => {
    it('passes CSS strings through', () => {
      expect(resolveSparklineColor('#ff0000')).toBe('#ff0000');
    });

    it('serializes complete color picker values', () => {
      expect(resolveSparklineColor({ r: 1, g: 2, b: 3, a: 0 })).toBe('rgba(1, 2, 3, 0)');
    });

    it('falls back to the default blue for empty or incomplete values', () => {
      expect(DEFAULT_SPARKLINE_COLOR).toBe('#2563eb');
      expect(resolveSparklineColor(undefined)).toBe(DEFAULT_SPARKLINE_COLOR);
      expect(resolveSparklineColor('')).toBe(DEFAULT_SPARKLINE_COLOR);
      expect(resolveSparklineColor({ r: 1, g: 2 })).toBe(DEFAULT_SPARKLINE_COLOR);
    });
  });

  describe('resolveCardBgColor', () => {
    it('passes CSS strings through', () => {
      expect(resolveCardBgColor('#fafafa')).toBe('#fafafa');
    });

    it('serializes color picker values and maps alpha 0 to transparent', () => {
      expect(resolveCardBgColor({ r: 10, g: 20, b: 30 })).toBe('rgba(10, 20, 30, 1)');
      expect(resolveCardBgColor({ r: 10, g: 20, b: 30, a: 0.5 })).toBe('rgba(10, 20, 30, 0.5)');
      expect(resolveCardBgColor({ r: 10, g: 20, b: 30, a: 0 })).toBe('transparent');
    });

    it('falls back to transparent for empty or incomplete values', () => {
      expect(resolveCardBgColor(undefined)).toBe('transparent');
      expect(resolveCardBgColor({ g: 2, b: 3 })).toBe('transparent');
    });
  });
});
