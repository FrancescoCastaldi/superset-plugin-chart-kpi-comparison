export interface SparklinePoint {
  x: number;
  y: number;
  val: number;
}

export function calculateSparklinePoints(
  data: number[],
  height: number,
  paddingY = 4,
  graphWidth = 100,
): SparklinePoint[] {
  if (!data || data.length < 2) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const graphHeight = Math.max(10, height - paddingY * 2);

  return data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * graphWidth;
    const y = paddingY + graphHeight - ((val - min) / range) * graphHeight;
    return { x, y, val };
  });
}

export function calculateSparklinePath(
  points: SparklinePoint[],
  curve: 'smooth' | 'linear' = 'smooth',
): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  if (curve === 'smooth' && points.length > 2) {
    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return pathD;
  }

  // Linear
  return points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');
}
