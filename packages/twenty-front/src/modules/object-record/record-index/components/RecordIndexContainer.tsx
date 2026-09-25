import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useSearchParams } from 'react-router-dom';

import { TaskMatrixContainer } from '@/activities/tasks/task-matrix/components/TaskMatrixContainer';

import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordIndexTableContainer } from '@/object-record/record-index/components/RecordIndexTableContainer';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

import { RecordIndexCalendarContainer } from '@/object-record/record-index/components/RecordIndexCalendarContainer';
import { RecordIndexEmptyStateNotShared } from '@/object-record/record-index/components/RecordIndexEmptyStateNotShared';
import { RecordIndexFiltersToContextStoreEffect } from '@/object-record/record-index/components/RecordIndexFiltersToContextStoreEffect';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { RecordListContainer } from '@/object-record/record-list/components/RecordListContainer';
import { ViewType } from '@/views/types/ViewType';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledContainerWithPadding = styled.div`
  box-sizing: border-box;
  flex: 1;
  margin-left: ${themeCssVariables.spacing[2]};
  min-height: 0;
`;

const StyledTaskLayouts = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: 4px;
  padding: 8px 16px;

  button {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: ${themeCssVariables.font.color.secondary};
    cursor: pointer;
    font: inherit;
    padding: 6px 10px;
  }

  button[aria-pressed='true'] {
    background: ${themeCssVariables.background.secondary};
    border-color: ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const RecordIndexContainer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const recordIndexViewType = useAtomComponentStateValue(
    recordIndexViewTypeState,
  );

  const { recordIndexId, objectMetadataItem, objectNameSingular } =
    useRecordIndexContextOrThrow();

  const { hasCurrentViewNonReadableFields, nonReadableViewFieldInfo } =
    useHasCurrentViewNonReadableFields(objectMetadataItem);

  const isTaskObject = objectNameSingular === 'task';
  const isTaskMatrix =
    isTaskObject && searchParams.get('taskLayout') === 'matrix';
  const selectTaskLayout = (matrix: boolean) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (matrix) next.set('taskLayout', 'matrix');
        else next.delete('taskLayout');
        return next;
      },
      { replace: true },
    );
  };

  return (
    <StyledContainer>
      {hasCurrentViewNonReadableFields ? (
        <RecordIndexEmptyStateNotShared
          nonReadableViewFieldInfo={nonReadableViewFieldInfo}
        />
      ) : (
        <>
          <RecordIndexFiltersToContextStoreEffect />
          {isTaskObject && (
            <StyledTaskLayouts role="group" aria-label={t`Task layout`}>
              <button
                type="button"
                aria-pressed={!isTaskMatrix}
                onClick={() => selectTaskLayout(false)}
              >{t`Standard view`}</button>
              <button
                type="button"
                aria-pressed={isTaskMatrix}
                onClick={() => selectTaskLayout(true)}
              >{t`Impact & effort`}</button>
            </StyledTaskLayouts>
          )}
          {isTaskMatrix && <TaskMatrixContainer />}
          {!isTaskMatrix && recordIndexViewType === ViewType.TABLE && (
            <RecordIndexTableContainer recordTableId={recordIndexId} />
          )}
          {!isTaskMatrix && recordIndexViewType === ViewType.KANBAN && (
            <StyledContainerWithPadding>
              <RecordBoardContainer
                recordBoardId={recordIndexId}
                viewBarId={recordIndexId}
                objectNameSingular={objectNameSingular}
              />
            </StyledContainerWithPadding>
          )}
          {!isTaskMatrix && recordIndexViewType === ViewType.CALENDAR && (
            <StyledContainerWithPadding>
              <RecordIndexCalendarContainer />
            </StyledContainerWithPadding>
          )}
          {!isTaskMatrix && recordIndexViewType === ViewType.LIST && (
            <StyledContainerWithPadding>
              <RecordListContainer
                objectNameSingular={objectNameSingular}
                viewBarInstanceId={recordIndexId}
              />
            </StyledContainerWithPadding>
          )}
        </>
      )}
    </StyledContainer>
  );
};
