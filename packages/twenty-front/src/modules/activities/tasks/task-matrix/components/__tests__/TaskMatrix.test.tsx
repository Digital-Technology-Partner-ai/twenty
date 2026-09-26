import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TaskMatrix } from '@/activities/tasks/task-matrix/components/TaskMatrix';
import {
  type TaskMatrixProject,
  type TaskMatrixTag,
  type TaskMatrixTask,
} from '@/activities/tasks/task-matrix/components/types';

const projects: TaskMatrixProject[] = [
  { id: 'alpha', name: 'Alpha' },
  { id: 'beta', name: 'Beta' },
];
const tags: TaskMatrixTag[] = [
  { id: 'next', label: 'Next action' },
  { id: 'waiting', label: 'Waiting' },
];
const makeTask = (
  id: string,
  title: string,
  project: TaskMatrixProject | null,
  gtdTagIds: string[] = ['next'],
): TaskMatrixTask => ({
  dueAt: null,
  effort: 'low',
  gtdTagIds,
  id,
  impact: 'high',
  owner: { id: `owner-${id}`, name: 'Alex Owner' },
  project,
  title,
});

const renderMatrix = (tasks: TaskMatrixTask[]) =>
  render(
    <TaskMatrix
      onOpenTask={jest.fn()}
      projects={projects}
      tags={tags}
      tasks={tasks}
    />,
  );

beforeAll(() => {
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
  }
  if (typeof HTMLDialogElement.prototype.close !== 'function') {
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  }
});

describe('TaskMatrix', () => {
  it('starts with every project selected and supports clear/select all', async () => {
    const user = userEvent.setup();
    renderMatrix([
      makeTask('a', 'Alpha task', projects[0]),
      makeTask('b', 'Beta task', projects[1]),
    ]);

    expect(screen.getByRole('button', { name: 'Alpha task' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Beta task' })).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: 'Clear all' })[0]);
    expect(
      screen.queryByRole('button', { name: 'Alpha task' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(screen.getByRole('button', { name: 'Beta task' })).toBeVisible();
  });

  it('matches any selected GTD tag and includes untagged tasks separately', async () => {
    const user = userEvent.setup();
    renderMatrix([
      makeTask('a', 'Next task', projects[0], ['next']),
      makeTask('b', 'Waiting task', projects[0], ['waiting']),
      makeTask('c', 'Untagged task', projects[0], []),
    ]);
    await user.click(screen.getByRole('button', { name: /GTD tags/ }));
    await user.click(screen.getAllByRole('button', { name: 'Clear all' })[0]);
    await user.click(screen.getByRole('checkbox', { name: 'Next action' }));
    expect(screen.getByRole('button', { name: 'Next task' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Waiting task' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'No tags' }));
    expect(screen.getByRole('button', { name: 'Untagged task' })).toBeVisible();
  });

  it('renders every task in a congested score group with an overflow cue', () => {
    renderMatrix([
      makeTask('a', 'First task', projects[0]),
      makeTask('b', 'Second task', projects[0]),
      makeTask('c', 'Third task', projects[0]),
      makeTask('d', 'Fourth task', projects[0]),
      makeTask('e', 'Fifth task', projects[0]),
    ]);

    expect(screen.getByRole('button', { name: 'First task' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Second task' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Third task' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fourth task' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fifth task' })).toBeVisible();
    expect(screen.getByRole('button', { name: '1 more' })).toBeVisible();
    expect(screen.queryByText(/Effort:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Impact:/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /View all/ }),
    ).not.toBeInTheDocument();
  });

  it('opens the unscored tray for tasks missing either score', async () => {
    const user = userEvent.setup();
    const unscored = makeTask('u', 'Needs scoring', projects[0]);
    unscored.impact = null;
    renderMatrix([unscored]);
    await user.click(
      screen.getByRole('button', { name: /Review unscored tasks/ }),
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('Needs scoring');
  });
});
