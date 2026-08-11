import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Renders as an icon-only button (square aspect ratio) */
  iconOnly?: boolean;
  /** Shows a loading spinner and disables interaction */
  loading?: boolean;
  /** Expands button to full container width */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

/**
 * Button — native `<button>` wrapper with design token styling.
 *
 * No JS logic beyond what the browser provides.
 * All state (disabled, loading) is communicated to assistive technology
 * via native HTML attributes and ARIA.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('saved')}>
 *   Save changes
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'juice-btn',
    `juice-btn--${variant}`,
    `juice-btn--${size}`,
    iconOnly && 'juice-btn--icon',
    loading && 'juice-btn--loading',
    fullWidth && 'juice-btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {children}
    </button>
  );
}
