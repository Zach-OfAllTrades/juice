import { type InputHTMLAttributes, type ReactNode, useEffect, useId, useRef } from 'react';
import './Checkbox.css';

export type CheckboxLabelPosition = 'top' | 'bottom' | 'left' | 'right';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text displayed beside the checkbox */
  label?: ReactNode;
  /** Subtext description below label */
  description?: ReactNode;
  /** Error message */
  error?: string;
  /** Indeterminate mixed state (e.g. for partially selected parent groups) */
  indeterminate?: boolean;
  /** Position of label relative to the checkbox box (default: 'right') */
  labelPosition?: CheckboxLabelPosition;
}

/**
 * Checkbox — native `<input type="checkbox">` wrapper with label positioning.
 *
 * Implements low-ROI native HTML wrapping with zero JavaScript overhead.
 * Handles checked, indeterminate, focus, labelPosition, and error states accessibly.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept Terms and Conditions" labelPosition="right" required />
 * ```
 */
export function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  disabled = false,
  labelPosition = 'right',
  id: propId,
  className = '',
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const id = propId ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      htmlFor={id}
      className={[
        'juice-checkbox-wrapper',
        `juice-checkbox-wrapper--label-${labelPosition}`,
        disabled && 'juice-checkbox-wrapper--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="juice-checkbox-control">
        <input
          {...props}
          ref={inputRef}
          type="checkbox"
          id={id}
          disabled={disabled}
          data-indeterminate={indeterminate || undefined}
          className="juice-checkbox-input"
        />
        <span className="juice-checkbox-box" aria-hidden="true">
          {indeterminate ? (
            <svg
              className="juice-checkbox-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ) : (
            <svg
              className="juice-checkbox-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
      </span>

      {(label || description || error) && (
        <span className="juice-checkbox-label-group">
          {label && <span className="juice-checkbox-label">{label}</span>}
          {description && <span className="juice-checkbox-description">{description}</span>}
          {error && (
            <span className="juice-checkbox-error" role="alert">
              {error}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
