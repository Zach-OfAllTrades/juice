/**
 * Pure value/format/masking logic for TimePicker, kept separate from the
 * component tree so the (fiddly) digit-masking state machine and time-math
 * can be unit tested directly, without simulating real scroll/DOM behavior.
 */

export type {
  DigitComplete,
  DigitPartial,
  DigitRejected,
  DigitState,
} from '../../../utils/digitMask';
export { matchPeriodKey, nextDigitState } from '../../../utils/digitMask';

export type TimeFormat = '12h' | '24h';

export interface TimeValue {
  /** 1-12 in '12h' format, 0-23 in '24h' format */
  hour: number;
  /** 0-59 */
  minute: number;
  /** Present only in '12h' format */
  period?: 'AM' | 'PM';
}

export type TimeSegment = 'hour' | 'minute' | 'period';

/* ── Minutes-of-day conversion ──────────────────────────────── */

/** Converts a wall-clock TimeValue to minutes since midnight (0-1439). */
export function toMinutesOfDay(value: TimeValue, format: TimeFormat): number {
  if (format === '24h') {
    return value.hour * 60 + value.minute;
  }
  const period = value.period ?? 'AM';
  const hour24 = (value.hour % 12) + (period === 'PM' ? 12 : 0);
  return hour24 * 60 + value.minute;
}

/** Inverse of {@link toMinutesOfDay}. Wraps out-of-range input into 0-1439. */
export function fromMinutesOfDay(totalMinutes: number, format: TimeFormat): TimeValue {
  const clamped = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(clamped / 60);
  const minute = clamped % 60;

  if (format === '24h') {
    return { hour: hour24, minute };
  }

  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour: hour12, minute, period };
}

export function timeValueFromDate(date: Date, format: TimeFormat): TimeValue {
  return fromMinutesOfDay(date.getHours() * 60 + date.getMinutes(), format);
}

/* ── Column value lists ─────────────────────────────────────── */

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export function getHourValues(format: TimeFormat): number[] {
  return format === '12h' ? range(1, 12) : range(0, 23);
}

/** Clamps step to a sane 1-30 range so the minute column always has >= 2 rows. */
export function normalizeStep(step: number | undefined): number {
  if (!step || Number.isNaN(step)) return 1;
  return Math.max(1, Math.min(30, Math.floor(step)));
}

export function getMinuteValues(step: number | undefined): number[] {
  const normalized = normalizeStep(step);
  const values: number[] = [];
  for (let m = 0; m < 60; m += normalized) values.push(m);
  return values;
}

export function roundMinuteToStep(minute: number, step: number | undefined): number {
  const values = getMinuteValues(step);
  return values.reduce((closest, candidate) =>
    Math.abs(candidate - minute) < Math.abs(closest - minute) ? candidate : closest
  );
}

/* ── Display formatting ─────────────────────────────────────── */

export function formatHourDisplay(value: number | null, format: TimeFormat): string {
  if (value === null) return '--';
  return format === '12h' ? String(value) : String(value).padStart(2, '0');
}

export function formatMinuteDisplay(value: number | null): string {
  if (value === null) return '--';
  return String(value).padStart(2, '0');
}

export function formatTimeDisplay(
  hour: number | null,
  minute: number | null,
  period: 'AM' | 'PM' | null,
  format: TimeFormat
): string {
  const h = formatHourDisplay(hour, format);
  const m = formatMinuteDisplay(minute);
  return format === '24h' ? `${h}:${m}` : `${h}:${m} ${period ?? '--'}`;
}

/** 24h "HH:MM" — the machine-readable value for the hidden form input. */
export function serializeTimeValue(
  value: TimeValue | null | undefined,
  format: TimeFormat
): string {
  if (!value) return '';
  const minutes = toMinutesOfDay(value, format);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Character range of a segment within a formatted display string (e.g.
 * "9:30 AM" or "14:05"), used to visually indicate the active segment via
 * native text selection since a plain `<input>` can't style part of its
 * value while focused. Returns null when there's nothing to select (empty
 * value, or the period segment in 24h format).
 */
export function getSegmentCharRange(
  segment: TimeSegment,
  displayValue: string
): [number, number] | null {
  if (!displayValue) return null;
  const [timePart, periodPart] = displayValue.split(' ');
  const [hourStr, minuteStr] = timePart.split(':');
  if (hourStr === undefined || minuteStr === undefined) return null;

  if (segment === 'hour') return [0, hourStr.length];
  if (segment === 'minute') {
    const start = hourStr.length + 1;
    return [start, start + minuteStr.length];
  }
  if (periodPart === undefined) return null;
  const start = timePart.length + 1;
  return [start, start + periodPart.length];
}

/* ── Bounds ──────────────────────────────────────────────────── */

export function isTimeOutOfBounds(
  candidate: TimeValue,
  format: TimeFormat,
  minTime?: TimeValue,
  maxTime?: TimeValue
): boolean {
  const candidateMinutes = toMinutesOfDay(candidate, format);
  if (minTime && candidateMinutes < toMinutesOfDay(minTime, format)) return true;
  if (maxTime && candidateMinutes > toMinutesOfDay(maxTime, format)) return true;
  return false;
}
