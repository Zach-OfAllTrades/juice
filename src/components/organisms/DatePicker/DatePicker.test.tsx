import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker';
import type { DateValue } from './DatePicker.utils';

function getInput() {
  return screen.getByRole('combobox') as HTMLInputElement;
}

function getGrid() {
  return screen.getByRole('grid', { name: 'Choose a date' });
}

function type(input: HTMLInputElement, keys: string) {
  for (const key of keys) {
    fireEvent.keyDown(input, { key });
  }
}

describe('DatePicker', () => {
  it('is closed by default and opens the popover on focus', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={null} />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();

    await user.click(getInput());
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
  });

  it('starts empty with a placeholder when defaultValue is explicitly null', () => {
    render(<DatePicker defaultValue={null} placeholder="Pick a date" />);
    expect(getInput()).toHaveValue('');
    expect(getInput()).toHaveAttribute('placeholder', 'Pick a date');
  });

  it('defaults to today when defaultValue is omitted', () => {
    const now = new Date(2026, 0, 15);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    render(<DatePicker />);
    expect(getInput().value).toBe('01/15/2026');
    vi.useRealTimers();
  });

  it('types a full date via masked digit entry and closes on the year segment completing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker defaultValue={null} onChange={onChange} />);

    const input = getInput();
    await user.click(input);
    type(input, '03152026');

    expect(input.value).toBe('03/15/2026');
    expect(onChange).toHaveBeenLastCalledWith({ month: 3, day: 15, year: 2026 });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('falls back and reprocesses when a second digit does not extend the month buffer', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={null} />);
    const input = getInput();
    await user.click(input);
    // '2' is ambiguous (could become 2x), '9' doesn't extend it, so month
    // commits to 2 and '9' is reprocessed as the first digit of day.
    type(input, '29');
    expect(input.value).toMatch(/^02\/09\//);
  });

  it('clamps the day when a shorter month is typed for a value with a high day', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 31, year: 2026 }} />);
    const input = getInput();
    await user.click(input);
    type(input, '04');
    expect(input.value).toBe('04/30/2026');
  });

  it('updates the value live when clicking a day cell, without closing the popover', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} onChange={onChange} />);
    const input = getInput();
    await user.click(input);

    const grid = getGrid();
    await user.click(within(grid).getByRole('gridcell', { name: '15' }));

    expect(input.value).toBe('01/15/2026');
    expect(onChange).toHaveBeenLastCalledWith({ month: 1, day: 15, year: 2026 });
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('Clear sets the value to null and closes the popover', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} onChange={onChange} />);
    const input = getInput();
    await user.click(input);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe('');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Select closes the popover, committing the current live value', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} />);
    const input = getInput();
    await user.click(input);

    const grid = getGrid();
    await user.click(within(grid).getByRole('gridcell', { name: '15' }));
    await user.click(screen.getByRole('button', { name: 'Select' }));

    expect(input.value).toBe('01/15/2026');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Escape closes the popover and commits the currently synced value', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} />);
    const input = getInput();
    await user.click(input);
    type(input, '5');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('05/10/2026');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('ArrowDown/ArrowUp move the active segment value and ArrowRight moves segments', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 6, day: 15, year: 2026 }} />);
    const input = getInput();
    await user.click(input);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('07/15/2026');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('05/15/2026');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to day segment
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('05/16/2026');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to year segment
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('05/16/2027');
  });

  it('navigates months and years in the calendar header without changing the value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} onChange={onChange} />);
    const input = getInput();
    await user.click(input);

    expect(screen.getByText('January 2026')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('February 2026')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    // Drill into month view, then year view, then back down.
    await user.click(screen.getByRole('button', { name: 'February 2026' }));
    expect(screen.getByRole('button', { name: 'Mar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2026' }));
    expect(screen.getByRole('button', { name: /^\d{4}–\d{4}$/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2020' }));
    expect(screen.getByRole('button', { name: 'Mar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mar' }));
    expect(screen.getByText('March 2020')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blurring outside the picker commits the live value and closes', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} />
        <button type="button">Elsewhere</button>
      </div>
    );
    const input = getInput();
    await user.click(input);
    type(input, '5');
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

    expect(input.value).toBe('05/10/2026');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('does not open and ignores typing when disabled', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={null} disabled />);
    const input = getInput();
    expect(input).toBeDisabled();
    await user.click(input);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('does not open when readOnly', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={null} readOnly />);
    const input = getInput();
    await user.click(input);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('renders a hidden input bound to `name` for form submission, serialized as ISO YYYY-MM-DD', () => {
    const { container } = render(
      <DatePicker name="startDate" defaultValue={{ month: 3, day: 5, year: 2026 }} />
    );
    const hidden = container.querySelector('input[type="hidden"][name="startDate"]');
    expect(hidden).toHaveValue('2026-03-05');
  });

  it('marks out-of-bounds day cells disabled via minDate/maxDate and blocks selecting them', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={{ month: 1, day: 15, year: 2026 }}
        minDate={{ month: 1, day: 10, year: 2026 }}
        maxDate={{ month: 1, day: 20, year: 2026 }}
      />
    );
    const input = getInput();
    await user.click(input);

    const grid = getGrid();
    const cell25 = within(grid).getByRole('gridcell', { name: '25' });
    expect(cell25).toHaveAttribute('aria-disabled', 'true');

    await user.click(cell25);
    expect(input.value).toBe('01/15/2026'); // unchanged — disabled cell is not selectable
  });

  it('marks day cells disabled via isDateDisabled', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={{ month: 1, day: 15, year: 2026 }}
        isDateDisabled={(v) => v.day === 13}
      />
    );
    const input = getInput();
    await user.click(input);

    const grid = getGrid();
    expect(within(grid).getByRole('gridcell', { name: '13' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('is fully controlled via value + onChange', async () => {
    function Controlled() {
      const [value, setValue] = useState<DateValue | null>({ month: 1, day: 10, year: 2026 });
      return <DatePicker value={value} onChange={setValue} />;
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const input = getInput();
    await user.click(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('02/10/2026');
  });

  it('resets to the month segment and days view on reopen', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 1, day: 10, year: 2026 }} />);
    const input = getInput();

    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'January 2026' })); // drill into months view
    fireEvent.keyDown(input, { key: 'Escape' });

    await user.click(input);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    type(input, '9');
    expect(input.value).toBe('09/10/2026');
  });

  it('selects the active segment text so the user can see which part is being edited', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={{ month: 3, day: 15, year: 2026 }} />);
    const input = getInput();
    await user.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(2); // "03"

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to day
    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(5); // "15"

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to year
    expect(input.selectionStart).toBe(6);
    expect(input.selectionEnd).toBe(10); // "2026"
  });
});
