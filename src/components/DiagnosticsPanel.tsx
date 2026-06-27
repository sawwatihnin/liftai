import React from 'react';

export type DiagnosticFlag = {
  label: string;
  ok: boolean;
  detail: string;
};

type DiagnosticsPanelProps = {
  cameraPermissionStatus: string;
  currentErrors: string[];
  detectForVideoActive?: boolean;
  fileProtocol: boolean;
  flags: DiagnosticFlag[];
  frameCount?: number;
  landmarksDetected?: number;
  mediaPipeDetail: string;
  mediaPipeStatus: string;
  poseStatus?: string;
  posesDetected?: number;
  poseModelDetail: string;
  startupEvents?: string[];
  startupStage?: string;
  trackedJointsVisible?: number;
  videoDimensions?: string;
  videoAspectRatio?: string;
  canvasDimensions?: string;
};

export function DiagnosticsPanel({
  cameraPermissionStatus,
  currentErrors,
  detectForVideoActive,
  fileProtocol,
  flags,
  frameCount,
  landmarksDetected,
  mediaPipeDetail,
  mediaPipeStatus,
  poseStatus,
  posesDetected,
  poseModelDetail,
  startupEvents,
  startupStage,
  trackedJointsVisible,
  videoDimensions,
  videoAspectRatio,
  canvasDimensions,
}: DiagnosticsPanelProps) {
  return (
    <details className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-aqua">Diagnostics</p>
          <h2 className="mt-2 text-2xl font-bold text-white">LiftAI Loaded</h2>
        </div>
        <div className="text-right text-sm text-slate-300">
          <p>React Version: {React.version}</p>
          <p>Camera Permission: {cameraPermissionStatus}</p>
          <p>MediaPipe Status: {mediaPipeStatus}</p>
        </div>
      </summary>

      <div className="mt-5 space-y-5">
        {fileProtocol ? (
          <div className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
            This page is running from <code>file:///</code>. Vite apps should be opened from
            <code> http://localhost:5173</code> or the active Vite dev server URL so module imports
            can resolve correctly.
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {flags.map((flag) => (
            <div
              key={flag.label}
              className={`rounded-2xl border p-4 ${
                flag.ok ? 'border-aqua/35 bg-aqua/10' : 'border-coral/35 bg-coral/10'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{flag.label}</p>
              <p className="mt-2 text-base font-semibold text-white">{flag.ok ? 'Yes' : 'No'}</p>
              <p className="mt-2 text-sm text-slate-300">{flag.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">MediaPipe detail</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-slate-300">
              {mediaPipeDetail}
            </pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">Pose model detail</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-slate-300">
              {poseModelDetail}
            </pre>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">Pose loop</p>
            <p className="mt-2 text-sm text-slate-300">
              detectForVideo active: {detectForVideoActive ? 'yes' : 'no'}
            </p>
            <p className="mt-1 text-sm text-slate-300">Frames processed: {frameCount ?? 0}</p>
            <p className="mt-1 text-sm text-slate-300">Pose badge: {poseStatus ?? 'none'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">Detection counts</p>
            <p className="mt-2 text-sm text-slate-300">Poses detected: {posesDetected ?? 0}</p>
            <p className="mt-1 text-sm text-slate-300">
              Landmarks detected: {landmarksDetected ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Tracked joints visible: {trackedJointsVisible ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">Surface sizes</p>
            <p className="mt-2 text-sm text-slate-300">Video: {videoDimensions ?? '0x0'}</p>
            <p className="mt-1 text-sm text-slate-300">Aspect: {videoAspectRatio ?? '16 / 9'}</p>
            <p className="mt-1 text-sm text-slate-300">Canvas: {canvasDimensions ?? '0x0'}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">Startup stage</p>
            <p className="mt-2 text-sm text-slate-300">{startupStage ?? 'idle'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm font-semibold text-white">Startup events</p>
            {startupEvents && startupEvents.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {startupEvents.map((event, index) => (
                  <li key={`${event}-${index}`}>{event}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-300">No startup events recorded yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink/50 p-4">
          <p className="text-sm font-semibold text-white">Current errors</p>
          {currentErrors.length === 0 ? (
            <p className="mt-2 text-sm text-slate-300">No startup errors recorded.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-coral">
              {currentErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </details>
  );
}
