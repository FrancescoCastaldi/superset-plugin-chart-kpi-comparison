import React from 'react';
import { BadgeStyle, TrendDirection } from '../types';

interface KPIComparisonBadgeProps {
  deltaPercentStr: string;
  deltaAbsoluteStr: string;
  trendDirection: TrendDirection;
  badgeStyle: BadgeStyle;
  badgeBackgroundColor: string;
  badgeTextColor: string;
  showAbsoluteDelta?: boolean;
}

export const KPIComparisonBadge: React.FC<KPIComparisonBadgeProps> = ({
  deltaPercentStr,
  deltaAbsoluteStr,
  trendDirection,
  badgeStyle,
  badgeBackgroundColor,
  badgeTextColor,
  showAbsoluteDelta = true,
}) => {
  const getArrowIcon = () => {
    switch (trendDirection) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '■';
    }
  };

  const isPill = badgeStyle === 'pill';
  const isFull = badgeStyle === 'full';

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: isPill ? '3px 9px' : isFull ? '4px 10px' : '2px 0px',
    borderRadius: isPill ? '9999px' : isFull ? '6px' : '0px',
    backgroundColor: badgeBackgroundColor,
    color: badgeTextColor,
    fontSize: '0.85rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
    boxShadow: isPill ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
    transition: 'all 0.2s ease-in-out',
    userSelect: 'none',
  };

  const arrowStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    lineHeight: 1,
    transform: trendDirection === 'up' ? 'translateY(-1px)' : trendDirection === 'down' ? 'translateY(1px)' : 'none',
  };

  return (
    <span style={containerStyle} title={`Delta: ${deltaAbsoluteStr}`}>
      <span style={arrowStyle}>{getArrowIcon()}</span>
      <span>{deltaPercentStr}</span>
      {showAbsoluteDelta && deltaAbsoluteStr && deltaAbsoluteStr !== '—' && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            opacity: 0.85,
            marginLeft: '2px',
          }}
        >
          ({deltaAbsoluteStr})
        </span>
      )}
    </span>
  );
};
