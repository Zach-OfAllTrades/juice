import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import './Text.css';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'muted' | 'danger' | 'success';

export interface TextOwnProps {
  /** Element (or component) to render as. Defaults to `p`. */
  as?: ElementType;
  /** Font size, mapped to `--juice-text-*` tokens */
  size?: TextSize;
  /** Font weight, mapped to `--juice-weight-*` tokens */
  weight?: TextWeight;
  /** Color tone, mapped to `--juice-color-text-*` / semantic color tokens */
  tone?: TextTone;
  className?: string;
  children: ReactNode;
}

export type TextProps<T extends ElementType = 'p'> = TextOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps>;

/**
 * Text — typography atom for body copy, styled entirely from design tokens.
 *
 * Polymorphic via `as` — renders as any element or component (`span`, `div`,
 * `label`, a router `Link`, …) while keeping the same size/weight/tone API.
 *
 * @example
 * ```tsx
 * <Text tone="muted">Everything's placed.</Text>
 * <Text as="span" size="sm" weight="medium">Due tomorrow</Text>
 * ```
 */
export function Text<T extends ElementType = 'p'>({
  as,
  size = 'base',
  weight = 'regular',
  tone = 'default',
  className = '',
  children,
  ...props
}: TextProps<T>) {
  const Component = (as ?? 'p') as ElementType;
  const classes = [
    'juice-text',
    `juice-text--${size}`,
    `juice-text--${weight}`,
    `juice-text--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...(props as Record<string, unknown>)}>
      {children}
    </Component>
  );
}
