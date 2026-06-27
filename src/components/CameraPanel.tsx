import type { RefObject } from 'react';

type CameraPanelProps = {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isRunning: boolean;
  isTracking: boolean;
};

export function CameraPanel({
  videoRef,
  canvasRef,
  isRunning,
  isTracking,
}: CameraPanelProps) {
  return (
    <div
      className={`relative self-start overflow-hidden rounded-[24px] border bg-panel/80 backdrop-blur-md ${
        isTracking
          ? 'border-rose/35 shadow-tracking'
          : 'border-white/8 shadow-panel'
      }`}
    >
      {isTracking ? (
        <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-rose/25 animate-glowPulse" />
      ) : null}
      <div className="relative w-full bg-[radial-gradient(circle_at_top,rgba(217,75,106,0.10),transparent_28%),#110f15]">
        <video
          ref={videoRef}
          className="block h-auto w-full object-contain"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>
      {!isRunning ? (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/55 backdrop-blur-sm">
          <div className="max-w-sm px-6 text-center">
            <p className="text-lg font-semibold text-text">Ready for your next squat set</p>
            <p className="mt-2 text-sm text-muted">
              Start the camera to see your skeleton, track reps, and get real-time coaching.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
