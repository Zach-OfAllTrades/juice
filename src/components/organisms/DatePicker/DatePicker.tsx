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
  useRef,
  useState,
} from 'react';
import {
  type DigitState,
  nextDigitState,
  nextFixedWidthDigitState,
} from '../../../utils/digitMask';
import { Button } from '../../atoms/Button';
import { ButtonGroup } from '../../molecules/ButtonGroup';
import './DatePicker.css';
import {
  type CalendarView,
  type DateSegment,
  type DateValue,
  MONTH_LABELS,
  MONTH_LABELS_SHORT,
  WEEKDAY_LABELS,
  buildDayGrid,
  buildYearGrid,
  clampDayToMonth,
  formatDateDisplay,
  getDayValues,
  getMonthValues,
  getSegmentCharRange,
  getYearPageStart,
  isDateOutOfBounds,
  isMonthOutOfBounds,
  isSameDate,
  isYearOutOfBounds,
  serializeDateValue,
  todayDateValue,
} from './DatePicker.utils';

export type { CalendarView, DateSegment, DateValue } from './DatePicker.utils';

const YEAR_DIGIT_WIDTH = 4;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Best-effort "advance to the next field" — mirrors reaching the end of a native `<input type="date">`. */
function focusNextTabbable(current: HTMLElement) {
  const focusable = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const idx = focusable.indexOf(current);
  const next = idx >= 0 ? focusable[idx + 1] : undefined;
  if (next) next.focus();
  else current.blur();
}

/* ── Context ─────────────────────────────────────────────────── */

export interface DatePickerContextValue {
  month: number | null;
  day: number | null;
  year: number | null;
  monthValues: number[];
  dayValues: number[];
  segments: DateSegment[];
  activeSegment: DateSegment;
  setActiveSegment: (segment: DateSegment) => void;
  digitBuffer: string;
  setDigitBuffer: (buffer: string) => void;
  commitSegment: (segment: DateSegment, value: number) => void;
  isRowDisabled: (segment: DateSegment, value: number) => boolean;
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

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);

export function useDatePickerContext(componentName: string): DatePickerContextValue {
  const ctx = useContext(DatePickerContext);
  if (!ctx) {
    throw new Error(`<DatePicker.${componentName} /> must be rendered inside <DatePicker.Root>.`);
  }
  return ctx;
}

/* ── Root ────────────────────────────────────────────────────── */

export interface DatePickerRootProps {
  /** Controlled value. Pass `null` for an explicitly empty field. */
  value?: DateValue | null;
  /** Uncontrolled initial value. Omitted defaults to today; explicit `null` starts empty. */
  defaultValue?: DateValue | null;
  onChange?: (value: DateValue | null) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  /** Arbitrary disabled dates, evaluated per candidate day. */
  isDateDisabled?: (value: DateValue) => boolean;
  /** Native form field name — renders a hidden input for plain `<form>`/`Form` submission. */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  children: ReactNode;
}

