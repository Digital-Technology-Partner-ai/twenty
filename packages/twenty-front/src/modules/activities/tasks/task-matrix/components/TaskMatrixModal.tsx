import { t } from '@lingui/core/macro';
import { type RefObject } from 'react';

import {
  StyledModal,
  StyledModalHeader,
  StyledModalList,
} from '../styles/taskMatrixStyles';
import { TaskMatrixCard } from './TaskMatrixCard';
import { type TaskMatrixTask } from './types';

type TaskMatrixModalProps = {
  modalRef: RefObject<HTMLDialogElement | null>;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
  tagLabels: Map<string, string>;
  tasks: TaskMatrixTask[];
};

export const TaskMatrixModal = ({
  modalRef,
  onClose,
  onOpenTask,
  tagLabels,
  tasks,
}: TaskMatrixModalProps) => (
  <StyledModal ref={modalRef} onCancel={onClose}>
    <StyledModalHeader>
      <strong>{t`Tasks`}</strong>
      <button onClick={onClose}>{t`Close`}</button>
    </StyledModalHeader>
    <StyledModalList>
      {tasks.map((task) => (
        <TaskMatrixCard
          key={task.id}
          onOpenTask={onOpenTask}
          tagLabels={tagLabels}
          task={task}
        />
      ))}
    </StyledModalList>
  </StyledModal>
);
