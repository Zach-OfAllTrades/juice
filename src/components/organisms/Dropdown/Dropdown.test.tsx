import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../../atoms/Button';
import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
  it('opens menu items on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        trigger={<Button>Open Menu</Button>}
        items={[{ label: 'Option Alpha' }, { label: 'Option Beta' }]}
      />
    );

    expect(screen.queryByText('Option Alpha')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByText('Option Alpha')).toBeInTheDocument();
    expect(screen.getByText('Option Beta')).toBeInTheDocument();
  });
});
