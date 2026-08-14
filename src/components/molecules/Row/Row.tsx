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
export interface RowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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
 * Purely a layout wrapper — no interactive/ARIA behavior of its own. Pairs
 * naturally as `Card` body content for a list of rows inside a card, or
 * stacked standalone as a simple list (consecutive `Row`s get a divider).
 *
 * @example
 * ```tsx
 * <Row
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
export function Row({ title, meta, actions, className = '', children, ...props }: RowProps) {
  const hasContent = Boolean(title || meta || children);

  return (
    <div className={['juice-row', className].filter(Boolean).join(' ')} {...props}>
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
