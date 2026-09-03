import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import './Table.css';

export type TableAlign = 'left' | 'center' | 'right';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

/**
 * Table — data grid organism for CRUD list screens, with header/body/row/cell
 * slots and an empty-state row.
 *
 * @example
 * ```tsx
 * <Table>
 *   <Table.Head>
 *     <Table.Row>
 *       <Table.HeaderCell>Name</Table.HeaderCell>
 *       <Table.HeaderCell align="right">Amount</Table.HeaderCell>
 *     </Table.Row>
 *   </Table.Head>
 *   <Table.Body>
 *     {rows.length === 0 ? (
 *       <Table.Empty colSpan={2}>No rows yet.</Table.Empty>
 *     ) : (
 *       rows.map((row) => (
 *         <Table.Row key={row.id}>
 *           <Table.Cell>{row.name}</Table.Cell>
 *           <Table.Cell numeric tone={row.amount < 0 ? 'negative' : 'positive'}>
 *             {row.amount}
 *           </Table.Cell>
 *         </Table.Row>
 *       ))
 *     )}
 *   </Table.Body>
 * </Table>
 * ```
 */
export function Table({ className = '', children, ...props }: TableProps) {
  return (
    <div className="juice-table-wrapper">
      <table className={['juice-table', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`juice-table-head ${className}`.trim()} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`juice-table-body ${className}`.trim()} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`juice-table-row ${className}`.trim()} {...props}>
      {children}
    </tr>
  );
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlign;
}

export function TableHeaderCell({
  align = 'left',
  className = '',
  children,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={[
        'juice-table-header-cell',
        align !== 'left' && `juice-table-header-cell--${align}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </th>
  );
}

export type TableCellTone = 'positive' | 'negative';

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlign;
  /** Right-aligned, tabular/mono formatting for numbers and currency */
  numeric?: boolean;
  tone?: TableCellTone;
}

export function TableCell({
  align,
  numeric = false,
  tone,
  className = '',
  children,
  ...props
}: TableCellProps) {
  const resolvedAlign = align ?? (numeric ? 'right' : 'left');
  return (
    <td
      className={[
        'juice-table-cell',
        numeric && 'juice-table-cell--numeric',
        resolvedAlign !== 'left' && `juice-table-cell--${resolvedAlign}`,
        tone && `juice-table-cell--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </td>
  );
}

export interface TableEmptyProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Number of columns to span, so the message centers across the full table width */
  colSpan: number;
  children: ReactNode;
}

export function TableEmpty({ colSpan, className = '', children, ...props }: TableEmptyProps) {
  return (
    <tr className="juice-table-empty-row">
      <td colSpan={colSpan} className={`juice-table-empty-cell ${className}`.trim()} {...props}>
        {children}
      </td>
    </tr>
  );
}

/* Attach compound slots */
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;
Table.Empty = TableEmpty;
