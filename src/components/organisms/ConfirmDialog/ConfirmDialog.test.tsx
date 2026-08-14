import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../atoms/Button';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('opens via trigger and calls onConfirm/onCancel', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        trigger={<Button variant="danger">Delete task</Button>}
        title="Delete this task?"
        description="This action cannot be undone."
        tone="danger"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <p>Extra reason slot content</p>
      </ConfirmDialog>
    );

    expect(screen.queryByText('Delete this task?')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete task/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete this task?')).toBeInTheDocument();
    expect(screen.getByText('Extra reason slot content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Delete this task?')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete task/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Delete this task?')).not.toBeInTheDocument();
  });
});
