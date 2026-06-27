import type { DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision';

const CONNECTIONS = [
  { start: 11, end: 12 },
  { start: 11, end: 13 },
  { start: 13, end: 15 },
  { start: 12, end: 14 },
  { start: 14, end: 16 },
  { start: 11, end: 23 },
  { start: 12, end: 24 },
  { start: 23, end: 24 },
  { start: 23, end: 25 },
  { start: 25, end: 27 },
  { start: 24, end: 26 },
  { start: 26, end: 28 },
];

export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  drawingUtils: DrawingUtils,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);

  drawingUtils.drawConnectors(landmarks, CONNECTIONS, {
    color: '#79f2e6',
    lineWidth: 4,
  });

  drawingUtils.drawLandmarks(landmarks, {
    color: '#ffd166',
    radius: 4,
    fillColor: '#ff7b72',
    lineWidth: 2,
  });
}
