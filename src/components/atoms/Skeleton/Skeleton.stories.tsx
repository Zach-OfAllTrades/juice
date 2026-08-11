import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['rect', 'circle', 'text'] },
    count: { control: { type: 'number', min: 1, max: 10 } },
    width: { control: 'text' },
    height: { control: 'text' },
    // 'as' is a polymorphic element type — not suitable for Storybook controls
    as: { control: false, table: { disable: true } },
  },
  // Provide a container so width: 100% stories have a sensible reference
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single text-line skeleton — the most common usage. */
export const TextLine: Story = {
  args: { variant: 'text', width: '60%' },
};

/** A block rectangle — use for image or card thumbnails. */
export const Rect: Story = {
  args: { height: 120 },
};

/** A circle — use for avatars and icons. */
export const Circle: Story = {
  args: { variant: 'circle', width: 48, height: 48 },
};

/** Use `count` to render multiple stacked rows. */
export const MultipleRows: Story = {
  args: { variant: 'text', count: 4, width: '80%' },
};

/** A realistic card loading state composed from multiple Skeletons. */
export const CardPlaceholder: Story = {
  args: { variant: 'rect' },
  render: () => (
    <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height={160} />
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Skeleton variant="circle" width={40} height={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="85%" />
      <Skeleton variant="text" width="60%" />
    </div>
  ),
};
