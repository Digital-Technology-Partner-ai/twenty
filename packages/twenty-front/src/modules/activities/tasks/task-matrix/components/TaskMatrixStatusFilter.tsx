import { useEffect, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/icon';

import {
  StyledFilterButton,
  StyledFilterPanel,
  StyledOption,
  StyledOptions,
  StyledRelative,
  StyledSelectionActions,
  StyledSubtleButton,
} from '../styles/taskMatrixStyles';
import { type TaskMatrixStatus } from './types';

type TaskMatrixStatusFilterProps = {
  selectedStatusIds: Set<string>;
  statusCounts: Map<string, number>;
  statuses: TaskMatrixStatus[];
  onSelectedStatusIdsChange: (statusIds: Set<string>) => void;
};

export const TaskMatrixStatusFilter = ({
  onSelectedStatusIdsChange,
  selectedStatusIds,
  statusCounts,
  statuses,
}: TaskMatrixStatusFilterProps) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
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

  const allSelected = selectedStatusIds.size === statuses.length;
  const selectedStatus =
    selectedStatusIds.size === 1
      ? statuses.find(({ id }) => selectedStatusIds.has(id))
      : undefined;
  const summary = allSelected
    ? t`All statuses`
    : (selectedStatus?.label ?? t`${selectedStatusIds.size} selected`);
  const setAll = (selected: boolean) =>
    onSelectedStatusIdsChange(
      selected ? new Set(statuses.map(({ id }) => id)) : new Set(),
    );

  return (
    <StyledRelative ref={pickerRef}>
      <StyledFilterButton aria-expanded={open} onClick={() => setOpen(!open)}>
        {t`Status`} {summary} <IconChevronDown size={14} />
      </StyledFilterButton>
      {open && (
        <StyledFilterPanel>
          <StyledSelectionActions>
            <StyledSubtleButton
              onClick={() => setAll(true)}
            >{t`Select all`}</StyledSubtleButton>
            <StyledSubtleButton
              onClick={() => setAll(false)}
            >{t`Clear all`}</StyledSubtleButton>
          </StyledSelectionActions>
          <StyledOptions>
            {statuses.map((status) => (
              <StyledOption key={status.id}>
                <input
                  aria-label={status.label}
                  checked={selectedStatusIds.has(status.id)}
                  onChange={() => {
                    const next = new Set(selectedStatusIds);
                    next.has(status.id)
                      ? next.delete(status.id)
                      : next.add(status.id);
                    onSelectedStatusIdsChange(next);
                  }}
                  type="checkbox"
                />
                <span>{status.label}</span>
                <span>{statusCounts.get(status.id) ?? 0}</span>
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
