import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('is not in the document until hovered, then shows its content', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Realistic given your time and resources." delayDuration={0}>
        <span>achievable</span>
      </Tooltip>
    );

    expect(screen.queryByText('Realistic given your time and resources.')).not.toBeInTheDocument();

    await user.hover(screen.getByText('achievable'));
    expect(await screen.findByText('Realistic given your time and resources.')).toBeInTheDocument();
  });

  it('exposes its content with role="tooltip" for assistive tech', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint text" delayDuration={0}>
        <span>term</span>
      </Tooltip>
    );

    await user.hover(screen.getByText('term'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Hint text');
  });

  it('shows its content on keyboard focus, not just hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Focus-visible hint" delayDuration={0}>
        <button type="button">Focusable term</button>
      </Tooltip>
    );

    await user.tab();
    expect(await screen.findByText('Focus-visible hint')).toBeInTheDocument();
  });
});
