import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders input with connected label', () => {
    render(<Input label="Email address" placeholder="you@example.com" />);
    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });

  it('handles user typing', async () => {
    const user = userEvent.setup();
    render(<Input label="Username" />);
    const input = screen.getByLabelText(/username/i);

    await user.type(input, 'zach_rose');
    expect(input).toHaveValue('zach_rose');
  });

  it('displays error message and sets aria-invalid', () => {
    render(<Input label="Password" error="Too short" />);
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('displays helper text', () => {
    render(<Input label="Bio" helperText="Maximum 160 characters" />);
    expect(screen.getByText('Maximum 160 characters')).toBeInTheDocument();
  });
});
