export type TaskMatrixScore = 'low' | 'medium' | 'high';

export type TaskMatrixOwner = {
  avatarUrl?: string | null;
  id: string;
  name: string;
};

export type TaskMatrixProject = {
  color?: string;
  id: string;
  name: string;
  taskCount?: number;
};

export type TaskMatrixTag = {
  id: string;
  label: string;
};

export type TaskMatrixTask = {
  dueAt?: string | null;
  effort: TaskMatrixScore | null;
  gtdTagIds: string[];
  id: string;
  impact: TaskMatrixScore | null;
  owner: TaskMatrixOwner | null;
  project: TaskMatrixProject | null;
  title: string;
};

export type TaskMatrixProps = {
  onOpenTask: (taskId: string) => void;
  projects: TaskMatrixProject[];
  tags: TaskMatrixTag[];
  tasks: TaskMatrixTask[];
};
