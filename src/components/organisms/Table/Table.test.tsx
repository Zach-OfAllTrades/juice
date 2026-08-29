import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table } from './Table';

describe('Table', () => {
  it('renders header and body cells', () => {
    render(
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell align="right">Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Groceries</Table.Cell>
            <Table.Cell numeric tone="negative">
              -42.50
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('-42.50')).toBeInTheDocument();
  });

  it('applies alignment and numeric/tone modifier classes', () => {
    render(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell numeric tone="positive" data-testid="cell">
              12.00
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const cell = screen.getByTestId('cell');
    expect(cell.className).toContain('juice-table-cell--numeric');
    expect(cell.className).toContain('juice-table-cell--positive');
    expect(cell.className).toContain('juice-table-cell--right');
  });

  it('renders an empty-state row spanning all columns', () => {
    render(
      <Table>
        <Table.Body>
          <Table.Empty colSpan={2}>No rows yet.</Table.Empty>
        </Table.Body>
      </Table>
    );

    const cell = screen.getByText('No rows yet.');
    expect(cell.closest('td')).toHaveAttribute('colSpan', '2');
  });
});
