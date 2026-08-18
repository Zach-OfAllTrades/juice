import * as PopoverPrimitive from '@radix-ui/react-popover';
import { RemoveScroll } from 'react-remove-scroll';
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
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '../../atoms/Button';
import { ButtonGroup } from '../../molecules/ButtonGroup';
import './TimePicker.css';
import {
  type TimeFormat,
  type TimeSegment,
  type TimeValue,
  formatHourDisplay,
  formatMinuteDisplay,
  formatTimeDisplay,
  fromMinutesOfDay,
  getHourValues,
  getMinuteValues,
  getSegmentCharRange,
  isTimeOutOfBounds,
  matchPeriodKey,
  nextDigitState,
  roundMinuteToStep,
  serializeTimeValue,
  toMinutesOfDay,
} from './TimePicker.utils';

export type { TimeFormat, TimeSegment, TimeValue } from './TimePicker.utils';

const FALLBACK_ROW_HEIGHT = 36;
const SCROLL_SETTLE_DELAY = 120;
const PROGRAMMATIC_SCROLL_GUARD = 400;

function getDefaultCurrentTime(format: TimeFormat, step: number): TimeValue {
  const now = new Date();
  const rounded = roundMinuteToStep(now.getMinutes(), step);
  return fromMinutesOfDay(now.getHours() * 60 + rounded, format);
}

/**
 * Neutral baseline (midnight) for filling in not-yet-typed segments while
 * building up a value from empty — distinct from {@link getDefaultCurrentTime},
 * which only seeds the *initial* mount value. Typing just an hour into an
 * empty field should default minute to 00, not to whatever the clock reads.
 */
