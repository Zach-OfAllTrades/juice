/**
 * Pure value/format/masking logic for DateTimePicker. Reuses DatePicker's
 * and TimePicker's own pure utils wherever possible (the combined display
 * string is just "<date> <time>" joined with a space, so segment-range and
 * formatting logic can delegate to each half rather than reimplementing it).
 */

import {
  type DateSegment,
  type DateValue,
  formatDateDisplay,
  getSegmentCharRange as getDateSegmentCharRange,
  serializeDateValue,
  toJsDate,
} from '../DatePicker/DatePicker.utils';
import {
  type TimeFormat,
  type TimeSegment,
  type TimeValue,
  formatTimeDisplay,
  getSegmentCharRange as getTimeSegmentCharRange,
  serializeTimeValue,
  toMinutesOfDay,
} from '../TimePicker/TimePicker.utils';

export interface DateTimeValue extends DateValue {
  /** 1-12 in '12h' format, 0-23 in '24h' format */
  hour: number;
  /** 0-59 */
  minute: number;
  /** Present only in '12h' format */
  period?: 'AM' | 'PM';
}

export type DateTimeSegment = DateSegment | TimeSegment;

export function toDateValue(value: DateTimeValue): DateValue {
  return { year: value.year, month: value.month, day: value.day };
}

export function toTimeValue(value: DateTimeValue): TimeValue {
  return { hour: value.hour, minute: value.minute, period: value.period };
}

/** Day-ordinal (days since the Unix epoch, UTC-based so it's DST-safe). */
function dateOrdinal(date: DateValue): number {
  return Date.UTC(date.year, date.month - 1, date.day) / 86_400_000;
}

/** Absolute minutes since the Unix epoch — a single monotonic scale for comparing full date+time values. */
export function toAbsoluteMinutes(value: DateTimeValue, format: TimeFormat): number {
  return dateOrdinal(toDateValue(value)) * 1440 + toMinutesOfDay(toTimeValue(value), format);
}

export function isDateTimeOutOfBounds(
  candidate: DateTimeValue,
  format: TimeFormat,
  minDateTime?: DateTimeValue,
  maxDateTime?: DateTimeValue
): boolean {
  const candidateMinutes = toAbsoluteMinutes(candidate, format);
  if (minDateTime && candidateMinutes < toAbsoluteMinutes(minDateTime, format)) return true;
  if (maxDateTime && candidateMinutes > toAbsoluteMinutes(maxDateTime, format)) return true;
  return false;
}

/** "MM/DD/YYYY hh:mm AM/PM" (or "MM/DD/YYYY HH:mm" in 24h format). */
export function formatDateTimeDisplay(
  month: number | null,
  day: number | null,
  year: number | null,
  hour: number | null,
  minute: number | null,
  period: 'AM' | 'PM' | null,
  format: TimeFormat
): string {
  return `${formatDateDisplay(month, day, year)} ${formatTimeDisplay(hour, minute, period, format)}`;
}

/** ISO-ish "YYYY-MM-DDTHH:MM" — the machine-readable value for the hidden form input. */
export function serializeDateTimeValue(
  value: DateTimeValue | null | undefined,
  format: TimeFormat
): string {
  if (!value) return '';
  return `${serializeDateValue(toDateValue(value))}T${serializeTimeValue(toTimeValue(value), format)}`;
}

/**
 * Character range of a segment within a combined "<date> <time>" display
 * string, delegating to DatePicker's/TimePicker's own range finders for
 * each half.
 */
export function getSegmentCharRange(
  segment: DateTimeSegment,
  displayValue: string
): [number, number] | null {
  const spaceIdx = displayValue.indexOf(' ');
  if (spaceIdx === -1) return null;
  const datePart = displayValue.slice(0, spaceIdx);
  const timePart = displayValue.slice(spaceIdx + 1);

  if (segment === 'month' || segment === 'day' || segment === 'year') {
    return getDateSegmentCharRange(segment, datePart);
  }

  const range = getTimeSegmentCharRange(segment, timePart);
  if (!range) return null;
  const offset = spaceIdx + 1;
  return [range[0] + offset, range[1] + offset];
}

export function toJsDateTime(value: DateTimeValue, format: TimeFormat): Date {
  const time = toTimeValue(value);
  const minutes = toMinutesOfDay(time, format);
  const date = toJsDate(toDateValue(value));
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}
