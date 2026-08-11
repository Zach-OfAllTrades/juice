import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Form } from './Form';

describe('Form', () => {
  it('renders form and error summary when provided', () => {
    render(
      <Form error="Submission failed">
        <input type="text" aria-label="Name" />
      </Form>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Submission failed');
  });
});
