import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DateFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/DateFieldInput';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useDateField } from '@/object-record/record-field/ui/meta-types/hooks/useDateField';

jest.mock(
  '@/object-record/record-field/ui/meta-types/hooks/useDateField',
  () => ({ useDateField: jest.fn() }),
);

jest.mock('@/ui/field/input/components/DateInput', () => ({
  DateInput: ({ onClear }: { onClear?: () => void }) => (
    <div>
      <button type="button" onClick={onClear}>
        Clear from plan
      </button>
    </div>
  ),
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: jest.fn(() => 'date-input'),
  }),
);

describe('DateFieldInput rapid date actions', () => {
  const mockedUseDateField = jest.mocked(useDateField);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDateField.mockReturnValue({
      fieldValue: null,
      setDraftValue: jest.fn(),
      setFieldValue: jest.fn(),
      clearable: true,
      fieldDefinition: {
        metadata: {
          fieldName: 'plannedDay',
          objectMetadataNameSingular: 'task',
        },
      },
    } as unknown as ReturnType<typeof useDateField>);
  });

  it('should persist null when Clear from plan is selected', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(
      <FieldInputEventContext.Provider value={{ onSubmit }}>
        <DateFieldInput isTableCell />
      </FieldInputEventContext.Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Clear from plan' }));
    expect(onSubmit).toHaveBeenCalledWith({ newValue: null });
  });
});
