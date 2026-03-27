import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PageHeader } from '../../components/shared/PageHeader';
import { Toast } from '../../components/shared/Toast';

const AUDIENCE_OPTIONS = [
  { value: 'all_leads', label: 'All leads' },
  { value: 'dropped_leads', label: 'Dropped leads' },
  { value: 'converted_leads', label: 'Converted leads' },
  { value: 'recent_customers_30d', label: 'Recent customers (30d)' },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
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
      await api.post('/business/campaigns', {
        name: name.trim(),
        audienceType,
        sendMode,
        message: message.trim(),
        templateName: templateName.trim(),
        templateLanguage: templateLanguage.trim() || 'en',
        scheduledAt: scheduledAt || null,
      });
      showToast('Campaign created!');
      setTimeout(() => navigate('/dashboard/campaigns/history'), 800);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create campaign');
      setSaving(false);
    }
  }

  return (
    <div className="ab-page max-w-4xl space-y-4">
      <Toast message={toast} visible={!!toast} />

      <PageHeader
        title="Create Campaign"
        description="Build a WhatsApp campaign with targeting, scheduling, and delivery tracking."
      />

      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4 sm:px-5">
          <form className="space-y-4" onSubmit={createNewCampaign}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Festival Offer - April" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Audience</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={sendMode}
                  onChange={(e) => setSendMode(e.target.value)}
                >
                  <option value="text">Text message</option>
                  <option value="template">Meta template</option>
                </select>
              </div>
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
                  rows={5}
                  maxLength={1024}
                  placeholder="Write your promotional message..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <div className="mt-1 text-xs text-slate-500">{message.length}/1024</div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule (optional)</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              <p className="mt-1 text-xs text-slate-500">If set, campaign auto-sends at this time.</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} size="md">
                {saving ? 'Creating…' : 'Create Campaign'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/campaigns/history')} size="md">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
