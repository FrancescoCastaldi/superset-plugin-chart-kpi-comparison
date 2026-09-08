import React, { useId } from 'react';

interface KPISparklineProps {
  data: number[];
  color?: string;
  fill?: boolean;
  height?: number;
  width?: number | string;
}

export const KPISparkline: React.FC<KPISparklineProps> = ({
  data,
  color = '#2563eb',
  fill = true,
  height = 40,
  width = '100%',
}) => {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const graphHeight = height - paddingY * 2;
  const graphWidth = 100; // viewBox relative coordinates

  // Generate SVG path coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * graphWidth;
    const y = paddingY + graphHeight - ((val - min) / range) * graphHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${graphWidth},${height} L 0,${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div style={{ width: width, height, marginTop: '8px', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${graphWidth} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {fill && <path d={areaD} fill={`url(#${gradientId})`} />}

        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="3"
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
};
