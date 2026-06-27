export type PoseJointName =
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle';

export type PosePoint = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

export type PoseJoints = Record<PoseJointName, PosePoint>;

export type PoseAngles = {
  leftKnee: number;
  rightKnee: number;
  hip: number;
  torso: number;
};

export type SquatPhase = 'standing' | 'descending' | 'bottom' | 'ascending';

export type FormWarning = 'Go deeper.' | 'Keep your chest up.' | 'Knees out.';

export type FormFeedback = {
  warnings: FormWarning[];
  depthScore: number;
  depthLabel: string;
  kneeValgusRatio: number;
  forwardLean: number;
};

export type SquatMetrics = {
  repCount: number;
  phase: SquatPhase;
  depthProgress: number;
  minKneeAngle: number;
};

export type CoachDiagnostics = {
  cameraAvailable: boolean;
  cameraPermissionStatus: 'unsupported' | 'unknown' | 'prompt' | 'granted' | 'denied';
  mediaPipeStatus: 'idle' | 'loading' | 'loaded' | 'failed';
  mediaPipeDetail: string;
  poseModelStatus: 'idle' | 'loading' | 'loaded' | 'failed';
  poseModelDetail: string;
  startupEvents: string[];
  startupStage:
    | 'idle'
    | 'camera_starting'
    | 'camera_active'
    | 'mediapipe_loading'
    | 'tracking'
    | 'failed';
  poseStatus: 'none' | 'partial' | 'full';
  posesDetected: number;
  landmarksDetected: number;
  trackedJointsVisible: number;
  detectForVideoActive: boolean;
  frameCount: number;
  videoDimensions: string;
  videoAspectRatio: string;
  canvasDimensions: string;
  reactInitialized: boolean;
  webcamActive: boolean;
};

export type PoseSnapshot = {
  joints: PoseJoints;
  angles: PoseAngles;
  feedback: FormFeedback;
  squat: SquatMetrics;
  timestamp: number;
};
