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

function formatDateTime(iso, tz = 'Asia/Kolkata') {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: tz }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz }),
  };
}

function toDateInputValue(iso, tz = 'Asia/Kolkata') {
  const d = new Date(iso);
  // en-CA returns YYYY-MM-DD which matches <input type="date">
  return d.toLocaleDateString('en-CA', { timeZone: tz });
}

function toTimeInputValue(iso, tz = 'Asia/Kolkata') {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
}

function addDaysToDateInput(dateInputValue, days) {
  // dateInputValue is "YYYY-MM-DD" (en-CA) so treat it as UTC to avoid timezone shifts
  const d = new Date(`${dateInputValue}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function getNowDateAndRoundedTime({ tz, stepMinutes = 30 }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: tz });
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [hh, mm] = timeStr.split(':').map(Number);
  let totalMins = (hh * 60) + mm;
  const rounded = Math.ceil(totalMins / stepMinutes) * stepMinutes;
  if (rounded >= 24 * 60) {
    return { date: addDaysToDateInput(dateStr, 1), time: '00:00' };
  }
  const rh = String(Math.floor(rounded / 60)).padStart(2, '0');
  const rm = String(rounded % 60).padStart(2, '0');
  return { date: dateStr, time: `${rh}:${rm}` };
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
  const [servicesList, setServicesList] = useState([]);
  const [businessTz, setBusinessTz] = useState('Asia/Kolkata');

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reschedError, setReschedError] = useState('');
  const [reschedSubmitting, setReschedSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createServiceId, setCreateServiceId] = useState('');
  const [createStaffId, setCreateStaffId] = useState('');
  const [createDate, setCreateDate] = useState('');
  const [createTime, setCreateTime] = useState('');
  const [createCustomerPhone, setCreateCustomerPhone] = useState('');
  const [createCustomerName, setCreateCustomerName] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuggestedSlots, setCreateSuggestedSlots] = useState([]);

  // Load staff for filter dropdown once
  useEffect(() => {
    Promise.all([api.get('/business'), api.get('/business/staff'), api.get('/business/services')]).then(
      ([b, staff, services]) => {
        const tz = b.data.business?.timezone || 'Asia/Kolkata';
        setBusinessTz(tz);
        const activeStaff = (staff.data.staff || []).filter(s => s.active);
        setStaffList(activeStaff);
        const activeServices = (services.data.services || []).filter(s => s.active);
        setServicesList(activeServices);

        // Default selections for manual booking modal
        const { date, time } = getNowDateAndRoundedTime({ tz, stepMinutes: 30 });
        setCreateDate(date);
        setCreateTime(time);
        setCreateStaffId(activeStaff[0]?.id ? String(activeStaff[0].id) : '');
        setCreateServiceId(activeServices[0]?.id ? String(activeServices[0].id) : '');
      },
    );
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

  const fetchSlots = useCallback(async (appointmentId, date) => {
    if (!appointmentId || !date) return;
    setSlotsLoading(true);
    try {
      const { data } = await api.get(`/business/appointments/${appointmentId}/slots`, {
        params: { date },
      });
      setSuggestedSlots(data.curatedSlots || []);
    } catch (err) {
      setSuggestedSlots([]);
      // Non-fatal: if slot suggestions fail (e.g. appointment not confirmed), user can still manual-enter.
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (rescheduleTarget?.id && reschedDate) {
      fetchSlots(rescheduleTarget.id, reschedDate);
    }
  }, [rescheduleTarget?.id, reschedDate, fetchSlots]);

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

  function openReschedule(appt) {
    setRescheduleTarget(appt);
    setReschedError('');
    setReschedDate(toDateInputValue(appt.scheduled_at, businessTz));
    setReschedTime(toTimeInputValue(appt.scheduled_at, businessTz));
    setSuggestedSlots([]);
  }

  function closeReschedule() {
    setRescheduleTarget(null);
    setSuggestedSlots([]);
    setReschedError('');
    setReschedSubmitting(false);
  }

  async function cancelAppointment(apptId) {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.post(`/business/appointments/${apptId}/cancel`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  }

  async function completeAppointment(apptId) {
    if (!confirm('Mark this appointment as completed?')) return;
    try {
      await api.post(`/business/appointments/${apptId}/complete`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete');
    }
  }

  async function submitReschedule() {
    if (!rescheduleTarget?.id) return;
    setReschedSubmitting(true);
    setReschedError('');
    try {
      await api.post(`/business/appointments/${rescheduleTarget.id}/reschedule`, {
        date: reschedDate,
        time: reschedTime,
      });
      closeReschedule();
      await load();
    } catch (err) {
      setReschedSubmitting(false);
      if (err.response?.status === 409) {
        setReschedError(err.response?.data?.error || 'That slot is not available');
        // Refresh suggestions for the chosen date.
        await fetchSlots(rescheduleTarget.id, reschedDate);
      } else {
        setReschedError(err.response?.data?.error || 'Failed to reschedule');
      }
    } finally {
      setReschedSubmitting(false);
    }
  }

  function openCreateAppointment() {
    // If reschedule modal is open, close it so we don't stack dialogs.
    closeReschedule();
    setCreateSuggestedSlots([]);
    setCreateError('');
    setCreateCustomerPhone('');
    setCreateCustomerName('');
    setCreateNotes('');
    setCreateSubmitting(false);
    setCreateOpen(true);

    const { date, time } = getNowDateAndRoundedTime({ tz: businessTz, stepMinutes: 30 });
    setCreateDate(date);
    setCreateTime(time);
    setCreateStaffId((prev) => prev || (staffList[0]?.id ? String(staffList[0].id) : ''));
    setCreateServiceId((prev) => prev || (servicesList[0]?.id ? String(servicesList[0].id) : ''));
  }

  function closeCreateAppointment() {
    setCreateOpen(false);
    setCreateError('');
    setCreateSuggestedSlots([]);
    setCreateSubmitting(false);
  }

  async function submitManualAppointment() {
    if (!createStaffId || !createServiceId || !createDate || !createTime || !createCustomerPhone) {
      setCreateError('Please fill staff, service, date, time, and customer phone.');
      return;
    }

    setCreateSubmitting(true);
    setCreateError('');
    setCreateSuggestedSlots([]);

    try {
      await api.post('/business/appointments/manual', {
        staffId: createStaffId,
        serviceId: createServiceId,
        customerPhone: createCustomerPhone,
        customerName: createCustomerName || null,
        date: createDate,
        time: createTime,
        notes: createNotes || null,
      });
      closeCreateAppointment();
      await load();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setCreateError(err.response?.data?.error || 'That slot is not available');
        setCreateSuggestedSlots(err.response?.data?.slots || []);
      } else {
        setCreateError(err.response?.data?.error || 'Failed to create appointment');
      }
    } finally {
      setCreateSubmitting(false);
    }
  }

  return (
    <div className="ab-page max-w-[1200px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Appointments</h1>
          <p className="mt-0.5 text-sm text-slate-500">{total} {total === 1 ? 'appointment' : 'appointments'} found</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="md" className="gap-2" onClick={exportCSV} disabled={!rows.length}>
            ⬇️ Export CSV
          </Button>
          <Button type="button" size="md" className="gap-2 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700" onClick={openCreateAppointment}>
            ➕ Add Appointment
          </Button>
        </div>
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
                    {['Date', 'Time', 'Service', 'Staff', 'Customer', 'Phone', 'Status', 'Ref', 'Actions'].map(h => (
                      <th key={h} className="whitespace-nowrap border-b border-slate-100 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const { date, time } = formatDateTime(r.scheduled_at, businessTz);
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
                        <td className="border-b border-slate-50 px-4 py-3 whitespace-nowrap">
                          {r.status === 'confirmed' ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 border-red-200 bg-white px-2 py-0 text-[12px] text-red-600 hover:bg-red-50"
                                onClick={() => cancelAppointment(r.id)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 border-slate-200 bg-white px-2 py-0 text-[12px] text-slate-700 hover:bg-slate-50"
                                onClick={() => openReschedule(r)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 border-emerald-200 bg-white px-2 py-0 text-[12px] text-emerald-700 hover:bg-emerald-50"
                                onClick={() => completeAppointment(r.id)}
                              >
                                Done
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[12px] text-slate-500">—</span>
                          )}
                        </td>
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

      {rescheduleTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeReschedule}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Reschedule Appointment</div>
                <div className="mt-0.5 text-xs text-slate-500">Ref #{rescheduleTarget.id}</div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={closeReschedule}>
                Close
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    New Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    value={reschedDate}
                    onChange={(e) => setReschedDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    New Time
                  </label>
                  <input
                    type="time"
                    step={1800}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    value={reschedTime}
                    onChange={(e) => setReschedTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Suggested slots
                </div>
                {slotsLoading ? (
                  <div className="text-sm text-slate-500">Loading slots…</div>
                ) : suggestedSlots.length ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestedSlots.map((t) => (
                      <Button
                        key={t}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-[12px] text-slate-700 hover:bg-slate-50"
                        onClick={() => setReschedTime(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    No open slots found for this date. You can still try manual entry.
                  </div>
                )}
              </div>

              {reschedError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {reschedError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeReschedule}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                  onClick={submitReschedule}
                  disabled={reschedSubmitting || !reschedDate || !reschedTime}
                >
                  {reschedSubmitting ? 'Saving…' : 'Reschedule'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeCreateAppointment}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Manual Appointment Booking</div>
                <div className="mt-0.5 text-xs text-slate-500">Creates a confirmed record using availability rules.</div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={closeCreateAppointment}>
                Close
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Service
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    value={createServiceId}
                    onChange={(e) => setCreateServiceId(e.target.value)}
                  >
                    {servicesList.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name} ({s.duration_minutes}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Staff
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    value={createStaffId}
                    onChange={(e) => setCreateStaffId(e.target.value)}
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={String(st.id)}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Time
                  </label>
                  <input
                    type="time"
                    step={1800}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    value={createTime}
                    onChange={(e) => setCreateTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer phone
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={createCustomerPhone}
                  onChange={(e) => setCreateCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer name (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={createCustomerName}
                  onChange={(e) => setCreateCustomerName(e.target.value)}
                  placeholder="e.g. Rahul"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes (optional)
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </div>

              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {createError}
                </div>
              )}

              {createSuggestedSlots.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Suggested available times
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {createSuggestedSlots.map((t) => (
                      <Button
                        key={t}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-[12px] text-slate-700 hover:bg-slate-50"
                        onClick={() => setCreateTime(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeCreateAppointment}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                  onClick={submitManualAppointment}
                  disabled={createSubmitting || !createCustomerPhone}
                >
                  {createSubmitting ? 'Saving…' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

