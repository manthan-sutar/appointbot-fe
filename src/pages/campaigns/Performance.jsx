import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { toast } from 'sonner';

export default function CampaignPerformance() {
  const [summary, setSummary] = useState(null);
  const [suppressedContacts, setSuppressedContacts] = useState([]);
  const [suppressedSearch, setSuppressedSearch] = useState('');
  const [suppressedLoading, setSuppressedLoading] = useState(false);
  const [suppressedUpdatingPhone, setSuppressedUpdatingPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSummary() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/business/campaigns/summary');
      setSummary(data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load campaign summary');
    } finally {
      setLoading(false);
    }
  }

  async function loadSuppressedContacts(search = suppressedSearch) {
    setSuppressedLoading(true);
    try {
      const { data } = await api.get('/business/messaging-preferences', {
        params: { optedOut: true, search, limit: 100 },
      });
      setSuppressedContacts(data.contacts || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load suppressed contacts');
    } finally {
      setSuppressedLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
    loadSuppressedContacts('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function optInContact(phone) {
    setSuppressedUpdatingPhone(phone);
    try {
      await api.put(`/business/messaging-preferences/${encodeURIComponent(phone)}`, { optOut: false });
      toast.error('Contact opted in for campaigns.');
      await loadSuppressedContacts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update preference');
    } finally {
      setSuppressedUpdatingPhone('');
    }
  }

  return (
    <div className="ab-page max-w-6xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Campaign Performance</h1>
          <p className="mt-1 text-sm text-slate-600">
            Delivery metrics, retry health, and suppression management.
          </p>
        </div>
        <Button asChild variant="outline" size="md">
          <Link to="/dashboard/campaigns/history">View History</Link>
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Campaign Metrics (30d)</CardTitle>
        </CardHeader>
        <CardContent className="grid w-full grid-cols-2 gap-3 px-4 pb-4 pt-4 text-sm sm:grid-cols-7 sm:px-5">
          {loading ? (
            <div className="col-span-7 text-sm text-slate-500">Loading metrics…</div>
          ) : error ? (
            <div className="col-span-7 text-sm text-red-600">{error}</div>
          ) : (
            <>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Campaigns</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{summary?.campaigns30d || 0}</div>
              </div>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Recipients</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{summary?.recipients30d || 0}</div>
              </div>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Sent</div>
                <div className="mt-1 text-xl font-bold text-emerald-700">{summary?.sent30d || 0}</div>
              </div>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Failed</div>
                <div className="mt-1 text-xl font-bold text-red-700">{summary?.failed30d || 0}</div>
              </div>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Delivery Rate</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{Number(summary?.deliveryRate30d || 0).toFixed(1)}%</div>
              </div>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Retry Pending</div>
                <div className="mt-1 text-xl font-bold text-blue-700">{summary?.retryPending30d || 0}</div>
              </div>
              <div className="flex min-w-0 flex-col rounded-lg border bg-card p-3">
                <div className="text-xs text-slate-500">Retry Exhausted</div>
                <div className="mt-1 text-xl font-bold text-amber-700">{summary?.retryExhausted30d || 0}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Suppressed Contacts (Opted-out)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
          <div className="flex gap-2">
            <Input
              value={suppressedSearch}
              onChange={(e) => setSuppressedSearch(e.target.value)}
              placeholder="Search phone…"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => loadSuppressedContacts(suppressedSearch)}
              disabled={suppressedLoading}
            >
              {suppressedLoading ? 'Loading…' : 'Search'}
            </Button>
          </div>

          {!suppressedContacts.length ? (
            <div className="py-8 text-center text-sm text-slate-500">No opted-out contacts found.</div>
          ) : (
            <div className="space-y-2">
              {suppressedContacts.map((c) => (
                <div key={c.customer_phone} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5">
                  <div>
                    <div className="font-mono text-sm font-medium text-slate-900">{c.customer_phone}</div>
                    <div className="text-xs text-slate-500">
                      {c.opt_out_reason || 'user_stop_keyword'} • {new Date(c.updated_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={suppressedUpdatingPhone === c.customer_phone}
                    onClick={() => optInContact(c.customer_phone)}
                  >
                    {suppressedUpdatingPhone === c.customer_phone ? 'Updating…' : 'Opt in'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
