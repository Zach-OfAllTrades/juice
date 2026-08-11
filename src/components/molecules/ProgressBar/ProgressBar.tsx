import { type HTMLAttributes, useId } from 'react';
import './ProgressBar.css';

export type ProgressVariant = 'brand' | 'success' | 'warning' | 'danger';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Numeric progress value (0 to max) */
  value?: number;
  /** Maximum progress value (default: 100) */
  max?: number;
  /** Visible label above the bar */
  label?: string;
  /** Show the numeric percentage value */
  showValueText?: boolean;
  /** Visual semantic variant */
  variant?: ProgressVariant;
  /** Indeterminate loading mode (continuous animated pulse) */
  indeterminate?: boolean;
}

/**
 * ProgressBar — accessible progress indicator.
 *
 * Exposes full ARIA progress attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
 *
 * @example
 * ```tsx
 * <ProgressBar label="Uploading file" value={65} showValueText />
 * ```
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValueText = false,
  variant = 'brand',
  indeterminate = false,
  className = '',
  ...props
}: ProgressBarProps) {
  const autoId = useId();
  const labelId = label ? `${autoId}-label` : undefined;

  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={['juice-progress-wrapper', className].filter(Boolean).join(' ')} {...props}>
      {(label || showValueText) && (
        <div className="juice-progress-header">
          {label && <span id={labelId}>{label}</span>}
          {showValueText && !indeterminate && (
            <span className="juice-progress-value-text">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuenow={indeterminate ? undefined : Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        className="juice-progress-track"
      >
        <div
          className={[
            'juice-progress-bar',
            `juice-progress-bar--${variant}`,
            indeterminate && 'juice-progress-bar--indeterminate',
          ]
            .filter(Boolean)
            .join(' ')}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
