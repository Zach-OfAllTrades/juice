import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('expands panel content on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Accordion
        items={[
          { value: 'q1', title: 'Question 1', content: 'Answer 1' },
          { value: 'q2', title: 'Question 2', content: 'Answer 2' },
        ]}
      />
    );

    expect(screen.queryByText('Answer 1')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /question 1/i }));
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
  });
});