function getEmptyBaseTime(format: TimeFormat): TimeValue {
  return fromMinutesOfDay(0, format);
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Best-effort "advance to the next field" — mirrors reaching the end of a native `<input type="time">`. */
function focusNextTabbable(current: HTMLElement) {
  const focusable = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const idx = focusable.indexOf(current);
  const next = idx >= 0 ? focusable[idx + 1] : undefined;
  if (next) next.focus();
  else current.blur();
}

/* ── Context ─────────────────────────────────────────────────── */

export interface TimePickerContextValue {
  format: TimeFormat;
  step: number;
  hourValues: number[];
  minuteValues: number[];
  hour: number | null;
  minute: number | null;
  period: 'AM' | 'PM' | null;
  segments: TimeSegment[];
  activeSegment: TimeSegment;
  setActiveSegment: (segment: TimeSegment) => void;
  digitBuffer: string;
  setDigitBuffer: (buffer: string) => void;
  commitSegment: (segment: TimeSegment, value: number | 'AM' | 'PM') => void;
  isRowDisabled: (segment: TimeSegment, value: number | 'AM' | 'PM') => boolean;
  clear: () => void;
  requestOpen: () => void;
  requestClose: () => void;
  open: boolean;
  disabled: boolean;
  readOnly: boolean;
  baseId: string;
  contentId: string;
}

export const TimePickerContext = createContext<TimePickerContextValue | null>(null);

export function useTimePickerContext(componentName: string): TimePickerContextValue {
  const ctx = useContext(TimePickerContext);
  if (!ctx) {
    throw new Error(`<TimePicker.${componentName} /> must be rendered inside <TimePicker.Root>.`);
  }
  return ctx;
}

/* ── Root ────────────────────────────────────────────────────── */

export interface TimePickerRootProps {
  /** Controlled value. Pass `null` for an explicitly empty field. */
  value?: TimeValue | null;
  /** Uncontrolled initial value. Omitted defaults to the current time; explicit `null` starts empty. */
  defaultValue?: TimeValue | null;
  onChange?: (value: TimeValue | null) => void;
  /** @default '12h' */
  format?: TimeFormat;
  /** Minute increment for the minute column. @default 1 */
  step?: number;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  /** Arbitrary disabled slots/ranges, evaluated per candidate row. */
  isTimeDisabled?: (value: TimeValue) => boolean;
  /** Native form field name — renders a hidden input for plain `<form>`/`Form` submission. */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  children: ReactNode;
}

export function TimePickerRoot({
  value: controlledValue,
  defaultValue,
  onChange,
  format = '12h',
  step: rawStep = 1,
  minTime,
  maxTime,
  isTimeDisabled,
  name,
  disabled = false,
  readOnly = false,
  children,
}: TimePickerRootProps) {
  const step = rawStep;
  const baseId = useId();
  const contentId = `${baseId}-content`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledMinutes, setUncontrolledMinutes] = useState<number | null>(() => {
    const initial = defaultValue !== undefined ? defaultValue : getDefaultCurrentTime(format, step);
    return initial ? toMinutesOfDay(initial, format) : null;
  });

  const minutesOfDay = isControlled
    ? controlledValue
      ? toMinutesOfDay(controlledValue, format)
      : null
    : uncontrolledMinutes;

  const [open, setOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<TimeSegment>('hour');
  const [digitBuffer, setDigitBuffer] = useState('');

  const hourValues = useMemo(() => getHourValues(format), [format]);
  const minuteValues = useMemo(() => getMinuteValues(step), [step]);
  const segments = useMemo<TimeSegment[]>(
    () => (format === '12h' ? ['hour', 'minute', 'period'] : ['hour', 'minute']),
    [format]
  );

  const current = minutesOfDay !== null ? fromMinutesOfDay(minutesOfDay, format) : null;
  const hour = current?.hour ?? null;
  const minute = current?.minute ?? null;
  const period = current?.period ?? null;

  // A single keystroke can cascade into committing more than one segment
  // synchronously (see handleDigitKey's reprocessDigit path) before React
  // re-renders. `currentRef` is the source of truth commitSegment/isRowDisabled
  // build on, updated synchronously on every call, so a second commit within
  // the same event handler sees the first commit's result instead of a stale
  // `current` captured at the start of this render.
  const currentRef = useRef(current);
  currentRef.current = current;

  const updateMinutes = useCallback(
    (newMinutes: number | null) => {
      if (!isControlled) setUncontrolledMinutes(newMinutes);
      onChange?.(newMinutes === null ? null : fromMinutesOfDay(newMinutes, format));
    },
    [isControlled, onChange, format]
  );

  const commitSegment = useCallback(
    (segment: TimeSegment, newValue: number | 'AM' | 'PM') => {
      const base = currentRef.current ?? getEmptyBaseTime(format);
      const updated: TimeValue = { ...base };
      if (segment === 'hour') updated.hour = newValue as number;
      if (segment === 'minute') updated.minute = newValue as number;
      if (segment === 'period') updated.period = newValue as 'AM' | 'PM';
      currentRef.current = updated;
      updateMinutes(toMinutesOfDay(updated, format));
    },
    [format, updateMinutes]
  );

  const isRowDisabled = useCallback(
    (segment: TimeSegment, candidateValue: number | 'AM' | 'PM') => {
      const base = currentRef.current ?? getEmptyBaseTime(format);
      const candidate: TimeValue = { ...base };
      if (segment === 'hour') candidate.hour = candidateValue as number;
      if (segment === 'minute') candidate.minute = candidateValue as number;
      if (segment === 'period') candidate.period = candidateValue as 'AM' | 'PM';
      if (isTimeOutOfBounds(candidate, format, minTime, maxTime)) return true;
      return Boolean(isTimeDisabled?.(candidate));
    },
    [format, minTime, maxTime, isTimeDisabled]
  );

  const clear = useCallback(() => {
    updateMinutes(null);
    setDigitBuffer('');
    setOpen(false);
  }, [updateMinutes]);

  const requestOpen = useCallback(() => {
    if (disabled || readOnly) return;
    // Reset to the hour segment on every fresh open — otherwise a picker
    // left on 'period' (or any non-hour segment) from a prior completed
    // entry silently ignores digit keys on reopen, since digits don't apply
    // to the period segment.
    if (!open) {
      setActiveSegment('hour');
      setDigitBuffer('');
    }
    setOpen(true);
  }, [disabled, readOnly, open]);

  const requestClose = useCallback(() => {
    setDigitBuffer('');
    setOpen(false);
  }, []);

  const contextValue: TimePickerContextValue = {
    format,
    step,
    hourValues,
    minuteValues,
    hour,
    minute,
    period,
    segments,
    activeSegment,
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
    <TimePickerContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose();
        }}
        modal={false}
      >
        {children}
      </PopoverPrimitive.Root>
      {name && <input type="hidden" name={name} value={serializeTimeValue(current, format)} />}
    </TimePickerContext.Provider>
  );
}

/* ── Trigger ─────────────────────────────────────────────────── */

