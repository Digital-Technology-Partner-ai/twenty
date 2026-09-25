import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const TASK_MATRIX_FIELD_NAMES = [
  'title',
  'effort',
  'impact',
  'gtdTags',
  'plannedDay',
  'dueAt',
  'status',
  'taskTargets',
  'assignee',
  'project',
] as const;

export const getTaskMatrixFieldNames = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): string[] => {
  const readableNames = new Set(
    objectMetadataItem.readableFields.map((field) => field.name),
  );

  return TASK_MATRIX_FIELD_NAMES.filter((name) => readableNames.has(name));
};

export const getTaskMatrixTagOptions = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) =>
  objectMetadataItem.readableFields.find((field) => field.name === 'gtdTags')
    ?.options ?? [];
