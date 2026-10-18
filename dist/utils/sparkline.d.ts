export interface SparklinePoint {
    x: number;
    y: number;
    val: number;
}
export declare function calculateSparklinePoints(data: number[], height: number, paddingY?: number, graphWidth?: number): SparklinePoint[];
export declare function calculateSparklinePath(points: SparklinePoint[], curve?: 'smooth' | 'linear'): string;
//# sourceMappingURL=sparkline.d.ts.map