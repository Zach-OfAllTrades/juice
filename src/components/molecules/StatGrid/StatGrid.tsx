import type { HTMLAttributes, ReactNode } from 'react';
import './StatGrid.css';

export type StatTone = 'default' | 'positive' | 'negative';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Small label above the value */
  label: ReactNode;
  /** The stat's headline value */
  value: ReactNode;
  /** Color tone for the value, e.g. to flag a positive/negative delta */
  tone?: StatTone;
}

/**
 * StatCard — a single labeled KPI value, meant to be laid out inside a `StatGrid`.
 *
 * @example
 * ```tsx
 * <StatGrid>
 *   <StatCard label="Net Worth" value="$128,400" tone="positive" />
 *   <StatCard label="Available Credit" value="$4,200" />
 * </StatGrid>
 * ```
 */
export function StatCard({
  label,
  value,
  tone = 'default',
  className = '',
  ...props
}: StatCardProps) {
  return (
    <div className={['juice-stat-card', className].filter(Boolean).join(' ')} {...props}>
      <div className="juice-stat-card__label">{label}</div>
      <div
        className={[
          'juice-stat-card__value',
          tone !== 'default' && `juice-stat-card__value--${tone}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </div>
    </div>
  );
}

export interface StatGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * StatGrid — responsive auto-fit grid layout for a row of `StatCard`s.
 * Collapses to 2 columns, then 1, on narrower viewports.
 *
 * @example
 * ```tsx
 * <StatGrid>
 *   <StatCard label="Ending Cash" value="$3,120" />
 *   <StatCard label="Savings Rate" value="18.4%" tone="positive" />
 * </StatGrid>
 * ```
 */
export function StatGrid({ className = '', children, ...props }: StatGridProps) {
  return (
    <div className={['juice-stat-grid', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

StatGrid.Card = StatCard;
