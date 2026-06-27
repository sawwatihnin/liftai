import { useEffect, useMemo, useRef, useState } from 'react';
import type { NormalizedLandmark, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { AudioFeedbackManager } from '../analysis/audioFeedback';
import type { ExerciseAnalyzer, ExerciseDefinition, ExerciseSnapshot } from '../exercises/types';
import {
  getPoseAssetConfig,
  getPoseLandmarker,
  createDrawingUtils,
} from '../pose/poseLandmarker';
import type { CoachDiagnostics } from '../pose/types';
import { drawPoseSkeleton } from '../pose/drawPose';
import { computeAngles } from '../utils/angles';
import { normalizeError } from '../utils/errors';

type CoachState = {
  diagnostics: CoachDiagnostics;
  errors: string[];
  isRunning: boolean;
  isLoading: boolean;
  audioEnabled: boolean;
  snapshot: ExerciseSnapshot | null;
  error: string | null;
  sessionStartedAt: number | null;
};

const MIN_VISIBILITY = 0.35;
const FULL_POSE_VISIBLE_JOINTS = 8;
const PARTIAL_POSE_VISIBLE_JOINTS = 4;
const UI_UPDATE_INTERVAL_MS = 120;
const DIAGNOSTIC_LOG_INTERVAL = 15;

// Accepts an ExerciseDefinition which provides angle computation, rep detection,
// coaching, and dashboard config. Pass null when no exercise is selected yet.
export function useLiftAiCoach(exerciseDefinition: ExerciseDefinition | null) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyzerRef = useRef<ExerciseAnalyzer | null>(null);
  const audioRef = useRef(new AudioFeedbackManager());
  const poseVisibleRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastUiUpdateRef = useRef(0);

  const [state, setState] = useState<CoachState>({
    diagnostics: {
      reactInitialized: true,
      cameraAvailable:
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function',
      cameraPermissionStatus: 'unknown',
      mediaPipeStatus: 'idle',
      mediaPipeDetail: `WASM root: ${getPoseAssetConfig().wasmRoot}`,
      poseModelStatus: 'idle',
      poseModelDetail: getPoseAssetConfig().modelAssetPath,
      startupEvents: [],
      startupStage: 'idle',
      poseStatus: 'none',
      posesDetected: 0,
      landmarksDetected: 0,
      trackedJointsVisible: 0,
      detectForVideoActive: false,
      frameCount: 0,
      videoDimensions: '0x0',
      videoAspectRatio: '16 / 9',
      canvasDimensions: '0x0',
      webcamActive: false,
    },
    errors: [],
    isRunning: false,
    isLoading: false,
    audioEnabled: true,
    snapshot: null,
    error: null,
    sessionStartedAt: null,
  });
  const [clockTick, setClockTick] = useState(0);

  // Recreate the analyzer whenever the exercise changes so session state resets cleanly.
  useEffect(() => {
    analyzerRef.current?.reset();
    analyzerRef.current = exerciseDefinition?.createAnalyzer() ?? null;
  }, [exerciseDefinition]);

  function logStartupEvent(event: string) {
    console.info(`[LiftAI] ${event}`);
    setState((current) => ({
      ...current,
      diagnostics: {
        ...current.diagnostics,
        startupEvents: appendStartupEvent(current.diagnostics.startupEvents, event),
      },
    }));
  }

  useEffect(() => {
    console.info('[LiftAI] Coach hook initialized.');
    audioRef.current.setEnabled(state.audioEnabled);
  }, [state.audioEnabled]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
      return;
    }

    let cancelled = false;
    void navigator.permissions
      .query({ name: 'camera' as PermissionName })
      .then((result) => {
        if (cancelled) return;
        setState((current) => ({
          ...current,
          diagnostics: {
            ...current.diagnostics,
            cameraPermissionStatus: result.state as CoachDiagnostics['cameraPermissionStatus'],
          },
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    if (!state.isRunning) return;
    const intervalId = window.setInterval(() => {
      setClockTick((tick) => tick + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [state.isRunning]);

  const sessionDurationMs = useMemo(() => {
    if (!state.sessionStartedAt) return 0;
    return Date.now() - state.sessionStartedAt;
  }, [clockTick, state.sessionStartedAt, state.snapshot?.timestamp]);

  async function start() {
    if (state.isRunning || state.isLoading) return;
    if (!exerciseDefinition) return;

    logStartupEvent('START_CAMERA_CLICKED');

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      const message = 'Camera APIs are unavailable in this browser.';
      setState((current) => ({
        ...current,
        diagnostics: { ...current.diagnostics, cameraAvailable: false, startupStage: 'failed' },
        errors: appendError(current.errors, message),
        error: message,
      }));
      return;
    }

    if (!videoRef.current) {
      const message = 'videoRef.current is unavailable before startup.';
      logStartupEvent('VIDEO_REF_MISSING');
      setState((current) => ({
        ...current,
        diagnostics: { ...current.diagnostics, startupStage: 'failed' },
        errors: appendError(current.errors, message),
        error: message,
      }));
      return;
    }

    if (!canvasRef.current) {
      const message = 'canvasRef.current is unavailable before startup.';
      logStartupEvent('CANVAS_REF_MISSING');
      setState((current) => ({
        ...current,
        diagnostics: { ...current.diagnostics, startupStage: 'failed' },
        errors: appendError(current.errors, message),
        error: message,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
      diagnostics: { ...current.diagnostics, startupStage: 'camera_starting' },
    }));

    try {
      // Reset per-session state.
      if (!analyzerRef.current) {
        analyzerRef.current = exerciseDefinition.createAnalyzer();
      }
      analyzerRef.current.reset();
      poseVisibleRef.current = false;
      frameCountRef.current = 0;
      lastUiUpdateRef.current = 0;
      audioRef.current.reset();

      logStartupEvent('GET_USER_MEDIA_START');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 960 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 4 / 3 },
        },
        audio: false,
      });
      logStartupEvent('GET_USER_MEDIA_SUCCESS');

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Video element is not ready.');

      video.srcObject = stream;
      await video.play();
      logStartupEvent('VIDEO_PLAY_SUCCESS');

      setState((current) => ({
        ...current,
        diagnostics: {
          ...current.diagnostics,
          startupStage: 'camera_active',
          mediaPipeStatus: 'loading',
          mediaPipeDetail: `Loading WASM from ${getPoseAssetConfig().wasmRoot}`,
          poseModelStatus: 'loading',
          poseModelDetail: `Loading model from ${getPoseAssetConfig().modelAssetPath}`,
          poseStatus: 'none',
          posesDetected: 0,
          landmarksDetected: 0,
          trackedJointsVisible: 0,
          detectForVideoActive: false,
          frameCount: 0,
          videoDimensions: '0x0',
          videoAspectRatio: '16 / 9',
          canvasDimensions: '0x0',
          webcamActive: true,
          cameraPermissionStatus: 'granted',
        },
      }));

      setState((current) => ({
        ...current,
        diagnostics: { ...current.diagnostics, startupStage: 'mediapipe_loading' },
      }));
      logStartupEvent('MEDIAPIPE_INIT_START');
      const poseLandmarker = await getPoseLandmarker();
      logStartupEvent('MEDIAPIPE_INIT_SUCCESS');

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas element is not ready.');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context.');

      const drawingUtils = createDrawingUtils(ctx);
      const sessionStartedAt = Date.now();

      setState((current) => ({
        ...current,
        diagnostics: {
          ...current.diagnostics,
          startupStage: 'tracking',
          mediaPipeStatus: 'loaded',
          mediaPipeDetail: `FilesetResolver loaded from ${getPoseAssetConfig().wasmRoot}`,
          poseModelStatus: 'loaded',
          poseModelDetail: `PoseLandmarker loaded from ${getPoseAssetConfig().modelAssetPath}`,
          detectForVideoActive: false,
        },
        isRunning: true,
        isLoading: false,
        sessionStartedAt,
      }));

      const renderFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;

        try {
          const currentVideo = videoRef.current;
          const currentCanvas = canvasRef.current;
          const videoWidth = currentVideo.videoWidth;
          const videoHeight = currentVideo.videoHeight;

          if (!videoWidth || !videoHeight) {
            setState((current) => ({
              ...current,
              diagnostics: {
                ...current.diagnostics,
                detectForVideoActive: false,
                videoDimensions: `${videoWidth}x${videoHeight}`,
                videoAspectRatio: videoWidth && videoHeight ? `${videoWidth} / ${videoHeight}` : '16 / 9',
                canvasDimensions: `${currentCanvas.width}x${currentCanvas.height}`,
              },
            }));
            animationFrameRef.current = window.requestAnimationFrame(renderFrame);
            return;
          }

          frameCountRef.current += 1;
          currentCanvas.width = videoWidth;
          currentCanvas.height = videoHeight;

          const result = poseLandmarker.detectForVideo(currentVideo, performance.now());
          const landmarks = result.landmarks[0];
          const requiredIndices = exerciseDefinition.requiredLandmarkIndices;
          const frameDiagnostics = deriveFrameDiagnostics(result, currentVideo, currentCanvas, frameCountRef.current, requiredIndices);

          if (frameCountRef.current === 1 || frameCountRef.current % DIAGNOSTIC_LOG_INTERVAL === 0) {
            console.debug('[LiftAI] PoseLandmarker frame output', {
              frame: frameCountRef.current,
              posesDetected: frameDiagnostics.posesDetected,
              landmarksDetected: frameDiagnostics.landmarksDetected,
              trackedJointsVisible: frameDiagnostics.trackedJointsVisible,
              poseStatus: frameDiagnostics.poseStatus,
            });
          }

          if (landmarks && landmarks.length > 0) {
            drawPoseSkeleton(
              currentCanvas.getContext('2d') as CanvasRenderingContext2D,
              drawingUtils,
              landmarks,
              currentCanvas.width,
              currentCanvas.height,
            );

            if (!poseVisibleRef.current) {
              console.info('[LiftAI] Pose detected in frame.');
              poseVisibleRef.current = true;
            }

            handlePoseFrame(landmarks, frameDiagnostics);
          } else {
            if (poseVisibleRef.current) {
              console.info('[LiftAI] Pose lost from frame.');
              poseVisibleRef.current = false;
            }
            maybePublishDiagnostics(frameDiagnostics);
            ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
          }
        } catch (error) {
          const details = normalizeError(error);
          console.error('[LiftAI] Pose detection loop failed.', details);
          stop();
          setState((current) => ({
            ...current,
            diagnostics: {
              ...current.diagnostics,
              mediaPipeStatus: 'failed',
              mediaPipeDetail: details.message,
              poseModelStatus: 'failed',
              poseModelDetail: details.message,
              poseStatus: 'none',
              detectForVideoActive: false,
            },
            errors: appendError(current.errors, details.message),
            error: details.message,
          }));
          return;
        }

        animationFrameRef.current = window.requestAnimationFrame(renderFrame);
      };

      logStartupEvent('POSE_LOOP_STARTED');
      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    } catch (error) {
      const details = normalizeError(error);
      console.error('[LiftAI] Startup failure', details);
      stop();
      setState((current) => ({
        ...current,
        diagnostics: {
          ...current.diagnostics,
          startupStage: 'failed',
          mediaPipeStatus: current.diagnostics.mediaPipeStatus === 'loading' ? 'failed' : current.diagnostics.mediaPipeStatus,
          mediaPipeDetail: current.diagnostics.mediaPipeStatus === 'loading' ? details.message : current.diagnostics.mediaPipeDetail,
          poseModelStatus: current.diagnostics.poseModelStatus === 'loading' ? 'failed' : current.diagnostics.poseModelStatus,
          poseModelDetail: current.diagnostics.poseModelStatus === 'loading' ? details.message : current.diagnostics.poseModelDetail,
          poseStatus: 'none',
          detectForVideoActive: false,
          webcamActive: false,
          cameraPermissionStatus: current.diagnostics.cameraPermissionStatus === 'unknown' ? 'denied' : current.diagnostics.cameraPermissionStatus,
        },
        errors: appendError(current.errors, details.message),
        isLoading: false,
        error: details.message,
      }));
    }
  }

  function stop() {
    console.info('[LiftAI] Stopping active session.');
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setState((current) => ({
      ...current,
      diagnostics: {
        ...current.diagnostics,
        startupStage: current.diagnostics.startupStage === 'failed' ? 'failed' : 'idle',
        detectForVideoActive: false,
        webcamActive: false,
      },
      isRunning: false,
      isLoading: false,
    }));
  }

  function toggleAudio() {
    setState((current) => ({ ...current, audioEnabled: !current.audioEnabled }));
  }

  function handlePoseFrame(
    landmarks: NormalizedLandmark[],
    frameDiagnostics: ReturnType<typeof deriveFrameDiagnostics>,
  ) {
    if (!exerciseDefinition || !analyzerRef.current) return;

    const angles = computeAngles(landmarks, exerciseDefinition.angleRequests);
    const result = analyzerRef.current.processFrame(landmarks, angles);
    const message = analyzerRef.current.getCoachingCue(result);

    if (message) {
      audioRef.current.speak(message);
    }

    maybePublishDiagnostics(frameDiagnostics, {
      angles,
      result,
      timestamp: Date.now(),
    });
  }

  function maybePublishDiagnostics(
    frameDiagnostics: ReturnType<typeof deriveFrameDiagnostics>,
    snapshot?: ExerciseSnapshot,
  ) {
    if (!shouldPublishUiUpdate(lastUiUpdateRef.current, snapshot)) return;

    lastUiUpdateRef.current = performance.now();
    setState((current) => ({
      ...current,
      diagnostics: {
        ...current.diagnostics,
        ...frameDiagnostics,
        detectForVideoActive: true,
      },
      snapshot: snapshot ?? current.snapshot,
    }));
  }

  return {
    ...state,
    sessionDurationMs,
    videoRef,
    canvasRef,
    start,
    stop,
    toggleAudio,
  };
}

function appendError(errors: string[], message: string) {
  return errors.includes(message) ? errors : [...errors, message];
}

function appendStartupEvent(events: string[], event: string) {
  return events.length >= 12 ? [...events.slice(-11), event] : [...events, event];
}

function shouldPublishUiUpdate(lastPublishedAt: number, snapshot?: ExerciseSnapshot) {
  const now = performance.now();
  if (now - lastPublishedAt >= UI_UPDATE_INTERVAL_MS) return true;
  if (!snapshot) return false;
  return snapshot.result.repCount > 0 || snapshot.result.warnings.length > 0;
}

function deriveFrameDiagnostics(
  result: PoseLandmarkerResult,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  frameCount: number,
  requiredIndices: number[],
) {
  const primaryLandmarks = result.landmarks[0] ?? [];
  const trackedJointsVisible = countTrackedVisibleJoints(primaryLandmarks, requiredIndices);

  return {
    poseStatus: classifyPoseStatus(trackedJointsVisible),
    posesDetected: result.landmarks.length,
    landmarksDetected: primaryLandmarks.length,
    trackedJointsVisible,
    frameCount,
    videoDimensions: `${video.videoWidth}x${video.videoHeight}`,
    videoAspectRatio: `${video.videoWidth} / ${video.videoHeight}`,
    canvasDimensions: `${canvas.width}x${canvas.height}`,
  };
}

function classifyPoseStatus(trackedVisible: number) {
  if (trackedVisible >= FULL_POSE_VISIBLE_JOINTS) return 'full' as const;
  if (trackedVisible >= PARTIAL_POSE_VISIBLE_JOINTS) return 'partial' as const;
  return 'none' as const;
}

function countTrackedVisibleJoints(landmarks: NormalizedLandmark[], requiredIndices: number[]) {
  return requiredIndices.reduce((count, index) => {
    const visibility = landmarks[index]?.visibility ?? 0;
    return visibility > MIN_VISIBILITY ? count + 1 : count;
  }, 0);
}
