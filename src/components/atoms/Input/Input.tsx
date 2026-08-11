import { type InputHTMLAttributes, type ReactNode, useId } from 'react';
import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

// Omit 'size' from native InputHTMLAttributes because native `size` is `number`,
// but our design system size prop uses string tokens ('sm' | 'md' | 'lg').
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label text */
  label?: string;
  /** Accessible helper text shown below the field */
  helperText?: string;
  /** Error message — presence signals error state */
  error?: string;
  /** Size variant */
  size?: InputSize;
  /** Mark the field as required (adds visual asterisk) */
  required?: boolean;
  /**
   * Stable ID for the input.
   * Auto-generated if omitted — use when you need to connect an external label.
   */
  id?: string;
  /** Leading icon/adornment inside the input */
  leadingIcon?: ReactNode;
}

/**
 * Input — native `<input>` with a wired `<label>`, helper text, and error state.
 *
 * Accessibility is provided entirely by native HTML:
 * - `htmlFor` / `id` links label to field
 * - `aria-describedby` links error and helper text
 * - `aria-invalid` signals error state to screen readers
 * - `aria-live` on error text announces changes to screen readers
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email address"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 * />
 * ```
 */
export function Input({
  label,
  helperText,
  error,
  size = 'md',
  required,
  id: propId,
  leadingIcon: _leadingIcon,
  className = '',
  ...props
}: InputProps) {
  const autoId = useId();
  const id = propId ?? autoId;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);

  const inputClasses = [
    'juice-input',
    size !== 'md' && `juice-input--${size}`,
    hasError && 'juice-input--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="juice-input-wrapper">
      {label && (
        <label htmlFor={id} className="juice-label">
          {label}
          {required && (
            <span className="juice-label__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        {...props}
        id={id}
        className={inputClasses}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={
          [hasError && errorId, hasHelper && descriptionId].filter(Boolean).join(' ') || undefined
        }
      />

      {hasError && (
        <span id={errorId} className="juice-error-text" role="alert" aria-live="polite">
          {error}
        </span>
      )}

      {hasHelper && !hasError && (
        <span id={descriptionId} className="juice-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
}
