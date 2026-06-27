import type { ExerciseDefinition } from '../exercises/types';

type SetupScreenProps = {
  exercise: ExerciseDefinition;
  onStart: () => void;
  onBack: () => void;
};

export function SetupScreen({ exercise, onStart, onBack }: SetupScreenProps) {
  return (
    <div className="animate-fadeRise mx-auto max-w-2xl">
      {/* Back nav */}
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-muted transition hover:text-text"
      >
        <span>←</span>
        <span>Exercise Library</span>
      </button>

      {/* Header */}
      <div className="mb-2">
        <p className="text-xs uppercase tracking-[0.32em] text-rose/80">Setup</p>
        <h1 className="mt-3 text-4xl font-bold text-text">{exercise.name}</h1>
        <p className="mt-2 text-base text-muted">{exercise.muscles}</p>
      </div>

      {/* Meta row */}
      <div className="mt-5 flex flex-wrap gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted">
          {exercise.category}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted">
          {exercise.difficulty}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted">
          {exercise.cameraView}
        </span>
      </div>

      {/* Camera setup instructions */}
      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-semibold uppercase tracking-[0.22em] text-rose/80">
          Camera setup
        </h2>
        <ol className="mt-5 space-y-4">
          {exercise.cameraSetup.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rose/30 bg-rose/10 text-sm font-semibold text-rose">
                {i + 1}
              </span>
              <span className="mt-0.5 text-sm text-slate-200">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Privacy note */}
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-muted/70">
        All video processing happens locally in your browser. No footage is uploaded or stored.
      </div>

      {/* Start CTA */}
      <button
        type="button"
        onClick={onStart}
        className="mt-8 w-full rounded-full border border-rose/35 bg-gradient-to-r from-burgundy to-garnet py-4 text-base font-semibold text-text shadow-burgundy transition hover:from-garnet hover:to-rose active:scale-[0.99]"
      >
        Start camera →
      </button>
    </div>
  );
}
