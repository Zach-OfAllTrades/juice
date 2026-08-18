/**
 * Pure value/format/masking/calendar-math logic for DatePicker, kept
 * separate from the component tree so it can be unit tested directly
 * without simulating real DOM/keyboard behavior. Mirrors the structure of
 * TimePicker.utils.ts.
 */

export interface DateValue {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

export type DateSegment = 'month' | 'day' | 'year';

/** Which grid the calendar popover is currently showing. */
export type CalendarView = 'days' | 'months' | 'years';

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_LABELS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Years shown per page in the years-navigation grid. */
const YEARS_PER_PAGE = 12;

/* ── Calendar math ───────────────────────────────────────────── */

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(month: number, year: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[(((month - 1) % 12) + 12) % 12];
}

export function getMonthValues(): number[] {
  return range(1, 12);
}

export function getDayValues(month: number, year: number): number[] {
  return range(1, daysInMonth(month, year));
}

/** Clamps a day into the valid range for the given month/year (e.g. Feb 30 -> Feb 28/29). */
export function clampDayToMonth(day: number, month: number, year: number): number {
  return Math.min(day, daysInMonth(month, year));
}

export function todayDateValue(): DateValue {
  return toDateValue(new Date());
}

export function toDateValue(date: Date): DateValue {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** Local midnight `Date` for the given value — never uses UTC, to avoid off-by-one-day bugs. */
export function toJsDate(value: DateValue): Date {
  return new Date(value.year, value.month - 1, value.day);
}

export function compareDateValues(a: DateValue, b: DateValue): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function isSameDate(a: DateValue | null, b: DateValue | null): boolean {
  if (!a || !b) return a === b;
  return compareDateValues(a, b) === 0;
}

/** Adds `delta` months to a month/year pair, wrapping the year as needed. */
export function addMonths(
  value: { month: number; year: number },
  delta: number
): { month: number; year: number } {
  const total = value.month - 1 + delta;
  const year = value.year + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return { month: month + 1, year };
}

export function addYears(
  value: { month: number; year: number },
  delta: number
): { month: number; year: number } {
  return { month: value.month, year: value.year + delta };
}

interface DayCell {
  date: DateValue;
  /** false for the leading/trailing days of adjacent months used to fill the grid. */
  inCurrentMonth: boolean;
}

/** Standard 6-week (42-cell) Sunday-start calendar grid for the given month. */
export function buildDayGrid(month: number, year: number): DayCell[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month - 1, 1 - startOffset);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i
    );
    cells.push({
      date: toDateValue(cellDate),
      inCurrentMonth: cellDate.getMonth() === month - 1 && cellDate.getFullYear() === year,
    });
  }
  return cells;
}

/** Start year of the 12-year page containing `year`. */
export function getYearPageStart(year: number): number {
  return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

export function buildYearGrid(year: number): number[] {
  const start = getYearPageStart(year);
  return range(start, start + YEARS_PER_PAGE - 1);
}

/* ── Display formatting ─────────────────────────────────────── */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** "MM/DD/YYYY", using "--" placeholders for not-yet-typed segments. */
export function formatDateDisplay(
  month: number | null,
  day: number | null,
  year: number | null
): string {
  const m = month === null ? '--' : pad2(month);
  const d = day === null ? '--' : pad2(day);
  const y = year === null ? '----' : String(year).padStart(4, '0');
  return `${m}/${d}/${y}`;
}

/** ISO "YYYY-MM-DD" — the machine-readable value for the hidden form input. */
export function serializeDateValue(value: DateValue | null | undefined): string {
  if (!value) return '';
  return `${String(value.year).padStart(4, '0')}-${pad2(value.month)}-${pad2(value.day)}`;
}

/**
 * Character range of a segment within a "MM/DD/YYYY" display string, used to
 * visually indicate the active segment via native text selection.
 */
export function getSegmentCharRange(
  segment: DateSegment,
  displayValue: string
): [number, number] | null {
  const parts = displayValue.split('/');
  if (parts.length !== 3) return null;
  const [monthStr, dayStr] = parts;

  if (segment === 'month') return [0, monthStr.length];
  if (segment === 'day') {
    const start = monthStr.length + 1;
    return [start, start + dayStr.length];
  }
  const start = monthStr.length + 1 + dayStr.length + 1;
  return [start, displayValue.length];
}

/* ── Bounds ──────────────────────────────────────────────────── */

export function isDateOutOfBounds(
  candidate: DateValue,
  minDate?: DateValue,
  maxDate?: DateValue
): boolean {
  if (minDate && compareDateValues(candidate, minDate) < 0) return true;
  if (maxDate && compareDateValues(candidate, maxDate) > 0) return true;
  return false;
}

/** Whole month is out of range (used to disable month-nav tiles). */
export function isMonthOutOfBounds(
  month: number,
  year: number,
  minDate?: DateValue,
  maxDate?: DateValue
): boolean {
  const first: DateValue = { year, month, day: 1 };
  const last: DateValue = { year, month, day: clampDayToMonth(31, month, year) };
  if (maxDate && compareDateValues(first, maxDate) > 0) return true;
  if (minDate && compareDateValues(last, minDate) < 0) return true;
  return false;
}

/** Whole year is out of range (used to disable year-nav tiles). */
export function isYearOutOfBounds(year: number, minDate?: DateValue, maxDate?: DateValue): boolean {
  const first: DateValue = { year, month: 1, day: 1 };
  const last: DateValue = { year, month: 12, day: 31 };
  if (maxDate && compareDateValues(first, maxDate) > 0) return true;
  if (minDate && compareDateValues(last, minDate) < 0) return true;
  return false;
}
