import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageHeader } from '../../components/shared/PageHeader';
import { Toast, useToastMessage } from '../../components/shared/Toast';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

const AUDIENCE_OPTIONS = [
  { value: 'all_leads', label: 'All leads' },
  { value: 'dropped_leads', label: 'Dropped leads' },
  { value: 'converted_leads', label: 'Converted leads' },
  { value: 'recent_customers_30d', label: 'Recent customers (30d)' },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { message: toastMessage, variant: toastVariant, showToast } = useToastMessage();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [audienceType, setAudienceType] = useState('all_leads');
  const [sendMode, setSendMode] = useState('template');
  const [templateName, setTemplateName] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('en');
  const [scheduledAt, setScheduledAt] = useState('');
  const [message, setMessage] = useState('');

  async function createNewCampaign(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Campaign name is required.', { variant: 'destructive' });
      return;
    }
    if (sendMode === 'text' && !message.trim()) {
      showToast('Message is required for text campaigns.', { variant: 'destructive' });
      return;
    }
    if (sendMode === 'template' && !templateName.trim()) {
      showToast('Template name is required for template campaigns.', { variant: 'destructive' });
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
      showToast(err.response?.data?.error || 'Failed to create campaign', { variant: 'destructive' });
      setSaving(false);
    }
  }

  return (
    <div className="ab-page relative max-w-4xl space-y-4">
      <Toast message={toastMessage} visible={!!toastMessage} variant={toastVariant} />

      <PageHeader
        title="Create Campaign"
        description="Build a WhatsApp campaign with targeting, scheduling, and delivery tracking."
      />

      <Alert>
        <AlertTitle className="text-sm">Meta WhatsApp requirements</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground sm:text-sm">
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>
              <strong className="text-foreground">Bulk / cold outreach:</strong> use{' '}
              <strong className="text-foreground">Meta template</strong> with an approved template from Meta Business
              Manager (Marketing or Utility). Freeform text only works inside the 24-hour chat window.
            </li>
            <li>
              <strong className="text-foreground">Error 131030 (number not in allowed list):</strong> in{' '}
              <em>Development</em>, add each test number under Meta Developer → your app → WhatsApp → API Setup. For
              real customers at scale, complete Business Verification, publish the app (Live), and use templates.
            </li>
          </ul>
          <p className="mt-2">
            Full checklist: <code className="rounded bg-muted px-1">appointbot-be/docs/WHATSAPP_CAMPAIGNS.md</code> ·{' '}
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Meta error codes
            </a>
          </p>
        </AlertDescription>
      </Alert>

      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4 sm:px-5">
          <form className="space-y-4" onSubmit={createNewCampaign}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Festival Offer - April" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audience</label>
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Send Type</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Template Name</label>
                  <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. promo_offer_april" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Template Language</label>
                  <Input value={templateLanguage} onChange={(e) => setTemplateLanguage(e.target.value)} placeholder="en" />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={1024}
                  placeholder="Write your promotional message..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="mt-1 text-xs text-muted-foreground">{message.length}/1024</div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule (optional)</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">If set, campaign auto-sends at this time.</p>
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
