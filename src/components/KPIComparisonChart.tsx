import React from 'react';
import { KPIComparisonProps } from '../types';
import { KPIComparisonBadge } from './KPIComparisonBadge';
import { KPISparkline } from './KPISparkline';

export const KPIComparisonChart: React.FC<KPIComparisonProps> = ({
  width,
  height,
  formattedPrimary,
  formattedComparison,
  formattedDeltaAbsolute,
  formattedDeltaPercent,
  trendDirection,
  badgeStyle,
  badgeBackgroundColor,
  badgeTextColor,
  kpiTitle,
  kpiSubtitle,
  comparisonLabel,
  prefixValue,
  suffixValue,
  cardAlignment = 'left',
  showComparisonValue = true,
  showAbsoluteDelta = true,
  showSparkline = false,
  sparklineData = [],
  sparklineColor = '#2563eb',
  sparklineFill = true,
  cardBgColor = '#ffffff',
  cardBorderRadius = 'subtle',
  cardBoxShadow = 'none',
}) => {
  // Dimensional tiers (decoupled height and width)
  const isVerticalUltraCompact = height < 90;
  const isVerticalCompact = height < 135;
  const isHorizontalUltraCompact = width < 180;
  const isHorizontalCompact = width < 230;

  // Title intelligence:
  // When vertical height is very small (< 90px), vertical space is prioritized 100%
  // for the primary KPI value and comparison delta badge. Title is preserved in container tooltip.
  const showTitle = !isVerticalUltraCompact && Boolean(kpiTitle);
  const isTitleMini = isHorizontalUltraCompact;
  const showSubtitle = height >= 140 && width >= 200 && Boolean(kpiSubtitle);

  // Sparkline: requires sufficient vertical room (>= 125px)
  const canRenderSparkline =
    showSparkline && sparklineData && sparklineData.length > 1 && height >= 125;
  const sparklineHeight = canRenderSparkline ? (height < 160 ? 22 : 36) : 0;

  // Dynamic padding scaled to dimensions
  const padV =
    height < 65 ? 2 : height < 80 ? 4 : height < 100 ? 6 : height < 140 ? 10 : height < 180 ? 14 : 18;
  const padH = width < 150 ? 6 : width < 200 ? 10 : width < 280 ? 14 : 20;

  // Fluid responsive font size calculation
  const titleHeight = showTitle ? (showSubtitle ? 32 : isTitleMini ? 14 : 18) : 0;
  const bottomHeight = isVerticalUltraCompact ? 18 : isVerticalCompact ? 22 : 26;
  const innerGap = isVerticalUltraCompact ? 2 : isVerticalCompact ? 4 : 8;

  const availWidth = Math.max(30, width - padH * 2);
  const effectiveChars =
    (formattedPrimary ? formattedPrimary.length * 0.58 : 1) +
    (prefixValue ? prefixValue.length * 0.35 : 0) +
    (suffixValue ? suffixValue.length * 0.35 : 0);

  const maxFontFromWidth = Math.floor(availWidth / Math.max(1, effectiveChars));

  const availHeight = Math.max(
    14,
    height - padV * 2 - sparklineHeight - titleHeight - bottomHeight - innerGap,
  );
  const maxFontFromHeight = Math.floor(availHeight / 1.05);

  // Primary font size dynamically scales and fills space smoothly, bounded between 13px and 64px
  const primaryFontSizePx = Math.max(
    13,
    Math.min(64, maxFontFromWidth, maxFontFromHeight),
  );

  // Absolute delta in badge: hide when horizontal width is tight (< 220px) to prevent crowded bottom row
  const hideBadgeAbsolute = !showAbsoluteDelta || width < 220;

  // Aesthetic border radius
  let borderRadius = '0px';
  switch (cardBorderRadius) {
    case 'subtle':
      borderRadius = '8px';
      break;
    case 'rounded':
      borderRadius = '14px';
      break;
    case 'pill':
      borderRadius = '24px';
      break;
    case 'square':
    default:
      borderRadius = '0px';
      break;
  }

  // Aesthetic shadow and border
  let boxShadow = 'none';
  let border = 'none';
  switch (cardBoxShadow) {
    case 'subtle':
      boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)';
      border = '1px solid rgba(0, 0, 0, 0.06)';
      break;
    case 'elevated':
      boxShadow = '0 8px 16px -4px rgba(0, 0, 0, 0.10), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      border = '1px solid rgba(0, 0, 0, 0.05)';
      break;
    case 'bordered':
      border = '1px solid #e2e8f0';
      boxShadow = 'none';
      break;
    case 'none':
    default:
      boxShadow = 'none';
      border = 'none';
      break;
  }

  const alignStyles: React.CSSProperties = {
    textAlign: cardAlignment,
    alignItems:
      cardAlignment === 'center'
        ? 'center'
        : cardAlignment === 'right'
        ? 'flex-end'
        : 'flex-start',
  };

  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        padding: `${padV}px ${padH}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: !showTitle ? 'center' : 'space-between',
        gap: !showTitle ? (height < 70 ? '2px' : '4px') : '0px',
        backgroundColor: cardBgColor,
        borderRadius,
        boxShadow,
        border,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
      title={
        !showTitle && kpiTitle
          ? kpiSubtitle
            ? `${kpiTitle} — ${kpiSubtitle}`
            : kpiTitle
          : undefined
      }
    >
      {/* Top Section: Title & Subtitle */}
      {showTitle && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            flexShrink: 0,
            ...alignStyles,
          }}
        >
          <div
            style={{
              fontSize: isTitleMini
                ? '0.70rem'
                : isVerticalCompact
                ? '0.74rem'
                : '0.90rem',
              fontWeight: 600,
              color: '#475569',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
            title={kpiTitle}
          >
            {kpiTitle}
          </div>
          {showSubtitle && (
            <div
              style={{
                fontSize: '0.74rem',
                color: '#94a3b8',
                marginTop: '1px',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
              title={kpiSubtitle}
            >
              {kpiSubtitle}
            </div>
          )}
        </div>
      )}

      {/* Middle Section: Main Big Value */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent:
            cardAlignment === 'center'
              ? 'center'
              : cardAlignment === 'right'
              ? 'flex-end'
              : 'flex-start',
          margin: isVerticalUltraCompact
            ? '0px'
            : isVerticalCompact
            ? '1px 0'
            : '3px 0',
          width: '100%',
          flexShrink: 0,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {prefixValue && (
          <span
            style={{
              fontSize: `${Math.max(10, Math.round(primaryFontSizePx * 0.52))}px`,
              fontWeight: 600,
              color: '#64748b',
              marginRight: '2px',
              userSelect: 'none',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {prefixValue}
          </span>
        )}
        <span
          style={{
            fontSize: `${primaryFontSizePx}px`,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
            flexShrink: 1,
          }}
          title={`${prefixValue}${formattedPrimary}${suffixValue}`}
        >
          {formattedPrimary}
        </span>
        {suffixValue && (
          <span
            style={{
              fontSize: `${Math.max(10, Math.round(primaryFontSizePx * 0.5))}px`,
              fontWeight: 600,
              color: '#64748b',
              marginLeft: '3px',
              userSelect: 'none',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {suffixValue}
          </span>
        )}
      </div>

      {/* Bottom Section: Comparison Badge, Comparison Value & Period Label */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: isHorizontalUltraCompact ? '3px' : '5px',
          width: '100%',
          justifyContent:
            cardAlignment === 'center'
              ? 'center'
              : cardAlignment === 'right'
              ? 'flex-end'
              : 'flex-start',
          fontSize: isVerticalUltraCompact
            ? '0.72rem'
            : isVerticalCompact
            ? '0.78rem'
            : '0.84rem',
          lineHeight: 1.2,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <KPIComparisonBadge
          deltaPercentStr={formattedDeltaPercent}
          deltaAbsoluteStr={formattedDeltaAbsolute}
          trendDirection={trendDirection}
          badgeStyle={badgeStyle}
          badgeBackgroundColor={badgeBackgroundColor}
          badgeTextColor={badgeTextColor}
          showAbsoluteDelta={showAbsoluteDelta}
          isCompact={isVerticalCompact}
          isUltraCompact={isVerticalUltraCompact}
          hideAbsoluteDelta={hideBadgeAbsolute}
        />

        {(showComparisonValue || comparisonLabel) && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              color: '#64748b',
              fontSize: isVerticalUltraCompact
                ? '0.70rem'
                : isVerticalCompact
                ? '0.74rem'
                : '0.80rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
              minWidth: 0,
            }}
            title={
              comparisonLabel && showComparisonValue
                ? `${comparisonLabel}: ${prefixValue}${formattedComparison}${suffixValue}`
                : comparisonLabel ||
                  `${prefixValue}${formattedComparison}${suffixValue}`
            }
          >
            {comparisonLabel && (
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {comparisonLabel}:
              </span>
            )}
            {showComparisonValue && (
              <span
                style={{
                  fontWeight: 600,
                  color: '#334155',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {prefixValue}
                {formattedComparison}
                {suffixValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Sparkline Area */}
      {canRenderSparkline && (
        <div style={{ width: '100%', marginTop: 'auto', flexShrink: 0 }}>
          <KPISparkline
            data={sparklineData}
            color={sparklineColor}
            fill={sparklineFill}
            height={height < 160 ? 22 : 36}
          />
        </div>
      )}
    </div>
  );
};

export default KPIComparisonChart;
