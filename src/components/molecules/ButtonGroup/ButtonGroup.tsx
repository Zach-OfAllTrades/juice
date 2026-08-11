import type { HTMLAttributes, ReactNode } from 'react';
import './ButtonGroup.css';

export type ButtonGroupVariant = 'segmented' | 'spaced' | 'stacked';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual arrangement mode */
  variant?: ButtonGroupVariant;
  /** Accessible label for the button group */
  label?: string;
  children: ReactNode;
}

/**
 * ButtonGroup — semantic `<div role="group">` wrapper for button clusters.
 *
 * @example
 * ```tsx
 * <ButtonGroup variant="segmented" label="View Mode">
 *   <Button variant="secondary">Day</Button>
 *   <Button variant="primary">Week</Button>
 *   <Button variant="secondary">Month</Button>
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  variant = 'spaced',
  label,
  className = '',
  children,
  ...props
}: ButtonGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA button group pattern uses role="group"
    <div
      role="group"
      aria-label={label}
      className={['juice-button-group', `juice-button-group--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
