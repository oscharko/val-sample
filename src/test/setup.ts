import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import i18n, { i18nReady } from '../i18n';

const createMockRect = (): DOMRect =>
  ({
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    top: 0,
    left: 0,
    right: 100,
    bottom: 40,
    toJSON: () => ({}),
  }) as DOMRect;

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value() {
    return createMockRect();
  },
});

Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
  configurable: true,
  value() {
    const rect = createMockRect();

    return {
      0: rect,
      length: 1,
      item: (index: number) => (index === 0 ? rect : null),
      [Symbol.iterator]: function* iterator() {
        yield rect;
      },
    } as DOMRectList;
  },
});

beforeEach(async () => {
  await i18nReady;
  await i18n.changeLanguage('de-DE');
  window.localStorage.removeItem('app.locale');

  const url = new URL(window.location.href);
  url.searchParams.delete('lang');
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
});
