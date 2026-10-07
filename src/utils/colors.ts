import { BadgeStyle } from '../types';
import { TrendPolarity } from './trend';

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface TrendColors {
  trendColor: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;
}

export const DEFAULT_SPARKLINE_COLOR = '#2563eb';
export const DARK_TEXT_COLOR = '#0f172a';
export const LIGHT_TEXT_COLOR = '#ffffff';

/** Brightness above which dark text is used on a colored background. */
export const BRIGHTNESS_CONTRAST_THRESHOLD = 125;

export function toRgbaString(color: RgbaColor): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
}

/**
 * Perceived brightness (0-255) from the W3C accessibility "color brightness"
 * formula ((R * 299) + (G * 587) + (B * 114)) / 1000. Alpha is ignored.
 */
export function getPerceivedBrightness(color: RgbaColor): number {
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
}

/** Text color that stays readable on top of `background`. */
export function getContrastTextColor(background: RgbaColor): string {
  return getPerceivedBrightness(background) > BRIGHTNESS_CONTRAST_THRESHOLD
    ? DARK_TEXT_COLOR
    : LIGHT_TEXT_COLOR;
}

const TREND_PALETTE: Record<TrendPolarity, { trend: string; background: string; text: string }> = {
  positive: { trend: '#10b981', background: '#dcfce7', text: '#15803d' },
  negative: { trend: '#ef4444', background: '#fee2e2', text: '#b91c1c' },
  neutral: { trend: '#94a3b8', background: '#f1f5f9', text: '#64748b' },
};

/** Trend accent and delta badge colors; the subtle badge style drops the background. */
export function getTrendColors(polarity: TrendPolarity, badgeStyle: BadgeStyle): TrendColors {
  const palette = TREND_PALETTE[polarity];
  return {
    trendColor: palette.trend,
    badgeBackgroundColor: badgeStyle === 'subtle' ? 'transparent' : palette.background,
    badgeTextColor: palette.text,
  };
}

const isRgbObject = (value: any): value is RgbaColor =>
  value.r !== undefined && value.g !== undefined && value.b !== undefined;

/** Sparkline color from a CSS string or a color picker `{ r, g, b, a }` value. */
export function resolveSparklineColor(config: any): string {
  if (config) {
    if (typeof config === 'string') {
      return config;
    }
    if (isRgbObject(config)) {
      return toRgbaString(config);
    }
  }
  return DEFAULT_SPARKLINE_COLOR;
}

/** Card background from a CSS string or a color picker value; alpha 0 means transparent. */
export function resolveCardBgColor(config: any): string {
  if (config) {
    if (typeof config === 'string') {
      return config;
    }
    if (isRgbObject(config)) {
      return config.a === 0 ? 'transparent' : toRgbaString(config);
    }
  }
  return 'transparent';
}
