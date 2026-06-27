const exercises = [
  {
    name: 'Back Squat',
    muscles: 'Glutes · Quads · Hamstrings',
    angle: 'Front view',
    difficulty: 'Foundational',
  },
  {
    name: 'Romanian Deadlift',
    muscles: 'Hamstrings · Glutes · Lower back',
    angle: 'Side view',
    difficulty: 'Intermediate',
  },
  {
    name: 'Shoulder Press',
    muscles: 'Shoulders · Triceps · Core',
    angle: 'Front view',
    difficulty: 'Intermediate',
  },
  {
    name: 'Split Squat',
    muscles: 'Quads · Glutes · Stability',
    angle: 'Three-quarter',
    difficulty: 'Controlled',
  },
];

export function ExerciseLibrary() {
  return (
    <section className="rounded-[24px] border border-white/8 bg-panel/70 p-5 shadow-panel backdrop-blur-md animate-fadeRise">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-rose/80">Movement Library</p>
          <h2 className="mt-2 text-2xl font-bold text-text">Choose your exercise</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Premium movement presets with recommended setup, primary muscles, and camera guidance.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted">
          Local tracking only
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {exercises.map((exercise, index) => (
          <article
            key={exercise.name}
            className="group rounded-[22px] border border-white/8 bg-gradient-to-br from-[#1A131B] via-[#161117] to-[#110E13] p-4 shadow-panel transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-rose/30 hover:shadow-burgundy"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-24 w-20 items-center justify-center rounded-[18px] border border-white/6 bg-[radial-gradient(circle_at_50%_20%,rgba(217,75,106,0.26),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
                <div className="h-16 w-8 rounded-full bg-gradient-to-b from-rose/60 via-garnet/30 to-transparent blur-[1px]" />
              </div>
              <div className="rounded-full border border-rose/20 bg-burgundy/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-rose/80">
                {exercise.angle}
              </div>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-text">{exercise.name}</h3>
            <p className="mt-1 text-sm text-muted">{exercise.muscles}</p>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
              <span>{exercise.difficulty}</span>
              <span>Camera ready</span>
            </div>
            <button
              type="button"
              className="mt-5 flex w-full items-center justify-between rounded-full border border-rose/30 bg-gradient-to-r from-burgundy/60 to-garnet/50 px-4 py-3 text-sm font-semibold text-text transition group-hover:border-rose/50"
            >
              Begin
              <span className="text-rose">→</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
