import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Molecules/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    variant: { control: 'select', options: ['brand', 'success', 'warning', 'danger'] },
    indeterminate: { control: 'boolean' },
    showValueText: { control: 'boolean' },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Deployment progress',
    value: 60,
    showValueText: true,
  },
  render: (args) => (
    <div style={{ width: 340 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

export const Variants: Story = {
  args: {},
  render: () => (
    <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ProgressBar label="Brand / Default" value={45} variant="brand" showValueText />
      <ProgressBar label="Completed Tasks" value={100} variant="success" showValueText />
      <ProgressBar label="Storage Quota" value={82} variant="warning" showValueText />
      <ProgressBar label="Critical CPU Load" value={94} variant="danger" showValueText />
    </div>
  ),
};

export const Indeterminate: Story = {
  args: {
    label: 'Connecting to cluster…',
    indeterminate: true,
  },
  render: (args) => (
    <div style={{ width: 340 }}>
      <ProgressBar {...args} />
    </div>
  ),
};
