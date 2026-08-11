import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../../atoms/Button';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('opens and closes drawer slide-over', async () => {
    const user = userEvent.setup();
    render(
      <Drawer side="right" trigger={<Button>Open Drawer</Button>} title="Side Panel">
        <p>Drawer content</p>
      </Drawer>
    );

    expect(screen.queryByText('Drawer content')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open drawer/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Side Panel')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });
});
