import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { toast } from 'sonner';

const STATUS_VARIANT = {
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
  no_show: 'outline',
};

const CONFIRMATION_VARIANT = {
  pending: 'outline',
  confirmed: 'default',
  declined: 'destructive',
  expired: 'secondary',
};

const VIEW_TABS = [
  { id: 'upcoming', label: '📅 Upcoming' },
  { id: 'today',    label: '🕐 Today' },
  { id: 'all',      label: '📋 All' },
  { id: 'range',    label: '🗓️ Date Range' },
];

/** Base UI / Radix-style selects reject empty string as SelectItem value — use a sentinel. */
const FILTER_ALL = '__all__';

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

  const [error, setError] = useState('');

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
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerNotes, setCustomerNotes] = useState([]);
  const [customerDrawerLoading, setCustomerDrawerLoading] = useState(false);
  const [customerNoteInput, setCustomerNoteInput] = useState('');
  const [customerNoteSaving, setCustomerNoteSaving] = useState(false);
  const [customerDrawerError, setCustomerDrawerError] = useState('');

  // Load staff for filter dropdown once
  useEffect(() => {
    Promise.all([api.get('/business'), api.get('/business/staff'), api.get('/business/services')])
      .then(([b, staff, services]) => {
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
      })
      .catch(err => {
        console.error('[Appointments] Failed to load business data:', err);
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ view, page, limit: 25 });
      if (status)  params.set('status',  status);
      if (staffId) params.set('staffId', staffId);
      if (search)  params.set('search',  search);
      if (view === 'range' && from) params.set('from', from);
      if (view === 'range' && to)   params.set('to',   to);

      const { data } = await api.get(`/business/appointments?${params}`);
      setRows(data.appointments || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('[Appointments] Load error:', err);
      console.error('[Appointments] Response:', err.response);
      setRows([]);
      setTotal(0);
      setPages(1);
      const errMsg = err.response?.data?.error || err.message || 'Failed to load appointments. Please try again.';
      setError(errMsg);
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

  async function openCustomerDrawer(phone) {
    if (!phone) return;
    setCustomerDrawerOpen(true);
    setSelectedCustomerPhone(phone);
    setCustomerDrawerLoading(true);
    setCustomerDrawerError('');
    setCustomerNoteInput('');
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get(`/business/customers/${encodeURIComponent(phone)}/profile`),
        api.get(`/business/customers/${encodeURIComponent(phone)}/history`),
      ]);
      setCustomerProfile(profileRes.data.customer || null);
      setCustomerHistory(historyRes.data.appointments || []);
      setCustomerNotes(historyRes.data.notes || []);
    } catch (err) {
      setCustomerDrawerError(err.response?.data?.error || 'Failed to load customer details');
      setCustomerProfile(null);
      setCustomerHistory([]);
      setCustomerNotes([]);
    } finally {
      setCustomerDrawerLoading(false);
    }
  }

  function closeCustomerDrawer() {
    setCustomerDrawerOpen(false);
    setSelectedCustomerPhone('');
    setCustomerProfile(null);
    setCustomerHistory([]);
    setCustomerNotes([]);
    setCustomerNoteInput('');
    setCustomerDrawerError('');
    setCustomerNoteSaving(false);
  }

  async function addCustomerNote() {
    const trimmed = customerNoteInput.trim();
    if (!trimmed || !selectedCustomerPhone) return;
    setCustomerNoteSaving(true);
    setCustomerDrawerError('');
    try {
      const { data } = await api.post(`/business/customers/${encodeURIComponent(selectedCustomerPhone)}/notes`, {
        note: trimmed,
      });
      setCustomerNotes((prev) => [data.note, ...prev]);
      setCustomerNoteInput('');
    } catch (err) {
      setCustomerDrawerError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setCustomerNoteSaving(false);
    }
  }

  return (
    <div className="ab-page max-w-[1200px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Appointments</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{total} {total === 1 ? 'appointment' : 'appointments'} found</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={exportCSV} disabled={!rows.length}>
            ⬇️ Export CSV
          </Button>
          <Button type="button" className="gap-2" onClick={openCreateAppointment}>
            ➕ Add Appointment
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={(val) => applyFilter(setView, val)}>
        <TabsList className="grid w-full grid-cols-4">
          {VIEW_TABS.map(t => (
            <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-[200px] flex-1 basis-[220px]">
          <Input
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => applyFilter(setSearch, e.target.value)}
            className="text-sm"
          />
        </div>

        <Select
          value={status ? status : FILTER_ALL}
          onValueChange={(val) => applyFilter(setStatus, val === FILTER_ALL ? '' : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={staffId ? String(staffId) : FILTER_ALL}
          onValueChange={(val) => applyFilter(setStaffId, val === FILTER_ALL ? '' : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>All staff</SelectItem>
            {staffList.map(st => (
              <SelectItem key={st.id} value={String(st.id)}>{st.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {view === 'range' && (
          <>
            <Input
              type="date"
              value={from}
              onChange={e => applyFilter(setFrom, e.target.value)}
              className="w-[160px]"
            />
            <span className="flex items-center text-sm text-muted-foreground">→</span>
            <Input
              type="date"
              value={to}
              onChange={e => applyFilter(setTo, e.target.value)}
              className="w-[160px]"
            />
          </>
        )}

        {(status || staffId || search || from || to) && (
          <Button type="button" variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => { setStatus(''); setStaffId(''); setSearch(''); setFrom(''); setTo(''); setPage(1); }}>
            Reset filters
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span className="flex-1">{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={load}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden rounded-xl border bg-background shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/40" />
            Loading appointments...
          </div>
        ) : rows.length === 0 && !error ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-3xl">📅</div>
            <div className="text-base font-semibold text-foreground">No appointments found</div>
            <div className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or switching the view.</div>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Ref</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const { date, time } = formatDateTime(r.scheduled_at, businessTz);
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">{date}</div>
                        </TableCell>
                        <TableCell className="font-semibold">{time}</TableCell>
                        <TableCell>{r.service_name || '—'}</TableCell>
                        <TableCell>{r.staff_name || '—'}</TableCell>
                        <TableCell>
                          {r.customer_phone ? (
                            <button
                              type="button"
                              onClick={() => openCustomerDrawer(r.customer_phone)}
                              className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              {r.customer_name || r.customer_phone}
                            </button>
                          ) : (
                            (r.customer_name || '—')
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.customer_phone}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[r.status] || 'secondary'} className="capitalize">
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={CONFIRMATION_VARIANT[r.confirmation_status] || 'secondary'} className="capitalize">
                              {r.confirmation_status || 'pending'}
                            </Badge>
                            {r.cancel_reason === 'auto_cancel_unconfirmed' && (
                              <div className="text-[11px] text-muted-foreground">auto-cancelled</div>
                            )}
                            {r.customer_risk_tier && r.customer_risk_tier !== 'low' && (
                              <Badge variant={r.customer_risk_tier === 'high' ? 'destructive' : 'outline'} className="text-[10px] uppercase">
                                {r.customer_risk_tier} risk
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">#{r.id}</TableCell>
                        <TableCell className="text-right">
                          {r.status === 'confirmed' ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 text-destructive hover:bg-destructive/10"
                                onClick={() => cancelAppointment(r.id)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={() => openReschedule(r)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={() => completeAppointment(r.id)}
                              >
                                Done
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>

            {pages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border px-4 py-3 sm:px-5">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                <div className="text-xs text-muted-foreground sm:text-sm">Page {page} of {pages} · {total} total</div>
                <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
              </div>
            )}
          </>
        )}
      </Card>

      <Dialog open={!!rescheduleTarget} onOpenChange={(open) => !open && closeReschedule()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Ref #{rescheduleTarget?.id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  New Date
                </label>
                <Input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  New Time
                </label>
                <Input
                  type="time"
                  step={1800}
                  value={reschedTime}
                  onChange={(e) => setReschedTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Suggested slots
              </div>
              {slotsLoading ? (
                <div className="text-sm text-muted-foreground">Loading slots…</div>
              ) : suggestedSlots.length ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedSlots.map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setReschedTime(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No open slots found for this date. You can still try manual entry.
                </div>
              )}
            </div>

            {reschedError && (
              <Alert variant="destructive">
                <AlertDescription>{reschedError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeReschedule}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitReschedule}
              disabled={reschedSubmitting || !reschedDate || !reschedTime}
            >
              {reschedSubmitting ? 'Rescheduling…' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={customerDrawerOpen} onOpenChange={(open) => !open && closeCustomerDrawer()}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Customer CRM</DialogTitle>
            <DialogDescription className="font-mono text-xs">{selectedCustomerPhone}</DialogDescription>
          </DialogHeader>

          {customerDrawerLoading ? (
            <div className="py-8 text-sm text-muted-foreground">Loading customer details...</div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {customerDrawerError && (
                  <Alert variant="destructive">
                    <AlertDescription>{customerDrawerError}</AlertDescription>
                  </Alert>
                )}

                {customerProfile && (
                  <Card>
                    <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div className="font-medium">{customerProfile.customer_name || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Last Visit</div>
                        <div className="font-medium">
                          {customerProfile.last_visit_at ? formatDateTime(customerProfile.last_visit_at, businessTz).date : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Completed Visits</div>
                        <div className="font-medium">{customerProfile.completed_visits || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Spend</div>
                        <div className="font-medium">₹{Math.round(Number(customerProfile.total_spend || 0))}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">Add Note</div>
                  <div className="flex gap-2">
                    <Input
                      value={customerNoteInput}
                      onChange={(e) => setCustomerNoteInput(e.target.value)}
                      placeholder="Example: Prefers evening slots, confirm by WhatsApp."
                    />
                    <Button type="button" onClick={addCustomerNote} disabled={customerNoteSaving || !customerNoteInput.trim()}>
                      {customerNoteSaving ? 'Saving...' : 'Add'}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Recent Notes</div>
                    <ScrollArea className="h-56 rounded-lg border">
                      <div className="p-2 space-y-2">
                        {customerNotes.length ? customerNotes.map((n) => (
                          <Card key={n.id}>
                            <CardContent className="p-3">
                              <div className="text-xs text-foreground">{n.note}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString('en-IN')}</div>
                            </CardContent>
                          </Card>
                        )) : <div className="text-xs text-muted-foreground p-2">No notes yet.</div>}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Recent Appointments</div>
                    <ScrollArea className="h-56 rounded-lg border">
                      <div className="p-2 space-y-2">
                        {customerHistory.length ? customerHistory.map((a) => {
                          const dt = formatDateTime(a.scheduled_at, businessTz);
                          return (
                            <Card key={a.id}>
                              <CardContent className="p-3">
                                <div className="font-medium text-sm">{a.service_name || 'Service'}</div>
                                <div className="text-xs text-muted-foreground">{dt.date} • {dt.time}</div>
                                <Badge variant="secondary" className="mt-1 text-[10px] uppercase">
                                  {a.status}
                                </Badge>
                              </CardContent>
                            </Card>
                          );
                        }) : <div className="text-xs text-muted-foreground p-2">No appointment history.</div>}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={(open) => !open && closeCreateAppointment()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manual Appointment Booking</DialogTitle>
            <DialogDescription>Creates a confirmed record using availability rules.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Service
                </label>
                <Select value={createServiceId} onValueChange={setCreateServiceId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesList.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.duration_minutes}m)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Staff
                </label>
                <Select value={createStaffId} onValueChange={setCreateStaffId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((st) => (
                      <SelectItem key={st.id} value={String(st.id)}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Date
                </label>
                <Input
                  type="date"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Time
                </label>
                <Input
                  type="time"
                  step={1800}
                  value={createTime}
                  onChange={(e) => setCreateTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Customer phone
              </label>
              <Input
                value={createCustomerPhone}
                onChange={(e) => setCreateCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Customer name (optional)
              </label>
              <Input
                value={createCustomerName}
                onChange={(e) => setCreateCustomerName(e.target.value)}
                placeholder="e.g. Rahul"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Notes (optional)
              </label>
              <Textarea
                className="min-h-[80px]"
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="Any special instructions..."
              />
            </div>

            {createError && (
              <Alert variant="destructive">
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            {createSuggestedSlots.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Suggested available times
                </div>
                <div className="flex flex-wrap gap-2">
                  {createSuggestedSlots.map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCreateTime(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateAppointment}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitManualAppointment}
              disabled={createSubmitting || !createServiceId || !createStaffId || !createDate || !createTime || !createCustomerPhone}
            >
              {createSubmitting ? 'Creating…' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

