import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const AUDIENCE_OPTIONS = [
  { value: 'all_leads', label: 'All leads' },
  { value: 'dropped_leads', label: 'Dropped leads' },
  { value: 'converted_leads', label: 'Converted leads' },
  { value: 'recent_customers_30d', label: 'Recent customers (30d)' },
];

function statusPillClass(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'failed') return 'bg-red-100 text-red-700';
  if (status === 'running') return 'bg-blue-100 text-blue-700';
  return 'bg-muted text-muted-foreground';
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suppressedContacts, setSuppressedContacts] = useState([]);
  const [suppressedSearch, setSuppressedSearch] = useState('');
  const [suppressedLoading, setSuppressedLoading] = useState(false);
  const [suppressedUpdatingPhone, setSuppressedUpdatingPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedFailureId, setExpandedFailureId] = useState(null);
  const [failureDataByCampaign, setFailureDataByCampaign] = useState({});
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [name, setName] = useState('');
  const [audienceType, setAudienceType] = useState('all_leads');
  const [sendMode, setSendMode] = useState('text');
  const [templateName, setTemplateName] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('en');
  const [scheduledAt, setScheduledAt] = useState('');
  const [message, setMessage] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function loadCampaigns() {
    setLoading(true);
    setError('');
    try {
      const [campaignRes, summaryRes] = await Promise.all([
        api.get('/business/campaigns'),
        api.get('/business/campaigns/summary'),
      ]);
      setCampaigns(campaignRes.data.campaigns || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadSuppressedContacts(search = suppressedSearch) {
    setSuppressedLoading(true);
    try {
      const { data } = await api.get('/business/messaging-preferences', {
        params: { optedOut: true, search, limit: 100 },
      });
      setSuppressedContacts(data.contacts || []);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load suppressed contacts');
    } finally {
      setSuppressedLoading(false);
    }
  }

  useEffect(() => {
    loadSuppressedContacts('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createNewCampaign(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Campaign name is required.');
      return;
    }
    if (sendMode === 'text' && !message.trim()) {
      showToast('Message is required for text campaigns.');
      return;
    }
    if (sendMode === 'template' && !templateName.trim()) {
      showToast('Template name is required for template campaigns.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/business/campaigns', {
        name: name.trim(),
        audienceType,
        sendMode,
        message: message.trim(),
        templateName: templateName.trim(),
        templateLanguage: templateLanguage.trim() || 'en',
        scheduledAt: scheduledAt || null,
      });
      setCampaigns((prev) => [data.campaign, ...prev]);
      setName('');
      setMessage('');
      setAudienceType('all_leads');
      setSendMode('text');
      setTemplateName('');
      setTemplateLanguage('en');
      setScheduledAt('');
      showToast('Campaign created.');
      await loadCampaigns();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  }

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

  async function optInContact(phone) {
    setSuppressedUpdatingPhone(phone);
    try {
      await api.put(`/business/messaging-preferences/${encodeURIComponent(phone)}`, { optOut: false });
      showToast('Contact opted in for campaigns.');
      await loadSuppressedContacts();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update preference');
    } finally {
      setSuppressedUpdatingPhone('');
    }
  }

  return (
    <div className="ab-page relative max-w-[1100px] space-y-4">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg border bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg sm:right-6 sm:top-6">
          {toast}
        </div>
      ) : null}

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Campaigns</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create WhatsApp campaigns, target a lead segment, and track send outcomes.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Create Campaign</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4 sm:px-5">
          <form className="space-y-3" onSubmit={createNewCampaign}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Festival Offer - April" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Audience</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Send Type</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={sendMode}
                onChange={(e) => setSendMode(e.target.value)}
              >
                <option value="text">Text message</option>
                <option value="template">Meta template</option>
              </select>
            </div>
            {sendMode === 'template' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Template Name</label>
                  <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. promo_offer_april" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Template Language</label>
                  <Input value={templateLanguage} onChange={(e) => setTemplateLanguage(e.target.value)} placeholder="en" />
                </div>
              </div>
            ) : (
              <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={1024}
                placeholder="Write your promotional message..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="mt-1 text-xs text-slate-500">{message.length}/1024</div>
            </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule (optional)</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              <p className="mt-1 text-xs text-slate-500">If set, campaign auto-sends at this time.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create Campaign'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Campaign Performance (30d)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 pb-4 pt-4 text-sm sm:grid-cols-7 sm:px-5">
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Campaigns</div>
            <div className="text-xl font-bold text-slate-900">{summary?.campaigns30d || 0}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Recipients</div>
            <div className="text-xl font-bold text-slate-900">{summary?.recipients30d || 0}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Sent</div>
            <div className="text-xl font-bold text-emerald-700">{summary?.sent30d || 0}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Failed</div>
            <div className="text-xl font-bold text-red-700">{summary?.failed30d || 0}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Delivery Rate</div>
            <div className="text-xl font-bold text-slate-900">{Number(summary?.deliveryRate30d || 0).toFixed(1)}%</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Retry Pending</div>
            <div className="text-xl font-bold text-blue-700">{summary?.retryPending30d || 0}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Retry Exhausted</div>
            <div className="text-xl font-bold text-amber-700">{summary?.retryExhausted30d || 0}</div>
          </div>
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
            <div className="text-sm text-slate-500">No opted-out contacts found.</div>
          ) : (
            <div className="space-y-2">
              {suppressedContacts.map((c) => (
                <div key={c.customer_phone} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div>
                    <div className="font-mono text-sm text-slate-900">{c.customer_phone}</div>
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

      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Campaign History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="text-sm text-slate-500">Loading campaigns…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : campaigns.length === 0 ? (
            <div className="text-sm text-slate-500">No campaigns yet. Create your first one above.</div>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      {String(c.audience_type || '').replace(/_/g, ' ')} • {new Date(c.created_at).toLocaleString('en-IN')}
                      {c.scheduled_at ? ` • scheduled ${new Date(c.scheduled_at).toLocaleString('en-IN')}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusPillClass(c.status)}`}>
                      {c.status}
                    </span>
                    {!c.scheduled_at ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={sendingId === c.id || !['draft', 'failed'].includes(c.status)}
                        onClick={() => sendCampaign(c.id)}
                      >
                        {sendingId === c.id ? 'Sending…' : 'Send now'}
                      </Button>
                    ) : null}
                    {(c.failed_count || 0) > 0 ? (
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
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {c.send_mode === 'template'
                    ? `Template: ${c.template_name} (${c.template_language || 'en'})`
                    : c.message_text}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Recipients: {c.total_recipients || 0} • Sent: {c.sent_count || 0} • Failed: {c.failed_count || 0}
                </div>
                {expandedFailureId === c.id ? (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">Failure drilldown</div>
                    {(failureDataByCampaign[c.id]?.topReasons || []).length ? (
                      <div className="mb-2 flex flex-wrap gap-2 text-xs">
                        {failureDataByCampaign[c.id].topReasons.map((r, idx) => (
                          <span key={`${r.reason}-${idx}`} className="rounded border border-red-200 bg-background px-2 py-1 text-red-700">
                            {r.count}× {r.reason}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-2 text-xs text-red-700">No failure reasons found.</div>
                    )}
                    {(failureDataByCampaign[c.id]?.failedRecipients || []).length ? (
                      <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-red-100 bg-background p-2">
                        {failureDataByCampaign[c.id].failedRecipients.map((fr) => (
                            <div key={`${fr.customer_phone}-${fr.created_at}`} className="text-xs text-foreground">
                            <span className="font-mono">{fr.customer_phone}</span> — {fr.error_message || 'unknown error'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-red-700">No failed recipients found.</div>
                    )}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
