import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type TaskMatrixRecord } from '@/activities/tasks/task-matrix/types/TaskMatrixRecord';
import { type TaskMatrixScore, type TaskMatrixTask } from './types';

const PROJECT_COLORS = [
  themeCssVariables.color.blue,
  themeCssVariables.color.green,
  themeCssVariables.color.purple,
  themeCssVariables.color.orange,
  themeCssVariables.color.pink,
  themeCssVariables.color.turquoise,
];

const projectColor = (projectId: string) => {
  const hash = Array.from(projectId).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return PROJECT_COLORS[hash % PROJECT_COLORS.length];
};

const score = (value: unknown): TaskMatrixScore | null => {
  if (value === 'LOW') return 'low';
  if (value === 'MEDIUM') return 'medium';
  if (value === 'HIGH') return 'high';
  return null;
};

const displayName = (name: unknown): string => {
  if (typeof name === 'string') return name;
  if (typeof name !== 'object' || name === null) return '';
  const firstName = 'firstName' in name ? name.firstName : '';
  const lastName = 'lastName' in name ? name.lastName : '';
  return [firstName, lastName]
    .filter((part) => typeof part === 'string')
    .join(' ')
    .trim();
};

export const taskMatrixRecordAdapter = (
  record: TaskMatrixRecord,
): TaskMatrixTask => ({
  id: record.id,
  title: record.title ?? '',
  effort: score(record.effort),
  impact: score(record.impact),
  dueAt: record.dueAt,
  gtdTagIds: record.gtdTags ?? [],
  project: record.project
    ? {
        id: record.project.id,
        name: displayName(record.project.name),
        color: projectColor(record.project.id),
      }
    : null,
  owner: record.assignee
    ? {
        id: record.assignee.id,
        name: displayName(record.assignee.name),
        avatarUrl:
          typeof record.assignee.avatarUrl === 'string'
            ? record.assignee.avatarUrl
            : null,
      }
    : null,
});
