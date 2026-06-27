import { useState } from 'react';
import { CameraPanel } from '../components/CameraPanel';
import { ControlBar } from '../components/ControlBar';
import { Dashboard } from '../components/Dashboard';
import { DiagnosticsPanel } from '../components/DiagnosticsPanel';
import { ExerciseLibrary } from '../components/ExerciseLibrary';
import { SetupScreen } from '../components/SetupScreen';
import type { ExerciseDefinition } from '../exercises/types';
import { useLiftAiCoach } from '../hooks/useLiftAiCoach';

type View = 'library' | 'setup' | 'tracking';

export function HomePage() {
  const [view, setView] = useState<View>('library');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);

  const {
    audioEnabled,
    canvasRef,
    diagnostics,
    error,
    errors,
    isLoading,
    isRunning,
    sessionDurationMs,
    snapshot,
    start,
    stop,
    toggleAudio,
    videoRef,
  } = useLiftAiCoach(selectedExercise);

  function handleSelectExercise(exercise: ExerciseDefinition) {
    setSelectedExercise(exercise);
    setView('setup');
  }

  async function handleStartTracking() {
    await start();
    setView('tracking');
  }

  function handleStop() {
    stop();
    setView('library');
  }

  function handleBackToSetup() {
    stop();
    setView('setup');
  }

  const fileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

  // ── Library ─────────────────────────────────────────────────────────────────
  if (view === 'library') {
    return (
      <main className="min-h-screen px-4 py-10 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-[0.36em] text-aqua">LiftAI</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your AI fitness coach.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-300">
              Real-time biomechanical analysis using MediaPipe Pose. Runs entirely in your browser —
              no backend, no uploads.
            </p>
          </header>
          <ExerciseLibrary onSelect={handleSelectExercise} />
        </div>
      </main>
    );
  }

  // ── Setup ────────────────────────────────────────────────────────────────────
  if (view === 'setup' && selectedExercise) {
    return (
      <main className="min-h-screen px-4 py-10 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SetupScreen
            exercise={selectedExercise}
            onStart={handleStartTracking}
            onBack={() => setView('library')}
          />
        </div>
      </main>
    );
  }

  // ── Tracking ─────────────────────────────────────────────────────────────────
  // Guard: if we somehow reach here without an exercise, send back to library.
  if (!selectedExercise) {
    setView('library');
    return null;
  }

  const flags = [
    {
      label: 'React initialized',
      ok: diagnostics.reactInitialized,
      detail: diagnostics.reactInitialized ? 'Root mounted and App rendered.' : 'React did not mount.',
    },
    {
      label: 'Camera available',
      ok: diagnostics.cameraAvailable,
      detail: diagnostics.cameraAvailable ? 'getUserMedia is available.' : 'Browser camera APIs are missing.',
    },
    {
      label: 'MediaPipe loaded',
      ok: diagnostics.mediaPipeStatus === 'loaded',
      detail: diagnostics.mediaPipeDetail,
    },
    {
      label: 'Pose model loaded',
      ok: diagnostics.poseModelStatus === 'loaded',
      detail: diagnostics.poseModelDetail,
    },
    {
      label: 'Webcam active',
      ok: diagnostics.webcamActive,
      detail: diagnostics.webcamActive ? 'Live camera stream active.' : 'Camera not active yet.',
    },
    {
      label: 'Pose badge',
      ok: diagnostics.poseStatus !== 'none',
      detail:
        diagnostics.poseStatus === 'full'
          ? 'Full pose detected.'
          : diagnostics.poseStatus === 'partial'
            ? 'Partial pose detected.'
            : 'No pose detected.',
    },
  ];

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header section */}
        <section className="mb-8 overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-glow lg:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              {/* Back link */}
              <button
                type="button"
                onClick={handleBackToSetup}
                className="mb-4 flex items-center gap-2 text-sm text-muted transition hover:text-text"
              >
                <span>←</span>
                <span>{selectedExercise.name}</span>
              </button>

              <p className="text-sm uppercase tracking-[0.32em] text-aqua">LiftAI</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {selectedExercise.name}
              </h1>
              <p className="mt-2 text-base text-slate-300">
                {selectedExercise.muscles}
              </p>

              <div className="mt-6">
                <ControlBar
                  isRunning={isRunning}
                  isLoading={isLoading}
                  audioEnabled={audioEnabled}
                  onStart={start}
                  onStop={handleStop}
                  onToggleAudio={toggleAudio}
                />
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-coral/50 bg-coral/10 px-4 py-3 text-sm text-coral">
                  {error}
                </div>
              ) : null}
            </div>

            {/* Side panels */}
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {/* Setup checklist */}
              <div className="rounded-[28px] border border-white/10 bg-ink/40 p-5">
                <p className="text-sm text-slate-300">Camera setup</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {selectedExercise.cameraSetup.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Live warning */}
              <div className="rounded-[28px] border border-white/10 bg-ink/40 p-5">
                <p className="text-sm text-slate-300">Live warnings</p>
                <p className="mt-3 text-xl font-semibold text-white">
                  {snapshot?.result.warnings[0] ?? 'All clear'}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  The coach calls out the highest-priority cue with audio cooldown protection.
                </p>
              </div>

              {/* Depth/rep progress */}
              <div className="rounded-[28px] border border-white/10 bg-ink/40 p-5">
                <p className="text-sm text-slate-300">Rep progress</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-aqua via-gold to-coral transition-all"
                    style={{
                      width: `${typeof snapshot?.result.metrics.depthProgress === 'number'
                        ? snapshot.result.metrics.depthProgress
                        : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {selectedExercise.id === 'back-squat'
                    ? 'Uses knee flexion to estimate depth in the current rep.'
                    : 'Movement progress within the current rep.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostics */}
        <section className="mb-6">
          <DiagnosticsPanel
            cameraPermissionStatus={diagnostics.cameraPermissionStatus}
            currentErrors={error ? [...errors, error] : errors}
            detectForVideoActive={diagnostics.detectForVideoActive}
            fileProtocol={fileProtocol}
            flags={flags}
            frameCount={diagnostics.frameCount}
            landmarksDetected={diagnostics.landmarksDetected}
            mediaPipeDetail={diagnostics.mediaPipeDetail}
            mediaPipeStatus={diagnostics.mediaPipeStatus}
            poseStatus={diagnostics.poseStatus}
            posesDetected={diagnostics.posesDetected}
            poseModelDetail={diagnostics.poseModelDetail}
            startupEvents={diagnostics.startupEvents}
            startupStage={diagnostics.startupStage}
            trackedJointsVisible={diagnostics.trackedJointsVisible}
            videoDimensions={diagnostics.videoDimensions}
            videoAspectRatio={diagnostics.videoAspectRatio}
            canvasDimensions={diagnostics.canvasDimensions}
          />
        </section>

        {/* Camera + Dashboard */}
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            isRunning={isRunning}
            isTracking={diagnostics.poseStatus !== 'none'}
          />
          <Dashboard
            definition={selectedExercise}
            snapshot={snapshot}
            sessionDurationMs={sessionDurationMs}
          />
        </section>
      </div>
    </main>
  );
}
