import { describe, expect, it } from 'vitest';
import {
  formatHourDisplay,
  formatMinuteDisplay,
  formatTimeDisplay,
  fromMinutesOfDay,
  getHourValues,
  getMinuteValues,
  isTimeOutOfBounds,
  matchPeriodKey,
  nextDigitState,
  normalizeStep,
  roundMinuteToStep,
  serializeTimeValue,
  timeValueFromDate,
  toMinutesOfDay,
} from './TimePicker.utils';

describe('toMinutesOfDay / fromMinutesOfDay', () => {
  it('converts 24h values directly', () => {
    expect(toMinutesOfDay({ hour: 14, minute: 30 }, '24h')).toBe(14 * 60 + 30);
    expect(fromMinutesOfDay(14 * 60 + 30, '24h')).toEqual({ hour: 14, minute: 30 });
  });

  it('handles 12h midnight and noon edge cases', () => {
    expect(toMinutesOfDay({ hour: 12, minute: 0, period: 'AM' }, '12h')).toBe(0);
    expect(toMinutesOfDay({ hour: 12, minute: 0, period: 'PM' }, '12h')).toBe(12 * 60);
    expect(fromMinutesOfDay(0, '12h')).toEqual({ hour: 12, minute: 0, period: 'AM' });
    expect(fromMinutesOfDay(12 * 60, '12h')).toEqual({ hour: 12, minute: 0, period: 'PM' });
  });

  it('round-trips 12h values', () => {
    const value = { hour: 9, minute: 45, period: 'PM' as const };
    expect(fromMinutesOfDay(toMinutesOfDay(value, '12h'), '12h')).toEqual(value);
  });

  it('wraps out-of-range minutes into a single day', () => {
    expect(fromMinutesOfDay(-30, '24h')).toEqual({ hour: 23, minute: 30 });
    expect(fromMinutesOfDay(1440 + 30, '24h')).toEqual({ hour: 0, minute: 30 });
  });

  it('derives a TimeValue from a Date', () => {
    const date = new Date(2026, 0, 1, 13, 5);
    expect(timeValueFromDate(date, '24h')).toEqual({ hour: 13, minute: 5 });
    expect(timeValueFromDate(date, '12h')).toEqual({ hour: 1, minute: 5, period: 'PM' });
  });
});

describe('getHourValues / getMinuteValues / normalizeStep', () => {
  it('lists 1-12 for 12h and 0-23 for 24h', () => {
    expect(getHourValues('12h')).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    expect(getHourValues('24h')).toEqual(Array.from({ length: 24 }, (_, i) => i));
  });

  it('steps the minute list and clamps step to 1-30', () => {
    expect(getMinuteValues(1)).toHaveLength(60);
    expect(getMinuteValues(15)).toEqual([0, 15, 30, 45]);
    expect(normalizeStep(0)).toBe(1);
    expect(normalizeStep(undefined)).toBe(1);
    expect(normalizeStep(45)).toBe(30);
    expect(normalizeStep(Number.NaN)).toBe(1);
  });

  it('rounds a minute to the nearest step value', () => {
    expect(roundMinuteToStep(7, 15)).toBe(0);
    expect(roundMinuteToStep(8, 15)).toBe(15);
    expect(roundMinuteToStep(59, 15)).toBe(45);
  });
});

