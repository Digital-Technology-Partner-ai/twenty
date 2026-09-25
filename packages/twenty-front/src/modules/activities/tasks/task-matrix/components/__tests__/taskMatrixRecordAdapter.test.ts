import { taskMatrixRecordAdapter } from '@/activities/tasks/task-matrix/components/taskMatrixRecordAdapter';

describe('taskMatrixRecordAdapter', () => {
  it('should preserve task identifiers and GTD values and normalize matrix scores', () => {
    expect(
      taskMatrixRecordAdapter({
        id: 'task-one',
        __typename: 'Task',
        title: 'Contact supplier',
        effort: 'LOW',
        impact: 'HIGH',
        gtdTags: ['EMAIL', 'CUSTOM_CONTEXT'],
        assignee: {
          id: 'person-one',
          __typename: 'WorkspaceMember',
          name: { firstName: 'Sam', lastName: 'Taylor' },
        },
        project: { id: 'project-one', __typename: 'Project', name: 'Website' },
      }),
    ).toMatchObject({
      id: 'task-one',
      title: 'Contact supplier',
      effort: 'low',
      impact: 'high',
      gtdTagIds: ['EMAIL', 'CUSTOM_CONTEXT'],
      owner: { id: 'person-one', name: 'Sam Taylor' },
      project: { id: 'project-one', name: 'Website' },
    });
  });

  it('should leave missing scores unscored without inventing an owner or project', () => {
    expect(
      taskMatrixRecordAdapter({ id: 'task-two', __typename: 'Task' }),
    ).toMatchObject({
      effort: null,
      impact: null,
      owner: null,
      project: null,
      gtdTagIds: [],
    });
  });
});
