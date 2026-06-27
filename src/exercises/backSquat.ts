import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { analyzeForm } from '../analysis/formAnalysis';
import { SquatStateMachine } from '../analysis/squatStateMachine';
import { getCoachingCue } from '../analysis/voiceCoaching';
import type { FormWarning, PoseAngles, SquatPhase } from '../pose/types';
import { extractTrackedJoints } from '../pose/poseLandmarker';
import { angleBetweenPoints, angleFromVertical, averagePoint } from '../utils/geometry';
import type {
  AngleDisplayItem,
  AngleRequest,
  DashboardMetric,
  ExerciseAnalyzer,
  ExerciseDefinition,
  ExerciseFrameResult,
  SecondaryMetric,
} from './types';
import { formatDuration } from '../utils/time';

// Converts a NormalizedLandmark to the PosePoint shape used by geometry utilities.
// They are structurally identical; this makes the type explicit.
function lm(landmarks: NormalizedLandmark[], index: number) {
  const l = landmarks[index];
  return { x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0 };
}

class BackSquatAnalyzer implements ExerciseAnalyzer {
  private machine = new SquatStateMachine();
  private previousWarning: FormWarning | null = null;
  private previousPhase: SquatPhase | null = null;
  private previousRepCount = 0;

  processFrame(landmarks: NormalizedLandmark[], angles: Record<string, number>): ExerciseFrameResult {
    const joints = extractTrackedJoints(landmarks);

    const poseAngles: PoseAngles = {
      leftKnee: angles.leftKnee ?? 180,
      rightKnee: angles.rightKnee ?? 180,
      hip: angles.hip ?? 180,
      torso: angles.torso ?? 0,
    };

    const squat = this.machine.update(poseAngles);
    const feedback = analyzeForm(joints, poseAngles, squat);

    return {
      repCount: squat.repCount,
      phase: squat.phase,
      warnings: feedback.warnings,
      metrics: {
        depth: Math.round(feedback.depthScore),
        depthLabel: feedback.depthLabel,
        depthProgress: squat.depthProgress,
        forwardLean: Math.round(feedback.forwardLean),
        kneeTracking: Number(feedback.kneeValgusRatio.toFixed(2)),
      },
    };
  }

  getCoachingCue(result: ExerciseFrameResult): string | null {
    const squatMetrics = {
      repCount: result.repCount,
      phase: result.phase as SquatPhase,
      minKneeAngle: 0,
      depthProgress: (result.metrics.depthProgress as number) ?? 0,
    };

    const cue = getCoachingCue(squatMetrics, result.warnings as FormWarning[], {
      previousCorrection: this.previousWarning,
      previousPhase: this.previousPhase,
      previousRepCount: this.previousRepCount,
    });

    this.previousWarning = cue.nextCorrection;
    this.previousPhase = cue.nextPhase;
    this.previousRepCount = cue.nextRepCount;
    return cue.message;
  }

  reset() {
    this.machine.reset();
    this.previousWarning = null;
    this.previousPhase = null;
    this.previousRepCount = 0;
  }
}

const angleRequests: AngleRequest[] = [
  {
    key: 'leftKnee',
    label: 'Left Knee',
    compute: (l) => angleBetweenPoints(lm(l, 23), lm(l, 25), lm(l, 27)),
  },
  {
    key: 'rightKnee',
    label: 'Right Knee',
    compute: (l) => angleBetweenPoints(lm(l, 24), lm(l, 26), lm(l, 28)),
  },
  {
    key: 'hip',
    label: 'Hip',
    compute: (l) => {
      const shoulderCenter = averagePoint(lm(l, 11), lm(l, 12));
      const hipCenter = averagePoint(lm(l, 23), lm(l, 24));
      const kneeCenter = averagePoint(lm(l, 25), lm(l, 26));
      return angleBetweenPoints(shoulderCenter, hipCenter, kneeCenter);
    },
  },
  {
    key: 'torso',
    label: 'Torso Lean',
    compute: (l) => angleFromVertical(averagePoint(lm(l, 11), lm(l, 12)), averagePoint(lm(l, 23), lm(l, 24))),
  },
];

const dashboardMetrics: DashboardMetric[] = [
  {
    key: 'reps',
    label: 'Reps',
    getValue: (r) => String(r.repCount),
    accent: 'aqua',
  },
  {
    key: 'depth',
    label: 'Depth',
    getValue: (r) => (typeof r.metrics.depth === 'number' ? `${r.metrics.depth}%` : '--'),
    accent: 'gold',
  },
  {
    key: 'phase',
    label: 'Phase',
    getValue: (r) => r.phase,
    accent: 'coral',
  },
  {
    key: 'duration',
    label: 'Duration',
    getValue: (_r, sessionDurationMs) => formatDuration(sessionDurationMs),
    accent: 'aqua',
  },
];

const angleDisplayItems: AngleDisplayItem[] = [
  { key: 'leftKnee', label: 'Left Knee' },
  { key: 'rightKnee', label: 'Right Knee' },
  { key: 'hip', label: 'Hip' },
  { key: 'torso', label: 'Torso Lean' },
];

const secondaryMetrics: SecondaryMetric[] = [
  {
    key: 'depthLabel',
    label: 'Depth estimate',
    getValue: (r) => String(r.metrics.depthLabel ?? '--'),
    description: 'Based on average knee flexion during the current squat cycle.',
  },
  {
    key: 'forwardLean',
    label: 'Forward lean',
    getValue: (r) => (typeof r.metrics.forwardLean === 'number' ? `${r.metrics.forwardLean}°` : '--'),
    description: 'Torso angle measured against vertical using shoulder-to-hip alignment.',
  },
  {
    key: 'kneeTracking',
    label: 'Knee tracking',
    getValue: (r) => (typeof r.metrics.kneeTracking === 'number' ? r.metrics.kneeTracking.toFixed(2) : '--'),
    description: 'Ratio compares knee width to ankle width to estimate knees collapsing inward.',
  },
];

export const backSquatDefinition: ExerciseDefinition = {
  id: 'back-squat',
  name: 'Back Squat',
  category: 'Lower Body',
  muscles: 'Glutes · Quads · Hamstrings',
  difficulty: 'Foundational',
  cameraView: 'Front / ¾ view',
  cameraSetup: [
    'Position your entire body in frame.',
    'Stand 8–10 feet from the camera.',
    'Rotate ~30° to the side for clearer hip angles.',
    'Camera should be at roughly hip height.',
  ],
  requiredLandmarkIndices: [11, 12, 23, 24, 25, 26, 27, 28],
  angleRequests,
  dashboardMetrics,
  angleDisplayItems,
  secondaryMetrics,
  createAnalyzer: () => new BackSquatAnalyzer(),
};
