import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { Button } from 'twenty-ui/input';

const getTaskDeleteConfirmationModalId = (taskId: string) =>
  `task-delete-confirmation-${taskId}`;

export const TaskRecordDeleteButton = ({ taskId }: { taskId: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const isRecordDeleted = useIsRecordDeleted({ recordId: taskId });
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();
  const modalInstanceId = getTaskDeleteConfirmationModalId(taskId);

  if (!objectPermissions.canSoftDeleteObjectRecords || isRecordDeleted) {
    return null;
  }

  const handleDeleteTask = async () => {
    setIsDeleting(true);

    try {
      await deleteOneRecord(taskId);
      setIsDeleting(false);
      await closeSidePanelMenu();
    } catch {
      setIsDeleting(false);
      enqueueErrorSnackBar({ message: t`Failed to delete task` });
    }
  };

  return (
    <>
      <Button
        accent="danger"
        ariaLabel={t`Delete task`}
        disabled={isDeleting}
        onClick={() => openModal(modalInstanceId)}
        size="small"
        title={t`Delete task`}
        variant="secondary"
      />
      <ConfirmationModal
        confirmButtonAccent="danger"
        confirmButtonText={t`Delete task`}
        loading={isDeleting}
        modalInstanceId={modalInstanceId}
        onConfirmClick={() => void handleDeleteTask()}
        subtitle={t`This task will be moved to trash.`}
        title={t`Delete this task?`}
      />
    </>
  );
};
