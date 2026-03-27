import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

function formatDate(iso, tz = 'Asia/Kolkata') {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: tz,
  });
}

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'risk');
  const [selectedPhone, setSelectedPhone] = useState(searchParams.get('phone') || '');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [tz, setTz] = useState('Asia/Kolkata');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: b } = await api.get('/business');
      setTz(b.business?.timezone || 'Asia/Kolkata');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);
      const { data } = await api.get(`/business/customers?${params.toString()}`);
      setCustomers(data.customers || []);
    } catch (err) {
      setCustomers([]);
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  const loadCustomerDetail = useCallback(async (phone) => {
    if (!phone) return;
    setSelectedPhone(phone);
    setDetailLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get(`/business/customers/${encodeURIComponent(phone)}/profile`),
        api.get(`/business/customers/${encodeURIComponent(phone)}/history`),
      ]);
      setSelectedProfile(profileRes.data.customer || null);
      setSelectedHistory(historyRes.data.appointments || []);
      setSelectedNotes(historyRes.data.notes || []);
    } catch (err) {
      setSelectedProfile(null);
      setSelectedHistory([]);
      setSelectedNotes([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) loadCustomerDetail(phone);
  }, [searchParams, loadCustomerDetail]);

  function onSearchChange(val) {
    setSearch(val);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val.trim()) p.set('q', val.trim());
      else p.delete('q');
      return p;
    }, { replace: true });
  }

  function onSortChange(val) {
    setSort(val);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('sort', val);
      return p;
    }, { replace: true });
  }

  function openDetail(phone) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('phone', phone);
      return p;
    }, { replace: true });
  }

  async function addNote() {
    const text = noteInput.trim();
    if (!selectedPhone || !text) return;
    setNoteSaving(true);
    try {
      const { data } = await api.post(`/business/customers/${encodeURIComponent(selectedPhone)}/notes`, {
        note: text,
      });
      setSelectedNotes((prev) => [data.note, ...prev]);
      setNoteInput('');
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <div className="ab-page max-w-[1200px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Customers CRM</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track customer history, spend, risk, and notes.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
            <input
              className="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or phone..."
            />
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="risk">Sort: Risk</option>
              <option value="last_visit">Sort: Last Visit</option>
              <option value="spend">Sort: Spend</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-slate-500">Loading customers...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : (
            <div className="max-h-[65vh] overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Customer', 'Phone', 'Last Visit', 'Spend', 'Risk'].map((h) => (
                      <th key={h} className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.customer_phone} className={selectedPhone === c.customer_phone ? 'bg-blue-50/50' : ''}>
                      <td className="border-b border-slate-50 px-3 py-2 text-sm">
                        <button type="button" className="text-left text-blue-700 hover:underline" onClick={() => openDetail(c.customer_phone)}>
                          {c.customer_name || c.customer_phone}
                        </button>
                      </td>
                      <td className="border-b border-slate-50 px-3 py-2 font-mono text-xs text-slate-600">{c.customer_phone}</td>
                      <td className="border-b border-slate-50 px-3 py-2 text-sm text-slate-600">{formatDate(c.last_visit_at, tz)}</td>
                      <td className="border-b border-slate-50 px-3 py-2 text-sm text-slate-700">₹{Math.round(Number(c.total_spend || 0))}</td>
                      <td className="border-b border-slate-50 px-3 py-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase"
                          style={{
                            background: c.risk_tier === 'high' ? '#fee2e2' : c.risk_tier === 'medium' ? '#fef3c7' : '#dcfce7',
                            color: c.risk_tier === 'high' ? '#991b1b' : c.risk_tier === 'medium' ? '#92400e' : '#166534',
                          }}
                        >
                          {c.risk_tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
          {!selectedPhone ? (
            <div className="p-2 text-sm text-slate-500">Select a customer to view profile and notes.</div>
          ) : detailLoading ? (
            <div className="p-2 text-sm text-slate-500">Loading customer detail...</div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-sm font-semibold text-slate-900">{selectedProfile?.customer_name || selectedPhone}</div>
                <div className="mt-1 text-xs text-slate-500">{selectedPhone}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-slate-50 px-2 py-1">Visits: {selectedProfile?.completed_visits || 0}</div>
                  <div className="rounded bg-slate-50 px-2 py-1">Spend: ₹{Math.round(Number(selectedProfile?.total_spend || 0))}</div>
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Add Note</div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Write a quick note..."
                  />
                  <Button type="button" size="sm" onClick={addNote} disabled={noteSaving || !noteInput.trim()}>
                    {noteSaving ? 'Saving...' : 'Add'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Notes</div>
                  <div className="max-h-52 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
                    {selectedNotes.length ? selectedNotes.map((n) => (
                      <div key={n.id} className="rounded border border-slate-100 bg-slate-50 px-2 py-2 text-xs">
                        <div>{n.note}</div>
                        <div className="mt-1 text-[11px] text-slate-500">{new Date(n.created_at).toLocaleString('en-IN')}</div>
                      </div>
                    )) : <div className="text-xs text-slate-500">No notes yet.</div>}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Appointments</div>
                  <div className="max-h-52 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
                    {selectedHistory.length ? selectedHistory.map((a) => (
                      <div key={a.id} className="rounded border border-slate-100 bg-slate-50 px-2 py-2 text-xs">
                        <div className="font-medium text-slate-800">{a.service_name || 'Service'}</div>
                        <div className="text-slate-600">{formatDate(a.scheduled_at, tz)}</div>
                        <div className="mt-1 uppercase tracking-wide text-slate-500">{a.status}</div>
                      </div>
                    )) : <div className="text-xs text-slate-500">No history yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
