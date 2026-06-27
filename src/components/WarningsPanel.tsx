type WarningsPanelProps = {
  warnings: string[];
};

export function WarningsPanel({ warnings }: WarningsPanelProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Form feedback</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Coach</span>
      </div>

      {warnings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3 text-slate-400">
          All clear
        </div>
      ) : (
        <div className="space-y-3">
          {warnings.map((warning) => (
            <div
              key={warning}
              className="rounded-2xl border border-coral/50 bg-coral/15 px-4 py-3 text-white"
            >
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
