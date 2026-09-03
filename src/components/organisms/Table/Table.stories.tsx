import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../atoms/Badge';
import { Table } from './Table';

const meta = {
  title: 'Organisms/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const transactions = [
  { id: '1', name: 'Paycheck', category: 'Income', amount: 2400.0 },
  { id: '2', name: 'Groceries', category: 'Food', amount: -86.42 },
  { id: '3', name: 'Rent', category: 'Housing', amount: -1500.0 },
];

export const Default: Story = {
  render: () => (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Category</Table.HeaderCell>
          <Table.HeaderCell align="right">Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {transactions.map((tx) => (
          <Table.Row key={tx.id}>
            <Table.Cell>{tx.name}</Table.Cell>
            <Table.Cell>
              <Badge>{tx.category}</Badge>
            </Table.Cell>
            <Table.Cell numeric tone={tx.amount < 0 ? 'negative' : 'positive'}>
              {tx.amount.toFixed(2)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Category</Table.HeaderCell>
          <Table.HeaderCell align="right">Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Empty colSpan={3}>No transactions logged this month.</Table.Empty>
      </Table.Body>
    </Table>
  ),
};
