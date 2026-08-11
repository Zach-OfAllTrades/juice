import type { CSSProperties, ElementType, HTMLAttributes } from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps extends HTMLAttributes<HTMLElement> {
  /** Width of the skeleton (CSS value, e.g. '100%', '200px') */
  width?: string | number;
  /** Height of the skeleton (CSS value) */
  height?: string | number;
  /** Border radius override; 'circle' is shorthand for 50% */
  borderRadius?: string;
  /** Shape variant */
  variant?: SkeletonVariant;
  /**
   * Number of skeleton rows to render (stacked with gap).
   * When > 1, renders inside a flex column wrapper.
   */
  count?: number;
  /** Override the rendered HTML element */
  as?: ElementType;
}

/**
 * Skeleton — animated loading placeholder.
 * Drop in wherever content is loading. Fully CSS-driven shimmer.
 *
 * @example
 * ```tsx
 * // Single line
 * <Skeleton variant="text" width="60%" />
 *
 * // Avatar + lines
 * <Skeleton variant="circle" width={48} height={48} />
 * <Skeleton variant="text" width="40%" />
 * <Skeleton variant="text" width="70%" />
 *
 * // Multiple rows
 * <Skeleton count={3} height={16} />
 * ```
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  variant = 'rect',
  count = 1,
  as: Tag = 'span',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const classes = [
    'juice-skeleton',
    variant === 'circle' && 'juice-skeleton--circle',
    variant === 'text' && 'juice-skeleton--text',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inlineStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius,
    ...style,
  };

  const single = (key?: number) => (
    <Tag key={key} className={classes} style={inlineStyle} aria-hidden="true" {...props} />
  );

  if (count === 1) return single();

  return (
    <span className="juice-skeleton-group" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => single(i))}
    </span>
  );
}
