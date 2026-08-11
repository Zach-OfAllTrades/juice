import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { InputStack } from '../../molecules/InputStack';
import { Modal } from './Modal';

const meta = {
  title: 'Organisms/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    showClose: { control: 'boolean' },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Account Settings',
    description: 'Manage your profile details and preferences.',
    showClose: true,
  },
  render: (args) => (
    <Modal
      {...args}
      trigger={<Button variant="primary">Open Modal</Button>}
      footer={
        <>
          <Modal.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Modal.Close>
          <Button variant="primary">Save Changes</Button>
        </>
      }
    >
      <p>Your account is currently active. Changes made here will take effect immediately.</p>
    </Modal>
  ),
};

export const WithForm: Story = {
  args: {
    title: 'Create Project',
    description: 'Deploy a new agnostic design system in seconds.',
  },
  render: (args) => (
    <Modal
      {...args}
      trigger={<Button variant="primary">New Project</Button>}
      footer={
        <>
          <Modal.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Modal.Close>
          <Button variant="primary">Create</Button>
        </>
      }
    >
      <InputStack>
        <Input label="Project Name" placeholder="e.g. Acme UI" required />
        <Input
          label="Repository Slug"
          placeholder="acme-ui"
          helperText="Unique identifier for package distribution."
        />
      </InputStack>
    </Modal>
  ),
};

export const DestructiveConfirmation: Story = {
  args: {
    title: 'Delete Repository',
    description:
      'Are you sure you want to permanently delete this repository? This action cannot be undone.',
  },
  render: (args) => (
    <Modal
      {...args}
      trigger={<Button variant="danger">Delete Repository</Button>}
      footer={
        <>
          <Modal.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Modal.Close>
          <Button variant="danger">Yes, Delete</Button>
        </>
      }
    >
      <p style={{ fontSize: '0.875rem', color: 'var(--juice-color-text-subtle)' }}>
        All branches, issues, pull requests, and automated workflows will be immediately and
        irreversibly erased.
      </p>
    </Modal>
  ),
};

export const ControlledState: Story = {
  args: {},
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem' }}>Modal state is open: {open ? 'true' : 'false'}</p>
        <Button onClick={() => setOpen(true)}>Open Programmatically</Button>

        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Controlled Dialog"
          description="This dialog is controlled via React useState."
          footer={
            <Button variant="primary" onClick={() => setOpen(false)}>
              Got it
            </Button>
          }
        >
          <p>Controlled modals allow fine-grained lifecycle handling and form submission flows.</p>
        </Modal>
      </div>
    );
  },
};

export const CompoundComposition: Story = {
  args: {},
  render: () => (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary">Custom Compound Modal</Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Compound Component API</Modal.Title>
          <Modal.Description>
            You can compose Modal.Root, Modal.Trigger, Modal.Header, Modal.Body, and Modal.Footer
            directly.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body>
          <p>
            This offers full JSX structural flexibility for specialized headers, multi-step wizards,
            or custom toolbars.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="primary">Close</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  ),
};
