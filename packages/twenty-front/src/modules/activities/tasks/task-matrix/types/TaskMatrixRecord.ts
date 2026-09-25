import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type TaskMatrixScore = 'LOW' | 'MEDIUM' | 'HIGH' | null;

export type TaskMatrixRecord = ObjectRecord & {
  title?: string | null;
  effort?: TaskMatrixScore;
  impact?: TaskMatrixScore;
  gtdTags?: string[] | null;
  plannedDay?: string | null;
  dueAt?: string | null;
  status?: string | null;
  taskTargets?: ObjectRecord[] | null;
  assignee?: ObjectRecord | null;
  project?: ObjectRecord | null;
};

export type TaskMatrixProject = {
  id: string;
  name: string;
  color?: string | null;
};

export type TaskMatrixTagOption = {
  value: string;
  label: string;
  color?: string | null;
};
