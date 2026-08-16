import '@testing-library/jest-dom';

// jsdom doesn't implement scroll APIs — TimePicker's scroll-snap columns
// call these to center the active row; stub them as no-ops in tests.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
