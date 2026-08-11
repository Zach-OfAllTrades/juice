import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('toggles check state on user click', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Enable notifications" />);

    const checkbox = screen.getByLabelText(/enable notifications/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('renders description text', () => {
    render(<Checkbox label="Option" description="Extra details" />);
    expect(screen.getByText('Extra details')).toBeInTheDocument();
  });

  it('disables input when disabled prop is provided', () => {
    render(<Checkbox label="Disabled option" disabled />);
    expect(screen.getByLabelText(/disabled option/i)).toBeDisabled();
  });
});