export interface TimePickerTriggerProps {
  className?: string;
  /** Visual error state, matching `Input`'s error styling. */
  error?: boolean;
  placeholder?: string;
}

export const TimePickerTrigger = forwardRef<HTMLInputElement, TimePickerTriggerProps>(
  ({ className = '', error = false, placeholder }, forwardedRef) => {
    const ctx = useTimePickerContext('Trigger');
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
      hourValues,
      minuteValues,
      hour,
      minute,
      period,
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

    const hasValue = hour !== null;
    const displayValue = hasValue ? formatTimeDisplay(hour, minute, period, format) : '';
    const defaultPlaceholder = format === '12h' ? 'hh:mm AM/PM' : 'HH:mm';

    // Visual indicator of which segment is active: native text selection
    // over that segment's characters (e.g. select "30" while editing
    // minutes), since a plain <input> can't style a character range while
    // the rest stays plain. Re-synced whenever the active segment or the
    // displayed text changes.
    useEffect(() => {
      if (!open) return;
      const input = internalInputRef.current;
      if (!input) return;
      const range = getSegmentCharRange(activeSegment, displayValue);
      if (!range) return;
      input.setSelectionRange(range[0], range[1]);
    }, [open, activeSegment, displayValue]);

    function segmentValues(segment: TimeSegment): (number | 'AM' | 'PM')[] {
      if (segment === 'hour') return hourValues;
      if (segment === 'minute') return minuteValues;
      return ['AM', 'PM'];
    }

    function activeValueFor(segment: TimeSegment): number | 'AM' | 'PM' | null {
      if (segment === 'hour') return hour;
      if (segment === 'minute') return minute;
      return period;
    }

    function moveActive(segment: TimeSegment, delta: number) {
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

    function moveActiveToEdge(segment: TimeSegment, edge: 'first' | 'last') {
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
      let finalSegment: TimeSegment = activeSegment;
      let finalBuffer = '';

      while (pendingDigit !== undefined && segIndex < segments.length) {
        const segment = segments[segIndex];
        finalSegment = segment;
        if (segment === 'period') break; // digits don't apply to the period segment

        const values = segment === 'hour' ? hourValues : minuteValues;
        const state = nextDigitState(values, buffer, pendingDigit);

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

    function getRowId(segment: TimeSegment, value: number | 'AM' | 'PM') {
      return `${baseId}-${segment}-${value}`;
    }

    const activeValue = activeValueFor(activeSegment);
    const activeDescendant =
      open && activeValue !== null ? getRowId(activeSegment, activeValue) : undefined;

    return (
      <PopoverPrimitive.Anchor asChild>
        <input
          ref={setRefs}
          type="text"
          inputMode="numeric"
          role="combobox"
          aria-haspopup="listbox"
          aria-autocomplete="none"
          aria-expanded={open}
          aria-controls={contentId}
          aria-activedescendant={activeDescendant}
          aria-invalid={error || undefined}
          className={[
            'juice-input',
            'juice-time-picker-trigger',
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
        />
      </PopoverPrimitive.Anchor>
    );
  }
);
TimePickerTrigger.displayName = 'TimePickerTrigger';

/* ── Column ──────────────────────────────────────────────────── */

interface TimePickerColumnProps<T extends number | string> {
  values: T[];
  activeValue: T | null;
  onSelect: (value: T) => void;
  isDisabled: (value: T) => boolean;
  formatRow: (value: T) => string;
  getRowId: (value: T) => string;
  ariaLabel: string;
}

function TimePickerColumn<T extends number | string>({
  values,
  activeValue,
  onSelect,
  isDisabled,
  formatRow,
  getRowId,
  ariaLabel,
}: TimePickerColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<T, HTMLDivElement>());
  const isProgrammaticScroll = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastHeightRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || activeValue === null) return undefined;

    function scrollToActive(behavior: ScrollBehavior) {
      const row = rowRefs.current.get(activeValue as T);
      if (!container || !row) return;
      const rowHeight = row.offsetHeight || FALLBACK_ROW_HEIGHT;
      const targetTop = row.offsetTop - container.clientHeight / 2 + rowHeight / 2;
      isProgrammaticScroll.current = true;
      container.scrollTo({ top: targetTop, behavior });
    }

    scrollToActive('smooth');
    const guard = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, PROGRAMMATIC_SCROLL_GUARD);

    // DateTimePicker measures and applies the calendar panel's height to this
    // column asynchronously, on a later render than the one this effect's
    // initial scroll ran against — re-center (without animating) whenever the
    // column's own rendered height changes so it doesn't stay scrolled for a
    // viewport size that's since gone stale.
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        const newHeight = entries[0]?.contentRect.height;
        if (newHeight === undefined || newHeight === lastHeightRef.current) return;
        lastHeightRef.current = newHeight;
        scrollToActive('auto');
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(guard);
      resizeObserver?.disconnect();
    };
  }, [activeValue]);

  function handleScroll() {
    if (isProgrammaticScroll.current) return;
    const container = containerRef.current;
    if (!container) return;

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      const center = container.scrollTop + container.clientHeight / 2;
      let closest: T | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const value of values) {
        const row = rowRefs.current.get(value);
        if (!row) continue;
        const rowCenter = row.offsetTop + row.offsetHeight / 2;
        const distance = Math.abs(rowCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = value;
        }
      }

      if (closest === null) return;

      if (!isDisabled(closest)) {
        if (closest !== activeValue) onSelect(closest);
        return;
      }

      const idx = values.indexOf(closest);
      for (let offset = 1; offset < values.length; offset++) {
        const after = values[idx + offset];
        const before = values[idx - offset];
        if (after !== undefined && !isDisabled(after)) {
          onSelect(after);
          return;
        }
        if (before !== undefined && !isDisabled(before)) {
          onSelect(before);
          return;
        }
      }
    }, SCROLL_SETTLE_DELAY);
  }

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: intentionally not a real focus stop — the combobox <input> owns keyboard focus and drives this listbox via aria-activedescendant (ARIA 1.2 combobox pattern)
    <div
      ref={containerRef}
      className="juice-time-picker-column"
      // biome-ignore lint/a11y/useSemanticElements: a native <select> can't render a custom scroll-snap wheel-picker column
      role="listbox"
      aria-label={ariaLabel}
      onScroll={handleScroll}
    >
      <div className="juice-time-picker-column__pad" aria-hidden="true" />
      {values.map((value) => {
        const disabled = isDisabled(value);
        const selected = value === activeValue;
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: virtual option — real keyboard focus stays on the combobox <input>, which drives selection via TimePickerTrigger's onKeyDown; this row is mouse/touch-only
          // biome-ignore lint/a11y/useFocusableInteractive: intentionally not a real focus stop, see the listbox container above
          <div
            key={String(value)}
            id={getRowId(value)}
            ref={(el) => {
              if (el) rowRefs.current.set(value, el);
              else rowRefs.current.delete(value);
            }}
            // biome-ignore lint/a11y/useSemanticElements: this is a custom combobox listbox row, not a native <select>'s <option>
            role="option"
            aria-selected={selected}
            aria-disabled={disabled || undefined}
            className={[
              'juice-time-picker-row',
              selected && 'juice-time-picker-row--selected',
              disabled && 'juice-time-picker-row--disabled',
            ]
              .filter(Boolean)
              .join(' ')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (!disabled) onSelect(value);
            }}
          >
            {formatRow(value)}
          </div>
        );
      })}
      <div className="juice-time-picker-column__pad" aria-hidden="true" />
    </div>
  );
}

