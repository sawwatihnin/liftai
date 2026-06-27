import type { PosePoint } from '../pose/types';

const RAD_TO_DEG = 180 / Math.PI;

export function angleBetweenPoints(a: PosePoint, b: PosePoint, c: PosePoint) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);

  if (magAB === 0 || magCB === 0) {
    return 0;
  }

  const cosine = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return Math.acos(cosine) * RAD_TO_DEG;
}

export function angleFromVertical(top: PosePoint, bottom: PosePoint) {
  const dx = top.x - bottom.x;
  const dy = bottom.y - top.y;
  return Math.abs(Math.atan2(dx, dy) * RAD_TO_DEG);
}

export function averagePoint(a: PosePoint, b: PosePoint): PosePoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility, b.visibility),
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function distance2D(a: PosePoint, b: PosePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
