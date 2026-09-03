import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../atoms/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: '📋',
    title: 'No budgets configured',
    description: 'Create budgets for each spending category to track your progress.',
  },
};

export const WithAction: Story = {
  args: {
    icon: '💳',
    title: 'No transactions yet',
    description: 'Add your first transaction to start tracking spending.',
    action: <Button variant="primary">+ Add Transaction</Button>,
  },
};

export const TitleOnly: Story = {
  args: {
    icon: '🎯',
    title: 'No savings goals',
  },
};
