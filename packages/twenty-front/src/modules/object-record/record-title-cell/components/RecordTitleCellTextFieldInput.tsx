import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';

import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useContext, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';

const StyledMultilineTitleInput = styled.textarea`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  field-sizing: fixed;
  font: inherit;
  height: 36px;
  line-height: 18px;
  outline: none;
  overflow-wrap: anywhere;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 ${themeCssVariables.spacing[1]};
  resize: none;
  white-space: pre-wrap;
  width: 100%;

  &:focus {
    border-color: ${themeCssVariables.color.blue};
  }
`;

type RecordTitleCellTextFieldInputProps = {
  instanceId: string;
  multiline?: boolean;
  sizeVariant?: 'xs' | 'sm' | 'md';
};

export const RecordTitleCellTextFieldInput = ({
  instanceId,
  multiline = false,
  sizeVariant,
}: RecordTitleCellTextFieldInputProps) => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();

  const inputRef = useRef<HTMLInputElement>(null);
  const multilineInputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (newText: string) => {
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newText));
  };

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  useRegisterInputEvents<string>({
    focusId: instanceId,
    inputRef: multiline ? multilineInputRef : inputRef,
    inputValue: draftValue ?? '',
    onEnter: (inputValue) => {
      onEnter?.({ newValue: inputValue });
    },
    onEscape: (inputValue) => {
      onEscape?.({ newValue: inputValue });
    },
    onClickOutside: (event, inputValue) => {
      onClickOutside?.({ newValue: inputValue, event });
    },
    onTab: (inputValue) => {
      onTab?.({ newValue: inputValue });
    },
    onShiftTab: (inputValue) => {
      onShiftTab?.({ newValue: inputValue });
    },
  });

  const handleFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isDefined(draftValue)) {
      event.target.select();
    }
  };

  if (multiline) {
    return (
      <StyledMultilineTitleInput
        aria-label={fieldDefinition.label}
        autoFocus
        onChange={(event) => handleChange(event.target.value)}
        onFocus={handleFocus}
        placeholder={fieldDefinition.label}
        ref={multilineInputRef}
        rows={2}
        value={draftValue ?? ''}
      />
    );
  }

  return (
    <TextInput
      ref={inputRef}
      autoGrow
      sizeVariant={sizeVariant}
      inheritFontStyles
      value={draftValue ?? ''}
      onChange={handleChange}
      placeholder={fieldDefinition.label}
      onFocus={handleFocus}
      autoFocus
    />
  );
};
