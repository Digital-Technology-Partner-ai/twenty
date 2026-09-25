import { renderHook, act, waitFor } from '@testing-library/react';

import { useTaskMatrixRecords } from '@/activities/tasks/task-matrix/hooks/useTaskMatrixRecords';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const useObjectMetadataItemMock = jest.fn();
const useObjectMetadataItemsMock = jest.fn();
const useFindManyRecordIndexTableParamsMock = jest.fn();
const useFindManyRecordsMock = jest.fn();
const generateDepthRecordGqlFieldsFromFieldsMock = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => useObjectMetadataItemMock(),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => useObjectMetadataItemsMock(),
}));
jest.mock(
  '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams',
  () => ({
    useFindManyRecordIndexTableParams: () =>
      useFindManyRecordIndexTableParamsMock(),
  }),
);
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (...args: unknown[]) => useFindManyRecordsMock(...args),
}));
jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields',
  () => ({
    generateDepthRecordGqlFieldsFromFields: (...args: unknown[]) =>
      generateDepthRecordGqlFieldsFromFieldsMock(...args),
  }),
);

const taskMetadata = getTestEnrichedObjectMetadataItemsMock().find(
  (item) => item.nameSingular === 'task',
);

if (!taskMetadata) {
  throw new Error('Task metadata fixture is missing');
}

const matrixFields = ['effort', 'impact', 'gtdTags', 'project', 'assignee'].map(
  (name) => ({
    ...taskMetadata.fields[0],
    id: `matrix-${name}`,
    name,
  }),
);
const metadata = {
  ...taskMetadata,
  fields: [...taskMetadata.fields, ...matrixFields],
  readableFields: [...taskMetadata.readableFields, ...matrixFields],
};

describe('useTaskMatrixRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useObjectMetadataItemMock.mockReturnValue({ objectMetadataItem: metadata });
    useObjectMetadataItemsMock.mockReturnValue({
      objectMetadataItems: [metadata],
    });
    useFindManyRecordIndexTableParamsMock.mockReturnValue({
      filter: { title: { like: '%query%' } },
      orderBy: [{ title: 'AscNullsLast' }],
    });
    generateDepthRecordGqlFieldsFromFieldsMock.mockReturnValue({ title: true });
  });

  it('fetches every page one at a time', async () => {
    const allRecords = Array.from({ length: 425 }, (_, index) => ({
      id: `task-${index}`,
    }));
    let records = allRecords.slice(0, 200);
    let hasNextPage = true;
    const fetchMoreRecords = jest.fn(async () => {
      records = allRecords.slice(0, records.length + 200);
      hasNextPage = records.length < allRecords.length;
      return { data: [] };
    });
    useFindManyRecordsMock.mockImplementation(() => ({
      records,
      loading: false,
      error: undefined,
      totalCount: 425,
      hasNextPage,
      fetchMoreRecords,
      refetch: jest.fn(),
      queryIdentifier: 'tasks-query',
    }));

    const { result, rerender } = renderHook(() => useTaskMatrixRecords());

    await waitFor(() => expect(fetchMoreRecords).toHaveBeenCalledTimes(2));
    // Apollo notifies subscribers when the final page is merged into its cache.
    rerender();
    expect(result.current.records).toHaveLength(425);
    expect(useFindManyRecordsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { title: { like: '%query%' } },
        limit: 200,
      }),
    );
  });

  it('surfaces pagination failures and retries the base query', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    const fetchMoreRecords = jest.fn().mockResolvedValue({
      error: new Error('page failed'),
    });
    useFindManyRecordsMock.mockReturnValue({
      records: [],
      loading: false,
      error: undefined,
      totalCount: 201,
      hasNextPage: true,
      fetchMoreRecords,
      refetch,
      queryIdentifier: 'tasks-query',
    });

    const { result } = renderHook(() => useTaskMatrixRecords());
    await waitFor(() =>
      expect(result.current.error?.message).toBe('page failed'),
    );

    await act(async () => result.current.retry());
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('ignores an old pagination failure after the query changes', async () => {
    let queryIdentifier = 'first-query';
    let rejectPage: ((error: Error) => void) | undefined;
    const fetchMoreRecords = jest.fn(
      () =>
        new Promise<{ error: Error }>((resolve, reject) => {
          rejectPage = (error) => reject(error);
          void resolve;
        }),
    );
    useFindManyRecordsMock.mockImplementation(() => ({
      records: [{ id: queryIdentifier }],
      loading: false,
      error: undefined,
      totalCount: 201,
      hasNextPage: true,
      fetchMoreRecords,
      refetch: jest.fn(),
      queryIdentifier,
    }));

    const { result, rerender } = renderHook(() => useTaskMatrixRecords());
    await waitFor(() => expect(fetchMoreRecords).toHaveBeenCalledTimes(1));

    queryIdentifier = 'second-query';
    rerender();
    await act(async () => rejectPage?.(new Error('stale page failed')));

    await waitFor(() => expect(result.current.error).toBeUndefined());
    expect(result.current.records).toEqual([{ id: 'second-query' }]);
  });

  it('reflects records replaced by the shared query cache', () => {
    let records = [{ id: 'before', title: 'Old title' }];
    useFindManyRecordsMock.mockImplementation(() => ({
      records,
      loading: false,
      error: undefined,
      totalCount: 1,
      hasNextPage: false,
      fetchMoreRecords: jest.fn(),
      refetch: jest.fn(),
      queryIdentifier: 'tasks-query',
    }));

    const { result, rerender } = renderHook(() => useTaskMatrixRecords());
    expect(result.current.records[0]?.title).toBe('Old title');

    records = [{ id: 'before', title: 'Updated title' }];
    rerender();
    expect(result.current.records[0]?.title).toBe('Updated title');
  });

  it('surfaces a failed base-query retry without rejecting', async () => {
    const refetch = jest.fn().mockRejectedValue(new Error('refresh failed'));
    useFindManyRecordsMock.mockReturnValue({
      records: [],
      loading: false,
      error: undefined,
      totalCount: 0,
      hasNextPage: false,
      fetchMoreRecords: jest.fn(),
      refetch,
      queryIdentifier: 'tasks-query',
    });

    const { result } = renderHook(() => useTaskMatrixRecords());
    await act(async () => result.current.retry());

    expect(result.current.error?.message).toBe('refresh failed');
  });
});
