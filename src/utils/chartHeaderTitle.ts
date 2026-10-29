/**
 * Puts the resolved KPI title (with the dynamic month) in the title bar of the dashboard chart, so
 * the card does not repeat it inside. The dashboard owns that bar and renders the chart name as plain
 * text, so the text of its title link is replaced and put back when the card goes away.
 */
const TITLE_SELECTOR = '[data-test="editable-title"]';
const ORIGINAL_ATTR = 'data-kpi-original-title';

interface HeaderRoot {
  closest(selector: string): HeaderRoot | null;
  querySelector(selector: string): any;
}

/** The element that holds the chart name in the title bar around `root`, or null outside a dashboard. */
export function findChartHeaderTitle(root: HeaderRoot | null | undefined): any {
  const slice = root?.closest?.('.chart-slice');
  const holder = slice?.querySelector(TITLE_SELECTOR);
  if (!holder) return null;
  return holder.querySelector('a') ?? holder;
}

/** Writes `title` in the title bar; returns the function that restores the original text. */
export function syncChartHeaderTitle(root: HeaderRoot | null | undefined, title: string): () => void {
  const text = title.trim();
  const target = text ? findChartHeaderTitle(root) : null;
  if (!target) return () => undefined;
  if (target.getAttribute(ORIGINAL_ATTR) === null) {
    target.setAttribute(ORIGINAL_ATTR, target.textContent ?? '');
  }
  if (target.textContent !== text) target.textContent = text;
  return () => {
    const original = target.getAttribute(ORIGINAL_ATTR);
    if (original === null) return;
    target.textContent = original;
    target.removeAttribute(ORIGINAL_ATTR);
  };
}
