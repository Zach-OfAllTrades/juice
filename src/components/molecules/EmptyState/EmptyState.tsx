import type { HTMLAttributes, ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Decorative icon/emoji rendered above the title */
  icon?: ReactNode;
  /** Short headline describing the empty condition */
  title: ReactNode;
  /** Supporting copy explaining what to do next */
  description?: ReactNode;
  /** Primary call-to-action, typically a `Button` */
  action?: ReactNode;
}

/**
 * EmptyState — centered placeholder for a list/table/section with no data yet.
 *
 * Purely presentational; pair with a `Button` via `action` to prompt the
 * first piece of data entry.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="📋"
 *   title="No budgets configured"
 *   description="Create budgets for each spending category to track your progress."
 *   action={<Button variant="primary">+ Set Budget</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}: EmptyStateProps) {
  return (
    <div className={['juice-empty-state', className].filter(Boolean).join(' ')} {...props}>
      {icon && (
        <div className="juice-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="juice-empty-state__title">{title}</div>
      {description && <div className="juice-empty-state__description">{description}</div>}
      {action && <div className="juice-empty-state__action">{action}</div>}
    </div>
  );
}
