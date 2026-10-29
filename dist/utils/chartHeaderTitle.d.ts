interface HeaderRoot {
    closest(selector: string): HeaderRoot | null;
    querySelector(selector: string): any;
}
/** The element that holds the chart name in the title bar around `root`, or null outside a dashboard. */
export declare function findChartHeaderTitle(root: HeaderRoot | null | undefined): any;
/** Writes `title` in the title bar; returns the function that restores the original text and style. */
export declare function syncChartHeaderTitle(root: HeaderRoot | null | undefined, title: string): () => void;
export {};
//# sourceMappingURL=chartHeaderTitle.d.ts.map