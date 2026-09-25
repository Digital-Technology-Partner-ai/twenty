import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

import { useTaskMatrixRecords } from '@/activities/tasks/task-matrix/hooks/useTaskMatrixRecords';
import { TaskMatrix } from './TaskMatrix';
import { taskMatrixRecordAdapter } from './taskMatrixRecordAdapter';

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  padding: 16px;
`;

export const TaskMatrixContainer = () => {
  const { records, fieldNames, tagOptions, loading, error, retry } =
    useTaskMatrixRecords();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const tasks = useMemo(() => records.map(taskMatrixRecordAdapter), [records]);
  const projects = useMemo(() => {
    const uniqueProjects = new Map(
      tasks.flatMap((task) =>
        task.project ? [[task.project.id, task.project] as const] : [],
      ),
    );
    return [...uniqueProjects.values()].sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [tasks]);
  const tags = useMemo(
    () =>
      tagOptions.map((option) => ({ id: option.value, label: option.label })),
    [tagOptions],
  );

  if (!fieldNames.includes('effort') || !fieldNames.includes('impact')) {
    return (
      <StyledNotice role="status">{t`The matrix requires readable Effort and Impact fields on tasks. Ask your administrator to check the task fields and your access.`}</StyledNotice>
    );
  }

  if (error) {
    return (
      <StyledNotice role="alert">
        <p>{t`Unable to load all tasks. Try again to show the complete matrix.`}</p>
        <button
          type="button"
          onClick={() => void retry()}
        >{t`Try again`}</button>
      </StyledNotice>
    );
  }

  return (
    <>
      {loading && (
        <StyledNotice role="status">{t`Loading tasks…`}</StyledNotice>
      )}
      <TaskMatrix
        tasks={tasks}
        projects={projects}
        tags={tags}
        onOpenTask={(recordId) =>
          openRecordInSidePanel({
            recordId,
            objectNameSingular: CoreObjectNameSingular.Task,
          })
        }
      />
    </>
  );
};
