import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

function StatCard({ label, value, icon, sub }) {
  return (
    <Card className="h-full border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-600">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
          {sub && <span className="text-sm font-normal text-slate-500">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

const STATUS_COLORS = { confirmed: '#d1fae5', cancelled: '#fee2e2', completed: '#dbeafe' };
const STATUS_TEXT   = { confirmed: '#065f46', cancelled: '#991b1b', completed: '#1e40af' };

export default function Dashboard() {
  const { owner } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/business/stats'),
      api.get('/business/appointments'),
      api.get('/business'),
    ]).then(([st, a, b]) => {
      setStats(st.data);
      setAppointments(a.data.appointments || []);
      setBusiness(b.data.business);
      // Upcoming = future appointments (not today)
      const now = new Date();
      const future = (a.data.appointments || []).filter(ap => new Date(ap.scheduled_at) > now);
      setUpcoming(future.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const chatUrl = business?.slug ? `${window.location.origin}/chat/${business.slug}` : '';
  const isNewBusiness = (stats?.total ?? 0) === 0;

  function copyUrl() {
    navigator.clipboard.writeText(chatUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="flex items-center gap-3 px-6 py-10 text-sm text-slate-500">
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      <span>Loading dashboard…</span>
    </div>
  );

  return (
    <div className="ab-page max-w-[1100px] space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{business?.name || 'Dashboard'}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{today}</p>
        </div>
        <Button asChild size="md" className="gap-2 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700">
          <a href={chatUrl} target="_blank" rel="noreferrer">💬 Open Chat UI</a>
        </Button>
      </div>

      {/* Welcome banner for new users */}
      {isNewBusiness && (
        <Card className="ab-section-gap border-none bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white shadow-md sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="text-sm font-semibold sm:text-base">Your bot is live! Share your link to get your first booking.</div>
                <div className="mt-0.5 text-xs opacity-90">Customers can book 24/7 via the link below.</div>
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-white/15 px-3 py-2 font-mono text-xs">{chatUrl}</code>
              <Button type="button" variant="secondary" size="sm" className="shrink-0 bg-white text-indigo-600 hover:bg-slate-100" onClick={copyUrl}>
                {copied ? '✓ Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Chat URL banner (for existing users) */}
      {!isNewBusiness && (
        <Card className="ab-section-gap overflow-hidden border border-slate-200/80 bg-slate-900 p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Your Booking Bot URL</div>
              <div className="mt-0.5 text-xs text-slate-300">Share this link with your customers</div>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
              <code className="min-w-0 flex-1 break-all rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-200">
                {chatUrl}
              </code>
              <Button type="button" size="md" className="shrink-0 bg-emerald-600 font-semibold text-white hover:bg-emerald-700" onClick={copyUrl}>
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="ab-stats-grid">
        <StatCard icon="📅" label="Today's Bookings" value={stats?.today ?? 0} />
        <StatCard icon="📆" label="This Month" value={stats?.thisMonth ?? 0} sub={stats?.limits?.bookingsPerMonth != null && stats.limits.bookingsPerMonth !== Infinity ? ` / ${stats.limits.bookingsPerMonth}` : ''} />
        <StatCard icon="📊" label="Total Bookings" value={stats?.total ?? 0} />
      </div>

      {/* Quick Actions */}
      <div className="ab-quick-actions">
        <Link to="/dashboard/settings" className="ab-quick-card">
          <Card className="flex h-full flex-col items-center justify-center gap-1.5 border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow sm:p-5">
            <span className="text-xl sm:text-2xl">📋</span>
            <span className="text-xs font-semibold text-slate-700">Add Service</span>
          </Card>
        </Link>
        <Link to="/dashboard/settings" className="ab-quick-card">
          <Card className="flex h-full flex-col items-center justify-center gap-1.5 border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow sm:p-5">
            <span className="text-xl sm:text-2xl">👤</span>
            <span className="text-xs font-semibold text-slate-700">Add Staff</span>
          </Card>
        </Link>
        <a href={chatUrl} target="_blank" rel="noreferrer" className="ab-quick-card">
          <Card className="flex h-full flex-col items-center justify-center gap-1.5 border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow sm:p-5">
            <span className="text-xl sm:text-2xl">🤖</span>
            <span className="text-xs font-semibold text-slate-700">Test Bot</span>
          </Card>
        </a>
      </div>

      {/* Today's appointments */}
      <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 className="flex-1 text-sm font-semibold text-slate-900 sm:text-base">Today's Appointments</h2>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">
            {appointments.filter(a => {
              const d = new Date(a.scheduled_at);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).length}
          </span>
        </div>

        {(() => {
          const todayAppts = appointments.filter(a => {
            const d = new Date(a.scheduled_at);
            const today = new Date();
            return d.toDateString() === today.toDateString();
          });
          if (todayAppts.length === 0) return (
            <div className="py-8 text-center sm:py-10">
              <div className="mb-2 text-3xl sm:text-4xl">📅</div>
              <div className="text-sm font-semibold text-slate-700">No appointments today</div>
              <div className="mt-0.5 text-xs text-slate-500">Share your chat link to start getting bookings.</div>
            </div>
          );
          return (
            <div className="ab-table-wrap">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Time', 'Service', 'Staff', 'Customer', 'Phone', 'Status'].map(h => (
                      <th key={h} className="bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.map(a => (
                    <tr key={a.id} className="border-t border-slate-100">
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-slate-700 sm:px-4 sm:py-3 sm:text-sm">{formatTime(a.scheduled_at)}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{a.service_name || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{a.staff_name || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 sm:px-4 sm:py-3 sm:text-sm">{a.customer_name || '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-slate-600 sm:px-4 sm:py-3">{a.customer_phone}</td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <span
                          className="inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize"
                          style={{ background: STATUS_COLORS[a.status] || '#f3f4f6', color: STATUS_TEXT[a.status] || '#374151' }}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Card>

      {/* Upcoming appointments */}
      {upcoming.length > 0 && (
        <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
            <h2 className="flex-1 text-sm font-semibold text-slate-900 sm:text-base">Upcoming</h2>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">{upcoming.length}</span>
          </div>
          <div className="px-4 py-2 sm:px-5">
            {upcoming.map((a, i) => (
              <div
                key={a.id}
                className={`flex items-center gap-4 py-3.5 ${i < upcoming.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="w-20 flex-shrink-0">
                  <div className="text-[11px] font-semibold text-slate-500">{formatDate(a.scheduled_at)}</div>
                  <div className="text-sm font-bold text-slate-900">{formatTime(a.scheduled_at)}</div>
                </div>
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900">{a.service_name || 'Appointment'}</div>
                  <div className="text-xs text-slate-500">{a.customer_name || a.customer_phone} · {a.staff_name || 'Any staff'}</div>
                </div>
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                  style={{ background: STATUS_COLORS[a.status] || '#f3f4f6', color: STATUS_TEXT[a.status] || '#374151' }}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
