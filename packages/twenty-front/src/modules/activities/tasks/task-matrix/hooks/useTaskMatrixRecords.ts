import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationGqlRecordFields,
} from 'twenty-shared/types';
import {
  getTaskMatrixFieldNames,
  getTaskMatrixTagOptions,
} from '@/activities/tasks/task-matrix/utils/getTaskMatrixFieldNames';
import { type TaskMatrixRecord } from '@/activities/tasks/task-matrix/types/TaskMatrixRecord';

export const useTaskMatrixRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const queryParams = useFindManyRecordIndexTableParams(
    CoreObjectNameSingular.Task,
  );
  const [fetchingAllPages, setFetchingAllPages] = useState(false);
  const [paginationError, setPaginationError] = useState<Error | undefined>();
  // The cursor is owned by the shared record query; this prevents duplicate fetches while it advances.
  // oxlint-disable-next-line twenty/no-state-useref
  const paginationInFlight = useRef(false);
  // Incremented whenever the shared query identity changes, invalidating stale page responses.
  // oxlint-disable-next-line twenty/no-state-useref
  const paginationQueryGeneration = useRef(0);

  const fieldNames = useMemo(
    () => getTaskMatrixFieldNames(objectMetadataItem),
    [objectMetadataItem],
  );
  const recordGqlFields = useMemo<RecordGqlOperationGqlRecordFields>(() => {
    const fields = objectMetadataItem.readableFields.filter((field) =>
      fieldNames.includes(field.name),
    );
    const readableObjectMetadataItems = objectMetadataItems.map((item) => ({
      ...item,
      fields: item.readableFields,
    }));
    const readableObjectMetadataItem =
      readableObjectMetadataItems.find(
        (item) => item.id === objectMetadataItem.id,
      ) ?? objectMetadataItem;

    return {
      id: true,
      ...generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: readableObjectMetadataItems,
        sourceObjectMetadataItem: readableObjectMetadataItem,
        fields,
        depth: 1,
      }),
    };
  }, [fieldNames, objectMetadataItem, objectMetadataItems]);

  const {
    records,
    loading,
    error,
    totalCount,
    hasNextPage,
    fetchMoreRecords,
    refetch,
    queryIdentifier,
  } = useFindManyRecords<TaskMatrixRecord>({
    ...queryParams,
    objectNameSingular: CoreObjectNameSingular.Task,
    recordGqlFields,
    limit: 200,
    fetchPolicy: 'cache-and-network',
  });

  const fetchNextPage = useCallback(async () => {
    if (paginationInFlight.current || !hasNextPage) return;
    const queryGeneration = paginationQueryGeneration.current;
    paginationInFlight.current = true;
    setPaginationError(undefined);
    setFetchingAllPages(true);
    try {
      const nextPage = await fetchMoreRecords();
      if (
        nextPage?.error &&
        queryGeneration === paginationQueryGeneration.current
      ) {
        throw nextPage.error;
      }
    } catch (nextPageError) {
      if (queryGeneration === paginationQueryGeneration.current) {
        setPaginationError(
          nextPageError instanceof Error
            ? nextPageError
            : new Error('Unable to load more tasks'),
        );
      }
    } finally {
      setFetchingAllPages(false);
      paginationInFlight.current = false;
    }
  }, [fetchMoreRecords, hasNextPage]);

  useEffect(() => {
    paginationQueryGeneration.current += 1;
    setPaginationError(undefined);
  }, [queryIdentifier]);

  useEffect(() => {
    if (!loading && !paginationError && hasNextPage) void fetchNextPage();
  }, [
    fetchNextPage,
    hasNextPage,
    loading,
    paginationError,
    fetchingAllPages,
    records.length,
  ]);

  return {
    records,
    objectMetadataItem,
    fieldNames,
    tagOptions: getTaskMatrixTagOptions(objectMetadataItem),
    loading: loading || fetchingAllPages,
    error: error ?? paginationError,
    totalCount,
    hasNextPage,
    refetch,
    retry: async () => {
      if (paginationInFlight.current) return;
      const queryGeneration = paginationQueryGeneration.current;
      paginationInFlight.current = true;
      setFetchingAllPages(true);
      setPaginationError(undefined);
      try {
        await refetch();
      } catch (retryError) {
        if (queryGeneration === paginationQueryGeneration.current) {
          setPaginationError(
            retryError instanceof Error
              ? retryError
              : new Error('Unable to refresh tasks'),
          );
        }
      } finally {
        paginationInFlight.current = false;
        setFetchingAllPages(false);
      }
    },
  };
};
