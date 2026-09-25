import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { IconChevronDown, IconSearch } from 'twenty-ui/icon';

import {
  StyledFilterButton,
  StyledFilterPanel,
  StyledOption,
  StyledOptions,
  StyledRelative,
  StyledSearchInput,
  StyledSelectionActions,
  StyledSubtleButton,
} from '../styles/taskMatrixStyles';
import { type TaskMatrixTag } from './types';

type TaskMatrixGtdFilterProps = {
  selectedTagIds: Set<string>;
  tagCounts: Map<string, number>;
  tags: TaskMatrixTag[];
  onSelectedTagIdsChange: (tagIds: Set<string>) => void;
};

const NO_TAGS_ID = '__no_tags__';

export const TaskMatrixGtdFilter = ({
  onSelectedTagIdsChange,
  selectedTagIds,
  tagCounts,
  tags,
}: TaskMatrixGtdFilterProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);
  const allTags = useMemo(
    () => [...tags, { id: NO_TAGS_ID, label: t`No tags` }],
    [tags],
  );
  const visibleTags = allTags.filter((tag) =>
    tag.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const allSelected = selectedTagIds.size === allTags.length;

  const setAll = (selected: boolean) =>
    onSelectedTagIdsChange(
      selected ? new Set(allTags.map(({ id }) => id)) : new Set(),
    );

  return (
    <StyledRelative ref={pickerRef}>
      <StyledFilterButton aria-expanded={open} onClick={() => setOpen(!open)}>
        {t`GTD tags`}{' '}
        {allSelected ? t`All tags` : t`${selectedTagIds.size} selected`}{' '}
        <IconChevronDown size={14} />
      </StyledFilterButton>
      {open && (
        <StyledFilterPanel>
          <StyledSearchInput>
            <IconSearch size={14} />
            <input
              aria-label={t`Search GTD tags`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t`Search all GTD tags`}
              value={query}
            />
          </StyledSearchInput>
          <StyledSelectionActions>
            <StyledSubtleButton
              onClick={() => setAll(true)}
            >{t`Select all`}</StyledSubtleButton>
            <StyledSubtleButton
              onClick={() => setAll(false)}
            >{t`Clear all`}</StyledSubtleButton>
          </StyledSelectionActions>
          <StyledOptions>
            {visibleTags.map((tag) => (
              <StyledOption key={tag.id}>
                <input
                  aria-label={tag.label}
                  checked={selectedTagIds.has(tag.id)}
                  onChange={() => {
                    const next = new Set(selectedTagIds);
                    next.has(tag.id) ? next.delete(tag.id) : next.add(tag.id);
                    onSelectedTagIdsChange(next);
                  }}
                  type="checkbox"
                />
                <span>{tag.label}</span>
                <span>{tagCounts.get(tag.id) ?? 0}</span>
              </StyledOption>
            ))}
          </StyledOptions>
          <StyledSubtleButton
            onClick={() => setOpen(false)}
          >{t`Done`}</StyledSubtleButton>
        </StyledFilterPanel>
      )}
    </StyledRelative>
  );
};

export { NO_TAGS_ID };
