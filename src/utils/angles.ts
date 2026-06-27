import type { PoseAngles, PoseJoints } from '../pose/types';
import { angleBetweenPoints, angleFromVertical, averagePoint } from './geometry';

export function calculatePoseAngles(joints: PoseJoints): PoseAngles {
  const hipCenter = averagePoint(joints.leftHip, joints.rightHip);
  const shoulderCenter = averagePoint(joints.leftShoulder, joints.rightShoulder);
  const kneeCenter = averagePoint(joints.leftKnee, joints.rightKnee);

  return {
    // Knee flexion is the interior angle at the knee joint.
    leftKnee: angleBetweenPoints(joints.leftHip, joints.leftKnee, joints.leftAnkle),
    rightKnee: angleBetweenPoints(joints.rightHip, joints.rightKnee, joints.rightAnkle),
    // Hip angle uses the torso segment and thigh segment to approximate squat depth.
    hip: angleBetweenPoints(shoulderCenter, hipCenter, kneeCenter),
    // Torso lean is measured against vertical so larger values mean more forward fold.
    torso: angleFromVertical(shoulderCenter, hipCenter),
  };
}
