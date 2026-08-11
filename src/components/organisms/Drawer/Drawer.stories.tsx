import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { InputStack } from '../../molecules/InputStack';
import { Drawer } from './Drawer';

const meta = {
  title: 'Organisms/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['bottom', 'right', 'left'] },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomSheet: Story = {
  args: {
    side: 'bottom',
    title: 'Share Document',
    description: 'Anyone with the link will be able to view this file.',
  },
  render: (args) => (
    <Drawer
      {...args}
      trigger={<Button variant="primary">Open Bottom Sheet</Button>}
      footer={
        <>
          <Drawer.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Drawer.Close>
          <Button variant="primary">Copy Link</Button>
        </>
      }
    >
      <InputStack>
        <Input label="Shareable URL" defaultValue="https://juice-ui.dev/s/7f8a9b" readOnly />
      </InputStack>
    </Drawer>
  ),
};

export const RightSlideOver: Story = {
  args: {
    side: 'right',
    title: 'Filter Results',
    description: 'Narrow down component listings by tags.',
  },
  render: (args) => (
    <Drawer
      {...args}
      trigger={<Button variant="secondary">Open Slide-Over</Button>}
      footer={
        <>
          <Drawer.Close asChild>
            <Button variant="ghost">Reset</Button>
          </Drawer.Close>
          <Button variant="primary">Apply Filters</Button>
        </>
      }
    >
      <InputStack>
        <Input label="Search query" placeholder="e.g. Radix primitives" />
        <Input label="Author" placeholder="e.g. Zach" />
      </InputStack>
    </Drawer>
  ),
};