describe('nextDigitState', () => {
  const hour12 = getHourValues('12h');
  const hour24 = getHourValues('24h');
  const minuteAll = getMinuteValues(1);
  const minuteStep15 = getMinuteValues(15);

  it('completes immediately on a non-extendable single digit', () => {
    expect(nextDigitState(hour12, '', '9')).toEqual({ status: 'complete', value: 9 });
    expect(nextDigitState(minuteAll, '', '9')).toEqual({ status: 'complete', value: 9 });
  });

  it('stays partial on an ambiguous single digit that could extend', () => {
    expect(nextDigitState(hour12, '', '1')).toEqual({
      status: 'partial',
      buffer: '1',
      tentativeValue: 1,
    });
  });

  it('stays partial (no tentative value) on a leading zero with no standalone meaning', () => {
    expect(nextDigitState(hour12, '', '0')).toEqual({
      status: 'partial',
      buffer: '0',
      tentativeValue: null,
    });
  });

  it('rejects a digit with no valid standalone or extension', () => {
    // Stepped minutes [0,15,30,45]: '9' isn't a value and nothing in 90-99 is either.
    expect(nextDigitState(minuteStep15, '', '9').status).toBe('rejected');
  });

  it('completes a tens-prefix two-digit hour', () => {
    const partial = nextDigitState(hour12, '', '1');
    expect(partial.status).toBe('partial');
    expect(nextDigitState(hour12, (partial as { buffer: string }).buffer, '0')).toEqual({
      status: 'complete',
      value: 10,
    });
  });

  it('completes a leading-zero minute', () => {
    const partial = nextDigitState(minuteAll, '', '0');
    expect(nextDigitState(minuteAll, (partial as { buffer: string }).buffer, '5')).toEqual({
      status: 'complete',
      value: 5,
    });
  });

  it('falls back to the buffered value and flags reprocessing when the second digit does not extend it', () => {
    const partial = nextDigitState(hour12, '', '1'); // buffer '1', tentative 1
    const result = nextDigitState(hour12, (partial as { buffer: string }).buffer, '5'); // 15 invalid
    expect(result).toEqual({ status: 'complete', value: 1, reprocessDigit: '5' });
  });

  it('ignores a second digit that extends to nothing and has no standalone fallback', () => {
    // 24h hour buffer '2' can extend to 20-23; typing '9' -> candidate 29 invalid,
    // and buffer '2' alone IS a standalone-valid 24h hour, so it should fall back.
    const partial = nextDigitState(hour24, '', '2');
    expect(partial).toEqual({ status: 'partial', buffer: '2', tentativeValue: 2 });
    expect(nextDigitState(hour24, '2', '9')).toEqual({
      status: 'complete',
      value: 2,
      reprocessDigit: '9',
    });
  });

  it('respects stepped minute lists', () => {
    expect(nextDigitState(minuteStep15, '', '4')).toEqual({
      status: 'partial',
      buffer: '4',
      tentativeValue: null,
    });
    expect(nextDigitState(minuteStep15, '4', '5')).toEqual({ status: 'complete', value: 45 });
  });

  it('rejects non-digit keys', () => {
    expect(nextDigitState(hour12, '', 'a').status).toBe('rejected');
  });
});

describe('matchPeriodKey', () => {
  it('matches a/p case-insensitively', () => {
    expect(matchPeriodKey('a')).toBe('AM');
    expect(matchPeriodKey('A')).toBe('AM');
    expect(matchPeriodKey('p')).toBe('PM');
    expect(matchPeriodKey('x')).toBeNull();
  });
});

describe('display formatting', () => {
  it('formats hours with/without leading zero per format', () => {
    expect(formatHourDisplay(9, '12h')).toBe('9');
    expect(formatHourDisplay(9, '24h')).toBe('09');
    expect(formatHourDisplay(null, '12h')).toBe('--');
  });

  it('formats minutes zero-padded', () => {
    expect(formatMinuteDisplay(5)).toBe('05');
    expect(formatMinuteDisplay(null)).toBe('--');
  });

  it('formats the full display string per format', () => {
    expect(formatTimeDisplay(9, 5, 'AM', '12h')).toBe('9:05 AM');
    expect(formatTimeDisplay(14, 5, null, '24h')).toBe('14:05');
    expect(formatTimeDisplay(null, null, null, '12h')).toBe('--:-- --');
  });
});

describe('serializeTimeValue', () => {
  it('serializes to 24h HH:MM regardless of display format', () => {
    expect(serializeTimeValue({ hour: 9, minute: 5, period: 'PM' }, '12h')).toBe('21:05');
    expect(serializeTimeValue({ hour: 9, minute: 5 }, '24h')).toBe('09:05');
  });

  it('serializes null/undefined to an empty string', () => {
    expect(serializeTimeValue(null, '12h')).toBe('');
    expect(serializeTimeValue(undefined, '12h')).toBe('');
  });
});

describe('isTimeOutOfBounds', () => {
  it('flags values outside min/max', () => {
    const minTime = { hour: 9, minute: 0 };
    const maxTime = { hour: 17, minute: 0 };
    expect(isTimeOutOfBounds({ hour: 8, minute: 59 }, '24h', minTime, maxTime)).toBe(true);
    expect(isTimeOutOfBounds({ hour: 17, minute: 1 }, '24h', minTime, maxTime)).toBe(true);
    expect(isTimeOutOfBounds({ hour: 12, minute: 0 }, '24h', minTime, maxTime)).toBe(false);
  });

  it('is unbounded when min/max are omitted', () => {
    expect(isTimeOutOfBounds({ hour: 0, minute: 0 }, '24h')).toBe(false);
  });
});
