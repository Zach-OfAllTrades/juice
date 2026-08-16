import type { HTMLAttributes, ReactNode } from 'react';
import './Row.css';

/* ── Compound Sub-components ───────────────────────────────── */

export function RowContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-row-content ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function RowTitle({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`juice-row-title ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function RowMeta({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`juice-row-meta ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function RowActions({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`juice-row-actions ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/* ── Declarative Row ────────────────────────────────────────── */
export type RowVariant = 'plain' | 'card';

export interface RowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Visual surface. 'plain' (default) is a bare row meant to sit inside
   * something else — a `Card`, a bordered list wrapper — with a divider
   * between consecutive rows stacked directly. 'card' makes the row a
   * self-contained bordered/padded surface for when each row needs to read
   * as its own separate card in a list, without wrapping it in `Card`
   * yourself; stack multiple with your own gap (e.g. a flex column), not a
   * divider, since they're meant to look like separate cards.
   */
  variant?: RowVariant;
  /** Add interactive hover elevation (only visible on the 'card' variant) */
  interactive?: boolean;
  /** Primary row title, rendered on the left */
  title?: ReactNode;
  /** Optional subtitle/meta text rendered below the title */
  meta?: ReactNode;
  /** Trailing action button(s), rendered on the right (e.g. a `ButtonGroup`) */
  actions?: ReactNode;
  /** Additional content rendered below title/meta, or used instead of them for full composition */
  children?: ReactNode;
}

/**
 * Row — the common "title (+ optional subtitle/meta) on the left, trailing
 * actions on the right" list-item layout molecule.
 *
 * Purely a layout wrapper — no interactive/ARIA behavior of its own beyond
 * the optional hover elevation. Pairs naturally as `Card` body content for a
 * list of rows inside one shared card (variant="plain", the default), stands
 * on its own as a self-contained bordered surface (variant="card"), or
 * stacks standalone as a simple divided list (consecutive plain `Row`s get a
 * divider).
 *
 * @example
 * ```tsx
 * <Row
 *   variant="card"
 *   title="Finish quarterly report"
 *   meta="Due tomorrow"
 *   actions={
 *     <ButtonGroup variant="spaced">
 *       <Button variant="ghost" size="sm">Snooze</Button>
 *       <Button variant="danger-ghost" size="sm">Delete</Button>
 *     </ButtonGroup>
 *   }
 * />
 * ```
 */
export function Row({
  variant = 'plain',
  interactive = false,
  title,
  meta,
  actions,
  className = '',
  children,
  ...props
}: RowProps) {
  const hasContent = Boolean(title || meta || children);

  return (
    <div
      className={[
        'juice-row',
        `juice-row--${variant}`,
        interactive && 'juice-row--interactive',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {hasContent && (
        <RowContent>
          {title && <RowTitle>{title}</RowTitle>}
          {meta && <RowMeta>{meta}</RowMeta>}
          {children}
        </RowContent>
      )}
      {actions && <RowActions>{actions}</RowActions>}
    </div>
  );
}

/* Attach compound slots */
Row.Content = RowContent;
Row.Title = RowTitle;
Row.Meta = RowMeta;
Row.Actions = RowActions;
