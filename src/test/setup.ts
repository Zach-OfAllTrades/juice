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

// jsdom doesn't implement pointer capture either — Radix's Select opens its
// listbox from a pointerdown handler that calls `hasPointerCapture` on the
// trigger unconditionally.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// ...nor scrollIntoView — Radix's Select scrolls the highlighted item into
// view within its Viewport when the listbox opens.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
