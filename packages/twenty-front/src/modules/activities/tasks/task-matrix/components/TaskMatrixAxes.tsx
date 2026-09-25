import { t } from '@lingui/core/macro';
import {
  StyledAxisLabel,
  StyledQuadrant,
  StyledQuadrantLabel,
} from '@/activities/tasks/task-matrix/styles/taskMatrixStyles';

export const TaskMatrixAxes = () => (
  <>
    <StyledQuadrant quadrant="quick" />
    <StyledQuadrant quadrant="major" />
    <StyledQuadrant quadrant="small" />
    <StyledQuadrant quadrant="reconsider" />
    <StyledQuadrantLabel quadrant="quick">
      ● {t`Quick wins`}
    </StyledQuadrantLabel>
    <StyledQuadrantLabel quadrant="major">
      ● {t`Major projects`}
    </StyledQuadrantLabel>
    <StyledQuadrantLabel quadrant="small">
      ● {t`Small improvements`}
    </StyledQuadrantLabel>
    <StyledQuadrantLabel quadrant="reconsider">
      ● {t`Reconsider`}
    </StyledQuadrantLabel>
    <StyledAxisLabel
      style={{ left: '-62px', top: '19%' }}
    >{t`High impact`}</StyledAxisLabel>
    <StyledAxisLabel
      style={{ left: '-62px', top: '50%' }}
    >{t`Medium impact`}</StyledAxisLabel>
    <StyledAxisLabel
      style={{ left: '-62px', top: '81%' }}
    >{t`Low impact`}</StyledAxisLabel>
    <StyledAxisLabel
      style={{ bottom: '-24px', left: '13%' }}
    >{t`Low effort`}</StyledAxisLabel>
    <StyledAxisLabel
      style={{ bottom: '-24px', left: '46%' }}
    >{t`Medium effort`}</StyledAxisLabel>
    <StyledAxisLabel
      style={{ bottom: '-24px', right: '13%' }}
    >{t`High effort`}</StyledAxisLabel>
  </>
);
