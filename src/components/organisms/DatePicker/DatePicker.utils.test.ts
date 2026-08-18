import { describe, expect, it } from 'vitest';
import {
  addMonths,
  addYears,
  buildDayGrid,
  buildYearGrid,
  clampDayToMonth,
  compareDateValues,
  daysInMonth,
  formatDateDisplay,
  getDayValues,
  getMonthValues,
  getSegmentCharRange,
  getYearPageStart,
  isDateOutOfBounds,
  isLeapYear,
  isSameDate,
  serializeDateValue,
  toDateValue,
  toJsDate,
} from './DatePicker.utils';

describe('isLeapYear', () => {
  it('handles the standard/century/400-year rules', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe('daysInMonth', () => {
  it('returns correct lengths, including Feb in leap vs non-leap years', () => {
    expect(daysInMonth(1, 2026)).toBe(31);
    expect(daysInMonth(4, 2026)).toBe(30);
    expect(daysInMonth(2, 2024)).toBe(29);
    expect(daysInMonth(2, 2026)).toBe(28);
  });
});

describe('getMonthValues / getDayValues', () => {
  it('enumerates 1-12 for months', () => {
    expect(getMonthValues()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('enumerates 1-daysInMonth for days, varying by month/year', () => {
    expect(getDayValues(2, 2026)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(getDayValues(2, 2024)).toHaveLength(29);
  });
});

describe('clampDayToMonth', () => {
  it('clamps an out-of-range day down to the month max', () => {
    expect(clampDayToMonth(31, 4, 2026)).toBe(30);
    expect(clampDayToMonth(15, 4, 2026)).toBe(15);
  });
});

describe('toDateValue / toJsDate', () => {
  it('round-trips through local Date construction without UTC drift', () => {
    const value = { year: 2026, month: 3, day: 5 };
    expect(toDateValue(toJsDate(value))).toEqual(value);
  });
});

describe('compareDateValues / isSameDate', () => {
  it('orders by year, then month, then day', () => {
    expect(
      compareDateValues({ year: 2026, month: 1, day: 1 }, { year: 2027, month: 1, day: 1 })
    ).toBeLessThan(0);
    expect(
      compareDateValues({ year: 2026, month: 2, day: 1 }, { year: 2026, month: 1, day: 1 })
    ).toBeGreaterThan(0);
    expect(
      compareDateValues({ year: 2026, month: 1, day: 5 }, { year: 2026, month: 1, day: 5 })
    ).toBe(0);
  });

  it('treats null as equal only to null', () => {
    expect(isSameDate(null, null)).toBe(true);
    expect(isSameDate(null, { year: 2026, month: 1, day: 1 })).toBe(false);
  });
});

describe('addMonths', () => {
  it('wraps forward across a year boundary', () => {
    expect(addMonths({ month: 11, year: 2026 }, 2)).toEqual({ month: 1, year: 2027 });
  });

  it('wraps backward across a year boundary', () => {
    expect(addMonths({ month: 1, year: 2026 }, -2)).toEqual({ month: 11, year: 2025 });
  });
});

describe('addYears', () => {
  it('shifts the year and keeps the month', () => {
    expect(addYears({ month: 6, year: 2026 }, 3)).toEqual({ month: 6, year: 2029 });
  });
});

describe('buildDayGrid', () => {
  it('produces 42 cells starting on a Sunday and flags out-of-month padding', () => {
    const grid = buildDayGrid(2, 2026); // Feb 2026 starts on a Sunday
    expect(grid).toHaveLength(42);
    expect(grid[0].date).toEqual({ year: 2026, month: 2, day: 1 });
    expect(grid[0].inCurrentMonth).toBe(true);
    const lastInMonth = grid.filter((c) => c.inCurrentMonth);
    expect(lastInMonth).toHaveLength(28);
  });

  it('includes leading padding days from the prior month when the 1st is not a Sunday', () => {
    const grid = buildDayGrid(1, 2026); // Jan 1 2026 is a Thursday
    expect(grid[0].inCurrentMonth).toBe(false);
    expect(grid[0].date.month).toBe(12);
    expect(grid[0].date.year).toBe(2025);
  });
});

describe('getYearPageStart / buildYearGrid', () => {
  it('aligns to a 12-year page and returns 12 consecutive years', () => {
    const start = getYearPageStart(2026);
    expect(2026 - start).toBeLessThan(12);
    expect(buildYearGrid(2026)).toEqual(Array.from({ length: 12 }, (_, i) => start + i));
  });
});

describe('formatDateDisplay', () => {
  it('zero-pads month/day and shows placeholders for missing segments', () => {
    expect(formatDateDisplay(1, 5, 2026)).toBe('01/05/2026');
    expect(formatDateDisplay(null, null, null)).toBe('--/--/----');
    expect(formatDateDisplay(3, null, 2026)).toBe('03/--/2026');
  });
});

describe('serializeDateValue', () => {
  it('produces ISO YYYY-MM-DD', () => {
    expect(serializeDateValue({ year: 2026, month: 3, day: 5 })).toBe('2026-03-05');
    expect(serializeDateValue(null)).toBe('');
  });
});

describe('getSegmentCharRange', () => {
  const display = '03/05/2026';
  it('locates month, day, and year ranges', () => {
    expect(getSegmentCharRange('month', display)).toEqual([0, 2]);
    expect(getSegmentCharRange('day', display)).toEqual([3, 5]);
    expect(getSegmentCharRange('year', display)).toEqual([6, 10]);
  });

  it('returns null for a malformed display value', () => {
    expect(getSegmentCharRange('month', '')).toBeNull();
  });
});

describe('isDateOutOfBounds', () => {
  const minDate = { year: 2026, month: 1, day: 10 };
  const maxDate = { year: 2026, month: 1, day: 20 };

  it('flags dates before minDate or after maxDate', () => {
    expect(isDateOutOfBounds({ year: 2026, month: 1, day: 5 }, minDate, maxDate)).toBe(true);
    expect(isDateOutOfBounds({ year: 2026, month: 1, day: 25 }, minDate, maxDate)).toBe(true);
    expect(isDateOutOfBounds({ year: 2026, month: 1, day: 15 }, minDate, maxDate)).toBe(false);
  });
});
