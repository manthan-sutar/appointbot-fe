import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ScrollArea } from '../../components/ui/scroll-area';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { toast } from 'sonner';

function statusPillClass(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'failed') return 'bg-red-100 text-red-700';
  if (status === 'running') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-700';
}

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedFailureId, setExpandedFailureId] = useState(null);
  const [failureDataByCampaign, setFailureDataByCampaign] = useState({});
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function loadCampaigns() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/business/campaigns');
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function sendCampaign(campaignId) {
    if (!confirm('Send this campaign now?')) return;
    setSendingId(campaignId);
    try {
      const { data } = await api.post(`/business/campaigns/${campaignId}/send`);
      showToast(`Sent: ${data.sentCount}, Failed: ${data.failedCount}`);
      await loadCampaigns();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send campaign');
      await loadCampaigns();
    } finally {
      setSendingId(null);
    }
  }

  async function loadFailureDetails(campaignId) {
    try {
      const { data } = await api.get(`/business/campaigns/${campaignId}/failures`, { params: { limit: 50 } });
      setFailureDataByCampaign((prev) => ({ ...prev, [campaignId]: data }));
      setExpandedFailureId((prev) => (prev === campaignId ? null : campaignId));
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load failures');
    }
  }

  async function retryFailed(campaignId) {
    if (!confirm('Retry failed recipients for this campaign?')) return;
    setRetryingId(campaignId);
    try {
      const { data } = await api.post(`/business/campaigns/${campaignId}/retry-failed`, { max: 200 });
      showToast(`Retried ${data.retried}, recovered ${data.recovered}, still failed ${data.stillFailed}`);
      await loadCampaigns();
      await loadFailureDetails(campaignId);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to retry failed recipients');
    } finally {
      setRetryingId(null);
    }
  }

  async function exportFailuresCsv(campaignId) {
    try {
      const response = await api.get(`/business/campaigns/${campaignId}/failures.csv`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-${campaignId}-failures.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Failures CSV downloaded.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to export failures CSV');
    }
  }

  return (
    <div className="ab-page max-w-6xl space-y-4">
      <Toast message={toast} visible={!!toast} />

      <PageHeader
        title="Campaign History"
        description="View past and active campaigns with send status and retry options."
        actions={
          <Button asChild size="md">
            <Link to="/dashboard/campaigns/create">+ Create Campaign</Link>
          </Button>
        }
      />

      <Card className="border border-slate-200/80 shadow-sm">
        <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading campaigns…</div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-600">{error}</div>
          ) : campaigns.length === 0 ? (
            <EmptyState
              icon="📣"
              title="No campaigns yet"
              description="Create your first campaign to reach customers at scale."
              action={
                <Button asChild>
                  <Link to="/dashboard/campaigns/create">Create Campaign</Link>
                </Button>
              }
            />
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900">{c.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {String(c.audience_type || '').replace(/_/g, ' ')} • {new Date(c.created_at).toLocaleString('en-IN')}
                      {c.scheduled_at ? ` • scheduled ${new Date(c.scheduled_at).toLocaleString('en-IN')}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(c.status)}`}>
                      {c.status}
                    </span>
                    {!c.scheduled_at && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={sendingId === c.id || !['draft', 'failed'].includes(c.status)}
                        onClick={() => sendCampaign(c.id)}
                      >
                        {sendingId === c.id ? 'Sending…' : 'Send now'}
                      </Button>
                    )}
                    {(c.failed_count || 0) > 0 && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => loadFailureDetails(c.id)}
                        >
                          {expandedFailureId === c.id ? 'Hide failures' : 'View failures'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={retryingId === c.id}
                          onClick={() => retryFailed(c.id)}
                        >
                          {retryingId === c.id ? 'Retrying…' : 'Retry failed'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => exportFailuresCsv(c.id)}
                        >
                          Export CSV
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {c.send_mode === 'template'
                    ? `Template: ${c.template_name} (${c.template_language || 'en'})`
                    : c.message_text}
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>Recipients: <strong>{c.total_recipients || 0}</strong></span>
                  <span className="text-emerald-700">Sent: <strong>{c.sent_count || 0}</strong></span>
                  <span className="text-red-700">Failed: <strong>{c.failed_count || 0}</strong></span>
                </div>

                {expandedFailureId === c.id && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">Failure drilldown</div>
                    {(failureDataByCampaign[c.id]?.topReasons || []).length ? (
                      <div className="mb-2 flex flex-wrap gap-2 text-xs">
                        {failureDataByCampaign[c.id].topReasons.map((r, idx) => (
                          <span key={`${r.reason}-${idx}`} className="rounded bg-white px-2 py-1 text-red-700 border border-red-200">
                            {r.count}× {r.reason}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-2 text-xs text-red-700">No failure reasons found.</div>
                    )}
                    {(failureDataByCampaign[c.id]?.failedRecipients || []).length ? (
                      <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-red-100 bg-white p-2">
                        {failureDataByCampaign[c.id].failedRecipients.map((fr) => (
                          <div key={`${fr.customer_phone}-${fr.created_at}`} className="text-xs text-slate-700">
                            <span className="font-mono">{fr.customer_phone}</span> — {fr.error_message || 'unknown error'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-red-700">No failed recipients found.</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
