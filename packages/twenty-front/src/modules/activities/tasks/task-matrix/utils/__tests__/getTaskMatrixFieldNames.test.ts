import {
  getTaskMatrixFieldNames,
  getTaskMatrixStatusOptions,
} from '@/activities/tasks/task-matrix/utils/getTaskMatrixFieldNames';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

describe('getTaskMatrixFieldNames', () => {
  it('keeps only supported readable task fields', () => {
    const metadata = {
      readableFields: [
        { name: 'title' },
        { name: 'effort' },
        { name: 'secretField' },
        { name: 'gtdTags' },
        { name: 'status' },
      ],
    } as EnrichedObjectMetadataItem;

    expect(getTaskMatrixFieldNames(metadata)).toEqual([
      'title',
      'effort',
      'gtdTags',
      'status',
    ]);
  });

  it('returns the readable status field options', () => {
    const statusOptions = [
      { value: 'TODO', label: 'To do' },
      { value: 'DONE', label: 'Done' },
    ];
    const metadata = {
      readableFields: [{ name: 'status', options: statusOptions }],
    } as EnrichedObjectMetadataItem;

    expect(getTaskMatrixStatusOptions(metadata)).toEqual(statusOptions);
  });
});
