import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../../atoms/Button';
import { ButtonGroup } from './ButtonGroup';

describe('ButtonGroup', () => {
  it('renders with role="group" and accessible label', () => {
    render(
      <ButtonGroup label="Document pagination">
        <Button>Previous</Button>
        <Button>Next</Button>
      </ButtonGroup>
    );

    const group = screen.getByRole('group', { name: /document pagination/i });
    expect(group).toBeInTheDocument();
  });
});
