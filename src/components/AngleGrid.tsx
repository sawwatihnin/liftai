import type { PoseSnapshot } from '../pose/types';

type AngleGridProps = {
  snapshot: PoseSnapshot | null;
};

export function AngleGrid({ snapshot }: AngleGridProps) {
  const angleItems = [
    ['Left knee', snapshot?.angles.leftKnee],
    ['Right knee', snapshot?.angles.rightKnee],
    ['Hip', snapshot?.angles.hip],
    ['Torso lean', snapshot?.angles.torso],
  ] as const;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Joint angles</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Live</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {angleItems.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-ink/50 p-4">
            <p className="text-sm text-slate-300">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {typeof value === 'number' ? `${Math.round(value)}°` : '--'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
