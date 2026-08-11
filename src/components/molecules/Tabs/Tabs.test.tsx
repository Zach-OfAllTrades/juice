import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

describe('Tabs', () => {
  it('switches active tab and content on click', async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        defaultValue="first"
        items={[
          { value: 'first', label: 'First Tab', content: <p>First Content</p> },
          { value: 'second', label: 'Second Tab', content: <p>Second Content</p> },
        ]}
      />
    );

    expect(screen.getByText('First Content')).toBeInTheDocument();
    expect(screen.queryByText('Second Content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /second tab/i }));
    expect(screen.getByText('Second Content')).toBeInTheDocument();
    expect(screen.queryByText('First Content')).not.toBeInTheDocument();
  });
});
