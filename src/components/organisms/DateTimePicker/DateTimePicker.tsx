import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  type DigitState,
  matchPeriodKey,
  nextDigitState,
  nextFixedWidthDigitState,
} from '../../../utils/digitMask';
import { Button } from '../../atoms/Button';
import { ButtonGroup } from '../../molecules/ButtonGroup';
import {
  type CalendarView,
  DatePickerCalendarPanel,
  DatePickerContext,
  type DatePickerContextValue,
  type DateValue,
} from '../DatePicker/DatePicker';
import {
  clampDayToMonth,
  getDayValues,
  getMonthValues,
  isDateOutOfBounds,
  isMonthOutOfBounds,
  isYearOutOfBounds,
  todayDateValue,
} from '../DatePicker/DatePicker.utils';
import {
  TimePickerColumnsPanel,
  TimePickerContext,
  type TimePickerContextValue,
} from '../TimePicker/TimePicker';
import {
  type TimeFormat,
  type TimeSegment,
  fromMinutesOfDay,
  getHourValues,
  getMinuteValues,
  roundMinuteToStep,
} from '../TimePicker/TimePicker.utils';
import './DateTimePicker.css';
import {
  type DateTimeSegment,
  type DateTimeValue,
  formatDateTimeDisplay,
  getSegmentCharRange,
  isDateTimeOutOfBounds,
  serializeDateTimeValue,
  toDateValue,
} from './DateTimePicker.utils';

export type { DateTimeSegment, DateTimeValue } from './DateTimePicker.utils';

const YEAR_DIGIT_WIDTH = 4;

function getDefaultCurrentDateTime(format: TimeFormat, step: number): DateTimeValue {
  const now = new Date();
  const rounded = roundMinuteToStep(now.getMinutes(), step);
  const time = fromMinutesOfDay(now.getHours() * 60 + rounded, format);
  return { ...todayDateValue(), ...time };
}

