import type { ExerciseAnalyzer, ExerciseDefinition, ExerciseFrameResult } from './types';
import { backSquatDefinition } from './backSquat';

// A pass-through analyzer used for exercises whose full logic hasn't been
// implemented yet. It keeps UI functional without producing coaching cues.
function createStubAnalyzer(): ExerciseAnalyzer {
  let repCount = 0;
  const result: ExerciseFrameResult = {
    repCount,
    phase: 'standby',
    warnings: [],
    metrics: {},
  };
  return {
    processFrame() {
      return { ...result, repCount };
    },
    getCoachingCue() {
      return null;
    },
    reset() {
      repCount = 0;
    },
  };
}

const romanianDeadlift: ExerciseDefinition = {
  id: 'romanian-deadlift',
  name: 'Romanian Deadlift',
  category: 'Lower Body',
  muscles: 'Hamstrings · Glutes · Lower back',
  difficulty: 'Intermediate',
  cameraView: 'Side view',
  cameraSetup: [
    'Stand side-on to the camera.',
    'Keep your entire body in frame.',
    'Camera at roughly hip height.',
  ],
  requiredLandmarkIndices: [11, 12, 23, 24, 25, 26, 27, 28],
  angleRequests: [],
  dashboardMetrics: [
    { key: 'reps', label: 'Reps', getValue: (r) => String(r.repCount), accent: 'aqua' },
    { key: 'phase', label: 'Phase', getValue: (r) => r.phase, accent: 'coral' },
  ],
  angleDisplayItems: [],
  secondaryMetrics: [],
  createAnalyzer: createStubAnalyzer,
};

const bicepCurl: ExerciseDefinition = {
  id: 'bicep-curl',
  name: 'Bicep Curl',
  category: 'Upper Body',
  muscles: 'Biceps · Forearms',
  difficulty: 'Foundational',
  cameraView: 'Front view',
  cameraSetup: [
    'Face the camera directly.',
    'Upper body visible — waist and above.',
    'Keep elbows at your sides throughout.',
  ],
  requiredLandmarkIndices: [11, 12, 13, 14, 15, 16],
  angleRequests: [],
  dashboardMetrics: [
    { key: 'reps', label: 'Reps', getValue: (r) => String(r.repCount), accent: 'aqua' },
    { key: 'phase', label: 'Phase', getValue: (r) => r.phase, accent: 'coral' },
  ],
  angleDisplayItems: [],
  secondaryMetrics: [],
  createAnalyzer: createStubAnalyzer,
};

const pushUp: ExerciseDefinition = {
  id: 'push-up',
  name: 'Push-up',
  category: 'Upper Body',
  muscles: 'Chest · Triceps · Shoulders · Core',
  difficulty: 'Foundational',
  cameraView: 'Side view',
  cameraSetup: [
    'Set up side-on to the camera.',
    'Full body visible from head to toe.',
    'Camera at floor level or low angle.',
  ],
  requiredLandmarkIndices: [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
  angleRequests: [],
  dashboardMetrics: [
    { key: 'reps', label: 'Reps', getValue: (r) => String(r.repCount), accent: 'aqua' },
    { key: 'phase', label: 'Phase', getValue: (r) => r.phase, accent: 'coral' },
  ],
  angleDisplayItems: [],
  secondaryMetrics: [],
  createAnalyzer: createStubAnalyzer,
};

// All exercises available in the library. Order controls the grid display.
// Fully implemented exercises come first; stubs follow.
const EXERCISE_REGISTRY: ExerciseDefinition[] = [
  backSquatDefinition,
  romanianDeadlift,
  bicepCurl,
  pushUp,
];

export function getAllExercises(): ExerciseDefinition[] {
  return EXERCISE_REGISTRY;
}

export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return EXERCISE_REGISTRY.find((e) => e.id === id);
}
