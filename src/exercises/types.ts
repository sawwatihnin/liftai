import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type ExerciseCategory = 'Lower Body' | 'Upper Body' | 'Core' | 'Full Body';
export type ExerciseDifficulty = 'Foundational' | 'Intermediate' | 'Advanced';

// Describes how to compute one named angle from raw MediaPipe landmarks.
// Each exercise provides a list of these so the engine knows what to compute.
export type AngleRequest = {
  key: string;
  label: string;
  compute: (landmarks: NormalizedLandmark[]) => number;
};

// The per-frame output every analyzer must produce. All fields are exercise-generic.
export type ExerciseFrameResult = {
  repCount: number;
  phase: string;
  warnings: string[];
  // Arbitrary numeric/string metrics that the dashboard can display.
  // Keys are defined by the exercise definition (e.g. "depth", "forwardLean").
  metrics: Record<string, number | string>;
};

// Stateful object created by each exercise definition. One instance per session.
export interface ExerciseAnalyzer {
  processFrame(landmarks: NormalizedLandmark[], angles: Record<string, number>): ExerciseFrameResult;
  getCoachingCue(result: ExerciseFrameResult): string | null;
  reset(): void;
}

// A metric card shown in the top row of the dashboard.
export type DashboardMetric = {
  key: string;
  label: string;
  getValue: (result: ExerciseFrameResult, sessionDurationMs: number) => string;
  accent: 'aqua' | 'gold' | 'coral';
};

// A joint angle row shown in the angle grid panel.
export type AngleDisplayItem = {
  key: string;
  label: string;
};

// A secondary detail card below the angle grid.
export type SecondaryMetric = {
  key: string;
  label: string;
  getValue: (result: ExerciseFrameResult) => string;
  description: string;
};

// The complete definition of an exercise. Creating a new exercise means
// implementing this interface — no changes to the core tracking engine needed.
export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscles: string;
  difficulty: ExerciseDifficulty;
  cameraView: string;
  cameraSetup: string[];

  // Which MediaPipe landmark indices must be visible for a "full pose" reading.
  requiredLandmarkIndices: number[];

  // Angles this exercise needs the engine to compute each frame.
  angleRequests: AngleRequest[];

  // Dashboard layout — top metric cards.
  dashboardMetrics: DashboardMetric[];

  // Which computed angles to show in the joint-angle grid panel.
  angleDisplayItems: AngleDisplayItem[];

  // Secondary detail cards shown below the angle grid.
  secondaryMetrics: SecondaryMetric[];

  // Called once per session to create the stateful analyzer.
  createAnalyzer(): ExerciseAnalyzer;
}

// Generic snapshot produced each frame by the tracking engine.
// Replaces the old squat-specific PoseSnapshot.
export type ExerciseSnapshot = {
  angles: Record<string, number>;
  result: ExerciseFrameResult;
  timestamp: number;
};
