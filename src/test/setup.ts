import '@testing-library/jest-dom';

// jsdom doesn't implement scroll APIs — TimePicker's scroll-snap columns
// call these to center the active row; stub them as no-ops in tests.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// jsdom doesn't implement ResizeObserver either — Radix's Tooltip (via
// @radix-ui/react-use-size, used internally to measure its Arrow) calls
// `new ResizeObserver(...)` unconditionally, unlike TimePicker/
// DateTimePicker's own usage above which guard with a `typeof` check.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
