import { findChartHeaderTitle, syncChartHeaderTitle } from '../src/utils/chartHeaderTitle';

const makeNode = (text: string) => {
  const attrs: Record<string, string> = {};
  return {
    textContent: text,
    getAttribute: (name: string) => (name in attrs ? attrs[name] : null),
    setAttribute: (name: string, value: string) => {
      attrs[name] = value;
    },
    removeAttribute: (name: string) => {
      delete attrs[name];
    },
    querySelector: () => null,
  };
};

const makeDashboard = (withLink = true) => {
  const link = makeNode('Prenotazioni Totali');
  const holder = { ...makeNode(''), querySelector: (s: string) => (withLink && s === 'a' ? link : null) };
  const slice = { querySelector: (s: string) => (s === '[data-test="editable-title"]' ? holder : null), closest: () => null };
  const root = { closest: (s: string) => (s === '.chart-slice' ? slice : null), querySelector: () => null };
  return { root, link, holder };
};

describe('chart header title', () => {
  it('finds the title link in the title bar of the dashboard chart', () => {
    const { root, link } = makeDashboard();
    expect(findChartHeaderTitle(root)).toBe(link);
  });

  it('falls back to the title holder when it has no link, and to nothing outside a dashboard', () => {
    const { root, holder } = makeDashboard(false);
    expect(findChartHeaderTitle(root)).toBe(holder);
    expect(findChartHeaderTitle({ closest: () => null, querySelector: () => null })).toBeNull();
    expect(findChartHeaderTitle(null)).toBeNull();
  });

  it('writes the dynamic title and puts the original name back', () => {
    const { root, link } = makeDashboard();
    const restore = syncChartHeaderTitle(root, 'Prenotazioni Totali · Settembre 2026');
    expect(link.textContent).toBe('Prenotazioni Totali · Settembre 2026');
    const restoreAgain = syncChartHeaderTitle(root, 'Prenotazioni Totali · Ottobre 2026');
    expect(link.textContent).toBe('Prenotazioni Totali · Ottobre 2026');
    restoreAgain();
    expect(link.textContent).toBe('Prenotazioni Totali');
    restore();
    expect(link.textContent).toBe('Prenotazioni Totali');
  });

  it('keeps a long title on one line with the full text as tooltip, and removes both on restore', () => {
    const { root, link } = makeDashboard();
    const restore = syncChartHeaderTitle(root, 'Prenotazioni SSR · Ottobre 2026');
    expect(link.getAttribute('style')).toContain('text-overflow:ellipsis');
    expect(link.getAttribute('style')).toContain('white-space:nowrap');
    expect(link.getAttribute('title')).toBe('Prenotazioni SSR · Ottobre 2026');
    restore();
    expect(link.getAttribute('style')).toBe('');
    expect(link.getAttribute('title')).toBeNull();
  });

  it('does nothing for an empty title or outside a dashboard', () => {
    const { root, link } = makeDashboard();
    syncChartHeaderTitle(root, '   ')();
    expect(link.textContent).toBe('Prenotazioni Totali');
    expect(() => syncChartHeaderTitle(null, 'x')()).not.toThrow();
  });
});
