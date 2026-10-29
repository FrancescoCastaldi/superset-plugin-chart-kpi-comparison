/**
 * Puts the resolved KPI title (with the dynamic month) in the title bar of the dashboard chart, so
 * the card does not repeat it inside. The dashboard owns that bar and renders the chart name as plain
 * text, so the text of its title link is replaced and put back when the card goes away.
 */
const TITLE_SELECTOR = '[data-test="editable-title"]';
const ORIGINAL_ATTR = 'data-kpi-original-title';
const STYLE_ATTR = 'data-kpi-original-style';

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

// A long title stays on one line and ends in dots, so in a narrow card it never covers the value below.
const ONE_LINE = 'display:block;min-width:0;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;';

/** Writes `title` in the title bar; returns the function that restores the original text and style. */
export function syncChartHeaderTitle(root: HeaderRoot | null | undefined, title: string): () => void {
  const text = title.trim();
  const target = text ? findChartHeaderTitle(root) : null;
  if (!target) return () => undefined;
  if (target.getAttribute(ORIGINAL_ATTR) === null) {
    target.setAttribute(ORIGINAL_ATTR, target.textContent ?? '');
    target.setAttribute(STYLE_ATTR, target.getAttribute('style') ?? '');
  }
  if (target.textContent !== text) target.textContent = text;
  target.setAttribute('style', `${target.getAttribute(STYLE_ATTR)};${ONE_LINE}`);
  target.setAttribute('title', text);
  return () => {
    const original = target.getAttribute(ORIGINAL_ATTR);
    if (original === null) return;
    target.textContent = original;
    target.setAttribute('style', target.getAttribute(STYLE_ATTR) ?? '');
    target.removeAttribute(ORIGINAL_ATTR);
    target.removeAttribute(STYLE_ATTR);
    target.removeAttribute('title');
  };
}
