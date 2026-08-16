import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from './TimePicker';
import type { TimeValue } from './TimePicker.utils';

function getInput() {
  return screen.getByRole('combobox') as HTMLInputElement;
}

function getColumn(label: string) {
  return screen.getByRole('listbox', { name: label });
}

function type(input: HTMLInputElement, keys: string) {
  for (const key of keys) {
    fireEvent.keyDown(input, { key });
  }
}

describe('TimePicker', () => {
  it('is closed by default and opens the popover on focus', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} />);

    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();

    await user.click(getInput());
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
  });

  it('starts empty with a placeholder when defaultValue is explicitly null', () => {
    render(<TimePicker defaultValue={null} placeholder="Pick a time" />);
    expect(getInput()).toHaveValue('');
    expect(getInput()).toHaveAttribute('placeholder', 'Pick a time');
  });

  it('defaults to the current time when defaultValue is omitted', () => {
    const now = new Date(2026, 0, 1, 14, 30);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    render(<TimePicker />);
    expect(getInput().value).toBe('2:30 PM');
    vi.useRealTimers();
  });

  it('types a full 12h time via masked digit entry and closes on period completion', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} onChange={onChange} />);

    const input = getInput();
    await user.click(input);
    type(input, '0930a');

    expect(input.value).toBe('9:30 AM');
    expect(onChange).toHaveBeenLastCalledWith({ hour: 9, minute: 30, period: 'AM' });
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('completes an unambiguous single digit hour immediately', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} />);
    const input = getInput();
    await user.click(input);
    type(input, '9');
    expect(input.value).toBe('9:00 AM');
  });

  it('falls back and reprocesses when a second digit does not extend the buffer', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} />);
    const input = getInput();
    await user.click(input);
    // '1' is ambiguous (could become 10/11/12); '5' doesn't extend it, so hour
    // commits to 1 and '5' is reprocessed as the first digit of minute.
    type(input, '15');
    expect(input.value).toBe('1:05 AM');
  });

  it('supports 24h format with no period column', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} format="24h" />);
    const input = getInput();
    await user.click(input);

    expect(screen.queryByRole('listbox', { name: 'AM or PM' })).not.toBeInTheDocument();

    type(input, '1430');
    expect(input.value).toBe('14:30');
    // Minute is the last segment in 24h — completing it closes the popover.
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('updates the value live when clicking a row, without closing the popover', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker defaultValue={{ hour: 9, minute: 0, period: 'AM' }} onChange={onChange} />);
    const input = getInput();
    await user.click(input);

    const hourColumn = getColumn('Hour');
    await user.click(within(hourColumn).getByRole('option', { name: '5' }));

    expect(input.value).toBe('5:00 AM');
    expect(onChange).toHaveBeenLastCalledWith({ hour: 5, minute: 0, period: 'AM' });
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
  });

  it('Clear sets the value to null and closes the popover', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker defaultValue={{ hour: 9, minute: 0, period: 'AM' }} onChange={onChange} />);
    const input = getInput();
    await user.click(input);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe('');
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('Select closes the popover, committing the current live value', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={{ hour: 9, minute: 0, period: 'AM' }} />);
    const input = getInput();
    await user.click(input);

    const hourColumn = getColumn('Hour');
    await user.click(within(hourColumn).getByRole('option', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Select' }));

    expect(input.value).toBe('5:00 AM');
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('Escape closes the popover and commits the currently synced value', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={{ hour: 9, minute: 0, period: 'AM' }} />);
    const input = getInput();
    await user.click(input);
    type(input, '5');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('5:00 AM');
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('ArrowDown/ArrowUp move the active segment value and ArrowRight moves segments', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={{ hour: 9, minute: 30, period: 'AM' }} />);
    const input = getInput();
    await user.click(input);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('10:30 AM');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('8:30 AM');

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to minute segment
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('8:31 AM');
  });

  it('blurring outside the picker commits the live value and closes', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <TimePicker defaultValue={{ hour: 9, minute: 0, period: 'AM' }} />
        <button type="button">Elsewhere</button>
      </div>
    );
    const input = getInput();
    await user.click(input);
    type(input, '5');
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

    expect(input.value).toBe('5:00 AM');
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('does not open and ignores typing when disabled', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} disabled />);
    const input = getInput();
    expect(input).toBeDisabled();
    await user.click(input);
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('does not open when readOnly', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} readOnly />);
    const input = getInput();
    await user.click(input);
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();
  });

  it('renders a hidden input bound to `name` for form submission, serialized as 24h HH:MM', () => {
    const { container } = render(
      <TimePicker name="startTime" defaultValue={{ hour: 9, minute: 5, period: 'PM' }} />
    );
    const hidden = container.querySelector('input[type="hidden"][name="startTime"]');
    expect(hidden).toHaveValue('21:05');
  });

  it('marks out-of-bounds rows disabled via minTime/maxTime and blocks selecting them', async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        format="24h"
        defaultValue={{ hour: 12, minute: 0 }}
        minTime={{ hour: 9, minute: 0 }}
        maxTime={{ hour: 17, minute: 0 }}
      />
    );
    const input = getInput();
    await user.click(input);

    const hourColumn = getColumn('Hour');
    const row8 = within(hourColumn).getByRole('option', { name: '08' });
    expect(row8).toHaveAttribute('aria-disabled', 'true');

    await user.click(row8);
    expect(input.value).toBe('12:00'); // unchanged — disabled row is not selectable
  });

  it('marks rows disabled via isTimeDisabled', async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        format="24h"
        defaultValue={{ hour: 12, minute: 0 }}
        isTimeDisabled={(v) => v.hour === 13}
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
      const [value, setValue] = useState<TimeValue | null>({ hour: 9, minute: 0, period: 'AM' });
      return <TimePicker value={value} onChange={setValue} />;
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const input = getInput();
    await user.click(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('10:00 AM');
  });

  it('accepts typed digits again after a full entry closes and the field is reopened', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} />);
    const input = getInput();

    await user.click(input);
    type(input, '0930a');
    expect(input.value).toBe('9:30 AM');
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();

    // Reopen and type a fresh time — this used to silently do nothing
    // because the active segment stayed on 'period' from the prior entry.
    await user.click(input);
    type(input, '1145p');
    expect(input.value).toBe('11:45 PM');
  });

  it('resets to the hour segment on reopen even after Enter-committing mid-entry', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={null} />);
    const input = getInput();

    await user.click(input);
    type(input, '2'); // ambiguous partial on minute never reached — just hour buffer
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.queryByRole('listbox', { name: 'Hour' })).not.toBeInTheDocument();

    await user.click(input);
    type(input, '3');
    expect(input.value).toBe('3:00 AM');
  });

  it('selects the active segment text so the user can see which part is being edited', async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={{ hour: 9, minute: 30, period: 'AM' }} />);
    const input = getInput();
    await user.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(1); // "9"

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to minute
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(4); // "30"

    fireEvent.keyDown(input, { key: 'ArrowRight' }); // move to period
    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(7); // "AM"
  });
});
