import type { Meta, StoryObj } from '@storybook/react';
import { StatCard, StatGrid } from './StatGrid';

const meta = {
  title: 'Molecules/StatGrid',
  component: StatGrid,
  tags: ['autodocs'],
} satisfies Meta<typeof StatGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StatGrid>
      <StatCard label="Net Worth" value="$128,400" tone="positive" />
      <StatCard label="Monthly Income" value="$6,200" tone="positive" />
      <StatCard label="Monthly Spending" value="$4,850" tone="negative" />
      <StatCard label="Savings Rate" value="21.8%" tone="positive" />
      <StatCard label="Available Credit" value="$9,400" />
      <StatCard label="Cash Balance" value="$3,120" tone="positive" />
    </StatGrid>
  ),
};
