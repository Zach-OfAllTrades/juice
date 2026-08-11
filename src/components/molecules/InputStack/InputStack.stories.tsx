import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { InputStack } from './InputStack';

const meta = {
  title: 'Molecules/InputStack',
  component: InputStack,
  tags: ['autodocs'],
} satisfies Meta<typeof InputStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <InputStack style={{ maxWidth: 400 }}>
      <Input label="First name" placeholder="Zach" />
      <Input label="Last name" placeholder="Rose" />
      <Input label="Email address" type="email" placeholder="zach@example.com" required />
    </InputStack>
  ),
};

export const WithSubmit: Story = {
  args: { children: null },
  render: () => (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <InputStack>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          helperText="We'll never share your email."
        />
        <Input label="Password" type="password" required />
      </InputStack>
      <Button type="submit" variant="primary" fullWidth>
        Sign in
      </Button>
    </form>
  ),
};

export const WithErrors: Story = {
  args: { children: null },
  render: () => (
    <InputStack style={{ maxWidth: 400 }}>
      <Input label="Username" defaultValue="x" error="Username must be at least 3 characters." />
      <Input
        label="Email"
        type="email"
        defaultValue="not-an-email"
        error="Please enter a valid email address."
      />
    </InputStack>
  ),
};
