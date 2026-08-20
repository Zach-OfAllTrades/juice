import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    delayDuration: { control: 'number' },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Realistic given your current time and resources.',
    side: 'top',
    delayDuration: 200,
    children: null,
  },
  render: (args) => (
    <Tooltip {...args}>
      <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>achievable</span>
    </Tooltip>
  ),
};

export const OnAButton: Story = {
  args: { content: 'Save your changes', side: 'top', children: null },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="primary">Save</Button>
    </Tooltip>
  ),
};

export const Sides: Story = {
  args: { content: 'Tooltip content', children: null },
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} content={`Positioned ${side}`} side={side}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};