export function DatePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  isDateDisabled,
  name,
  disabled = false,
  readOnly = false,
  children,
}: DatePickerRootProps) {
  const baseId = useId();
  const contentId = `${baseId}-content`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateValue | null>(() =>
    defaultValue !== undefined ? defaultValue : todayDateValue()
  );

  const current = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<DateSegment>('month');
  const [digitBuffer, setDigitBuffer] = useState('');
  const [view, setView] = useState<CalendarView>('days');
  const [cursor, setCursor] = useState<{ month: number; year: number }>(() => {
    const base = current ?? todayDateValue();
    return { month: base.month, year: base.year };
  });

  // See TimePicker's identical `currentRef` for the reasoning: a single
  // keystroke can cascade into committing more than one segment
  // synchronously before React re-renders, so commitSegment/isRowDisabled
  // must read a synchronously-fresh value rather than the stale `current`
  // captured at the start of this render.
  const currentRef = useRef(current);
  currentRef.current = current;

  // Neutral fallback base for filling in not-yet-typed segments while
  // building a value up from empty. Snapshotted once per open (not
  // recomputed on every keystroke) so it doesn't drift mid-session.
  const emptyBaseRef = useRef<DateValue>(todayDateValue());

  const segments: DateSegment[] = ['month', 'day', 'year'];

  const effectiveBase = current ?? emptyBaseRef.current;
  const monthValues = getMonthValues();
  const dayValues = getDayValues(effectiveBase.month, effectiveBase.year);

  const updateValue = useCallback(
    (next: DateValue | null) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const commitSegment = useCallback(
    (segment: DateSegment, newValue: number) => {
      const base = currentRef.current ?? emptyBaseRef.current;
      const updated: DateValue = { ...base };
      if (segment === 'month') {
        updated.month = newValue;
        updated.day = clampDayToMonth(updated.day, updated.month, updated.year);
      } else if (segment === 'day') {
        updated.day = newValue;
      } else {
        updated.year = newValue;
        updated.day = clampDayToMonth(updated.day, updated.month, updated.year);
      }
      currentRef.current = updated;
      updateValue(updated);
      setCursor({ month: updated.month, year: updated.year });
    },
    [updateValue]
  );

  const isRowDisabled = useCallback(
    (segment: DateSegment, candidateValue: number) => {
      const base = currentRef.current ?? emptyBaseRef.current;
      if (segment === 'month')
        return isMonthOutOfBounds(candidateValue, base.year, minDate, maxDate);
      if (segment === 'year') return isYearOutOfBounds(candidateValue, minDate, maxDate);
      const candidate: DateValue = { ...base, day: candidateValue };
      return isDateOutOfBounds(candidate, minDate, maxDate) || Boolean(isDateDisabled?.(candidate));
    },
    [minDate, maxDate, isDateDisabled]
  );

  const isCellDisabled = useCallback(
    (date: DateValue) =>
      isDateOutOfBounds(date, minDate, maxDate) || Boolean(isDateDisabled?.(date)),
    [minDate, maxDate, isDateDisabled]
  );

  const selectDate = useCallback(
    (date: DateValue) => {
      currentRef.current = date;
      updateValue(date);
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
      emptyBaseRef.current = todayDateValue();
      setActiveSegment('month');
      setDigitBuffer('');
      setView('days');
      setCursor({ month: base.month, year: base.year });
    }
    setOpen(true);
  }, [disabled, readOnly, open]);

  const requestClose = useCallback(() => {
    setDigitBuffer('');
    setOpen(false);
  }, []);

  const contextValue: DatePickerContextValue = {
    month: current?.month ?? null,
    day: current?.day ?? null,
    year: current?.year ?? null,
    monthValues,
    dayValues,
    segments,
    activeSegment,
    setActiveSegment,
    digitBuffer,
    setDigitBuffer,
    commitSegment,
    isRowDisabled,
    isCellDisabled,
    selectDate,
    selectedDate: current,
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
    <DatePickerContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
        modal={false}
      >
        {children}
      </PopoverPrimitive.Root>
      {name && <input type="hidden" name={name} value={serializeDateValue(current)} />}
    </DatePickerContext.Provider>
  );
}

/* ── Trigger ─────────────────────────────────────────────────── */

export interface DatePickerTriggerProps {
  className?: string;
  /** Visual error state, matching `Input`'s error styling. */
  error?: boolean;
  placeholder?: string;
}

