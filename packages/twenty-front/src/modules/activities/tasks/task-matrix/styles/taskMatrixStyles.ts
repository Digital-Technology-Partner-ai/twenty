import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledMatrixPage = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export const StyledMatrixToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  min-height: 56px;
  padding: 0 ${themeCssVariables.spacing[5]};
`;

export const StyledToolbarTitle = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

export const StyledMatrixIcon = styled.span`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 3px;
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(2, 1fr);
  height: 18px;
  overflow: hidden;
  width: 18px;

  span:nth-child(1) {
    background: ${themeCssVariables.color.green2};
  }
  span:nth-child(2) {
    background: ${themeCssVariables.color.blue2};
  }
  span:nth-child(3) {
    background: ${themeCssVariables.color.yellow2};
  }
  span:nth-child(4) {
    background: ${themeCssVariables.color.red2};
  }
`;

export const StyledToolbarActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
`;

export const StyledSearchInput = styled.label`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 220px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  input {
    background: transparent;
    border: 0;
    color: inherit;
    min-width: 0;
    outline: 0;
    width: 100%;
  }
`;

export const StyledMatrixBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const StyledSidebar = styled.aside`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[3]};
  width: 246px;

  @media (max-width: 640px) {
    max-height: 220px;

    > div:last-child {
      min-height: 72px;
    }
    width: auto;
  }
`;

export const StyledMatrixContent = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[5]};
`;

export const StyledChartScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

export const StyledMatrix = styled.div`
  display: grid;
  flex: 1;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  grid-template-rows: repeat(3, minmax(190px, 1fr));
  margin: 0 0 30px 64px;
  min-height: 690px;
  min-width: 760px;
  padding: 36px 8px;
  position: relative;
`;

export const StyledQuadrantLabel = styled.span<{
  quadrant: 'quick' | 'major' | 'small' | 'reconsider';
}>`
  bottom: ${({ quadrant }) =>
    quadrant === 'small' || quadrant === 'reconsider' ? '12px' : 'auto'};
  color: ${({ quadrant }) =>
    ({
      quick: themeCssVariables.color.green9,
      major: themeCssVariables.color.blue9,
      small: themeCssVariables.color.yellow9,
      reconsider: themeCssVariables.color.red9,
    })[quadrant]};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.medium};
  left: ${({ quadrant }) =>
    quadrant === 'major' || quadrant === 'reconsider' ? 'auto' : '16px'};
  position: absolute;
  right: ${({ quadrant }) =>
    quadrant === 'major' || quadrant === 'reconsider' ? '16px' : 'auto'};
  top: ${({ quadrant }) =>
    quadrant === 'small' || quadrant === 'reconsider' ? 'auto' : '12px'};
  z-index: 2;
`;

export const StyledAxisLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  pointer-events: none;
  position: absolute;
  text-align: center;
  width: 58px;
  z-index: 2;
`;

export const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  inset: 35% 20%;
  justify-content: center;
  position: absolute;
  text-align: center;
  z-index: 3;
`;

export const StyledQuadrant = styled.div<{
  quadrant: 'quick' | 'major' | 'small' | 'reconsider';
}>`
  background: ${({ quadrant }) =>
    ({
      quick: themeCssVariables.color.green2,
      major: themeCssVariables.color.blue2,
      small: themeCssVariables.color.yellow2,
      reconsider: themeCssVariables.color.red2,
    })[quadrant]};
  inset: ${({ quadrant }) =>
    quadrant === 'quick'
      ? '0 50% 50% 0'
      : quadrant === 'major'
        ? '0 0 50% 50%'
        : quadrant === 'small'
          ? '50% 50% 0 0'
          : '50% 0 0 50%'};
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

export const StyledGroupCell = styled.section`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]};
  position: relative;
  z-index: 1;
`;

export const StyledTaskCard = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 132px;
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition:
    box-shadow 120ms ease,
    border-color 120ms ease;
  width: min(100%, 290px);

  &:hover,
  &:focus-visible {
    border-color: ${themeCssVariables.color.blue};
    box-shadow: 0 2px 8px ${themeCssVariables.boxShadow.light};
  }
`;

export const StyledCardTop = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

export const StyledProjectChip = styled.span<{ color?: string }>`
  align-items: center;
  background: ${({ color }) =>
    `color-mix(in srgb, ${color ?? themeCssVariables.font.color.tertiary} 12%, transparent)`};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: 10px;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 60%;
  overflow: hidden;
  padding: 2px ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledDot = styled.span<{ color?: string }>`
  background: ${({ color }) => color ?? themeCssVariables.font.color.tertiary};
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

export const StyledOwner = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 42%;
`;

export const StyledOwnerName = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledCardTitle = styled.span`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  font-size: 13px;
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 18px;
  overflow: hidden;
`;

export const StyledTags = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  min-height: 18px;
`;

export const StyledTagPill = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  max-width: 100%;
  overflow: hidden;
  padding: 2px 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledCardBottom = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  margin-top: auto;
`;

export const StyledScorePill = styled.span<{
  tone: 'good' | 'warn' | 'bad' | 'neutral';
}>`
  background: ${({ tone }) =>
    ({
      good: themeCssVariables.color.green3,
      warn: themeCssVariables.color.yellow3,
      bad: themeCssVariables.color.red3,
      neutral: themeCssVariables.background.tertiary,
    })[tone]};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${({ tone }) =>
    ({
      good: themeCssVariables.color.green9,
      warn: themeCssVariables.color.orange9,
      bad: themeCssVariables.color.red9,
      neutral: themeCssVariables.font.color.secondary,
    })[tone]};
  font-size: 9px;
  padding: 2px 4px;
`;

export const StyledCompactRow = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: 11px;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 290px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  text-align: left;
  text-overflow: ellipsis;
  width: 100%;
`;

export const StyledMoreButton = styled.button`
  background: transparent;
  border: 0;
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: 11px;
  padding: ${themeCssVariables.spacing[2]};
  width: min(100%, 290px);
`;

export const StyledScorePills = styled.span`
  display: inline-flex;
  gap: 3px;
`;

export const StyledDueDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  white-space: nowrap;
`;

export const StyledFilterButton = styled.button`
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

export const StyledFilterPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 320px;
  min-width: 250px;
  padding: ${themeCssVariables.spacing[3]};
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 4;
`;

export const StyledRelative = styled.div`
  position: relative;
`;

export const StyledOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  overflow: auto;
`;

export const StyledOption = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]};
`;

export const StyledSelectionActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const StyledSubtleButton = styled.button`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: 11px;
  padding: 0;
`;

export const StyledProjectOption = styled.div<{ selected: boolean }>`
  align-items: center;
  background: ${({ selected }) =>
    selected ? themeCssVariables.background.tertiary : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.xs};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 34px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const StyledProjectLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const StyledOnlyButton = styled.button`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: 10px;
  padding: 2px 4px;
`;

export const StyledProjectName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledSidebarHeading = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const StyledMatrixMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: 12px;
  justify-content: space-between;
`;

export const StyledUnscoredTray = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
`;

export const StyledModal = styled.dialog`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  max-height: 80vh;
  max-width: 560px;
  padding: ${themeCssVariables.spacing[5]};
  width: calc(100% - 32px);

  &::backdrop {
    background: ${themeCssVariables.background.overlayPrimary};
  }
`;

export const StyledModalHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

export const StyledModalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 60vh;
  overflow: auto;
`;
