import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import type { PoseJoints, PosePoint } from './types';
import { normalizeError } from '../utils/errors';

let poseLandmarkerPromise: Promise<PoseLandmarker> | null = null;
const WASM_ROOT = '/mediapipe/wasm';
const MODEL_ASSET_PATH =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

export async function getPoseLandmarker() {
  if (!poseLandmarkerPromise) {
    poseLandmarkerPromise = (async () => {
      console.info('[LiftAI] MediaPipe WASM root selected.', WASM_ROOT);
      console.info('[LiftAI] wasm loading');
      await verifyAsset(`${WASM_ROOT}/vision_wasm_internal.js`, 'MediaPipe WASM loader');
      await verifyAsset(`${WASM_ROOT}/vision_wasm_internal.wasm`, 'MediaPipe WASM binary');

      console.info('[LiftAI] FilesetResolver.forVisionTasks(...) starting.', { wasmRoot: WASM_ROOT });
      const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
      console.info('[LiftAI] FilesetResolver loaded');

      console.info('[LiftAI] model loading');
      await verifyAsset(MODEL_ASSET_PATH, 'Pose model');
      console.info('[LiftAI] Model loaded');

      try {
        console.info('[LiftAI] PoseLandmarker.createFromOptions(...) starting.', {
          delegate: 'GPU',
          modelAssetPath: MODEL_ASSET_PATH,
        });
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_PATH,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        console.info('[LiftAI] PoseLandmarker loaded');
        return poseLandmarker;
      } catch (error) {
        const gpuError = normalizeError(error);
        console.warn('[LiftAI] GPU initialization failed, retrying on CPU.', {
          name: gpuError.name,
          message: gpuError.message,
          stack: gpuError.stack,
          error,
        });

        console.info('[LiftAI] PoseLandmarker.createFromOptions(...) starting.', {
          delegate: 'CPU',
          modelAssetPath: MODEL_ASSET_PATH,
        });
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_PATH,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        console.info('[LiftAI] PoseLandmarker loaded');
        return poseLandmarker;
      }
    })();
  }

  return poseLandmarkerPromise;
}

export function getPoseAssetConfig() {
  return {
    wasmRoot: WASM_ROOT,
    modelAssetPath: MODEL_ASSET_PATH,
  };
}

export function createDrawingUtils(ctx: CanvasRenderingContext2D) {
  return new DrawingUtils(ctx);
}

function mapLandmark(landmark: NormalizedLandmark): PosePoint {
  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: landmark.visibility ?? 0,
  };
}

export function extractTrackedJoints(landmarks: NormalizedLandmark[]): PoseJoints {
  return {
    leftShoulder: mapLandmark(landmarks[11]),
    rightShoulder: mapLandmark(landmarks[12]),
    leftHip: mapLandmark(landmarks[23]),
    rightHip: mapLandmark(landmarks[24]),
    leftKnee: mapLandmark(landmarks[25]),
    rightKnee: mapLandmark(landmarks[26]),
    leftAnkle: mapLandmark(landmarks[27]),
    rightAnkle: mapLandmark(landmarks[28]),
  };
}

async function verifyAsset(url: string, label: string) {
  console.info(`[LiftAI] Verifying ${label}.`, { url });

  let response: Response;
  try {
    response = await fetch(url, { method: 'HEAD', mode: 'cors' });
  } catch {
    response = await fetch(url, { method: 'GET', mode: 'cors' });
  }

  if (!response.ok) {
    throw new Error(`${label} check failed with status ${response.status} at ${url}.`);
  }

  console.info(`[LiftAI] ${label} verified.`, {
    url,
    status: response.status,
  });
}
