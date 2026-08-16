import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('defaults to an <h2> with the level-2 size and semibold weight', () => {
    render(<Heading>Account Settings</Heading>);
    const el = screen.getByRole('heading', { level: 2, name: 'Account Settings' });
    expect(el).toHaveClass(
      'juice-heading--xl',
      'juice-heading--semibold',
      'juice-heading--default'
    );
  });

  it('maps level to the matching heading tag and default size', () => {
    render(<Heading level={1}>Title</Heading>);
    const el = screen.getByRole('heading', { level: 1, name: 'Title' });
    expect(el).toHaveClass('juice-heading--2xl');
  });

  it('allows overriding size independently of level', () => {
    render(
      <Heading level={2} size="base">
        Subheading
      </Heading>
    );
    const el = screen.getByRole('heading', { level: 2, name: 'Subheading' });
    expect(el).toHaveClass('juice-heading--base');
  });
});
