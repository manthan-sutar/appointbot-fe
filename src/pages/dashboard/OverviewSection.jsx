import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

const STAT_STYLES = [
  { gradient: 'from-emerald-500 to-emerald-600', iconBg: 'bg-white/20', label: "Today's Bookings" },
  { gradient: 'from-blue-500 to-blue-600', iconBg: 'bg-white/20', label: 'This Month' },
  { gradient: 'from-violet-500 to-violet-600', iconBg: 'bg-white/20', label: 'Total Bookings' },
];

const statIcons = ['📅', '📆', '📊'];

export function NewBusinessBanner({ chatUrl, copied, onCopy }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-5 text-white shadow-lg sm:p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <div className="text-base font-bold sm:text-lg">Your bot is live!</div>
            <div className="mt-1 text-sm opacity-90">Share your booking link to get your first appointment. Customers can book 24/7.</div>
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-white/15 px-3 py-2.5 font-mono text-xs backdrop-blur-sm">{chatUrl}</code>
          <Button type="button" size="sm" className="shrink-0 bg-white font-semibold text-indigo-600 shadow-sm hover:bg-slate-100" onClick={onCopy}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats }) {
  const statValues = [stats?.today ?? 0, stats?.thisMonth ?? 0, stats?.total ?? 0];
  const statSubs = [
    null,
    stats?.limits?.bookingsPerMonth != null && stats.limits.bookingsPerMonth !== Infinity ? `/ ${stats.limits.bookingsPerMonth}` : null,
    null,
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STAT_STYLES.map((s, i) => (
        <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 text-white shadow-md`}>
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">{s.label}</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg} text-lg`}>{statIcons[i]}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{statValues[i]}</span>
              {statSubs[i] && <span className="text-sm font-medium text-white/70">{statSubs[i]}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingLinkCard({ chatUrl, copied, onCopy }) {
  if (!chatUrl) return null;
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">🔗</div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Booking Link</div>
            <div className="text-xs text-slate-500">Share with your customers</div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
          <code className="min-w-0 flex-1 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 sm:max-w-[400px]">
            {chatUrl}
          </code>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-semibold" onClick={onCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
