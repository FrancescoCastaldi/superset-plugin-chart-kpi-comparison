import { calculateSparklinePoints, calculateSparklinePath } from '../src/utils/sparkline';

describe('Sparkline Cubic Bezier Math & Logic', () => {
  it('should calculate valid normalized points within viewBox', () => {
    const data = [10, 20, 30, 40];
    const points = calculateSparklinePoints(data, 40, 4, 100);
    expect(points).toHaveLength(4);
    expect(points[0].x).toBe(0);
    expect(points[3].x).toBe(100);
    // Min value has highest y (lowest visual point)
    expect(points[0].y).toBeGreaterThan(points[3].y);
  });

  it('should generate cubic bezier C commands when curve is smooth', () => {
    const data = [10, 25, 15, 30, 45, 20];
    const points = calculateSparklinePoints(data, 40);
    const path = calculateSparklinePath(points, 'smooth');
    expect(path).toContain('M ');
    expect(path).toContain(' C ');
  });

  it('should generate linear L commands when curve is linear', () => {
    const data = [10, 25, 15, 30, 45, 20];
    const points = calculateSparklinePoints(data, 40);
    const path = calculateSparklinePath(points, 'linear');
    expect(path).toContain('M ');
    expect(path).toContain(' L ');
    expect(path).not.toContain(' C ');
  });

  it('should handle edge cases with 0, 1 or identical data points', () => {
    expect(calculateSparklinePoints([], 40)).toEqual([]);
    expect(calculateSparklinePoints([10], 40)).toEqual([]);
    const identicalPoints = calculateSparklinePoints([50, 50, 50], 40);
    expect(identicalPoints).toHaveLength(3);
  });
});
