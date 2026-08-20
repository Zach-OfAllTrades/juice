import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Form } from '../Form';
import { DatePicker } from './DatePicker';
import type { DateValue } from './DatePicker.utils';

const meta = {
  title: 'Organisms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    error: { control: 'boolean' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: { month: 6, day: 15, year: 2026 },
  },
};

export const EmptyByDefault: Story = {
  args: {
    defaultValue: null,
    placeholder: 'Select a date',
  },
};

export const BoundedRange: Story = {
  name: 'Bounded to this quarter',
  args: {
    defaultValue: { month: 2, day: 1, year: 2026 },
    minDate: { month: 1, day: 1, year: 2026 },
    maxDate: { month: 3, day: 31, year: 2026 },
  },
};

export const DisabledDates: Story = {
  name: 'Disabled dates (weekends)',
  args: {
    defaultValue: { month: 1, day: 12, year: 2026 },
    isDateDisabled: (value: DateValue) => {
      const day = new Date(value.year, value.month - 1, value.day).getDay();
      return day === 0 || day === 6;
    },
  },
};

export const ErrorState: Story = {
  args: {
    defaultValue: null,
    error: true,
    placeholder: 'Select a date',
  },
};

export const DisabledState: Story = {
  args: {
    defaultValue: { month: 1, day: 1, year: 2026 },
    disabled: true,
  },
};

export const ReadOnlyState: Story = {
  args: {
    defaultValue: { month: 1, day: 1, year: 2026 },
    readOnly: true,
  },
};

export const ControlledState: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<DateValue | null>({ month: 1, day: 1, year: 2026 });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'start' }}>
        <p style={{ fontSize: '0.875rem' }}>
          Value:{' '}
          {value
            ? `${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}/${value.year}`
            : 'null'}
        </p>
        <DatePicker value={value} onChange={setValue} />
        <Button variant="ghost" size="sm" onClick={() => setValue(null)}>
          Reset from outside
        </Button>
      </div>
    );
  },
};

export const InsideForm: Story = {
  args: {},
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Form onSubmit={(e) => e.preventDefault()}>
        <div className="juice-input-wrapper">
          <span className="juice-label">Start date</span>
          <DatePicker
            name="startDate"
            defaultValue={{ month: 1, day: 1, year: 2026 }}
            placeholder="Select a date"
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
  args: {},
  render: () => (
    <DatePicker.Root defaultValue={{ month: 1, day: 1, year: 2026 }}>
      <DatePicker.Trigger placeholder="Select a date" />
      <DatePicker.Content />
    </DatePicker.Root>
  ),
};