/** Neutral baseline (today, midnight) — see TimePicker's identical `getEmptyBaseTime` for the rationale. */
function getEmptyBaseDateTime(format: TimeFormat): DateTimeValue {
  return { ...todayDateValue(), ...fromMinutesOfDay(0, format) };
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusNextTabbable(current: HTMLElement) {
  const focusable = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const idx = focusable.indexOf(current);
  const next = idx >= 0 ? focusable[idx + 1] : undefined;
  if (next) next.focus();
  else current.blur();
}

/* ── Context ─────────────────────────────────────────────────── */

export interface DateTimePickerContextValue {
  format: TimeFormat;
  step: number;
  month: number | null;
  day: number | null;
  year: number | null;
  hour: number | null;
  minute: number | null;
  period: 'AM' | 'PM' | null;
  monthValues: number[];
  dayValues: number[];
  hourValues: number[];
  minuteValues: number[];
  segments: DateTimeSegment[];
  activeSegment: DateTimeSegment;
  setActiveSegment: (segment: DateTimeSegment) => void;
  digitBuffer: string;
  setDigitBuffer: (buffer: string) => void;
  commitSegment: (segment: DateTimeSegment, value: number | 'AM' | 'PM') => void;
  isRowDisabled: (segment: DateTimeSegment, value: number | 'AM' | 'PM') => boolean;
  isCellDisabled: (date: DateValue) => boolean;
  selectDate: (date: DateValue) => void;
  selectedDate: DateValue | null;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  cursor: { month: number; year: number };
  setCursor: (cursor: { month: number; year: number }) => void;
  clear: () => void;
  requestOpen: () => void;
  requestClose: () => void;
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  baseId: string;
  contentId: string;
}

const DateTimePickerContext = createContext<DateTimePickerContextValue | null>(null);

function useDateTimePickerContext(componentName: string): DateTimePickerContextValue {
  const ctx = useContext(DateTimePickerContext);
  if (!ctx) {
    throw new Error(
      `<DateTimePicker.${componentName} /> must be rendered inside <DateTimePicker.Root>.`
    );
  }
  return ctx;
}

/* ── Root ────────────────────────────────────────────────────── */

export interface DateTimePickerRootProps {
  /** Controlled value. Pass `null` for an explicitly empty field. */
  value?: DateTimeValue | null;
  /** Uncontrolled initial value. Omitted defaults to now; explicit `null` starts empty. */
  defaultValue?: DateTimeValue | null;
  onChange?: (value: DateTimeValue | null) => void;
  /** @default '12h' */
  format?: TimeFormat;
  /** Minute increment for the minute column. @default 1 */
  step?: number;
  minDateTime?: DateTimeValue;
  maxDateTime?: DateTimeValue;
  /** Arbitrary disabled dates/times, evaluated per candidate day or time-of-day row. */
  isDateTimeDisabled?: (value: DateTimeValue) => boolean;
  /** Native form field name — renders a hidden input for plain `<form>`/`Form` submission. */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  children: ReactNode;
}

export function DateTimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '12h',
  step = 1,
  minDateTime,
  maxDateTime,
  isDateTimeDisabled,
  name,
  disabled = false,
  readOnly = false,
  children,
}: DateTimePickerRootProps) {
  const baseId = useId();
  const contentId = `${baseId}-content`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateTimeValue | null>(() =>
    defaultValue !== undefined ? defaultValue : getDefaultCurrentDateTime(format, step)
  );

  const current = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<DateTimeSegment>('month');
  const [digitBuffer, setDigitBuffer] = useState('');
  const [view, setView] = useState<CalendarView>('days');
  const [cursor, setCursor] = useState<{ month: number; year: number }>(() => {
    const base = current ?? todayDateValue();
    return { month: base.month, year: base.year };
  });

  // See TimePicker's identical `currentRef` for the reasoning.
  const currentRef = useRef(current);
  currentRef.current = current;

  const emptyBaseRef = useRef<DateTimeValue>(getEmptyBaseDateTime(format));

  const segments: DateTimeSegment[] =
    format === '12h'
      ? ['month', 'day', 'year', 'hour', 'minute', 'period']
      : ['month', 'day', 'year', 'hour', 'minute'];

  const effectiveBase = current ?? emptyBaseRef.current;
  const monthValues = getMonthValues();
  const dayValues = getDayValues(effectiveBase.month, effectiveBase.year);
  const hourValues = getHourValues(format);
  const minuteValues = getMinuteValues(step);

  const minDateOnly = minDateTime ? toDateValue(minDateTime) : undefined;
  const maxDateOnly = maxDateTime ? toDateValue(maxDateTime) : undefined;

  const updateValue = useCallback(
    (next: DateTimeValue | null) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const commitSegment = useCallback(
    (segment: DateTimeSegment, newValue: number | 'AM' | 'PM') => {
      const base = currentRef.current ?? emptyBaseRef.current;
      const updated: DateTimeValue = { ...base };
      if (segment === 'month') {
        updated.month = newValue as number;
        updated.day = clampDayToMonth(updated.day, updated.month, updated.year);
      } else if (segment === 'day') {
        updated.day = newValue as number;
      } else if (segment === 'year') {
        updated.year = newValue as number;
        updated.day = clampDayToMonth(updated.day, updated.month, updated.year);
      } else if (segment === 'hour') {
        updated.hour = newValue as number;
      } else if (segment === 'minute') {
        updated.minute = newValue as number;
      } else {
        updated.period = newValue as 'AM' | 'PM';
      }
      currentRef.current = updated;
      updateValue(updated);
      setCursor({ month: updated.month, year: updated.year });
    },
    [updateValue]
  );

  const isRowDisabled = useCallback(
    (segment: DateTimeSegment, candidateValue: number | 'AM' | 'PM') => {
      const base = currentRef.current ?? emptyBaseRef.current;

      if (segment === 'month') {
        return isMonthOutOfBounds(candidateValue as number, base.year, minDateOnly, maxDateOnly);
      }
      if (segment === 'year') {
        return isYearOutOfBounds(candidateValue as number, minDateOnly, maxDateOnly);
      }
      if (segment === 'day') {
        const candidateDate: DateValue = {
          year: base.year,
          month: base.month,
          day: candidateValue as number,
        };
        return (
          isDateOutOfBounds(candidateDate, minDateOnly, maxDateOnly) ||
          Boolean(isDateTimeDisabled?.({ ...base, day: candidateValue as number }))
        );
      }

      const candidate: DateTimeValue = { ...base };
      if (segment === 'hour') candidate.hour = candidateValue as number;
      if (segment === 'minute') candidate.minute = candidateValue as number;
      if (segment === 'period') candidate.period = candidateValue as 'AM' | 'PM';
      return (
        isDateTimeOutOfBounds(candidate, format, minDateTime, maxDateTime) ||
        Boolean(isDateTimeDisabled?.(candidate))
      );
    },
    [format, minDateTime, maxDateTime, minDateOnly, maxDateOnly, isDateTimeDisabled]
  );

  const isCellDisabled = useCallback(
    (date: DateValue) => {
      if (isDateOutOfBounds(date, minDateOnly, maxDateOnly)) return true;
      const base = currentRef.current ?? emptyBaseRef.current;
      return Boolean(isDateTimeDisabled?.({ ...base, ...date }));
    },
    [minDateOnly, maxDateOnly, isDateTimeDisabled]
  );

  const selectDate = useCallback(
    (date: DateValue) => {
      const base = currentRef.current ?? emptyBaseRef.current;
      const updated: DateTimeValue = { ...base, ...date };
      currentRef.current = updated;
      updateValue(updated);
      setCursor({ month: date.month, year: date.year });
      setActiveSegment('day');
      setDigitBuffer('');
    },
    [updateValue]
  );

  const clear = useCallback(() => {
    currentRef.current = null;
    updateValue(null);
    setDigitBuffer('');
    setOpen(false);
  }, [updateValue]);

  const requestOpen = useCallback(() => {
    if (disabled || readOnly) return;
    if (!open) {
      const base = currentRef.current ?? todayDateValue();
      emptyBaseRef.current = getEmptyBaseDateTime(format);
      setActiveSegment('month');
      setDigitBuffer('');
      setView('days');
      setCursor({ month: base.month, year: base.year });
    }
    setOpen(true);
  }, [disabled, readOnly, open, format]);

  const requestClose = useCallback(() => {
    setDigitBuffer('');
    setOpen(false);
  }, []);

  const contextValue: DateTimePickerContextValue = {
    format,
    step,
    month: current?.month ?? null,
    day: current?.day ?? null,
    year: current?.year ?? null,
    hour: current?.hour ?? null,
    minute: current?.minute ?? null,
    period: current?.period ?? null,
    monthValues,
    dayValues,
    hourValues,
    minuteValues,
    segments,
    activeSegment,
    setActiveSegment,
    digitBuffer,
    setDigitBuffer,
    commitSegment,
    isRowDisabled,
    isCellDisabled,
    selectDate,
    selectedDate: current ? toDateValue(current) : null,
    view,
    setView,
    cursor,
    setCursor,
    clear,
    requestOpen,
    requestClose,
    open,
    disabled,
    readOnly,
    baseId,
    contentId,
  };

  return (
    <DateTimePickerContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
        modal={false}
      >
        {children}
      </PopoverPrimitive.Root>
      {name && <input type="hidden" name={name} value={serializeDateTimeValue(current, format)} />}
    </DateTimePickerContext.Provider>
  );
}

/* ── Trigger ─────────────────────────────────────────────────── */

export interface DateTimePickerTriggerProps {
  className?: string;
  /** Visual error state, matching `Input`'s error styling. */
  error?: boolean;
  placeholder?: string;
}

export const DateTimePickerTrigger = forwardRef<HTMLInputElement, DateTimePickerTriggerProps>(
  ({ className = '', error = false, placeholder }, forwardedRef) => {
    const ctx = useDateTimePickerContext('Trigger');
    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const setRefs = useCallback(
      (el: HTMLInputElement | null) => {
        internalInputRef.current = el;
        if (typeof forwardedRef === 'function') forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      },
      [forwardedRef]
    );
    const {
      format,
      month,
      day,
      year,
      hour,
      minute,
      period,
      monthValues,
      dayValues,
      hourValues,
      minuteValues,
      segments,
      activeSegment,
      setActiveSegment,
      digitBuffer,
      setDigitBuffer,
      commitSegment,
      isRowDisabled,
      requestOpen,
      requestClose,
      open,
      disabled,
      readOnly,
      baseId,
      contentId,
    } = ctx;

    const hasValue = month !== null;
    const displayValue = hasValue
      ? formatDateTimeDisplay(month, day, year, hour, minute, period, format)
      : '';
    const defaultPlaceholder = format === '12h' ? 'mm/dd/yyyy hh:mm AM/PM' : 'mm/dd/yyyy HH:mm';

    useEffect(() => {
      if (!open) return;
      const input = internalInputRef.current;
      if (!input) return;
      const range = getSegmentCharRange(activeSegment, displayValue);
      if (!range) return;
      input.setSelectionRange(range[0], range[1]);
    }, [open, activeSegment, displayValue]);

    function segmentValues(segment: DateTimeSegment): (number | 'AM' | 'PM')[] {
      if (segment === 'month') return monthValues;
      if (segment === 'day') return dayValues;
      if (segment === 'year') return [];
      if (segment === 'hour') return hourValues;
      if (segment === 'minute') return minuteValues;
      return ['AM', 'PM'];
    }

    function activeValueFor(segment: DateTimeSegment): number | 'AM' | 'PM' | null {
      if (segment === 'month') return month;
      if (segment === 'day') return day;
      if (segment === 'year') return year;
      if (segment === 'hour') return hour;
      if (segment === 'minute') return minute;
      return period;
    }

    function moveActive(segment: DateTimeSegment, delta: number) {
      if (segment === 'year') {
        const currentValue = year ?? new Date().getFullYear();
        const nextValue = currentValue + delta;
        if (isRowDisabled('year', nextValue)) return;
        commitSegment('year', nextValue);
        setActiveSegment('year');
        setDigitBuffer('');
        return;
      }

      const values = segmentValues(segment);
      const currentValue = activeValueFor(segment);
      let idx = currentValue !== null ? values.indexOf(currentValue) : -1;
      if (idx === -1) idx = delta > 0 ? -1 : values.length;
      let nextIdx = idx + delta;
      while (
        nextIdx >= 0 &&
        nextIdx < values.length &&
        isRowDisabled(segment, values[nextIdx] as number | 'AM' | 'PM')
      ) {
        nextIdx += delta;
      }
      if (nextIdx < 0 || nextIdx >= values.length) return;
      commitSegment(segment, values[nextIdx] as number | 'AM' | 'PM');
      setActiveSegment(segment);
      setDigitBuffer('');
    }

    function moveActiveToEdge(segment: DateTimeSegment, edge: 'first' | 'last') {
      if (segment === 'year') return;
      const values = segmentValues(segment);
      const ordered = edge === 'first' ? values : [...values].reverse();
      const target = ordered.find((v) => !isRowDisabled(segment, v));
      if (target !== undefined) {
        commitSegment(segment, target);
        setActiveSegment(segment);
        setDigitBuffer('');
      }
    }

    function moveSegment(delta: number) {
      setDigitBuffer('');
      const idx = segments.indexOf(activeSegment);
      const nextIdx = Math.min(Math.max(idx + delta, 0), segments.length - 1);
      setActiveSegment(segments[nextIdx]);
    }

    function closeAndAdvanceFocus(inputEl: HTMLInputElement) {
      setDigitBuffer('');
      requestClose();
      focusNextTabbable(inputEl);
    }

    function handleDigitKey(inputEl: HTMLInputElement, firstDigit: string) {
      let segIndex = segments.indexOf(activeSegment);
      let buffer = digitBuffer;
      let pendingDigit: string | undefined = firstDigit;
      let finalSegment: DateTimeSegment = activeSegment;
      let finalBuffer = '';

      while (pendingDigit !== undefined && segIndex < segments.length) {
        const segment = segments[segIndex];
        finalSegment = segment;
        if (segment === 'period') break; // digits don't apply to the period segment

        const state: DigitState =
          segment === 'year'
            ? nextFixedWidthDigitState(buffer, pendingDigit, YEAR_DIGIT_WIDTH)
            : nextDigitState(segmentValues(segment) as number[], buffer, pendingDigit);

        if (state.status === 'rejected') {
          pendingDigit = undefined;
          finalBuffer = buffer;
          break;
        }
        if (state.status === 'partial') {
          if (state.tentativeValue !== null) commitSegment(segment, state.tentativeValue);
          finalBuffer = state.buffer;
          pendingDigit = undefined;
          break;
        }

        commitSegment(segment, state.value);
        buffer = '';
        finalBuffer = '';
        pendingDigit = state.reprocessDigit;
        segIndex += 1;
        finalSegment = segments[Math.min(segIndex, segments.length - 1)];

        if (pendingDigit === undefined && segIndex >= segments.length) {
          closeAndAdvanceFocus(inputEl);
          return;
        }
      }

      setActiveSegment(finalSegment);
      setDigitBuffer(finalBuffer);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (disabled || readOnly) return;
      const inputEl = e.currentTarget;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveActive(activeSegment, 1);
          return;
        case 'ArrowUp':
          e.preventDefault();
          moveActive(activeSegment, -1);
          return;
        case 'ArrowRight':
          e.preventDefault();
          moveSegment(1);
          return;
        case 'ArrowLeft':
          e.preventDefault();
          moveSegment(-1);
          return;
        case 'Home':
          e.preventDefault();
          moveActiveToEdge(activeSegment, 'first');
          return;
        case 'End':
          e.preventDefault();
          moveActiveToEdge(activeSegment, 'last');
          return;
        case 'Escape':
          e.preventDefault();
          setDigitBuffer('');
          requestClose();
          return;
        case 'Enter':
          e.preventDefault();
          closeAndAdvanceFocus(inputEl);
          return;
        default:
          break;
      }

      if (activeSegment === 'period') {
        const matched = matchPeriodKey(e.key);
        if (matched) {
          e.preventDefault();
          commitSegment('period', matched);
          closeAndAdvanceFocus(inputEl);
        }
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitKey(inputEl, e.key);
      }
    }

    return (
      <PopoverPrimitive.Anchor asChild>
        <input
          ref={setRefs}
          type="text"
          inputMode="numeric"
          role="combobox"
          aria-haspopup="dialog"
          aria-autocomplete="none"
          aria-expanded={open}
          aria-controls={contentId}
          aria-invalid={error || undefined}
          className={[
            'juice-input',
            'juice-datetime-picker-trigger',
            error && 'juice-input--error',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          value={displayValue}
          placeholder={placeholder ?? defaultPlaceholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={() => {
            /* all edits are driven by onKeyDown's masking; ignore raw input events */
          }}
          onFocus={requestOpen}
          onClick={requestOpen}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setDigitBuffer('');
            requestClose();
          }}
          id={baseId}
        />
      </PopoverPrimitive.Anchor>
    );
  }
);
DateTimePickerTrigger.displayName = 'DateTimePickerTrigger';

/* ── Content ─────────────────────────────────────────────────── */

export interface DateTimePickerContentProps
  extends Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, 'children'> {}

export const DateTimePickerContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  DateTimePickerContentProps
>(({ className = '', sideOffset = 4, align = 'start', ...props }, ref) => {
  const ctx = useDateTimePickerContext('Content');
  const {
    format,
    step,
    month,
    day,
    year,
    hour,
    minute,
    period,
    monthValues,
    dayValues,
    hourValues,
    minuteValues,
    activeSegment,
    setActiveSegment,
    digitBuffer,
    setDigitBuffer,
    commitSegment,
    isRowDisabled,
    isCellDisabled,
    selectDate,
    selectedDate,
    view,
    setView,
    cursor,
    setCursor,
    clear,
    requestOpen,
    requestClose,
    open,
    disabled,
    readOnly,
    baseId,
    contentId,
  } = ctx;

  // TimePicker's columns are an intentionally-clipped, taller-than-visible
  // scroll window (its rows overflow past the visible 5 rows so the
  // scroll-snap centering trick works) — a CSS `height: 100%` can't stretch
  // it to match the calendar's height because the flex line's own cross
  // size would be computed from the columns' full unclipped content height,
  // not the calendar's. Instead, measure the calendar panel's rendered
  // height directly and apply it as the columns' explicit window height.
  const [datePanelNode, setDatePanelNode] = useState<HTMLDivElement | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!datePanelNode) return;
    const update = () => setPanelHeight(datePanelNode.offsetHeight);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(datePanelNode);
    return () => observer.disconnect();
  }, [datePanelNode]);

  const datePickerCtxValue: DatePickerContextValue = {
    month,
    day,
    year,
    monthValues,
    dayValues,
    segments: ['month', 'day', 'year'],
    activeSegment:
      activeSegment === 'month' || activeSegment === 'day' || activeSegment === 'year'
        ? activeSegment
        : 'month',
    setActiveSegment,
    digitBuffer,
    setDigitBuffer,
    commitSegment,
    isRowDisabled,
    isCellDisabled,
    selectDate,
    selectedDate,
    view,
    setView,
    cursor,
    setCursor,
    clear,
    requestOpen,
    requestClose,
    open,
    disabled,
    readOnly,
    baseId,
    contentId,
  };

  const timeSegments: TimeSegment[] =
    format === '12h' ? ['hour', 'minute', 'period'] : ['hour', 'minute'];
  const timePickerCtxValue: TimePickerContextValue = {
    format,
    step,
    hourValues,
    minuteValues,
    hour,
    minute,
    period,
    segments: timeSegments,
    activeSegment:
      activeSegment === 'hour' || activeSegment === 'minute' || activeSegment === 'period'
        ? activeSegment
        : 'hour',
    setActiveSegment,
    digitBuffer,
    setDigitBuffer,
    commitSegment,
    isRowDisabled,
    clear,
    requestOpen,
    requestClose,
    open,
    disabled,
    readOnly,
    baseId,
    contentId,
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        id={contentId}
        className={`juice-datetime-picker-content ${className}`.trim()}
        sideOffset={sideOffset}
        align={align}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        <div className="juice-datetime-picker-panels">
          <div className="juice-datetime-picker-date-panel" ref={setDatePanelNode}>
            <DatePickerContext.Provider value={datePickerCtxValue}>
              <DatePickerCalendarPanel />
            </DatePickerContext.Provider>
          </div>
          <div className="juice-datetime-picker-divider" aria-hidden="true" />
          <div
            className="juice-datetime-picker-time-panel"
            style={panelHeight ? { height: panelHeight } : undefined}
          >
            <TimePickerContext.Provider value={timePickerCtxValue}>
              <TimePickerColumnsPanel />
            </TimePickerContext.Provider>
          </div>
        </div>

        <ButtonGroup
          variant="segmented"
          label="Date and time picker actions"
          className="juice-datetime-picker-actions"
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={requestClose}
          >
            Select
          </Button>
        </ButtonGroup>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
DateTimePickerContent.displayName = 'DateTimePickerContent';

/* ── Declarative DateTimePicker ──────────────────────────────── */

export interface DateTimePickerProps extends Omit<DateTimePickerRootProps, 'children'> {
  className?: string;
  /** Visual error state, matching `Input`'s error styling. */
  error?: boolean;
  placeholder?: string;
}

/**
 * DateTimePicker — combines DatePicker and TimePicker into a single typeable
 * input and single popover, showing the calendar and time columns side by
 * side. Built by composing DatePicker's calendar panel and TimePicker's
 * columns panel directly (see `TimePickerColumnsPanel`/`DatePickerCalendarPanel`),
 * driven by one unified segment/digit-masking state machine spanning both
 * the date and time portions of the value.
 *
 * @example
 * ```tsx
 * <DateTimePicker
 *   defaultValue={null}
 *   format="12h"
 *   step={15}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export function DateTimePicker({
  value,
  defaultValue,
  onChange,
  format,
  step,
  minDateTime,
  maxDateTime,
  isDateTimeDisabled,
  name,
  disabled,
  readOnly,
  error,
  placeholder,
  className,
}: DateTimePickerProps) {
  return (
    <DateTimePickerRoot
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      format={format}
      step={step}
      minDateTime={minDateTime}
      maxDateTime={maxDateTime}
      isDateTimeDisabled={isDateTimeDisabled}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
    >
      <DateTimePickerTrigger error={error} placeholder={placeholder} className={className} />
      <DateTimePickerContent />
    </DateTimePickerRoot>
  );
}

/* Attach compound sub-parts */
DateTimePicker.Root = DateTimePickerRoot;
DateTimePicker.Trigger = DateTimePickerTrigger;
DateTimePicker.Content = DateTimePickerContent;
