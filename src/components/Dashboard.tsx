import type { ExerciseDefinition, ExerciseSnapshot } from '../exercises/types';
import { AngleGrid } from './AngleGrid';
import { MetricCard } from './MetricCard';
import { WarningsPanel } from './WarningsPanel';

type DashboardProps = {
  definition: ExerciseDefinition;
  snapshot: ExerciseSnapshot | null;
  sessionDurationMs: number;
};

export function Dashboard({ definition, snapshot, sessionDurationMs }: DashboardProps) {
  return (
    <div className="space-y-5">
      {/* Top metric cards — driven by the exercise definition */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {definition.dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.key}
            label={metric.label}
            value={snapshot ? metric.getValue(snapshot.result, sessionDurationMs) : '--'}
            accent={metric.accent}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <AngleGrid snapshot={snapshot} displayItems={definition.angleDisplayItems} />
        <WarningsPanel warnings={snapshot?.result.warnings ?? []} />
      </div>

      {/* Secondary detail cards — each exercise defines what appears here */}
      {definition.secondaryMetrics.length > 0 ? (
        <div className={`grid gap-4 ${definition.secondaryMetrics.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {definition.secondaryMetrics.map((metric) => (
            <div key={metric.key} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">{metric.label}</p>
              <p className="mt-3 text-3xl font-bold text-white">
                {snapshot ? metric.getValue(snapshot.result) : '--'}
              </p>
              <p className="mt-2 text-sm text-slate-400">{metric.description}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
