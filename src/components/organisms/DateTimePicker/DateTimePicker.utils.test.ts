import { describe, expect, it } from 'vitest';
import {
  type DateTimeValue,
  formatDateTimeDisplay,
  getSegmentCharRange,
  isDateTimeOutOfBounds,
  serializeDateTimeValue,
  toAbsoluteMinutes,
  toJsDateTime,
} from './DateTimePicker.utils';

const base: DateTimeValue = { year: 2026, month: 3, day: 15, hour: 9, minute: 30, period: 'AM' };

describe('toAbsoluteMinutes', () => {
  it('orders values by date first, then time of day', () => {
    const earlierDay: DateTimeValue = { ...base, day: 14, hour: 11, minute: 59, period: 'PM' };
    const laterTimeSameDay: DateTimeValue = { ...base, hour: 11, minute: 59, period: 'PM' };
    expect(toAbsoluteMinutes(earlierDay, '12h')).toBeLessThan(toAbsoluteMinutes(base, '12h'));
    expect(toAbsoluteMinutes(base, '12h')).toBeLessThan(toAbsoluteMinutes(laterTimeSameDay, '12h'));
  });

  it('is stable across a DST transition boundary', () => {
    // US spring-forward 2026-03-08; must not produce a fractional/duplicate ordinal.
    const before: DateTimeValue = {
      year: 2026,
      month: 3,
      day: 7,
      hour: 12,
      minute: 0,
      period: 'PM',
    };
    const after: DateTimeValue = {
      year: 2026,
      month: 3,
      day: 9,
      hour: 12,
      minute: 0,
      period: 'PM',
    };
    expect(toAbsoluteMinutes(after, '12h') - toAbsoluteMinutes(before, '12h')).toBe(2 * 1440);
  });
});

describe('isDateTimeOutOfBounds', () => {
  const minDateTime: DateTimeValue = {
    year: 2026,
    month: 3,
    day: 15,
    hour: 9,
    minute: 0,
    period: 'AM',
  };
  const maxDateTime: DateTimeValue = {
    year: 2026,
    month: 3,
    day: 15,
    hour: 5,
    minute: 0,
    period: 'PM',
  };

  it('flags a time before minDateTime on the boundary day', () => {
    const candidate: DateTimeValue = { ...base, hour: 8, minute: 0, period: 'AM' };
    expect(isDateTimeOutOfBounds(candidate, '12h', minDateTime, maxDateTime)).toBe(true);
  });

  it('flags a time after maxDateTime on the boundary day', () => {
    const candidate: DateTimeValue = { ...base, hour: 6, minute: 0, period: 'PM' };
    expect(isDateTimeOutOfBounds(candidate, '12h', minDateTime, maxDateTime)).toBe(true);
  });

  it('allows a time within bounds on the boundary day', () => {
    expect(isDateTimeOutOfBounds(base, '12h', minDateTime, maxDateTime)).toBe(false);
  });

  it('allows any time on a day strictly between min and max', () => {
    const nextDay: DateTimeValue = { ...base, day: 16, hour: 2, minute: 0, period: 'AM' };
    const min: DateTimeValue = { year: 2026, month: 3, day: 15, hour: 9, minute: 0, period: 'AM' };
    const max: DateTimeValue = { year: 2026, month: 3, day: 17, hour: 5, minute: 0, period: 'PM' };
    expect(isDateTimeOutOfBounds(nextDay, '12h', min, max)).toBe(false);
  });
});

describe('formatDateTimeDisplay', () => {
  it('joins the date and time display with a space', () => {
    expect(formatDateTimeDisplay(3, 15, 2026, 9, 30, 'AM', '12h')).toBe('03/15/2026 9:30 AM');
    expect(formatDateTimeDisplay(3, 15, 2026, 14, 30, null, '24h')).toBe('03/15/2026 14:30');
  });
});

describe('serializeDateTimeValue', () => {
  it('produces ISO-ish YYYY-MM-DDTHH:MM in 24h time', () => {
    expect(serializeDateTimeValue(base, '12h')).toBe('2026-03-15T09:30');
    expect(serializeDateTimeValue(null, '12h')).toBe('');
  });
});

describe('getSegmentCharRange', () => {
  const display = '03/15/2026 9:30 AM';

  it('locates date segments within the date half', () => {
    expect(getSegmentCharRange('month', display)).toEqual([0, 2]);
    expect(getSegmentCharRange('day', display)).toEqual([3, 5]);
    expect(getSegmentCharRange('year', display)).toEqual([6, 10]);
  });

  it('locates time segments within the time half, offset past the space', () => {
    expect(getSegmentCharRange('hour', display)).toEqual([11, 12]);
    expect(getSegmentCharRange('minute', display)).toEqual([13, 15]);
    expect(getSegmentCharRange('period', display)).toEqual([16, 18]);
  });

  it('returns null for a malformed display value', () => {
    expect(getSegmentCharRange('month', '')).toBeNull();
  });
});

describe('toJsDateTime', () => {
  it('constructs a local Date combining the date and 24h-converted time', () => {
    const date = toJsDateTime(base, '12h');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(9);
    expect(date.getMinutes()).toBe(30);
  });
});
