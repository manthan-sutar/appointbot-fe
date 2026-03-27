export function StatCard({ label, value, sublabel, variant = 'default' }) {
  const variants = {
    default: 'border-slate-200 bg-white',
    emerald: 'border-emerald-200 bg-emerald-50',
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
    amber: 'border-amber-200 bg-amber-50',
  };

  const textColors = {
    default: 'text-slate-900',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
    amber: 'text-amber-700',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${variants[variant] || variants.default}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${textColors[variant] || textColors.default}`}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-slate-600">{sublabel}</div>}
    </div>
  );
}
