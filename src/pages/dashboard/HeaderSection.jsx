import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export function DashboardHeader({ greeting, ownerEmail, todayStr, businessName, chatUrl }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {greeting}, {ownerEmail?.split('@')[0] || 'there'}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">{todayStr} &middot; {businessName || 'Dashboard'}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/dashboard/appointments">View All Appointments</Link>
        </Button>
        {chatUrl && (
          <Button asChild size="sm" className="gap-1.5 bg-emerald-600 font-semibold text-white hover:bg-emerald-700">
            <a href={chatUrl} target="_blank" rel="noreferrer">Open Chat UI</a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function QuickActions({ chatUrl }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Link to="/dashboard/appointments" className="group">
        <Card className="flex h-full flex-col items-center justify-center gap-2 border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl transition-transform group-hover:scale-110">📅</div>
          <span className="text-xs font-semibold text-slate-700">Appointments</span>
        </Card>
      </Link>
      <Link to="/dashboard/settings?tab=services" className="group">
        <Card className="flex h-full flex-col items-center justify-center gap-2 border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl transition-transform group-hover:scale-110">📋</div>
          <span className="text-xs font-semibold text-slate-700">Services</span>
        </Card>
      </Link>
      <Link to="/dashboard/settings?tab=staff" className="group">
        <Card className="flex h-full flex-col items-center justify-center gap-2 border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-violet-200 hover:shadow-md sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl transition-transform group-hover:scale-110">👤</div>
          <span className="text-xs font-semibold text-slate-700">Staff</span>
        </Card>
      </Link>
      <Link to="/dashboard/customers" className="group">
        <Card className="flex h-full flex-col items-center justify-center gap-2 border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-amber-200 hover:shadow-md sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl transition-transform group-hover:scale-110">🧾</div>
          <span className="text-xs font-semibold text-slate-700">Customers</span>
        </Card>
      </Link>
      {chatUrl && (
        <a href={chatUrl} target="_blank" rel="noreferrer" className="group">
          <Card className="flex h-full flex-col items-center justify-center gap-2 border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-amber-200 hover:shadow-md sm:p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl transition-transform group-hover:scale-110">🤖</div>
            <span className="text-xs font-semibold text-slate-700">Test Bot</span>
          </Card>
        </a>
      )}
    </div>
  );
}
