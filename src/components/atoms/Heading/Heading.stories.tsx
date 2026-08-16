import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Heading';

const meta = {
  title: 'Atoms/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    weight: {
      control: 'select',
      options: ['regular', 'medium', 'semibold', 'bold'],
    },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'danger', 'success'],
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { level: 1, children: 'Account Settings' },
};

export const AllLevels: Story = {
  args: { children: 'Heading' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
      <Heading level={6}>Heading level 6</Heading>
    </div>
  ),
};

export const MutedSubheading: Story = {
  args: { level: 3, tone: 'muted', children: 'Recent activity' },
};

export const SizeOverride: Story = {
  args: {
    level: 2,
    size: 'base',
    children: 'A level-2 heading (semantic <h2>) sized down to base',
  },
};
