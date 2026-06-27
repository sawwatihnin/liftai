import type { FormWarning, PoseSnapshot } from '../pose/types';

type WarningsPanelProps = {
  snapshot: PoseSnapshot | null;
};

const defaultWarnings: FormWarning[] = ['Go deeper.', 'Keep your chest up.', 'Knees out.'];

export function WarningsPanel({ snapshot }: WarningsPanelProps) {
  const activeWarnings = snapshot?.feedback.warnings ?? [];

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Form feedback</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Coach</span>
      </div>
      <div className="space-y-3">
        {defaultWarnings.map((warning) => {
          const isActive = activeWarnings.includes(warning);
          return (
            <div
              key={warning}
              className={`rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? 'border-coral/50 bg-coral/15 text-white'
                  : 'border-white/10 bg-ink/40 text-slate-400'
              }`}
            >
              {warning}
            </div>
          );
        })}
      </div>
    </div>
  );
}
