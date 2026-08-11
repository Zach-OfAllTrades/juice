import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with associated label', () => {
    render(<Textarea label="Message" placeholder="Type here..." />);
    const textarea = screen.getByLabelText(/message/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Type here...');
  });

  it('accepts text input', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Notes" />);
    const textarea = screen.getByLabelText(/notes/i);

    await user.type(textarea, 'First line\nSecond line');
    expect(textarea).toHaveValue('First line\nSecond line');
  });

  it('renders error message and aria-invalid', () => {
    render(<Textarea label="Review" error="Review is required" />);
    const textarea = screen.getByLabelText(/review/i);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Review is required');
  });
});
