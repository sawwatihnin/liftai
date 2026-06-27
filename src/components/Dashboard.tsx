import type { PoseSnapshot } from '../pose/types';
import { formatDuration } from '../utils/time';
import { AngleGrid } from './AngleGrid';
import { MetricCard } from './MetricCard';
import { WarningsPanel } from './WarningsPanel';

type DashboardProps = {
  snapshot: PoseSnapshot | null;
  sessionDurationMs: number;
};

export function Dashboard({ snapshot, sessionDurationMs }: DashboardProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Reps" value={String(snapshot?.squat.repCount ?? 0)} accent="aqua" />
        <MetricCard
          label="Depth"
          value={snapshot ? `${Math.round(snapshot.feedback.depthScore)}%` : '--'}
          accent="gold"
        />
        <MetricCard
          label="Phase"
          value={snapshot?.squat.phase ?? 'waiting'}
          accent="coral"
        />
        <MetricCard label="Duration" value={formatDuration(sessionDurationMs)} accent="aqua" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <AngleGrid snapshot={snapshot} />
        <WarningsPanel snapshot={snapshot} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Depth estimate</p>
          <p className="mt-3 text-3xl font-bold text-white">{snapshot?.feedback.depthLabel ?? '--'}</p>
          <p className="mt-2 text-sm text-slate-400">
            Based on average knee flexion during the current squat cycle.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Forward lean</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {snapshot ? `${Math.round(snapshot.feedback.forwardLean)}°` : '--'}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Torso angle is measured against vertical using shoulder-to-hip alignment.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">Knee tracking</p>
          <p className="mt-3 text-3xl font-bold text-white">
              {snapshot ? snapshot.feedback.kneeValgusRatio.toFixed(2) : '--'}
            </p>
          <p className="mt-2 text-sm text-slate-400">
              Ratio compares knee width to ankle width to estimate knees collapsing inward.
            </p>
        </div>
      </div>
    </div>
  );
}
