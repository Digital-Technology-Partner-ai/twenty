import { Temporal } from 'temporal-polyfill';

export const RAPID_DATE_PICKER_TIME_ZONE = 'Europe/London';
export type RapidDatePickerOption = 'TODAY' | 'TOMORROW';

export const getRapidDatePickerDate = ({
  option,
  timeZone,
  now = Temporal.Now.zonedDateTimeISO(timeZone),
}: {
  option: RapidDatePickerOption;
  timeZone: string;
  now?: Temporal.ZonedDateTime;
}) => {
  const today = now.withTimeZone(timeZone).toPlainDate();

  return option === 'TODAY'
    ? today.toString()
    : today.add({ days: 1 }).toString();
};
