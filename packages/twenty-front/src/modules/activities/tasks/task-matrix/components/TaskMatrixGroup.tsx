import { plural } from '@lingui/core/macro';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  StyledGroupCell,
  StyledGroupCount,
  StyledGroupOverflowButton,
  StyledGroupScroller,
} from '../styles/taskMatrixStyles';
import { TaskMatrixExpandableCard } from './TaskMatrixCard';
import { type TaskMatrixTask } from './types';

const DEFAULT_VISIBLE_TASK_COUNT = 4;

type HiddenTaskCounts = {
  above: number;
  below: number;
};

type TaskMatrixGroupProps = {
  ariaLabel: string;
  onOpenTask: (taskId: string) => void;
  tagLabels: Map<string, string>;
  tasks: TaskMatrixTask[];
};

export const TaskMatrixGroup = ({
  ariaLabel,
  onOpenTask,
  tagLabels,
  tasks,
}: TaskMatrixGroupProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hiddenTaskCounts, setHiddenTaskCounts] = useState<HiddenTaskCounts>({
    above: 0,
    below: Math.max(tasks.length - DEFAULT_VISIBLE_TASK_COUNT, 0),
  });

  const updateHiddenTaskCounts = useCallback(() => {
    const scroller = scrollerRef.current;

    // JSDOM and an element before layout report zero dimensions. Keeping the
    // deterministic four-row fallback also prevents the cue flashing away.
    if (!scroller || scroller.clientHeight === 0) return;

    const scrollerBounds = scroller.getBoundingClientRect();
    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>('[data-task-matrix-card]'),
    );
    const nextCounts = cards.reduce<HiddenTaskCounts>(
      (counts, card) => {
        const cardBounds = card.getBoundingClientRect();

        if (cardBounds.bottom <= scrollerBounds.top + 1) {
          counts.above += 1;
        } else if (cardBounds.top >= scrollerBounds.bottom - 1) {
          counts.below += 1;
        }

        return counts;
      },
      { above: 0, below: 0 },
    );

    setHiddenTaskCounts((currentCounts) =>
      currentCounts.above === nextCounts.above &&
      currentCounts.below === nextCounts.below
        ? currentCounts
        : nextCounts,
    );
  }, []);

  useLayoutEffect(() => {
    setHiddenTaskCounts({
      above: 0,
      below: Math.max(tasks.length - DEFAULT_VISIBLE_TASK_COUNT, 0),
    });
    updateHiddenTaskCounts();

    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(updateHiddenTaskCounts);
    resizeObserver.observe(scroller);
    scroller
      .querySelectorAll<HTMLElement>('[data-task-matrix-card]')
      .forEach((card) => resizeObserver.observe(card));

    return () => resizeObserver.disconnect();
  }, [tasks, updateHiddenTaskCounts]);

  const hiddenCount =
    hiddenTaskCounts.below > 0
      ? hiddenTaskCounts.below
      : hiddenTaskCounts.above;
  const overflowLabel =
    hiddenTaskCounts.below > 0
      ? plural(hiddenCount, { one: '# more', other: '# more' })
      : plural(hiddenCount, { one: '# above', other: '# above' });

  const handleOverflowClick = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    if (hiddenTaskCounts.below > 0) {
      scroller.scrollBy({
        behavior: 'smooth',
        top: Math.max(scroller.clientHeight - 38, 38),
      });
    } else {
      scroller.scrollTo({ behavior: 'smooth', top: 0 });
    }
  };

  return (
    <StyledGroupCell aria-label={ariaLabel}>
      {tasks.length > 0 && (
        <StyledGroupCount>
          {plural(tasks.length, { one: '# task', other: '# tasks' })}
        </StyledGroupCount>
      )}
      <StyledGroupScroller onScroll={updateHiddenTaskCounts} ref={scrollerRef}>
        {tasks.map((task) => (
          <TaskMatrixExpandableCard
            key={task.id}
            onOpenTask={onOpenTask}
            tagLabels={tagLabels}
            task={task}
          />
        ))}
      </StyledGroupScroller>
      {hiddenCount > 0 && (
        <StyledGroupOverflowButton
          aria-label={overflowLabel}
          onClick={handleOverflowClick}
        >
          {overflowLabel}{' '}
          <span aria-hidden="true">
            {hiddenTaskCounts.below > 0 ? '↓' : '↑'}
          </span>
        </StyledGroupOverflowButton>
      )}
    </StyledGroupCell>
  );
};
