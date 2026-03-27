import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';

function formatTime(isoStr, tz = 'Asia/Kolkata') {
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz });
}

function formatDate(isoStr, tz = 'Asia/Kolkata') {
  return new Date(isoStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz });
}

const STATUS_CONFIG = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-red-200' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-blue-200' },
  no_show: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status === 'no_show' ? 'No Show' : status}
    </span>
  );
}

function AppointmentListCard({ title, icon, iconBg, count, emptyIcon, emptyTitle, emptySubtitle, items, tz, showDate = false, footerLink = false }) {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} text-sm`}>{icon}</div>
        <h2 className="flex-1 text-sm font-semibold text-slate-900">{title}</h2>
        <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-800 px-2 text-[11px] font-bold text-white">
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">{emptyIcon}</div>
          <div className="text-sm font-semibold text-slate-700">{emptyTitle}</div>
          <div className="mt-1 text-xs text-slate-500">{emptySubtitle}</div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50">
              <div className="w-16 shrink-0 text-center">
                {showDate && <div className="text-[11px] font-semibold text-slate-500">{formatDate(a.scheduled_at, tz)}</div>}
                <div className="text-sm font-bold text-slate-900">{formatTime(a.scheduled_at, tz)}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">{a.service_name || 'Appointment'}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {a.customer_name || a.customer_phone} {a.staff_name ? `· ${a.staff_name}` : ''}
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}

      {footerLink && items.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-3">
          <Link to="/dashboard/appointments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View all appointments →
          </Link>
        </div>
      )}
    </Card>
  );
}

export function AppointmentPanels({ todayAppointments, upcoming, tz }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <AppointmentListCard
        title="Today"
        icon="🕐"
        iconBg="bg-emerald-50"
        count={todayAppointments.length}
        emptyIcon="📅"
        emptyTitle="No appointments today"
        emptySubtitle="Share your chat link to start getting bookings."
        items={todayAppointments}
        tz={tz}
      />
      <AppointmentListCard
        title="Upcoming"
        icon="📆"
        iconBg="bg-blue-50"
        count={upcoming.length}
        emptyIcon="📆"
        emptyTitle="No upcoming appointments"
        emptySubtitle="Future bookings will appear here."
        items={upcoming}
        tz={tz}
        showDate
        footerLink
      />
    </div>
  );
}
