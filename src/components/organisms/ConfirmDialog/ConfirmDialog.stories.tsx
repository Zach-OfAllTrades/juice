import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Textarea } from '../../atoms/Textarea';
import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'Organisms/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    cancelLabel: { control: 'text' },
    confirmLabel: { control: 'text' },
    tone: { control: 'select', options: ['default', 'danger'] },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Log out?',
    description: "You'll need to sign in again to access your account.",
    confirmLabel: 'Log out',
  },
  render: (args) => (
    <ConfirmDialog {...args} trigger={<Button variant="secondary">Log out</Button>} />
  ),
};

export const Destructive: Story = {
  args: {
    title: 'Delete this task?',
    description: 'This action cannot be undone.',
    tone: 'danger',
    confirmLabel: 'Delete',
  },
  render: (args) => (
    <ConfirmDialog {...args} trigger={<Button variant="danger">Delete task</Button>} />
  ),
};

export const WithReasonField: Story = {
  args: {
    title: 'Skip this block?',
    description: 'Let your team know why — this helps improve future scheduling.',
    tone: 'danger',
    confirmLabel: 'Skip',
  },
  render: (args) => {
    const [reason, setReason] = useState('');

    return (
      <ConfirmDialog
        {...args}
        trigger={<Button variant="danger-ghost">Skip block</Button>}
        onConfirm={() => alert(`Skipped. Reason: ${reason || '(none provided)'}`)}
      >
        <Textarea
          label="Reason (optional)"
          placeholder="e.g. Meeting ran long"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </ConfirmDialog>
    );
  },
};

export const ControlledState: Story = {
  args: {},
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem' }}>Dialog state is open: {open ? 'true' : 'false'}</p>
        <Button onClick={() => setOpen(true)}>Open Programmatically</Button>

        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Discard changes?"
          description="Unsaved edits will be lost."
          confirmLabel="Discard"
          tone="danger"
          onConfirm={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const CompoundComposition: Story = {
  args: {},
  render: () => (
    <ConfirmDialog.Root>
      <ConfirmDialog.Trigger asChild>
        <Button variant="ghost">Custom Compound Dialog</Button>
      </ConfirmDialog.Trigger>
      <ConfirmDialog.Content>
        <ConfirmDialog.Header>
          <ConfirmDialog.Title>Compound Component API</ConfirmDialog.Title>
          <ConfirmDialog.Description>
            You can compose ConfirmDialog.Root, ConfirmDialog.Content, ConfirmDialog.Cancel, and
            ConfirmDialog.Action directly for full structural control.
          </ConfirmDialog.Description>
        </ConfirmDialog.Header>
        <ConfirmDialog.Footer>
          <ConfirmDialog.Cancel>Back</ConfirmDialog.Cancel>
          <ConfirmDialog.Action tone="danger">Proceed</ConfirmDialog.Action>
        </ConfirmDialog.Footer>
      </ConfirmDialog.Content>
    </ConfirmDialog.Root>
  ),
};
