import { type TextareaHTMLAttributes, useId } from 'react';
import './Textarea.css';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label text */
  label?: string;
  /** Accessible helper text */
  helperText?: string;
  /** Error message — presence signals error state */
  error?: string;
  /** Mark field as required */
  required?: boolean;
  /**
   * Resizing behavior of the textarea:
   * - 'none': disables expand/contract resizing entirely
   * - 'vertical': allows vertical resizing (default)
   * - 'horizontal': allows horizontal resizing
   * - 'both': allows both axes
   * - false: shorthand for 'none'
   */
  resize?: TextareaResize | boolean;
  /** Custom ID for external label connection */
  id?: string;
}

/**
 * Textarea — native `<textarea>` wrapper with wired `<label>`, error states, and resize control.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Feedback"
 *   placeholder="Tell us what you think…"
 *   resize="none"
 *   rows={4}
 * />
 * ```
 */
export function Textarea({
  label,
  helperText,
  error,
  required,
  resize = 'vertical',
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

  const resizeMode: TextareaResize =
    resize === false ? 'none' : resize === true ? 'vertical' : resize;

  const textareaClasses = [
    'juice-textarea',
    `juice-textarea--resize-${resizeMode}`,
    hasError && 'juice-textarea--error',
    className,
  ]
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
