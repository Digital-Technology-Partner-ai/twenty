import { useDateField } from '@/object-record/record-field/ui/meta-types/hooks/useDateField';
import { DateInput } from '@/ui/field/input/components/DateInput';
import { shouldShowRapidDatePickerActions } from '@/object-record/record-field/ui/meta-types/input/utils/shouldShowRapidDatePickerActions';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { type Nullable } from 'twenty-ui/utilities';

export type DateFieldInputProps = {
  isTableCell?: boolean;
};

export const DateFieldInput = ({
  isTableCell = false,
}: DateFieldInputProps) => {
  const { fieldValue, setDraftValue, fieldDefinition } = useDateField();

  const { onEnter, onEscape, onClickOutside, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleEnter = (newDate: Nullable<string>) => {
    onEnter?.({ newValue: newDate });
  };

  const handleSubmit = (newDate: Nullable<string>) => {
    onSubmit?.({ newValue: newDate });
  };

  const handleEscape = (newDate: Nullable<string>) => {
    onEscape?.({ newValue: newDate });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<string>,
  ) => {
    onClickOutside?.({ newValue: newDate, event });
  };

  const handleChange = (newDate: Nullable<string>) => {
    setDraftValue(newDate ?? '');
  };

  const handleClear = () => {
    onSubmit?.({ newValue: null });
  };

  const dateValue = fieldValue ?? null;

  return (
    <DateInput
      instanceId={instanceId}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
      clearable
      showRapidDateActions={shouldShowRapidDatePickerActions({
        isTableCell,
        objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
        fieldName: fieldDefinition.metadata.fieldName,
      })}
      onChange={handleChange}
      onClear={handleClear}
      onSubmit={handleSubmit}
    />
  );
};
