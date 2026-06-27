import type { ExerciseDefinition } from '../exercises/types';
import { getAllExercises } from '../exercises/registry';

type ExerciseLibraryProps = {
  onSelect: (exercise: ExerciseDefinition) => void;
};

const CATEGORY_BADGE: Record<string, string> = {
  'Lower Body': 'text-aqua/90 border-aqua/20 bg-aqua/5',
  'Upper Body': 'text-gold/90 border-gold/20 bg-gold/5',
  Core: 'text-coral/90 border-coral/20 bg-coral/5',
  'Full Body': 'text-rose/90 border-rose/20 bg-rose/5',
};

const DIFFICULTY_DOT: Record<string, string> = {
  Foundational: 'bg-aqua',
  Intermediate: 'bg-gold',
  Advanced: 'bg-coral',
};

export function ExerciseLibrary({ onSelect }: ExerciseLibraryProps) {
  const exercises = getAllExercises();

  return (
    <section className="animate-fadeRise">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.32em] text-rose/80">Movement Library</p>
        <h2 className="mt-3 text-3xl font-bold text-text">Choose your exercise</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Premium movement presets with live biomechanical analysis. Each exercise defines its own
          metrics, coaching cues, and joint-angle tracking.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted/60">
        More exercises coming soon · All processing runs locally in your browser
      </p>
    </section>
  );
}

type ExerciseCardProps = {
  exercise: ExerciseDefinition;
  index: number;
  onSelect: (exercise: ExerciseDefinition) => void;
};

function ExerciseCard({ exercise, index, onSelect }: ExerciseCardProps) {
  const categoryClass = CATEGORY_BADGE[exercise.category] ?? CATEGORY_BADGE['Full Body'];
  const dotClass = DIFFICULTY_DOT[exercise.difficulty] ?? 'bg-muted';
  const isFullyImplemented = exercise.angleRequests.length > 0;

  return (
    <article
      className="group relative flex flex-col rounded-[22px] border border-white/8 bg-gradient-to-br from-[#1A131B] via-[#161117] to-[#110E13] p-5 shadow-panel transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-rose/30 hover:shadow-burgundy"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Illustration placeholder */}
      <div className="flex h-28 items-center justify-center rounded-[18px] border border-white/6 bg-[radial-gradient(circle_at_50%_20%,rgba(217,75,106,0.22),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
        <div className="h-20 w-10 rounded-full bg-gradient-to-b from-rose/60 via-garnet/30 to-transparent blur-[1px] opacity-80 group-hover:opacity-100 transition" />
      </div>

      {/* Category badge */}
      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-full border px-3 py-0.5 text-[11px] uppercase tracking-[0.2em] ${categoryClass}`}>
          {exercise.category}
        </span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted/70">
          {exercise.cameraView}
        </span>
      </div>

      {/* Name + muscles */}
      <h3 className="mt-3 text-xl font-semibold text-text">{exercise.name}</h3>
      <p className="mt-1 text-sm text-muted">{exercise.muscles}</p>

      {/* Difficulty */}
      <div className="mt-3 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        <span className="text-xs text-muted/80">{exercise.difficulty}</span>
        {!isFullyImplemented ? (
          <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted/50">
            Soon
          </span>
        ) : null}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSelect(exercise)}
        className="mt-5 flex w-full items-center justify-between rounded-full border border-rose/30 bg-gradient-to-r from-burgundy/60 to-garnet/50 px-5 py-3 text-sm font-semibold text-text transition hover:border-rose/55 hover:from-garnet/70 hover:to-rose/40 active:scale-[0.98]"
      >
        Begin
        <span className="text-rose">→</span>
      </button>
    </article>
  );
}