export const DatePickerTrigger = forwardRef<HTMLInputElement, DatePickerTriggerProps>(
  ({ className = '', error = false, placeholder }, forwardedRef) => {
    const ctx = useDatePickerContext('Trigger');
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
      month,
      day,
      year,
      monthValues,
      dayValues,
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
    const displayValue = hasValue ? formatDateDisplay(month, day, year) : '';

    // Visual indicator of which segment is active: native text selection
    // over that segment's characters, mirroring TimePicker's Trigger.
    useEffect(() => {
      if (!open) return;
      const input = internalInputRef.current;
      if (!input) return;
      const range = getSegmentCharRange(activeSegment, displayValue);
      if (!range) return;
      input.setSelectionRange(range[0], range[1]);
    }, [open, activeSegment, displayValue]);

    function segmentValues(segment: DateSegment): number[] {
      if (segment === 'month') return monthValues;
      if (segment === 'day') return dayValues;
      return [];
    }

    function activeValueFor(segment: DateSegment): number | null {
      if (segment === 'month') return month;
      if (segment === 'day') return day;
      return year;
    }

    function moveActive(segment: DateSegment, delta: number) {
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
      while (nextIdx >= 0 && nextIdx < values.length && isRowDisabled(segment, values[nextIdx])) {
        nextIdx += delta;
      }
      if (nextIdx < 0 || nextIdx >= values.length) return;
      commitSegment(segment, values[nextIdx]);
      setActiveSegment(segment);
      setDigitBuffer('');
    }

    function moveActiveToEdge(segment: DateSegment, edge: 'first' | 'last') {
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
      let finalSegment: DateSegment = activeSegment;
      let finalBuffer = '';

      while (pendingDigit !== undefined && segIndex < segments.length) {
        const segment = segments[segIndex];
        finalSegment = segment;

        const state: DigitState =
          segment === 'year'
            ? nextFixedWidthDigitState(buffer, pendingDigit, YEAR_DIGIT_WIDTH)
            : nextDigitState(segmentValues(segment), buffer, pendingDigit);

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
            'juice-date-picker-trigger',
            error && 'juice-input--error',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          value={displayValue}
          placeholder={placeholder ?? 'mm/dd/yyyy'}
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
DatePickerTrigger.displayName = 'DatePickerTrigger';

/* ── Calendar panel ──────────────────────────────────────────── */

/**
 * The header-nav + grid UI, decoupled from the Popover chrome so it can be
 * embedded directly by DateTimePicker (which supplies its own constructed
 * `DatePickerContextValue` and owns a single shared popover).
 */
export function DatePickerCalendarPanel() {
  const ctx = useDatePickerContext('CalendarPanel');
  const {
    view,
    setView,
    cursor,
    setCursor,
    selectedDate,
    selectDate,
    isCellDisabled,
    isRowDisabled,
    baseId,
  } = ctx;

  function goDelta(delta: number) {
    if (view === 'days') {
      const total = cursor.month - 1 + delta;
      const year = cursor.year + Math.floor(total / 12);
      const month = (((total % 12) + 12) % 12) + 1;
      setCursor({ month, year });
    } else if (view === 'months') {
      setCursor({ month: cursor.month, year: cursor.year + delta });
    } else {
      setCursor({ month: cursor.month, year: cursor.year + delta * 12 });
    }
  }

  const yearPageStart = getYearPageStart(cursor.year);

  return (
    <div className="juice-date-picker-calendar">
      <div className="juice-date-picker-header">
        <button
          type="button"
          className="juice-date-picker-nav-btn"
          aria-label={
            view === 'years'
              ? 'Previous 12 years'
              : view === 'months'
                ? 'Previous year'
                : 'Previous month'
          }
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => goDelta(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="juice-date-picker-header-label"
          disabled={view === 'years'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setView(view === 'days' ? 'months' : 'years')}
        >
          {view === 'days' && `${MONTH_LABELS[cursor.month - 1]} ${cursor.year}`}
          {view === 'months' && cursor.year}
          {view === 'years' && `${yearPageStart}–${yearPageStart + 11}`}
        </button>
        <button
          type="button"
          className="juice-date-picker-nav-btn"
          aria-label={
            view === 'years' ? 'Next 12 years' : view === 'months' ? 'Next year' : 'Next month'
          }
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => goDelta(1)}
        >
          ›
        </button>
      </div>

      {view === 'days' && (
        <div>
          <div className="juice-date-picker-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="juice-date-picker-weekday">
                {label}
              </span>
            ))}
          </div>
          {/* biome-ignore lint/a11y/useSemanticElements: custom combobox grid, not a native <select> */}
          <div className="juice-date-picker-grid" role="grid" aria-label="Choose a date">
            {buildDayGrid(cursor.month, cursor.year).map((cell) => {
              const disabled = isCellDisabled(cell.date);
              const selected = isSameDate(cell.date, selectedDate);
              return (
                <button
                  key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                  type="button"
                  id={`${baseId}-day-${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                  // biome-ignore lint/a11y/useSemanticElements: a native <td> can't be independently focusable/keyboard-actionable the way a day cell in this custom calendar grid needs to be
                  role="gridcell"
                  aria-selected={selected}
                  aria-disabled={disabled || undefined}
                  disabled={disabled}
                  tabIndex={-1}
                  className={[
                    'juice-date-picker-cell',
                    'juice-date-picker-cell--day',
                    !cell.inCurrentMonth && 'juice-date-picker-cell--outside',
                    selected && 'juice-date-picker-cell--selected',
                    disabled && 'juice-date-picker-cell--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (!disabled) selectDate(cell.date);
                  }}
                >
                  {cell.date.day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'months' && (
        <div className="juice-date-picker-grid juice-date-picker-grid--months">
          {MONTH_LABELS_SHORT.map((label, i) => {
            const monthNum = i + 1;
            const disabled = isRowDisabled('month', monthNum);
            const selected = selectedDate?.year === cursor.year && selectedDate?.month === monthNum;
            return (
              <button
                key={label}
                type="button"
                disabled={disabled}
                className={[
                  'juice-date-picker-cell',
                  'juice-date-picker-cell--tile',
                  selected && 'juice-date-picker-cell--selected',
                  disabled && 'juice-date-picker-cell--disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setCursor({ month: monthNum, year: cursor.year });
                  setView('days');
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {view === 'years' && (
        <div className="juice-date-picker-grid juice-date-picker-grid--years">
          {buildYearGrid(cursor.year).map((yearNum) => {
            const disabled = isRowDisabled('year', yearNum);
            const selected = selectedDate?.year === yearNum;
            return (
              <button
                key={yearNum}
                type="button"
                disabled={disabled}
                className={[
                  'juice-date-picker-cell',
                  'juice-date-picker-cell--tile',
                  selected && 'juice-date-picker-cell--selected',
                  disabled && 'juice-date-picker-cell--disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setCursor({ month: cursor.month, year: yearNum });
                  setView('months');
                }}
              >
                {yearNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Content ─────────────────────────────────────────────────── */

export interface DatePickerContentProps
  extends Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, 'children'> {}

export const DatePickerContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  DatePickerContentProps
>(({ className = '', sideOffset = 4, align = 'start', ...props }, ref) => {
  const ctx = useDatePickerContext('Content');
  const { clear, requestClose, contentId } = ctx;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        id={contentId}
        className={`juice-date-picker-content ${className}`.trim()}
        sideOffset={sideOffset}
        align={align}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        <DatePickerCalendarPanel />

        <ButtonGroup
          variant="segmented"
          label="Date picker actions"
          className="juice-date-picker-actions"
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
DatePickerContent.displayName = 'DatePickerContent';

/* ── Declarative DatePicker ──────────────────────────────────── */

export interface DatePickerProps extends Omit<DatePickerRootProps, 'children'> {
  className?: string;
  /** Visual error state, matching `Input`'s error styling. */
  error?: boolean;
  placeholder?: string;
}

/**
 * DatePicker — a typeable text input paired with a calendar popover,
 * powered by Radix Popover for anchoring and portal rendering. Mirrors
 * TimePicker's architecture and interaction model.
 *
 * Value and popover selection stay in sync live, in both directions: typing
 * updates the highlighted day/month/year in the calendar, and browsing/
 * clicking a day updates the input. Closing the popover (blur, outside
 * click, Escape, finishing the year segment) always commits the current
 * value — the only way to get an empty value is the Clear action.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   defaultValue={null}
 *   minDate={{ year: 2026, month: 1, day: 1 }}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  isDateDisabled,
  name,
  disabled,
  readOnly,
  error,
  placeholder,
  className,
}: DatePickerProps) {
  return (
    <DatePickerRoot
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      isDateDisabled={isDateDisabled}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
    >
      <DatePickerTrigger error={error} placeholder={placeholder} className={className} />
      <DatePickerContent />
    </DatePickerRoot>
  );
}

/* Attach compound sub-parts */
DatePicker.Root = DatePickerRoot;
DatePicker.Trigger = DatePickerTrigger;
DatePicker.Content = DatePickerContent;
DatePicker.CalendarPanel = DatePickerCalendarPanel;
