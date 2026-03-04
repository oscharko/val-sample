import '@testing-library/jest-dom/vitest';

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
