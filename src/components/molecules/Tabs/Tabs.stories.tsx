import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { InputStack } from '../InputStack';
import { Tabs } from './Tabs';

const meta = {
  title: 'Molecules/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pill'] },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  {
    value: 'profile',
    label: 'Profile',
    content: (
      <InputStack style={{ maxWidth: 360 }}>
        <Input label="Display Name" defaultValue="Zach Rose" />
        <Input label="Email" defaultValue="zach@example.com" />
        <Button variant="primary">Save Changes</Button>
      </InputStack>
    ),
  },
  {
    value: 'security',
    label: 'Security',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
        <h4 style={{ fontWeight: 600 }}>Password & Authentication</h4>
        <p style={{ color: 'var(--juice-color-text-subtle)', fontSize: '0.875rem' }}>
          Manage your active API tokens and authentication credentials.
        </p>
        <Button variant="secondary">Generate New Token</Button>
      </div>
    ),
  },
  {
    value: 'billing',
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        Billing <Badge variant="brand">Pro</Badge>
      </span>
    ),
    content: (
      <p style={{ color: 'var(--juice-color-text-subtle)', fontSize: '0.875rem' }}>
        You are currently on the Pro plan with automatic monthly renewal.
      </p>
    ),
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    disabled: true,
    content: <p>Enterprise features.</p>,
  },
];

export const Underline: Story = {
  args: {
    variant: 'underline',
    items: sampleTabs,
    defaultValue: 'profile',
  },
};

export const Pill: Story = {
  args: {
    variant: 'pill',
    items: sampleTabs,
    defaultValue: 'profile',
  },
};

export const CompoundAPI: Story = {
  args: {},
  render: () => (
    <Tabs.Root defaultValue="tab1" style={{ maxWidth: 400 }}>
      <Tabs.List variant="pill">
        <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Analytics</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Reports</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <p style={{ padding: '1rem 0' }}>Dashboard overview metrics.</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <p style={{ padding: '1rem 0' }}>Traffic analytics and visitor charts.</p>
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <p style={{ padding: '1rem 0' }}>Exportable weekly and monthly reports.</p>
      </Tabs.Content>
    </Tabs.Root>
  ),
};