/* ── Columns panel ───────────────────────────────────────────── */

/**
 * The hour/minute/(period) scroll-snap columns, decoupled from the Popover
 * chrome and action buttons so it can be embedded directly by
 * DateTimePicker (which supplies its own constructed `TimePickerContextValue`
 * and owns a single shared popover alongside DatePicker's calendar).
 */
export function TimePickerColumnsPanel() {
  const ctx = useTimePickerContext('ColumnsPanel');
  const {
    format,
    hourValues,
    minuteValues,
    hour,
    minute,
    period,
    segments,
    setActiveSegment,
    setDigitBuffer,
    commitSegment,
    isRowDisabled,
    baseId,
  } = ctx;

  function select(segment: TimeSegment, value: number | 'AM' | 'PM') {
    commitSegment(segment, value);
    setActiveSegment(segment);
    setDigitBuffer('');
  }

  function getRowId(segment: TimeSegment, value: number | 'AM' | 'PM') {
    return `${baseId}-${segment}-${value}`;
  }

  return (
    <div className="juice-time-picker-columns">
      <TimePickerColumn
        values={hourValues}
        activeValue={hour}
        onSelect={(v) => select('hour', v)}
        isDisabled={(v) => isRowDisabled('hour', v)}
        formatRow={(v) => formatHourDisplay(v, format)}
        getRowId={(v) => getRowId('hour', v)}
        ariaLabel="Hour"
      />
      <TimePickerColumn
        values={minuteValues}
        activeValue={minute}
        onSelect={(v) => select('minute', v)}
        isDisabled={(v) => isRowDisabled('minute', v)}
        formatRow={(v) => formatMinuteDisplay(v)}
        getRowId={(v) => getRowId('minute', v)}
        ariaLabel="Minute"
      />
      {segments.includes('period') && (
        <TimePickerColumn
          values={['AM', 'PM']}
          activeValue={period}
          onSelect={(v) => select('period', v)}
          isDisabled={(v) => isRowDisabled('period', v)}
          formatRow={(v) => v}
          getRowId={(v) => getRowId('period', v)}
          ariaLabel="AM or PM"
        />
      )}
    </div>
  );
}

