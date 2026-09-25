import { getTaskMatrixFieldNames } from '@/activities/tasks/task-matrix/utils/getTaskMatrixFieldNames';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

describe('getTaskMatrixFieldNames', () => {
  it('keeps only supported readable task fields', () => {
    const metadata = {
      readableFields: [
        { name: 'title' },
        { name: 'effort' },
        { name: 'secretField' },
        { name: 'gtdTags' },
      ],
    } as EnrichedObjectMetadataItem;

    expect(getTaskMatrixFieldNames(metadata)).toEqual([
      'title',
      'effort',
      'gtdTags',
    ]);
  });
});
