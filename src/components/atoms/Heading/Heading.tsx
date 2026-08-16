import type { HTMLAttributes, ReactNode } from 'react';
import './Heading.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type HeadingWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type HeadingTone = 'default' | 'muted' | 'danger' | 'success';

const LEVEL_TAG = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

const LEVEL_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'base',
  5: 'sm',
  6: 'xs',
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level 1–6 — maps to the `<h1>`–`<h6>` tag and a default size */
  level?: HeadingLevel;
  /** Override the level's default font size, mapped to `--juice-text-*` tokens */
  size?: HeadingSize;
  /** Font weight, mapped to `--juice-weight-*` tokens */
  weight?: HeadingWeight;
  /** Color tone, mapped to `--juice-color-text-*` / semantic color tokens */
  tone?: HeadingTone;
  children: ReactNode;
}

/**
 * Heading — typography atom for section/page headings, styled entirely from
 * design tokens. `level` controls both the semantic tag (`h1`–`h6`) and the
 * default size; pass `size` separately when the visual hierarchy shouldn't
 * match the document outline.
 *
 * @example
 * ```tsx
 * <Heading level={1}>Account Settings</Heading>
 * <Heading level={3} tone="muted">Recent activity</Heading>
 * ```
 */
export function Heading({
  level = 2,
  size,
  weight = 'semibold',
  tone = 'default',
  className = '',
  children,
  ...props
}: HeadingProps) {
  const Component = LEVEL_TAG[level];
  const resolvedSize = size ?? LEVEL_SIZE[level];

  const classes = [
    'juice-heading',
    `juice-heading--${resolvedSize}`,
    `juice-heading--${weight}`,
    `juice-heading--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
