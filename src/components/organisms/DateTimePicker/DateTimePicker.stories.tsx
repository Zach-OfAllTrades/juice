import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Form } from '../Form';
import { DateTimePicker } from './DateTimePicker';
import type { DateTimeValue } from './DateTimePicker.utils';

const meta = {
  title: 'Organisms/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  argTypes: {
    format: { control: 'select', options: ['12h', '24h'] },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    error: { control: 'boolean' },
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: { month: 6, day: 15, year: 2026, hour: 9, minute: 30, period: 'AM' },
  },
};

export const EmptyByDefault: Story = {
  args: {
    defaultValue: null,
    placeholder: 'Select a date and time',
  },
};

export const Format24h: Story = {
  args: {
    format: '24h',
    defaultValue: { month: 6, day: 15, year: 2026, hour: 14, minute: 30 },
  },
};

export const SteppedMinutes: Story = {
  name: '15-minute steps',
  args: {
    step: 15,
    defaultValue: { month: 6, day: 15, year: 2026, hour: 9, minute: 0, period: 'AM' },
  },
};

export const BoundedRange: Story = {
  name: 'Bounded to business hours, this week',
  args: {
    format: '24h',
    defaultValue: { month: 1, day: 14, year: 2026, hour: 12, minute: 0 },
    minDateTime: { month: 1, day: 12, year: 2026, hour: 9, minute: 0 },
    maxDateTime: { month: 1, day: 16, year: 2026, hour: 17, minute: 0 },
  },
};

export const ErrorState: Story = {
  args: {
    defaultValue: null,
    error: true,
    placeholder: 'Select a date and time',
  },
};

export const DisabledState: Story = {
  args: {
    defaultValue: { month: 1, day: 1, year: 2026, hour: 9, minute: 0, period: 'AM' },
    disabled: true,
  },
};

export const ReadOnlyState: Story = {
  args: {
    defaultValue: { month: 1, day: 1, year: 2026, hour: 9, minute: 0, period: 'AM' },
    readOnly: true,
  },
};

export const ControlledState: Story = {
  args: { children: null },
  render: () => {
    const [value, setValue] = useState<DateTimeValue | null>({
      month: 1,
      day: 1,
      year: 2026,
      hour: 9,
      minute: 0,
      period: 'AM',
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'start' }}>
        <p style={{ fontSize: '0.875rem' }}>
          Value:{' '}
          {value
            ? `${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}/${value.year} ${value.hour}:${String(value.minute).padStart(2, '0')} ${value.period}`
            : 'null'}
        </p>
        <DateTimePicker value={value} onChange={setValue} />
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
    <div style={{ maxWidth: 360 }}>
      <Form onSubmit={(e) => e.preventDefault()}>
        <div className="juice-input-wrapper">
          <span className="juice-label">Meeting starts</span>
          <DateTimePicker
            name="startsAt"
            defaultValue={{ month: 1, day: 1, year: 2026, hour: 9, minute: 0, period: 'AM' }}
            placeholder="Select a date and time"
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
    <DateTimePicker.Root
      defaultValue={{ month: 1, day: 1, year: 2026, hour: 9, minute: 0, period: 'AM' }}
      format="12h"
    >
      <DateTimePicker.Trigger placeholder="Select a date and time" />
      <DateTimePicker.Content />
    </DateTimePicker.Root>
  ),
};
