import { t } from '@lingui/core/macro';
import { Avatar } from 'twenty-ui/data-display';

import {
  StyledCardBottom,
  StyledCardTitle,
  StyledCardTop,
  StyledCompactRow,
  StyledDueDate,
  StyledDot,
  StyledOwner,
  StyledOwnerName,
  StyledProjectChip,
  StyledScorePill,
  StyledScorePills,
  StyledTagPill,
  StyledTags,
  StyledTaskCard,
} from '../styles/taskMatrixStyles';
import { type TaskMatrixScore, type TaskMatrixTask } from './types';

const toneFor = (kind: 'effort' | 'impact', score: TaskMatrixScore | null) => {
  if (score === null) return 'neutral' as const;
  if (score === 'medium') return 'warn' as const;
  return kind === 'impact'
    ? score === 'high'
      ? 'good'
      : 'bad'
    : score === 'low'
      ? 'good'
      : 'bad';
};

const formatDue = (dueAt?: string | null) => {
  if (!dueAt) return t`No due date`;
  const date = new Date(dueAt);
  return Number.isNaN(date.getTime())
    ? dueAt
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export const TaskMatrixCard = ({
  onOpenTask,
  task,
  tagLabels,
}: {
  onOpenTask: (id: string) => void;
  task: TaskMatrixTask;
  tagLabels: Map<string, string>;
}) => (
  <StyledTaskCard aria-label={task.title} onClick={() => onOpenTask(task.id)}>
    <StyledCardTop>
      <StyledProjectChip color={task.project?.color}>
        <StyledDot color={task.project?.color} />
        {task.project?.name ?? t`No project`}
      </StyledProjectChip>
      {task.owner && (
        <StyledOwner title={task.owner.name}>
          <StyledOwnerName>{task.owner.name.split(' ')[0]}</StyledOwnerName>
          <Avatar
            avatarUrl={task.owner.avatarUrl}
            placeholder={task.owner.name}
            size="sm"
            type="rounded"
          />
        </StyledOwner>
      )}
    </StyledCardTop>
    <StyledCardTitle>{task.title || t`Untitled task`}</StyledCardTitle>
    <StyledTags aria-label={t`GTD tags`}>
      {task.gtdTagIds.length === 0 ? (
        <StyledTagPill>{t`No tags`}</StyledTagPill>
      ) : (
        task.gtdTagIds
          .slice(0, 2)
          .map((id) => (
            <StyledTagPill key={id}>{tagLabels.get(id) ?? id}</StyledTagPill>
          ))
      )}
      {task.gtdTagIds.length > 2 && (
        <StyledTagPill>+{task.gtdTagIds.length - 2}</StyledTagPill>
      )}
    </StyledTags>
    <StyledCardBottom>
      <StyledScorePills>
        <StyledScorePill tone={toneFor('effort', task.effort)}>
          {t`Effort:`} {task.effort ?? '—'}
        </StyledScorePill>
        <StyledScorePill tone={toneFor('impact', task.impact)}>
          {t`Impact:`} {task.impact ?? '—'}
        </StyledScorePill>
      </StyledScorePills>
      <StyledDueDate>{formatDue(task.dueAt)}</StyledDueDate>
    </StyledCardBottom>
  </StyledTaskCard>
);

export const TaskMatrixCompactTask = ({
  onOpenTask,
  task,
  tagLabels,
}: {
  onOpenTask: (id: string) => void;
  task: TaskMatrixTask;
  tagLabels: Map<string, string>;
}) => (
  <StyledCompactRow aria-label={task.title} onClick={() => onOpenTask(task.id)}>
    <StyledDot color={task.project?.color} />
    <span>{task.title}</span>
    {task.gtdTagIds.length > 0 && (
      <StyledTagPill>
        {tagLabels.get(task.gtdTagIds[0]) ?? task.gtdTagIds[0]}
      </StyledTagPill>
    )}
  </StyledCompactRow>
);
