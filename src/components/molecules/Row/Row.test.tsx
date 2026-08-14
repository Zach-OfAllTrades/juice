import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../atoms/Button';
import { Row } from './Row';

describe('Row', () => {
  it('renders title, meta, extra content, and actions', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Row
        title="Finish quarterly report"
        meta="Due tomorrow"
        actions={
          <Button size="sm" onClick={handleClick}>
            Complete
          </Button>
        }
      >
        <span>Extra content</span>
      </Row>
    );

    expect(screen.getByText('Finish quarterly report')).toBeInTheDocument();
    expect(screen.getByText('Due tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Extra content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /complete/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('omits the content wrapper when there is no title, meta, or children', () => {
    const { container } = render(<Row actions={<Button size="sm">Edit</Button>} />);
    expect(container.querySelector('.juice-row-content')).not.toBeInTheDocument();
  });
});
