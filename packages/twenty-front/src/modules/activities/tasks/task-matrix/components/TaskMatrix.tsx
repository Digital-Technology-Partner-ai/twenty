import { useMemo, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  StyledChartScroll,
  StyledEmptyState,
  StyledGroupCell,
  StyledMatrix,
  StyledMatrixBody,
  StyledMatrixContent,
  StyledMatrixIcon,
  StyledMatrixMeta,
  StyledMatrixPage,
  StyledMatrixToolbar,
  StyledMoreButton,
  StyledSearchInput,
  StyledToolbarActions,
  StyledToolbarTitle,
  StyledUnscoredTray,
} from '../styles/taskMatrixStyles';
import { TaskMatrixCard, TaskMatrixCompactTask } from './TaskMatrixCard';
import { TaskMatrixGtdFilter, NO_TAGS_ID } from './TaskMatrixGtdFilter';
import { TaskMatrixModal } from './TaskMatrixModal';
import { TaskMatrixAxes } from './TaskMatrixAxes';
import { TaskMatrixProjectSidebar } from './TaskMatrixProjectSidebar';
import { type TaskMatrixProps, type TaskMatrixTask } from './types';

const NO_PROJECT_ID = '__no_project__';
const SCORE_ORDER = ['low', 'medium', 'high'] as const;

const groupIndex = (task: TaskMatrixTask) =>
  task.effort === null || task.impact === null
    ? -1
    : SCORE_ORDER.indexOf(task.effort) +
      (2 - SCORE_ORDER.indexOf(task.impact)) * 3;

const projectIdFor = (task: TaskMatrixTask) =>
  task.project?.id ?? NO_PROJECT_ID;

