import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Temporal } from 'temporal-polyfill';

import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: jest.fn(() => null),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: jest.fn(() => ({ closeDropdown: jest.fn() })),
}));

jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('DatePicker rapid date actions', () => {
  it('submits exact London dates and recomputes after midnight', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    const nowSpy = jest.spyOn(Temporal.Now, 'zonedDateTimeISO');
    nowSpy.mockReturnValue(
      Temporal.ZonedDateTime.from('2026-03-28T23:30:00+00:00[Europe/London]'),
    );

    render(
      <DatePicker
        instanceId="date-picker"
        plainDateString="2026-03-29"
        showRapidDateActions
        clearable
        onClose={onClose}
      />,
    );

    await screen.findByText('Today');
    await user.click(screen.getByText('Today'));
    expect(onClose).toHaveBeenLastCalledWith('2026-03-28');

    nowSpy.mockReturnValue(
      Temporal.ZonedDateTime.from('2026-03-29T00:30:00+00:00[Europe/London]'),
    );
    await user.click(screen.getByText('Tomorrow'));
    expect(onClose).toHaveBeenLastCalledWith('2026-03-30');

    await user.click(screen.getByText('Today'));
    expect(onClose).toHaveBeenLastCalledWith('2026-03-29');

    nowSpy.mockRestore();
  });

  it('submits null through Clear from plan', async () => {
    const onClear = jest.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        instanceId="date-picker"
        plainDateString="2026-03-29"
        showRapidDateActions
        clearable
        onClear={onClear}
      />,
    );

    await screen.findByText('Clear from plan');
    await user.click(screen.getByText('Clear from plan'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not render rapid actions for the default picker', async () => {
    render(
      <DatePicker
        instanceId="date-picker"
        plainDateString="2026-03-29"
        clearable
      />,
    );

    expect(screen.queryByText('Today')).not.toBeInTheDocument();
    expect(screen.queryByText('Tomorrow')).not.toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
