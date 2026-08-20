import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InputStack } from './InputStack';

describe('InputStack', () => {
  it('renders its children', () => {
    render(
      <InputStack>
        <span>First name</span>
        <span>Last name</span>
      </InputStack>
    );
    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.getByText('Last name')).toBeInTheDocument();
  });

  it('merges a custom className with the base class', () => {
    const { container } = render(<InputStack className="custom">child</InputStack>);
    expect(container.firstChild).toHaveClass('juice-input-stack', 'custom');
  });
});
