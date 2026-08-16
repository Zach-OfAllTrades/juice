import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('renders as a <p> by default with base/regular/default classes', () => {
    render(<Text>Everything's placed.</Text>);
    const el = screen.getByText("Everything's placed.");
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('juice-text--base', 'juice-text--regular', 'juice-text--default');
  });

  it('applies size, weight, and tone modifier classes', () => {
    render(
      <Text size="lg" weight="bold" tone="danger">
        Overdue
      </Text>
    );
    const el = screen.getByText('Overdue');
    expect(el).toHaveClass('juice-text--lg', 'juice-text--bold', 'juice-text--danger');
  });

  it('renders as the element passed via `as`', () => {
    render(
      <p>
        Inline <Text as="span">label</Text>
      </p>
    );
    expect(screen.getByText('label').tagName).toBe('SPAN');
  });
});
