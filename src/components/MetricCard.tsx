type MetricCardProps = {
  label: string;
  value: string;
  accent?: 'aqua' | 'gold' | 'coral';
};

const accentStyles: Record<NonNullable<MetricCardProps['accent']>, string> = {
  aqua: 'from-aqua/25 to-aqua/5 text-aqua',
  gold: 'from-gold/25 to-gold/5 text-gold',
  coral: 'from-coral/25 to-coral/5 text-coral',
};

export function MetricCard({ label, value, accent = 'aqua' }: MetricCardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accentStyles[accent]} p-4 shadow-glow`}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
