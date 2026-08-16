import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Form } from '../Form';
import { TimePicker } from './TimePicker';
import type { TimeValue } from './TimePicker.utils';

const meta = {
  title: 'Organisms/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  argTypes: {
    format: { control: 'select', options: ['12h', '24h'] },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    error: { control: 'boolean' },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: { hour: 9, minute: 30, period: 'AM' },
  },
};

export const EmptyByDefault: Story = {
  args: {
    defaultValue: null,
    placeholder: 'Select a time',
  },
};

export const Format24h: Story = {
  args: {
    format: '24h',
    defaultValue: { hour: 14, minute: 30 },
  },
};

export const SteppedMinutes: Story = {
  name: '15-minute steps',
  args: {
    step: 15,
    defaultValue: { hour: 9, minute: 0, period: 'AM' },
  },
};

export const BoundedRange: Story = {
  name: 'Bounded to business hours (9-5)',
  args: {
    format: '24h',
    defaultValue: { hour: 12, minute: 0 },
    minTime: { hour: 9, minute: 0 },
    maxTime: { hour: 17, minute: 0 },
  },
};

export const DisabledSlots: Story = {
  name: 'Disabled slots (lunch block)',
  args: {
    format: '24h',
    defaultValue: { hour: 12, minute: 0 },
    isTimeDisabled: (value: TimeValue) => value.hour === 12,
  },
};

export const ErrorState: Story = {
  args: {
    defaultValue: null,
    error: true,
    placeholder: 'Select a time',
  },
};

export const DisabledState: Story = {
  args: {
    defaultValue: { hour: 9, minute: 0, period: 'AM' },
    disabled: true,
  },
};

export const ReadOnlyState: Story = {
  args: {
    defaultValue: { hour: 9, minute: 0, period: 'AM' },
    readOnly: true,
  },
};

export const ControlledState: Story = {
  args: { children: null },
  render: () => {
    const [value, setValue] = useState<TimeValue | null>({ hour: 9, minute: 0, period: 'AM' });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'start' }}>
        <p style={{ fontSize: '0.875rem' }}>
          Value:{' '}
          {value
            ? `${value.hour}:${String(value.minute).padStart(2, '0')} ${value.period}`
            : 'null'}
        </p>
        <TimePicker value={value} onChange={setValue} />
        <Button variant="ghost" size="sm" onClick={() => setValue(null)}>
          Reset from outside
        </Button>
      </div>
    );
  },
};

export const InsideForm: Story = {
  args: { children: null },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Form onSubmit={(e) => e.preventDefault()}>
        <div className="juice-input-wrapper">
          <span className="juice-label">Meeting time</span>
          <TimePicker
            name="meetingTime"
            defaultValue={{ hour: 9, minute: 0, period: 'AM' }}
            placeholder="Select a time"
          />
        </div>
        <Form.Actions>
          <Button type="submit" variant="primary">
            Schedule
          </Button>
        </Form.Actions>
      </Form>
    </div>
  ),
};

export const CompoundComposition: Story = {
  args: { children: null },
  render: () => (
    <TimePicker.Root defaultValue={{ hour: 9, minute: 0, period: 'AM' }} format="12h">
      <TimePicker.Trigger placeholder="Select a time" />
      <TimePicker.Content />
    </TimePicker.Root>
  ),
};
