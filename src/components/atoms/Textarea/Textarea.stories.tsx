import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Enter your comments here…',
    rows: 4,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us a bit about yourself…',
    helperText: 'Max 280 characters.',
    rows: 3,
  },
};

export const WithError: Story = {
  args: {
    label: 'Description',
    defaultValue: 'Too short',
    error: 'Description must be at least 20 characters.',
    rows: 3,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived Notes',
    defaultValue: 'This project is archived and read-only.',
    disabled: true,
    rows: 3,
  },
};
