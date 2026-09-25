import { useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/icon';

import {
  StyledOnlyButton,
  StyledOption,
  StyledOptions,
  StyledProjectLabel,
  StyledProjectName,
  StyledProjectOption,
  StyledSearchInput,
  StyledSelectionActions,
  StyledSidebar,
  StyledSidebarHeading,
  StyledSubtleButton,
  StyledDot,
} from '../styles/taskMatrixStyles';
import { type TaskMatrixProject } from './types';

type TaskMatrixProjectSidebarProps = {
  projects: TaskMatrixProject[];
  selectedProjectIds: Set<string>;
  taskCounts: Map<string, number>;
  onOnlyProject: (projectId: string) => void;
  onSelectedProjectIdsChange: (projectIds: Set<string>) => void;
};

export const TaskMatrixProjectSidebar = ({
  onOnlyProject,
  onSelectedProjectIdsChange,
  projects,
  selectedProjectIds,
  taskCounts,
}: TaskMatrixProjectSidebarProps) => {
  const [query, setQuery] = useState('');
  const visibleProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [projects, query],
  );
  const allSelected = selectedProjectIds.size === projects.length;

  const setAll = (selected: boolean) =>
    onSelectedProjectIdsChange(
      selected ? new Set(projects.map(({ id }) => id)) : new Set(),
    );

  return (
    <StyledSidebar aria-label={t`Project filters`}>
      <StyledSidebarHeading>
        <strong>{t`Projects`}</strong>
        <span>{t`${selectedProjectIds.size} selected`}</span>
      </StyledSidebarHeading>
      <StyledSearchInput>
        <IconSearch size={14} />
        <input
          aria-label={t`Search projects`}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t`Find a project`}
          value={query}
        />
      </StyledSearchInput>
      <StyledOption>
        <input
          aria-label={t`All projects`}
          checked={allSelected}
          onChange={(event) => setAll(event.target.checked)}
          type="checkbox"
        />
        <span>{t`All projects`}</span>
        <span>
          {[...taskCounts.values()].reduce((total, count) => total + count, 0)}
        </span>
      </StyledOption>
      <StyledSelectionActions>
        <StyledSubtleButton
          onClick={() => setAll(true)}
        >{t`Select all`}</StyledSubtleButton>
        <StyledSubtleButton
          onClick={() => setAll(false)}
        >{t`Clear all`}</StyledSubtleButton>
      </StyledSelectionActions>
      <StyledOptions>
        {visibleProjects.map((project) => {
          const selected = selectedProjectIds.has(project.id);
          return (
            <StyledProjectOption key={project.id} selected={selected}>
              <StyledProjectLabel>
                <input
                  aria-label={project.name}
                  checked={selected}
                  onChange={() => {
                    const next = new Set(selectedProjectIds);
                    selected ? next.delete(project.id) : next.add(project.id);
                    onSelectedProjectIdsChange(next);
                  }}
                  type="checkbox"
                />
                <StyledDot color={project.color} />
                <StyledProjectName>{project.name}</StyledProjectName>
              </StyledProjectLabel>
              <span>{taskCounts.get(project.id) ?? 0}</span>
              <StyledOnlyButton onClick={() => onOnlyProject(project.id)}>
                {t`Only`}
              </StyledOnlyButton>
            </StyledProjectOption>
          );
        })}
      </StyledOptions>
    </StyledSidebar>
  );
};
