import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../../atoms/Button';
import { Modal } from './Modal';

describe('Modal', () => {
  it('opens and closes via trigger and close button', async () => {
    const user = userEvent.setup();
    render(
      <Modal
        trigger={<Button>Open Dialog</Button>}
        title="Settings"
        description="Configure your preferences"
      >
        <p>Modal body content</p>
      </Modal>
    );

    expect(screen.queryByText('Modal body content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByText('Modal body content')).not.toBeInTheDocument();
  });
});
