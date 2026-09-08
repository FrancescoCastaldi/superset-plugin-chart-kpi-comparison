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
}) => {
  // Determine dynamic font size based on available card height and width
  const isCompact = height < 140 || width < 220;
  const primaryFontSize = isCompact ? '1.75rem' : height < 200 ? '2.4rem' : '2.9rem';

  const alignStyles: React.CSSProperties = {
    textAlign: cardAlignment,
    alignItems: cardAlignment === 'center' ? 'center' : cardAlignment === 'right' ? 'flex-end' : 'flex-start',
  };

  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        padding: isCompact ? '12px 14px' : '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Section: Title & Subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...alignStyles }}>
        {kpiTitle && (
          <div
            style={{
              fontSize: isCompact ? '0.82rem' : '0.92rem',
              fontWeight: 600,
              color: '#475569',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
            title={kpiTitle}
          >
            {kpiTitle}
          </div>
        )}
        {kpiSubtitle && (
          <div
            style={{
              fontSize: '0.78rem',
              color: '#94a3b8',
              marginTop: '2px',
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

      {/* Middle Section: Main Big Value */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: cardAlignment === 'center' ? 'center' : cardAlignment === 'right' ? 'flex-end' : 'flex-start',
          margin: isCompact ? '4px 0' : '8px 0',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {prefixValue && (
          <span
            style={{
              fontSize: isCompact ? '1.1rem' : '1.5rem',
              fontWeight: 600,
              color: '#64748b',
              marginRight: '3px',
              userSelect: 'none',
            }}
          >
            {prefixValue}
          </span>
        )}
        <span
          style={{
            fontSize: primaryFontSize,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            whiteSpace: 'nowrap',
          }}
        >
          {formattedPrimary}
        </span>
        {suffixValue && (
          <span
            style={{
              fontSize: isCompact ? '1.0rem' : '1.3rem',
              fontWeight: 600,
              color: '#64748b',
              marginLeft: '4px',
              userSelect: 'none',
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
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          justifyContent: cardAlignment === 'center' ? 'center' : cardAlignment === 'right' ? 'flex-end' : 'flex-start',
          fontSize: '0.85rem',
          lineHeight: 1.3,
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
        />

        {(showComparisonValue || comparisonLabel) && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#64748b',
              fontSize: '0.80rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {comparisonLabel && <span>{comparisonLabel}:</span>}
            {showComparisonValue && (
              <span style={{ fontWeight: 600, color: '#334155' }}>
                {prefixValue}
                {formattedComparison}
                {suffixValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional Sparkline Area */}
      {showSparkline && sparklineData && sparklineData.length > 1 && (
        <div style={{ width: '100%', marginTop: 'auto' }}>
          <KPISparkline
            data={sparklineData}
            color={sparklineColor}
            fill={sparklineFill}
            height={isCompact ? 28 : 42}
          />
        </div>
      )}
    </div>
  );
};

export default KPIComparisonChart;
