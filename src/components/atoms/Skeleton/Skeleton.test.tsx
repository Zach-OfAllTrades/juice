import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders a single hidden placeholder by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('.juice-skeleton');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the circle variant class', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.querySelector('.juice-skeleton--circle')).toBeInTheDocument();
  });

  it('renders `count` rows inside a group wrapper', () => {
    const { container } = render(<Skeleton count={3} />);
    const group = container.querySelector('.juice-skeleton-group');
    expect(group).toBeInTheDocument();
    expect(group?.querySelectorAll('.juice-skeleton')).toHaveLength(3);
  });

  it('renders the element passed via `as`', () => {
    const { container } = render(<Skeleton as="div" />);
    expect(container.querySelector('div.juice-skeleton')).toBeInTheDocument();
  });
});
