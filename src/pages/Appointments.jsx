import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const STATUS_COLOR = {
  confirmed: { bg: '#d1fae5', text: '#065f46' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b' },
  completed:  { bg: '#dbeafe', text: '#1e40af' },
};

const VIEW_TABS = [
  { id: 'upcoming', label: '📅 Upcoming' },
  { id: 'today',    label: '🕐 Today' },
  { id: 'all',      label: '📋 All' },
  { id: 'range',    label: '🗓️ Date Range' },
];

function formatDateTime(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }),
  };
}

export default function Appointments() {
  const [view,     setView]     = useState('upcoming');
  const [status,   setStatus]   = useState('');
  const [staffId,  setStaffId]  = useState('');
  const [search,   setSearch]   = useState('');
  const [from,     setFrom]     = useState('');
  const [to,       setTo]       = useState('');
  const [page,     setPage]     = useState(1);

  const [rows,     setRows]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Load staff for filter dropdown once
  useEffect(() => {
    api.get('/business/staff').then(({ data }) => setStaffList(data.staff.filter(s => s.active)));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ view, page, limit: 25 });
      if (status)  params.set('status',  status);
      if (staffId) params.set('staffId', staffId);
      if (search)  params.set('search',  search);
      if (view === 'range' && from) params.set('from', from);
      if (view === 'range' && to)   params.set('to',   to);

      const { data } = await api.get(`/business/appointments?${params}`);
      setRows(data.appointments);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [view, status, staffId, search, from, to, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  function applyFilter(setter, val) {
    setter(val);
    setPage(1);
  }

  function exportCSV() {
    if (!rows.length) return;
    const headers = ['ID', 'Date', 'Time', 'Service', 'Staff', 'Customer', 'Phone', 'Status'];
    const csvRows = rows.map(r => {
      const { date, time } = formatDateTime(r.scheduled_at);
      return [r.id, date, time, r.service_name || '', r.staff_name || '', r.customer_name || '', r.customer_phone, r.status];
    });
    const csv = [headers, ...csvRows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `appointments-${view}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ab-page max-w-[1200px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Appointments</h1>
          <p className="mt-0.5 text-sm text-slate-500">{total} {total === 1 ? 'appointment' : 'appointments'} found</p>
        </div>
        <Button type="button" variant="outline" size="md" className="gap-2" onClick={exportCSV} disabled={!rows.length}>
          ⬇️ Export CSV
        </Button>
      </div>

      <div className="flex w-full min-w-0 gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
        {VIEW_TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`h-8 flex-shrink-0 whitespace-nowrap rounded-md px-3 text-sm font-medium transition ${
              view === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => applyFilter(setView, t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="ab-filters-row mb-4">
        {/* Search */}
        <div className="flex min-w-[200px] flex-1 basis-[220px] items-center rounded-lg border border-slate-200 bg-white px-2.5 py-0">
          <span className="mr-1.5 text-sm">🔍</span>
          <input
            className="flex-1 border-0 bg-transparent py-2 text-[13px] outline-none"
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => applyFilter(setSearch, e.target.value)}
          />
          {search && (
            <button type="button" className="rounded p-0.5 text-sm text-slate-500 hover:text-slate-700" onClick={() => applyFilter(setSearch, '')}>✕</button>
          )}
        </div>

        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none"
          value={status}
          onChange={e => applyFilter(setStatus, e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none"
          value={staffId}
          onChange={e => applyFilter(setStaffId, e.target.value)}
        >
          <option value="">All staff</option>
          {staffList.map(st => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>

        {view === 'range' && (
          <>
            <input
              type="date"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none"
              value={from}
              onChange={e => applyFilter(setFrom, e.target.value)}
            />
            <span className="flex-shrink-0 text-sm text-slate-500">→</span>
            <input
              type="date"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none"
              value={to}
              onChange={e => applyFilter(setTo, e.target.value)}
            />
          </>
        )}

        {(status || staffId || search || from || to) && (
          <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => { setStatus(''); setStaffId(''); setSearch(''); setFrom(''); setTo(''); setPage(1); }}>
            Reset filters
          </Button>
        )}
      </div>

      <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500 sm:py-10">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">📅</div>
            <div className="text-base font-semibold text-slate-800">No appointments found</div>
            <div className="mt-1 text-sm text-slate-500">Try adjusting your filters or switching the view.</div>
          </div>
        ) : (
          <>
            <div className="ab-table-wrap">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Date', 'Time', 'Service', 'Staff', 'Customer', 'Phone', 'Status', 'Ref'].map(h => (
                      <th key={h} className="whitespace-nowrap border-b border-slate-100 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const { date, time } = formatDateTime(r.scheduled_at);
                    const sc = STATUS_COLOR[r.status] || { bg: '#f3f4f6', text: '#374151' };
                    return (
                      <tr key={r.id} className={i % 2 !== 0 ? 'bg-slate-50/50' : ''}>
                        <td className="border-b border-slate-50 px-4 py-3 text-[13px] text-slate-600">
                          <div className="text-xs text-slate-500">{date}</div>
                        </td>
                        <td className="border-b border-slate-50 px-4 py-3 text-[13px] font-semibold text-slate-700">{time}</td>
                        <td className="border-b border-slate-50 px-4 py-3 text-[13px] text-slate-600">{r.service_name || '—'}</td>
                        <td className="border-b border-slate-50 px-4 py-3 text-[13px] text-slate-600">{r.staff_name || '—'}</td>
                        <td className="border-b border-slate-50 px-4 py-3 text-[13px] text-slate-600">{r.customer_name || '—'}</td>
                        <td className="border-b border-slate-50 px-4 py-3 font-mono text-xs text-slate-600">{r.customer_phone}</td>
                        <td className="border-b border-slate-50 px-4 py-3">
                          <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize" style={{ background: sc.bg, color: sc.text }}>{r.status}</span>
                        </td>
                        <td className="border-b border-slate-50 px-4 py-3 text-xs text-slate-500">#{r.id}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                <div className="text-xs text-slate-500 sm:text-sm">Page {page} of {pages} · {total} total</div>
                <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

