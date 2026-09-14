export const shouldShowRapidDatePickerActions = ({
  isTableCell,
  objectNameSingular,
  fieldName,
}: {
  isTableCell: boolean;
  objectNameSingular?: string;
  fieldName: string;
}) =>
  isTableCell && objectNameSingular === 'task' && fieldName === 'plannedDay';