export const TaskMatrix = ({
  onOpenTask,
  projects,
  tags,
  tasks,
}: TaskMatrixProps) => {
  const allProjects = useMemo(
    () =>
      tasks.some((task) => task.project === null)
        ? [...projects, { id: NO_PROJECT_ID, name: t`No project` }]
        : projects,
    [projects, tasks],
  );
  const [selectedProjectIds, setSelectedProjectIds] =
    useState<Set<string> | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string> | null>(
    null,
  );
  const [taskQuery, setTaskQuery] = useState('');
  const [modalGroupIndex, setModalGroupIndex] = useState<
    number | 'unscored' | null
  >(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const tagLabels = new Map(tags.map((tag) => [tag.id, tag.label]));
  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach((task) =>
      counts.set(projectIdFor(task), (counts.get(projectIdFor(task)) ?? 0) + 1),
    );
    return counts;
  }, [tasks]);
  const scopedTasks = useMemo(() => {
    const query = taskQuery.trim().toLowerCase();
    return tasks.filter(
      (task) =>
        (selectedProjectIds === null ||
          selectedProjectIds.has(projectIdFor(task))) &&
        (!query ||
          `${task.title} ${task.owner?.name ?? ''}`
            .toLowerCase()
            .includes(query)),
    );
  }, [selectedProjectIds, taskQuery, tasks]);
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    scopedTasks.forEach((task) => {
      if (task.gtdTagIds.length === 0)
        counts.set(NO_TAGS_ID, (counts.get(NO_TAGS_ID) ?? 0) + 1);
      task.gtdTagIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    });
    return counts;
  }, [scopedTasks]);
  const visibleTasks = useMemo(
    () =>
      scopedTasks.filter(
        (task) =>
          selectedTagIds === null ||
          (task.gtdTagIds.length === 0
            ? selectedTagIds.has(NO_TAGS_ID)
            : task.gtdTagIds.some((id) => selectedTagIds.has(id))),
      ),
    [scopedTasks, selectedTagIds],
  );
  const groups = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) =>
        visibleTasks.filter((task) => groupIndex(task) === index),
      ),
    [visibleTasks],
  );
  const unscored = visibleTasks.filter((task) => groupIndex(task) === -1);

  const openList = (list: TaskMatrixTask[]) => {
    setModalGroupIndex(
      list.every((task) => groupIndex(task) === -1)
        ? 'unscored'
        : groupIndex(list[0]),
    );
    modalRef.current?.showModal();
  };
  const effectiveProjectIds =
    selectedProjectIds ?? new Set(allProjects.map(({ id }) => id));
  const effectiveTagIds =
    selectedTagIds ?? new Set([...tags.map(({ id }) => id), NO_TAGS_ID]);
  const modalTasks =
    modalGroupIndex === null
      ? []
      : modalGroupIndex === 'unscored'
        ? unscored
        : (groups[modalGroupIndex] ?? []);
  const changeProjects = (next: Set<string>) =>
    setSelectedProjectIds(next.size === allProjects.length ? null : next);
  const changeTags = (next: Set<string>) =>
    setSelectedTagIds(next.size === tags.length + 1 ? null : next);

  return (
    <StyledMatrixPage>
      <StyledMatrixToolbar>
        <StyledToolbarTitle>
          <StyledMatrixIcon aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </StyledMatrixIcon>
          {t`Impact & effort`}
          <span>{visibleTasks.length}</span>
        </StyledToolbarTitle>
        <StyledToolbarActions>
          <StyledSearchInput>
            <input
              aria-label={t`Search tasks`}
              onChange={(event) => setTaskQuery(event.target.value)}
              placeholder={t`Search tasks`}
              value={taskQuery}
            />
          </StyledSearchInput>
          <TaskMatrixGtdFilter
            onSelectedTagIdsChange={changeTags}
            selectedTagIds={effectiveTagIds}
            tagCounts={tagCounts}
            tags={tags}
          />
        </StyledToolbarActions>
      </StyledMatrixToolbar>
      <StyledMatrixBody>
        <TaskMatrixProjectSidebar
          onOnlyProject={(id) => setSelectedProjectIds(new Set([id]))}
          onSelectedProjectIdsChange={changeProjects}
          projects={allProjects}
          selectedProjectIds={effectiveProjectIds}
          taskCounts={taskCounts}
        />
        <StyledMatrixContent aria-label={t`Impact and effort matrix`}>
          <StyledMatrixMeta>
            <span>
              <strong>{visibleTasks.length - unscored.length}</strong>{' '}
              {t`scored tasks`}
            </span>
            <span>{t`Equal scores are grouped`}</span>
          </StyledMatrixMeta>
          <StyledChartScroll>
            <StyledMatrix>
              <TaskMatrixAxes />
              {groups.map((group, index) => (
                <StyledGroupCell
                  aria-label={`${SCORE_ORDER[index % 3]} effort`}
                  key={index}
                >
                  {isDefined(group[0]) && (
                    <TaskMatrixCard
                      onOpenTask={onOpenTask}
                      tagLabels={tagLabels}
                      task={group[0]}
                    />
                  )}
                  {group.length === 2 && (
                    <TaskMatrixCompactTask
                      onOpenTask={onOpenTask}
                      tagLabels={tagLabels}
                      task={group[1]}
                    />
                  )}
                  {group.length > 2 && (
                    <StyledMoreButton onClick={() => openList(group)}>
                      {t`View all`} {group.length} →
                    </StyledMoreButton>
                  )}
                </StyledGroupCell>
              ))}
              {visibleTasks.length > 0 &&
                groups.every((group) => group.length === 0) && (
                  <StyledEmptyState>
                    <strong>{t`These tasks need scores`}</strong>
                    <span>{t`They are waiting in the Unscored tray below.`}</span>
                  </StyledEmptyState>
                )}
              {visibleTasks.length === 0 && (
                <StyledEmptyState>
                  <strong>
                    {selectedProjectIds?.size === 0
                      ? t`Choose your projects`
                      : selectedTagIds?.size === 0
                        ? t`Choose your GTD tags`
                        : t`No matching tasks`}
                  </strong>
                  <button
                    onClick={() => {
                      setSelectedProjectIds(null);
                      setSelectedTagIds(null);
                      setTaskQuery('');
                    }}
                  >{t`Show all`}</button>
                </StyledEmptyState>
              )}
            </StyledMatrix>
          </StyledChartScroll>
          <StyledUnscoredTray
            aria-label={t`Review unscored tasks`}
            onClick={() => openList(unscored)}
          >
            <span aria-hidden="true">◇</span>
            <strong>{t`Unscored`}</strong>
            <span>{unscored.length}</span>
            <span>{t`Add effort or impact to place these tasks`}</span>
          </StyledUnscoredTray>
        </StyledMatrixContent>
      </StyledMatrixBody>
      <TaskMatrixModal
        modalRef={modalRef}
        onClose={() => {
          setModalGroupIndex(null);
          modalRef.current?.close();
        }}
        onOpenTask={(taskId) => {
          modalRef.current?.close();
          onOpenTask(taskId);
        }}
        tagLabels={tagLabels}
        tasks={modalTasks}
      />
    </StyledMatrixPage>
  );
};
