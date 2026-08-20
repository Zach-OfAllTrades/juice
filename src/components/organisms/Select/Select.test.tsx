import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('opens options on trigger click and selects one', async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Theme"
        placeholder="Choose theme"
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />
    );

    const trigger = screen.getByRole('combobox', { name: /theme/i });
    await user.click(trigger);
    expect(screen.getByText('Light')).toBeInTheDocument();

    await user.click(screen.getByText('Dark'));
    expect(trigger).toHaveTextContent('Dark');
  });

  it('renders error message and marks trigger invalid', () => {
    render(<Select label="Country" error="Please select a country" options={[]} />);
    expect(screen.getByRole('combobox', { name: /country/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a country');
  });
});
