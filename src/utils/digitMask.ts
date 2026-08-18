/**
 * Generic numeric-segment digit-masking state machine, shared by every
 * "typeable segmented input" in the library (TimePicker's hour/minute,
 * DatePicker's month/day, DateTimePicker's combined segments).
 *
 * Kept dependency-free and pure so it can be unit tested directly without
 * simulating DOM/keyboard behavior.
 */

export interface DigitPartial {
  status: 'partial';
  buffer: string;
  /** The value that would commit if the user stops typing/navigates away now, if any. */
  tentativeValue: number | null;
}
export interface DigitComplete {
  status: 'complete';
  value: number;
  /** Present when this digit didn't extend the buffer; the caller should
   * commit `value` (from the buffer), advance the segment, and reprocess
   * this same digit as the first keystroke of the new active segment. */
  reprocessDigit?: string;
}
export interface DigitRejected {
  status: 'rejected';
}
export type DigitState = DigitPartial | DigitComplete | DigitRejected;

/**
 * Advances a numeric segment's typing buffer by one digit keystroke.
 *
 * Handles, uniformly, via brute-force existence checks against the segment's
 * valid value list:
 * - immediate single-digit completion when no two-digit extension exists
 *   (e.g. typing "9" for a 0-59 minute completes instantly to 9)
 * - leading-zero completion (typing "0" then "5" completes to 5)
 * - tens-prefix completion (typing "1" then "0"/"1"/"2" completes to 10/11/12)
 * - fallback: if a second digit doesn't extend the buffer into any valid
 *   value, but the buffer alone was a valid standalone value, complete with
 *   the buffer's value and flag the new digit for reprocessing by the next
 *   segment.
 */
export function nextDigitState(values: number[], buffer: string, digit: string): DigitState {
  if (!/^[0-9]$/.test(digit)) return { status: 'rejected' };

  if (buffer === '') {
    const d = Number(digit);
    const standalone = values.includes(d);
    let hasExtension = false;
    for (let e = 0; e <= 9; e++) {
      const candidate = Number(`${digit}${e}`);
      if (candidate !== d && values.includes(candidate)) {
        hasExtension = true;
        break;
      }
    }

    if (!standalone && !hasExtension) return { status: 'rejected' };
    if (standalone && !hasExtension) return { status: 'complete', value: d };
    return { status: 'partial', buffer: digit, tentativeValue: standalone ? d : null };
  }

  const candidate = Number(buffer + digit);
  if (values.includes(candidate)) {
    return { status: 'complete', value: candidate };
  }

  const bufferValue = Number(buffer);
  if (values.includes(bufferValue)) {
    return { status: 'complete', value: bufferValue, reprocessDigit: digit };
  }

  return { status: 'partial', buffer, tentativeValue: null };
}

/**
 * Fixed-width digit buffer for segments too large to enumerate as a value
 * list (a year isn't a small closed set like an hour or a day). Completes
 * automatically once `width` digits have been typed; a full buffer typed
 * into again starts a fresh buffer from that digit.
 */
export function nextFixedWidthDigitState(buffer: string, digit: string, width: number): DigitState {
  if (!/^[0-9]$/.test(digit)) return { status: 'rejected' };

  const nextBuffer = buffer.length >= width ? digit : buffer + digit;
  if (nextBuffer.length >= width) {
    return { status: 'complete', value: Number(nextBuffer) };
  }
  return { status: 'partial', buffer: nextBuffer, tentativeValue: null };
}

export function matchPeriodKey(key: string): 'AM' | 'PM' | null {
  const k = key.toLowerCase();
  if (k === 'a') return 'AM';
  if (k === 'p') return 'PM';
  return null;
}
