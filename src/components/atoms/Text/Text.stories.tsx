import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta = {
  title: 'Atoms/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl'],
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
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Everything's placed." },
};

export const Muted: Story = {
  args: { tone: 'muted', children: 'No tasks scheduled for today.' },
};

export const AllSizes: Story = {
  args: { children: 'Text' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Text size="xs">Extra small text</Text>
      <Text size="sm">Small text</Text>
      <Text size="base">Base text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>
      <Text size="2xl">2XL text</Text>
    </div>
  ),
};

export const AllTones: Story = {
  args: { children: 'Text' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Text tone="default">Default tone</Text>
      <Text tone="muted">Muted tone</Text>
      <Text tone="danger">Danger tone</Text>
      <Text tone="success">Success tone</Text>
    </div>
  ),
};

export const PolymorphicAs: Story = {
  args: { children: 'Text' },
  render: () => (
    <p>
      Inline{' '}
      <Text as="span" weight="semibold" tone="danger">
        overdue
      </Text>{' '}
      label rendered as a span inside a paragraph.
    </p>
  ),
};
