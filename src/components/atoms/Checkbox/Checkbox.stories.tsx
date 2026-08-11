import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    labelPosition: {
      control: 'select',
      options: ['right', 'left', 'top', 'bottom'],
    },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Subscribe to product newsletter',
    labelPosition: 'right',
    defaultChecked: true,
  },
};

export const LabelPositions: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 360 }}>
      <Checkbox label="Label Right (Default)" labelPosition="right" defaultChecked />
      <Checkbox label="Label Left" labelPosition="left" defaultChecked />
      <Checkbox label="Label Top" labelPosition="top" defaultChecked />
      <Checkbox label="Label Bottom" labelPosition="bottom" defaultChecked />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'Two-Factor Authentication (2FA)',
    description: 'Require a secure one-time passcode on every sign-in attempt.',
    defaultChecked: false,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all components',
    description: '3 of 7 items currently selected.',
    indeterminate: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'I accept the Terms of Service',
    error: 'You must accept the terms before creating an account.',
    defaultChecked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Enterprise SSO Enforcement',
    description: 'Managed by organization administrator.',
    disabled: true,
    defaultChecked: true,
  },
};

export const CheckboxGroup: Story = {
  args: {},
  render: () => {
    const [items, setItems] = useState({
      analytics: true,
      marketing: false,
      essential: true,
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--juice-font-sans)' }}>
          Cookie Preferences
        </h4>
        <Checkbox
          label="Essential Cookies"
          description="Required for basic site functionality and security."
          checked={items.essential}
          disabled
        />
        <Checkbox
          label="Analytics & Diagnostics"
          description="Helps us understand component usage patterns."
          checked={items.analytics}
          onChange={(e) => setItems({ ...items, analytics: e.target.checked })}
        />
        <Checkbox
          label="Marketing & Campaigns"
          description="Personalized feature recommendations."
          checked={items.marketing}
          onChange={(e) => setItems({ ...items, marketing: e.target.checked })}
        />
      </div>
    );
  },
};
