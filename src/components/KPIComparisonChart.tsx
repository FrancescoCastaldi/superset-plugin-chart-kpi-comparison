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
  // Sizing tiers for responsive scaling
  const isUltraCompact = height < 90 || width < 180;
  const isCompact = height < 135 || width < 230;

  // Title intelligence: if ultra compact, hide internal title to give 100% space to primary KPI & delta
  const showTitle = !isUltraCompact && Boolean(kpiTitle);
  const showSubtitle = height >= 120 && width >= 200 && Boolean(kpiSubtitle);

  // Dynamic padding scaled to card dimensions
  const padV = height < 75 ? 3 : height < 95 ? 5 : height < 135 ? 8 : height < 180 ? 12 : 18;
  const padH = width < 160 ? 6 : width < 200 ? 10 : width < 280 ? 14 : 20;

  // Fluid responsive font size calculation
  const charLength =
    (formattedPrimary ? formattedPrimary.length : 1) +
    (prefixValue ? prefixValue.length * 0.7 : 0) +
    (suffixValue ? suffixValue.length * 0.7 : 0);

  const availWidth = Math.max(40, width - padH * 2);
  const maxFontFromWidth = Math.floor(availWidth / (Math.max(1, charLength) * 0.58));

  const sparklineHeight =
    showSparkline && sparklineData && sparklineData.length > 1 && !isUltraCompact
      ? isCompact
        ? 22
        : 36
      : 0;
  const titleHeight = showTitle ? (showSubtitle ? 32 : 16) : 0;
  const bottomHeight = isUltraCompact ? 18 : isCompact ? 24 : 30;
  const availHeight = Math.max(
    16,
    height - padV * 2 - sparklineHeight - titleHeight - bottomHeight - (isCompact ? 4 : 10),
  );

  const maxFontFromHeight = Math.floor(availHeight * 0.95);
  const targetBaseFont =
    height >= 240 && width >= 340
      ? 46
      : height >= 190
      ? 38
      : height >= 135
      ? 28
      : height >= 95
      ? 22
      : 18;

  const primaryFontSizePx = Math.max(
    13,
    Math.min(targetBaseFont, maxFontFromHeight, maxFontFromWidth),
  );

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
        justifyContent: isUltraCompact ? 'center' : 'space-between',
        gap: isUltraCompact ? '3px' : '0px',
        backgroundColor: cardBgColor,
        borderRadius,
        boxShadow,
        border,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
      title={isUltraCompact && kpiTitle ? kpiTitle : undefined}
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
              fontSize: isCompact ? '0.74rem' : '0.90rem',
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
          margin: isUltraCompact ? '1px 0' : isCompact ? '2px 0' : '4px 0',
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
          flexWrap: isCompact ? 'nowrap' : 'wrap',
          alignItems: 'center',
          gap: isUltraCompact ? '4px' : '6px',
          width: '100%',
          justifyContent:
            cardAlignment === 'center'
              ? 'center'
              : cardAlignment === 'right'
              ? 'flex-end'
              : 'flex-start',
          fontSize: isUltraCompact ? '0.72rem' : isCompact ? '0.78rem' : '0.84rem',
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
          isCompact={isCompact}
          isUltraCompact={isUltraCompact}
        />

        {(showComparisonValue || comparisonLabel) && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              color: '#64748b',
              fontSize: isUltraCompact ? '0.70rem' : isCompact ? '0.75rem' : '0.80rem',
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
                : comparisonLabel || `${prefixValue}${formattedComparison}${suffixValue}`
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
      {showSparkline && sparklineData && sparklineData.length > 1 && !isUltraCompact && (
        <div style={{ width: '100%', marginTop: 'auto', flexShrink: 0 }}>
          <KPISparkline
            data={sparklineData}
            color={sparklineColor}
            fill={sparklineFill}
            height={isCompact ? 22 : 36}
          />
        </div>
      )}
    </div>
  );
};

export default KPIComparisonChart;
