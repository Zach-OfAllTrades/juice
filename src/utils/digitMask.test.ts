import { describe, expect, it } from 'vitest';
import { matchPeriodKey, nextDigitState, nextFixedWidthDigitState } from './digitMask';

describe('nextDigitState', () => {
  const hour12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minuteStep15 = [0, 15, 30, 45];

  it('rejects non-digit keys', () => {
    expect(nextDigitState(hour12, '', 'a')).toEqual({ status: 'rejected' });
  });

  it('completes instantly for a standalone digit with no valid extension', () => {
    expect(nextDigitState(minuteStep15, '', '9')).toEqual({ status: 'rejected' });
  });

  it('stays partial for an ambiguous leading digit', () => {
    expect(nextDigitState(hour12, '', '1')).toEqual({
      status: 'partial',
      buffer: '1',
      tentativeValue: 1,
    });
  });

  it('completes a two-digit value that extends the buffer', () => {
    expect(nextDigitState(hour12, '1', '2')).toEqual({ status: 'complete', value: 12 });
  });

  it('falls back to the buffer value and reprocesses when the extension is invalid', () => {
    expect(nextDigitState(hour12, '1', '5')).toEqual({
      status: 'complete',
      value: 1,
      reprocessDigit: '5',
    });
  });
});

describe('nextFixedWidthDigitState', () => {
  it('rejects non-digit keys', () => {
    expect(nextFixedWidthDigitState('', 'x', 4)).toEqual({ status: 'rejected' });
  });

  it('stays partial until the buffer reaches the required width', () => {
    expect(nextFixedWidthDigitState('', '2', 4)).toEqual({
      status: 'partial',
      buffer: '2',
      tentativeValue: null,
    });
    expect(nextFixedWidthDigitState('202', '6', 4)).toEqual({ status: 'complete', value: 2026 });
  });

  it('starts a fresh buffer once the width is already full', () => {
    expect(nextFixedWidthDigitState('2026', '3', 4)).toEqual({
      status: 'partial',
      buffer: '3',
      tentativeValue: null,
    });
  });
});

describe('matchPeriodKey', () => {
  it('matches a/p case-insensitively', () => {
    expect(matchPeriodKey('a')).toBe('AM');
    expect(matchPeriodKey('P')).toBe('PM');
    expect(matchPeriodKey('x')).toBeNull();
  });
});