/* ── Content ─────────────────────────────────────────────────── */

export interface TimePickerContentProps
  extends Omit<ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, 'children'> {}

export const TimePickerContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  TimePickerContentProps
>(({ className = '', sideOffset = 4, align = 'start', ...props }, ref) => {
  const ctx = useTimePickerContext('Content');
  const { clear, requestClose, contentId, open } = ctx;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        id={contentId}
        className={`juice-time-picker-content ${className}`.trim()}
        sideOffset={sideOffset}
        align={align}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        {/* The Popover backing this content is deliberately non-modal (see
            TimePickerRoot) so it doesn't trap focus away from the trigger
            input's combobox keyboard handling. But a non-modal Popover
            mounts no scroll lock of its own — when this content is opened
            from inside a modal Dialog/Drawer, that ancestor's scroll lock
            (react-remove-scroll) stays the page's only active listener and
            blocks wheel/touch scrolling on this popover's content too,
            since it's portaled outside the Dialog's own DOM subtree. A
            plain, non-restrictive RemoveScroll here claims the top of that
            shared lock stack while open, handing scroll authority back to
            this content specifically — see react-remove-scroll's `lockStack`. */}
        <RemoveScroll enabled={open} allowPinchZoom removeScrollBar={false}>
          <TimePickerColumnsPanel />
        </RemoveScroll>

        <ButtonGroup
          variant="segmented"
          label="Time picker actions"
          className="juice-time-picker-actions"
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
TimePickerContent.displayName = 'TimePickerContent';

/* ── Declarative TimePicker ─────────────────────────────────── */

export interface TimePickerProps extends Omit<TimePickerRootProps, 'children'> {
  className?: string;
  /** Visual error state, matching `Input`'s error styling. */
  error?: boolean;
  placeholder?: string;
}

/**
 * TimePicker — a typeable text input paired with a dropdown of three
 * synchronized, scrollable columns (hour / minute / AM-PM), powered by Radix
 * Popover for anchoring and portal rendering.
 *
 * Value and popover selection stay in sync live, in both directions: typing
 * updates the highlighted/centered row, and scrolling/clicking a column
 * updates the input. Closing the popover (blur, outside click, Escape,
 * finishing the last segment) always commits the current value — the only
 * way to get an empty value is the Clear action.
 *
 * @example
 * ```tsx
 * <TimePicker
 *   defaultValue={null}
 *   format="12h"
 *   step={15}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export function TimePicker({
  value,
  defaultValue,
  onChange,
  format,
  step,
  minTime,
  maxTime,
  isTimeDisabled,
  name,
  disabled,
  readOnly,
  error,
  placeholder,
  className,
}: TimePickerProps) {
  return (
    <TimePickerRoot
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      format={format}
      step={step}
      minTime={minTime}
      maxTime={maxTime}
      isTimeDisabled={isTimeDisabled}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
    >
      <TimePickerTrigger error={error} placeholder={placeholder} className={className} />
      <TimePickerContent />
    </TimePickerRoot>
  );
}

/* Attach compound sub-parts */
TimePicker.Root = TimePickerRoot;
TimePicker.Trigger = TimePickerTrigger;
TimePicker.Content = TimePickerContent;
TimePicker.ColumnsPanel = TimePickerColumnsPanel;
