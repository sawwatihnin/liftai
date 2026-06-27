import type { FormFeedback, FormWarning, PoseAngles, PoseJoints, SquatMetrics } from '../pose/types';
import { clamp, distance2D } from '../utils/geometry';

const DEPTH_TARGET_ANGLE = 100;
const LEAN_WARNING_ANGLE = 32;
const VALGUS_RATIO_LIMIT = 0.82;

export function analyzeForm(
  joints: PoseJoints,
  angles: PoseAngles,
  squat: SquatMetrics,
): FormFeedback {
  const warnings: FormWarning[] = [];
  const averageKneeAngle = (angles.leftKnee + angles.rightKnee) / 2;
  const ankleWidth = distance2D(joints.leftAnkle, joints.rightAnkle);
  const kneeWidth = distance2D(joints.leftKnee, joints.rightKnee);
  // A narrower knee width than ankle width is a lightweight proxy for knees caving inward.
  const kneeValgusRatio = ankleWidth > 0 ? kneeWidth / ankleWidth : 1;
  const forwardLean = angles.torso;

  if ((squat.phase === 'bottom' || squat.phase === 'ascending') && averageKneeAngle > DEPTH_TARGET_ANGLE) {
    warnings.push('Go deeper.');
  }

  if (forwardLean > LEAN_WARNING_ANGLE) {
    warnings.push('Keep your chest up.');
  }

  if (kneeValgusRatio < VALGUS_RATIO_LIMIT) {
    warnings.push('Knees out.');
  }

  const depthScore = clamp(((170 - averageKneeAngle) / (170 - 70)) * 100, 0, 100);
  const depthLabel =
    depthScore > 75 ? 'Deep' : depthScore > 45 ? 'On track' : depthScore > 20 ? 'Shallow' : 'Top';

  return {
    warnings,
    depthScore,
    depthLabel,
    kneeValgusRatio,
    forwardLean,
  };
}
