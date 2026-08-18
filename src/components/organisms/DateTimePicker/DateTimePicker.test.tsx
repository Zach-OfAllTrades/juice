import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DateTimePicker } from './DateTimePicker';
import type { DateTimeValue } from './DateTimePicker.utils';

function getInput() {
  return screen.getByRole('combobox') as HTMLInputElement;
}

function getGrid() {
  return screen.getByRole('grid', { name: 'Choose a date' });
}

function getColumn(label: string) {
  return screen.getByRole('listbox', { name: label });
}

function type(input: HTMLInputElement, keys: string) {
  for (const key of keys) {
    fireEvent.keyDown(input, { key });
  }
}

describe('DateTimePicker', () => {
  it('is closed by default and opens the popover on focus, showing both the calendar and time columns', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker defaultValue={null} />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();

    await user.click(getInput());
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
  });

  it('starts empty with a placeholder when defaultValue is explicitly null', () => {
    render(<DateTimePicker defaultValue={null} placeholder="Pick a date and time" />);
    expect(getInput()).toHaveValue('');
    expect(getInput()).toHaveAttribute('placeholder', 'Pick a date and time');
  });

  it('defaults to now when defaultValue is omitted', () => {
    const now = new Date(2026, 0, 15, 14, 30);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    render(<DateTimePicker />);
    expect(getInput().value).toBe('01/15/2026 2:30 PM');
    vi.useRealTimers();
  });

  it('types a full date+time via masked digit entry across the whole segment chain', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateTimePicker defaultValue={null} onChange={onChange} />);

    const input = getInput();
    await user.click(input);
    type(input, '031520260930a');

    expect(input.value).toBe('03/15/2026 9:30 AM');
    expect(onChange).toHaveBeenLastCalledWith({
      month: 3,
      day: 15,
      year: 2026,
      hour: 9,
      minute: 30,
      period: 'AM',
    });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('supports 24h format with no period column or segment', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker defaultValue={null} format="24h" />);
    const input = getInput();
    await user.click(input);

    expect(screen.queryByRole('listbox', { name: 'AM or PM' })).not.toBeInTheDocument();

    type(input, '031520261430');
    expect(input.value).toBe('03/15/2026 14:30');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('selecting a day cell updates only the date part and keeps the popover open for time selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={{ month: 1, day: 10, year: 2026, hour: 9, minute: 0, period: 'AM' }}
        onChange={onChange}
      />
    );
    const input = getInput();
    await user.click(input);

    const grid = getGrid();
    await user.click(within(grid).getByRole('gridcell', { name: '15' }));

    expect(input.value).toBe('01/15/2026 9:00 AM');
    expect(onChange).toHaveBeenLastCalledWith({
      month: 1,
      day: 15,
      year: 2026,
      hour: 9,
      minute: 0,
      period: 'AM',
    });
    expect(screen.getByRole('grid')).toBeInTheDocument();

    const hourColumn = getColumn('Hour');
    await user.click(within(hourColumn).getByRole('option', { name: '5' }));
    expect(input.value).toBe('01/15/2026 5:00 AM');
  });

  it('Clear sets the value to null and closes the popover', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={{ month: 1, day: 10, year: 2026, hour: 9, minute: 0, period: 'AM' }}
        onChange={onChange}
      />
    );
    const input = getInput();
    await user.click(input);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe('');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Select closes the popover, committing the current live value', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={{ month: 1, day: 10, year: 2026, hour: 9, minute: 0, period: 'AM' }}
      />
    );
    const input = getInput();
    await user.click(input);

    const hourColumn = getColumn('Hour');
    await user.click(within(hourColumn).getByRole('option', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Select' }));

    expect(input.value).toBe('01/10/2026 5:00 AM');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('Escape closes the popover and commits the currently synced value', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={{ month: 1, day: 10, year: 2026, hour: 9, minute: 0, period: 'AM' }}
      />
    );
    const input = getInput();
    await user.click(input);
    type(input, '5');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('05/10/2026 9:00 AM');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('ArrowRight walks through every segment from month to period', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={{ month: 6, day: 15, year: 2026, hour: 9, minute: 30, period: 'AM' }}
      />
    );
    const input = getInput();
    await user.click(input);

    fireEvent.keyDown(input, { key: 'ArrowDown' }); // month
    expect(input.value).toBe('07/15/2026 9:30 AM');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // -> day
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('07/16/2026 9:30 AM');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // -> year
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('07/16/2027 9:30 AM');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // -> hour
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('07/16/2027 10:30 AM');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // -> minute
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('07/16/2027 10:31 AM');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // -> period
    fireEvent.keyDown(input, { key: 'p' });
    expect(input.value).toBe('07/16/2027 10:31 PM');
  });

  it('blurring outside the picker commits the live value and closes', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <DateTimePicker
          defaultValue={{ month: 1, day: 10, year: 2026, hour: 9, minute: 0, period: 'AM' }}
        />
        <button type="button">Elsewhere</button>
      </div>
    );
    const input = getInput();
    await user.click(input);
    type(input, '5');
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

    expect(input.value).toBe('05/10/2026 9:00 AM');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('does not open and ignores typing when disabled', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker defaultValue={null} disabled />);
    const input = getInput();
    expect(input).toBeDisabled();
    await user.click(input);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('does not open when readOnly', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker defaultValue={null} readOnly />);
    const input = getInput();
    await user.click(input);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('renders a hidden input bound to `name`, serialized as ISO-ish YYYY-MM-DDTHH:MM', () => {
    const { container } = render(
      <DateTimePicker
        name="startsAt"
        defaultValue={{ month: 3, day: 5, year: 2026, hour: 9, minute: 5, period: 'PM' }}
      />
    );
    const hidden = container.querySelector('input[type="hidden"][name="startsAt"]');
    expect(hidden).toHaveValue('2026-03-05T21:05');
  });

  it('marks out-of-bounds day cells and time rows disabled via minDateTime/maxDateTime', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        format="24h"
        defaultValue={{ month: 1, day: 15, year: 2026, hour: 12, minute: 0 }}
        minDateTime={{ month: 1, day: 15, year: 2026, hour: 9, minute: 0 }}
        maxDateTime={{ month: 1, day: 15, year: 2026, hour: 17, minute: 0 }}
      />
    );
    const input = getInput();
    await user.click(input);

    const grid = getGrid();
    const day10 = within(grid).getByRole('gridcell', { name: '10' });
    expect(day10).toHaveAttribute('aria-disabled', 'true');

    const hourColumn = getColumn('Hour');
    const row08 = within(hourColumn).getByRole('option', { name: '08' });
    expect(row08).toHaveAttribute('aria-disabled', 'true');

    await user.click(day10);
    expect(input.value).toBe('01/15/2026 12:00'); // unchanged — disabled cell is not selectable
  });

  it('marks rows disabled via isDateTimeDisabled', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        format="24h"
        defaultValue={{ month: 1, day: 15, year: 2026, hour: 12, minute: 0 }}
        isDateTimeDisabled={(v) => v.hour === 13}
      />
    );
    const input = getInput();
    await user.click(input);

    const hourColumn = getColumn('Hour');
    expect(within(hourColumn).getByRole('option', { name: '13' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('is fully controlled via value + onChange', async () => {
    function Controlled() {
      const [value, setValue] = useState<DateTimeValue | null>({
        month: 1,
        day: 10,
        year: 2026,
        hour: 9,
        minute: 0,
        period: 'AM',
      });
      return <DateTimePicker value={value} onChange={setValue} />;
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const input = getInput();
    await user.click(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('02/10/2026 9:00 AM');
  });

  it('resets to the month segment on reopen even after a full typed entry closes it', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker defaultValue={null} />);
    const input = getInput();

    await user.click(input);
    type(input, '031520260930a');
    expect(input.value).toBe('03/15/2026 9:30 AM');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();

    await user.click(input);
    type(input, '041620261145p');
    expect(input.value).toBe('04/16/2026 11:45 PM');
  });

  it('selects the active segment text so the user can see which part is being edited', async () => {
    const user = userEvent.setup();
    render(
      <DateTimePicker
        defaultValue={{ month: 3, day: 15, year: 2026, hour: 9, minute: 30, period: 'AM' }}
      />
    );
    const input = getInput();
    await user.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(2); // "03"

    for (let i = 0; i < 3; i++) fireEvent.keyDown(input, { key: 'ArrowRight' }); // -> hour
    expect(input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0)).toBe('9');
  });
});
