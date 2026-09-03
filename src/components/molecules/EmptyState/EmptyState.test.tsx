import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No items" description="Add one to get started." />);

    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Add one to get started.')).toBeInTheDocument();
  });

  it('renders the icon as decorative (hidden from assistive tech)', () => {
    render(<EmptyState icon="📋" title="No items" />);

    const icon = screen.getByText('📋');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders an action when provided', () => {
    render(<EmptyState title="No items" action={<button type="button">Add item</button>} />);

    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('omits description and action when not provided', () => {
    const { container } = render(<EmptyState title="No items" />);

    expect(container.querySelector('.juice-empty-state__description')).not.toBeInTheDocument();
    expect(container.querySelector('.juice-empty-state__action')).not.toBeInTheDocument();
  });
});
