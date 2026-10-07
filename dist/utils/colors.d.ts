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
export declare const DEFAULT_SPARKLINE_COLOR = "#2563eb";
export declare const DARK_TEXT_COLOR = "#0f172a";
export declare const LIGHT_TEXT_COLOR = "#ffffff";
/** Brightness above which dark text is used on a colored background. */
export declare const BRIGHTNESS_CONTRAST_THRESHOLD = 125;
export declare function toRgbaString(color: RgbaColor): string;
/**
 * Perceived brightness (0-255) from the W3C accessibility "color brightness"
 * formula ((R * 299) + (G * 587) + (B * 114)) / 1000. Alpha is ignored.
 */
export declare function getPerceivedBrightness(color: RgbaColor): number;
/** Text color that stays readable on top of `background`. */
export declare function getContrastTextColor(background: RgbaColor): string;
/** Trend accent and delta badge colors; the subtle badge style drops the background. */
export declare function getTrendColors(polarity: TrendPolarity, badgeStyle: BadgeStyle): TrendColors;
/** Sparkline color from a CSS string or a color picker `{ r, g, b, a }` value. */
export declare function resolveSparklineColor(config: any): string;
/** Card background from a CSS string or a color picker value; alpha 0 means transparent. */
export declare function resolveCardBgColor(config: any): string;
//# sourceMappingURL=colors.d.ts.map