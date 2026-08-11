import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { Input } from '../../atoms/Input';
import { Textarea } from '../../atoms/Textarea';
import { InputStack } from '../../molecules/InputStack';
import { Form } from './Form';

const meta = {
  title: 'Organisms/Form',
  component: Form,
  tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => {
    const [submitting, setSubmitting] = useState(false);

    return (
      <div style={{ maxWidth: 400 }}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            setTimeout(() => setSubmitting(false), 1200);
          }}
        >
          <InputStack>
            <Input label="Full Name" placeholder="Zach Rose" required />
            <Input label="Work Email" type="email" placeholder="zach@example.com" required />
            <Textarea label="Project Scope" placeholder="Describe requirements…" rows={3} />
            <Checkbox label="Agree to data processing agreement" required />
          </InputStack>
          <Form.Actions>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Application
            </Button>
          </Form.Actions>
        </Form>
      </div>
    );
  },
};

export const WithErrorSummary: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Form
        error="Unable to authenticate with the provided credentials. Please try again."
        onSubmit={(e) => e.preventDefault()}
      >
        <InputStack>
          <Input label="Email" type="email" defaultValue="bad@user.com" error="Invalid account" />
          <Input label="Password" type="password" error="Incorrect password" />
        </InputStack>
        <Form.Actions>
          <Button type="submit" variant="primary" fullWidth>
            Retry Sign In
          </Button>
        </Form.Actions>
      </Form>
    </div>
  ),
};
