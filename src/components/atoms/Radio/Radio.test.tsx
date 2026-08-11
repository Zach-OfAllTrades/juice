import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Radio, RadioGroup } from './Radio';

describe('Radio', () => {
  it('selects radio on click', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup>
        <Radio name="fruit" value="apple" label="Apple" />
        <Radio name="fruit" value="banana" label="Banana" />
      </RadioGroup>
    );

    const apple = screen.getByLabelText(/apple/i);
    const banana = screen.getByLabelText(/banana/i);

    expect(apple).not.toBeChecked();
    await user.click(apple);
    expect(apple).toBeChecked();
    expect(banana).not.toBeChecked();

    await user.click(banana);
    expect(apple).not.toBeChecked();
    expect(banana).toBeChecked();
  });
});
