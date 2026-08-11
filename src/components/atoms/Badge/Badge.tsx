import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic color variant */
  variant?: BadgeVariant;
  /** Show a small status dot before the label */
  dot?: boolean;
  children: ReactNode;
}

/**
 * Badge — inline status indicator built on a native `<span>`.
 * Purely presentational; no JavaScript logic.
 *
 * @example
 * ```tsx
 * <Badge variant="success" dot>Active</Badge>
 * <Badge variant="danger">Overdue</Badge>
 * ```
 */
export function Badge({
  variant = 'default',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const classes = ['juice-badge', `juice-badge--${variant}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {dot && <span className="juice-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
