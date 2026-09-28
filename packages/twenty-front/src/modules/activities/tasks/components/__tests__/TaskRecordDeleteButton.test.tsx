import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TaskRecordDeleteButton } from '@/activities/tasks/components/TaskRecordDeleteButton';

const mockDeleteOneRecord = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();
const mockOpenModal = jest.fn();
const mockUseIsRecordDeleted = jest.fn(() => false);
const mockUseObjectPermissionsForObject = jest.fn(() => ({
  canSoftDeleteObjectRecords: true,
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: { id: 'task-object' } }),
}));
jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({ deleteOneRecord: mockDeleteOneRecord }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => mockUseObjectPermissionsForObject(),
}));
jest.mock('@/object-record/record-field/ui/hooks/useIsRecordDeleted', () => ({
  useIsRecordDeleted: () => mockUseIsRecordDeleted(),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));
jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({ openModal: mockOpenModal }),
}));
jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: ({ onConfirmClick }: { onConfirmClick: () => void }) => (
    <button onClick={onConfirmClick}>Confirm task deletion</button>
  ),
}));
jest.mock('twenty-ui/input', () => ({
  Button: ({
    ariaLabel,
    disabled,
    onClick,
    title,
  }: {
    ariaLabel: string;
    disabled?: boolean;
    onClick: () => void;
    title: string;
  }) => (
    <button aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {title}
    </button>
  ),
}));

describe('TaskRecordDeleteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteOneRecord.mockResolvedValue({ id: 'task-1' });
    mockCloseSidePanelMenu.mockResolvedValue(undefined);
    mockUseIsRecordDeleted.mockReturnValue(false);
    mockUseObjectPermissionsForObject.mockReturnValue({
      canSoftDeleteObjectRecords: true,
    });
  });

  it('opens a task-specific confirmation and deletes the selected task', async () => {
    const user = userEvent.setup();

    render(<TaskRecordDeleteButton taskId="task-1" />);

    await user.click(screen.getByRole('button', { name: 'Delete task' }));
    expect(mockOpenModal).toHaveBeenCalledWith(
      'task-delete-confirmation-task-1',
    );

    await user.click(
      screen.getByRole('button', { name: 'Confirm task deletion' }),
    );

    expect(mockDeleteOneRecord).toHaveBeenCalledWith('task-1');
    await waitFor(() => expect(mockCloseSidePanelMenu).toHaveBeenCalled());
  });

  it('hides the action when the user cannot delete tasks', () => {
    mockUseObjectPermissionsForObject.mockReturnValue({
      canSoftDeleteObjectRecords: false,
    });

    render(<TaskRecordDeleteButton taskId="task-1" />);

    expect(
      screen.queryByRole('button', { name: 'Delete task' }),
    ).not.toBeInTheDocument();
  });
});
