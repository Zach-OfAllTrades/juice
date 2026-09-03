import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatCard, StatGrid } from './StatGrid';

describe('StatGrid', () => {
  it('renders each StatCard label and value', () => {
    render(
      <StatGrid>
        <StatCard label="Net Worth" value="$128,400" />
        <StatCard label="Available Credit" value="$4,200" />
      </StatGrid>
    );

    expect(screen.getByText('Net Worth')).toBeInTheDocument();
    expect(screen.getByText('$128,400')).toBeInTheDocument();
    expect(screen.getByText('Available Credit')).toBeInTheDocument();
    expect(screen.getByText('$4,200')).toBeInTheDocument();
  });

  it('applies the tone modifier class to the value', () => {
    render(<StatCard label="Net Worth" value="$128,400" tone="positive" />);

    expect(screen.getByText('$128,400')).toHaveClass('juice-stat-card__value--positive');
  });

  it('exposes StatCard as StatGrid.Card', () => {
    expect(StatGrid.Card).toBe(StatCard);
  });
});
