import { shouldShowRapidDatePickerActions } from '@/object-record/record-field/ui/meta-types/input/utils/shouldShowRapidDatePickerActions';

describe('shouldShowRapidDatePickerActions', () => {
  it('enables actions only for task plannedDay table cells', () => {
    expect(
      shouldShowRapidDatePickerActions({
        isTableCell: true,
        objectNameSingular: 'task',
        fieldName: 'plannedDay',
      }),
    ).toBe(true);

    expect(
      shouldShowRapidDatePickerActions({
        isTableCell: false,
        objectNameSingular: 'task',
        fieldName: 'plannedDay',
      }),
    ).toBe(false);

    expect(
      shouldShowRapidDatePickerActions({
        isTableCell: true,
        objectNameSingular: 'task',
        fieldName: 'targetDate',
      }),
    ).toBe(false);

    expect(
      shouldShowRapidDatePickerActions({
        isTableCell: true,
        objectNameSingular: 'project',
        fieldName: 'plannedDay',
      }),
    ).toBe(false);

    expect(
      shouldShowRapidDatePickerActions({
        isTableCell: true,
        objectNameSingular: 'task',
        fieldName: 'dueAt',
      }),
    ).toBe(false);

    expect(
      shouldShowRapidDatePickerActions({
        isTableCell: true,
        objectNameSingular: 'project',
        fieldName: 'targetDate',
      }),
    ).toBe(false);
  });
});
