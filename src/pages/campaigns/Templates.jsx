import { useEffect, useState } from 'react';
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
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export default function CampaignTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sendMode, setSendMode] = useState('text');
  const [metaTemplateName, setMetaTemplateName] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('en');
  const [contentText, setContentText] = useState('');
  const [contentMediaUrl, setContentMediaUrl] = useState('');
  const [variableCount, setVariableCount] = useState(0);
  const [variableLabels, setVariableLabels] = useState([]);

  async function loadTemplates() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/business/campaign-templates');
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
    setSendMode('text');
    setMetaTemplateName('');
    setTemplateLanguage('en');
    setContentText('');
    setContentMediaUrl('');
    setVariableCount(0);
    setVariableLabels([]);
  }

  function editTemplate(tmpl) {
    setEditingId(tmpl.id);
    setName(tmpl.name);
    setDescription(tmpl.description || '');
    setSendMode(tmpl.send_mode || 'text');
    setMetaTemplateName(tmpl.meta_template_name || '');
    setTemplateLanguage(tmpl.template_language || 'en');
    setContentText(tmpl.content_text || '');
    setContentMediaUrl(tmpl.content_media_url || '');
    setVariableCount(tmpl.variable_count || 0);
    setVariableLabels(Array.isArray(tmpl.variable_labels) ? tmpl.variable_labels : []);
  }

  async function saveTemplate(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.success('Template name is required.');
      return;
    }
    if (sendMode === 'template' && !metaTemplateName.trim()) {
      toast.success('Meta template name is required for template mode.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        sendMode,
        metaTemplateName: metaTemplateName.trim() || null,
        templateLanguage: templateLanguage.trim() || 'en',
        contentText: contentText.trim() || null,
        contentMediaUrl: contentMediaUrl.trim() || null,
        variableCount: Number(variableCount || 0),
        variableLabels: variableLabels.filter(v => v.trim()),
      };

      if (editingId) {
        await api.put(`/business/campaign-templates/${editingId}`, payload);
        toast.success('Template updated!');
      } else {
        await api.post('/business/campaign-templates', payload);
        toast.success('Template created!');
      }

      resetForm();
      await loadTemplates();
    } catch (err) {
      toast.success(err.response?.data?.error || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/business/campaign-templates/${id}`);
      toast.success('Template deleted');
      await loadTemplates();
    } catch (err) {
      toast.success(err.response?.data?.error || 'Failed to delete template');
    }
  }

  function updateVariableLabel(index, value) {
    const updated = [...variableLabels];
    updated[index] = value;
    setVariableLabels(updated);
  }

  useEffect(() => {
    const count = Number(variableCount || 0);
    setVariableLabels(prev => {
      const arr = [...prev];
      while (arr.length < count) arr.push('');
      return arr.slice(0, count);
    });
  }, [variableCount]);

  return (
    <div className="ab-page max-w-6xl space-y-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-slate-200/80 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg sm:right-6 sm:top-6">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Campaign Templates</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage reusable message templates for campaigns. Link to Meta-approved templates for template mode.
        </p>
      </div>

      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">{editingId ? 'Edit Template' : 'Create Template'}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4 sm:px-5">
          <form className="space-y-4" onSubmit={saveTemplate}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Template Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Promo 2026" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Send Type</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={sendMode}
                  onChange={(e) => setSendMode(e.target.value)}
                >
                  <option value="text">Text only</option>
                  <option value="template">Meta template</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description (optional)</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Internal note about this template" />
            </div>

            {sendMode === 'template' ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Meta Template Name</label>
                    <Input value={metaTemplateName} onChange={(e) => setMetaTemplateName(e.target.value)} placeholder="e.g. summer_promo_2026" />
                    <p className="mt-1 text-xs text-slate-500">This must match an approved template name in Meta.</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Language</label>
                    <Input value={templateLanguage} onChange={(e) => setTemplateLanguage(e.target.value)} placeholder="en" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Media URL (optional)</label>
                  <Input value={contentMediaUrl} onChange={(e) => setContentMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                  <p className="mt-1 text-xs text-slate-500">Image or video URL for header media.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Variable Count</label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={variableCount}
                      onChange={(e) => setVariableCount(parseInt(e.target.value, 10) || 0)}
                    />
                    <p className="mt-1 text-xs text-slate-500">Number of variables in Meta template body.</p>
                  </div>
                </div>

                {variableCount > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Variable Labels (for reference)</label>
                    <div className="space-y-2">
                      {variableLabels.map((label, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-16 text-xs text-slate-500">Var {idx + 1}</span>
                          <Input
                            value={label}
                            onChange={(e) => updateVariableLabel(idx, e.target.value)}
                            placeholder={`e.g. Customer Name`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Message Content</label>
                <textarea
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  rows={5}
                  maxLength={1024}
                  placeholder="Template message text..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <div className="mt-1 text-xs text-slate-500">{contentText.length}/1024</div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} size="md">
                {saving ? 'Saving…' : editingId ? 'Update Template' : 'Create Template'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} size="md">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Saved Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="text-sm text-slate-500">Loading templates…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No templates yet. Create one above.</div>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    {t.description && <div className="mt-0.5 text-xs text-slate-600">{t.description}</div>}
                    <div className="mt-1 text-xs text-slate-500">
                      {t.send_mode === 'template' ? `Meta template: ${t.meta_template_name || '—'} (${t.template_language})` : 'Text mode'}
                      {t.variable_count > 0 && ` • ${t.variable_count} variables`}
                      {t.content_media_url && ` • has media`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => editTemplate(t)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => deleteTemplate(t.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {t.content_text && (
                  <div className="mt-2 rounded bg-slate-50 px-2 py-2 text-xs text-slate-700">
                    {t.content_text}
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
