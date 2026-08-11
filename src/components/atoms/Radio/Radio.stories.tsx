import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup } from './Radio';

const meta = {
  title: 'Atoms/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    labelPosition: {
      control: 'select',
      options: ['right', 'left', 'top', 'bottom'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'sample',
    value: 'option1',
    label: 'Standard option',
    labelPosition: 'right',
    defaultChecked: true,
  },
};

export const LabelPositions: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 360 }}>
      <Radio
        name="pos"
        value="r"
        label="Label Right (Default)"
        labelPosition="right"
        defaultChecked
      />
      <Radio name="pos" value="l" label="Label Left" labelPosition="left" />
      <Radio name="pos" value="t" label="Label Top" labelPosition="top" />
      <Radio name="pos" value="b" label="Label Bottom" labelPosition="bottom" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    name: 'sample',
    value: 'option2',
    label: 'Developer Tier',
    description: 'Up to 10,000 API requests per day with community support.',
    defaultChecked: false,
  },
};

export const VerticalGroup: Story = {
  args: {},
  render: () => {
    const [selected, setSelected] = useState('monthly');

    return (
      <div style={{ maxWidth: 360 }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            fontFamily: 'var(--juice-font-sans)',
          }}
        >
          Billing Frequency
        </h4>
        <RadioGroup>
          <Radio
            name="billing"
            value="monthly"
            checked={selected === 'monthly'}
            onChange={() => setSelected('monthly')}
            label="Monthly billing"
            description="$29 billed every month."
          />
          <Radio
            name="billing"
            value="annual"
            checked={selected === 'annual'}
            onChange={() => setSelected('annual')}
            label="Annual billing (Save 20%)"
            description="$278 billed once a year."
          />
          <Radio
            name="billing"
            value="enterprise"
            disabled
            label="Custom Enterprise Contract"
            description="Contact sales for custom invoicing."
          />
        </RadioGroup>
      </div>
    );
  },
};

export const HorizontalGroup: Story = {
  args: {},
  render: () => {
    const [size, setSize] = useState('md');

    return (
      <div>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            fontFamily: 'var(--juice-font-sans)',
          }}
        >
          Size Preference
        </h4>
        <RadioGroup orientation="horizontal">
          <Radio
            name="size"
            value="sm"
            checked={size === 'sm'}
            onChange={() => setSize('sm')}
            label="Small"
          />
          <Radio
            name="size"
            value="md"
            checked={size === 'md'}
            onChange={() => setSize('md')}
            label="Medium"
          />
          <Radio
            name="size"
            value="lg"
            checked={size === 'lg'}
            onChange={() => setSize('lg')}
            label="Large"
          />
        </RadioGroup>
      </div>
    );
  },
};
