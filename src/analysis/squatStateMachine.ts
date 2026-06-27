import type { PoseAngles, SquatMetrics, SquatPhase } from '../pose/types';
import { clamp } from '../utils/geometry';

type SquatMachineState = {
  repCount: number;
  phase: SquatPhase;
  bottomReached: boolean;
  minKneeAngle: number;
};

const STANDING_THRESHOLD = 160;
const DESCENDING_THRESHOLD = 145;
const BOTTOM_THRESHOLD = 95;
const ASCENDING_THRESHOLD = 115;

export class SquatStateMachine {
  private state: SquatMachineState = {
    repCount: 0,
    phase: 'standing',
    bottomReached: false,
    minKneeAngle: 180,
  };

  update(angles: PoseAngles): SquatMetrics {
    const averageKneeAngle = (angles.leftKnee + angles.rightKnee) / 2;
    this.state.minKneeAngle = Math.min(this.state.minKneeAngle, averageKneeAngle);

    switch (this.state.phase) {
      case 'standing':
        if (averageKneeAngle < DESCENDING_THRESHOLD) {
          this.state.phase = 'descending';
          this.state.minKneeAngle = averageKneeAngle;
        }
        break;
      case 'descending':
        if (averageKneeAngle <= BOTTOM_THRESHOLD) {
          this.state.phase = 'bottom';
          this.state.bottomReached = true;
        } else if (averageKneeAngle > STANDING_THRESHOLD) {
          this.resetToStanding();
        }
        break;
      case 'bottom':
        if (averageKneeAngle > ASCENDING_THRESHOLD) {
          this.state.phase = 'ascending';
        }
        break;
      case 'ascending':
        if (averageKneeAngle >= STANDING_THRESHOLD) {
          if (this.state.bottomReached) {
            this.state.repCount += 1;
          }
          this.resetToStanding();
        } else if (averageKneeAngle < BOTTOM_THRESHOLD) {
          this.state.phase = 'bottom';
        }
        break;
    }

    return {
      repCount: this.state.repCount,
      phase: this.state.phase,
      minKneeAngle: this.state.minKneeAngle,
      depthProgress: clamp(((170 - averageKneeAngle) / 100) * 100, 0, 100),
    };
  }

  reset() {
    this.state = {
      repCount: 0,
      phase: 'standing',
      bottomReached: false,
      minKneeAngle: 180,
    };
  }

  private resetToStanding() {
    this.state.phase = 'standing';
    this.state.bottomReached = false;
    this.state.minKneeAngle = 180;
  }
}
