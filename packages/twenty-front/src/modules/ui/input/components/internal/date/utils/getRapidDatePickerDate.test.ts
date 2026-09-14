import { Temporal } from 'temporal-polyfill';

import { getRapidDatePickerDate } from '@/ui/input/components/internal/date/utils/getRapidDatePickerDate';

describe('getRapidDatePickerDate', () => {
  it('resolves London calendar dates across DST', () => {
    const now = Temporal.ZonedDateTime.from(
      '2026-03-29T00:30:00+00:00[Europe/London]',
    );

    expect(
      getRapidDatePickerDate({
        option: 'TODAY',
        timeZone: 'Europe/London',
        now,
      }),
    ).toBe('2026-03-29');
    expect(
      getRapidDatePickerDate({
        option: 'TOMORROW',
        timeZone: 'Europe/London',
        now,
      }),
    ).toBe('2026-03-30');
  });
});
