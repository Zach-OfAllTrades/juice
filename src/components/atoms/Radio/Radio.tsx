import { type HTMLAttributes, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import './Radio.css';

export type RadioLabelPosition = 'top' | 'bottom' | 'left' | 'right';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text displayed beside the radio */
  label?: ReactNode;
  /** Subtext description below label */
  description?: ReactNode;
  /** Position of label relative to the radio circle (default: 'right') */
  labelPosition?: RadioLabelPosition;
}

/**
 * Radio — native `<input type="radio">` wrapper with label positioning.
 *
 * @example
 * ```tsx
 * <Radio name="plan" value="pro" label="Pro Plan" labelPosition="right" description="$20 / month" />
 * ```
 */
export function Radio({
  label,
  description,
  disabled = false,
  labelPosition = 'right',
  id: propId,
  className = '',
  ...props
}: RadioProps) {
  const autoId = useId();
  const id = propId ?? autoId;

  return (
    <label
      htmlFor={id}
      className={[
        'juice-radio-wrapper',
        `juice-radio-wrapper--label-${labelPosition}`,
        disabled && 'juice-radio-wrapper--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="juice-radio-control">
        <input {...props} type="radio" id={id} disabled={disabled} className="juice-radio-input" />
        <span className="juice-radio-circle" aria-hidden="true">
          <span className="juice-radio-dot" />
        </span>
      </span>

      {(label || description) && (
        <span className="juice-radio-label-group">
          {label && <span className="juice-radio-label">{label}</span>}
          {description && <span className="juice-radio-description">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
}

/**
 * RadioGroup — semantic wrapper layout for Radio options with `role="radiogroup"`.
 */
export function RadioGroup({
  orientation = 'vertical',
  className = '',
  children,
  ...props
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={[
        'juice-radio-group',
        orientation === 'horizontal' && 'juice-radio-group--horizontal',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

Radio.Group = RadioGroup;
