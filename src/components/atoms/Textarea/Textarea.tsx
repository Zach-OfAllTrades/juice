import { type TextareaHTMLAttributes, useId } from 'react';
import './Textarea.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label text */
  label?: string;
  /** Accessible helper text */
  helperText?: string;
  /** Error message — presence signals error state */
  error?: string;
  /** Mark field as required */
  required?: boolean;
  /** Custom ID for external label connection */
  id?: string;
}

/**
 * Textarea — native `<textarea>` wrapper with wired `<label>` and ARIA error states.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Feedback"
 *   placeholder="Tell us what you think…"
 *   rows={4}
 * />
 * ```
 */
export function Textarea({
  label,
  helperText,
  error,
  required,
  id: propId,
  className = '',
  ...props
}: TextareaProps) {
  const autoId = useId();
  const id = propId ?? autoId;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);

  const textareaClasses = ['juice-textarea', hasError && 'juice-textarea--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="juice-textarea-wrapper">
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

      <textarea
        {...props}
        id={id}
        className={textareaClasses}
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
