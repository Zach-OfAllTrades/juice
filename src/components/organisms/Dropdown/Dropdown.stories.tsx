import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../atoms/Button';
import { Dropdown } from './Dropdown';

const meta = {
  title: 'Organisms/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button variant="secondary">Options ▾</Button>,
    items: [
      { label: 'View Profile', shortcut: '⌘P' },
      { label: 'Billing & Invoices', shortcut: '⌘B' },
      { label: 'Team Settings', separatorAfter: true },
      { label: 'Sign out', variant: 'danger' },
    ],
  },
};

export const CompoundMenu: Story = {
  args: {
    trigger: <div />,
    items: [],
  },
  render: () => (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button variant="primary">Manage Project</Button>
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Label>Project Controls</Dropdown.Label>
        <Dropdown.Item>Edit metadata</Dropdown.Item>
        <Dropdown.Item>Duplicate workflow</Dropdown.Item>
        <Dropdown.Separator />
        <Dropdown.Label>Danger Zone</Dropdown.Label>
        <Dropdown.Item variant="danger">Archive project</Dropdown.Item>
        <Dropdown.Item variant="danger">Delete permanently</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
};
