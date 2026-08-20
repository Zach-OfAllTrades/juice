import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies the variant class', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toHaveClass('juice-badge--success');
  });

  it('renders a status dot only when dot is true', () => {
    const { rerender, container } = render(<Badge>Status</Badge>);
    expect(container.querySelector('.juice-badge__dot')).not.toBeInTheDocument();

    rerender(<Badge dot>Status</Badge>);
    expect(container.querySelector('.juice-badge__dot')).toBeInTheDocument();
  });
});
