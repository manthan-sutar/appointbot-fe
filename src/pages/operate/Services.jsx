import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { Toast, useToastMessage } from '../../components/shared/Toast';

function downloadServicesTemplate() {
  const csv = 'name,duration_minutes,price\nHaircut,60,500\nConsultation,30,200\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'services-import-template.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Services() {
  const { message: toastMessage, variant: toastVariant, showToast } = useToastMessage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/business/services')
      .then(({ data }) => setServices(data.services || []))
      .finally(() => setLoading(false));
  }, []);

  async function addService() {
    try {
      const { data } = await api.post('/business/services', {
        name: 'New Service',
        duration_minutes: 30,
      });
      setServices((sv) => [...sv, data.service]);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add service', { variant: 'destructive' });
    }
  }

  function updateService(id, field, value) {
    setServices((sv) =>
      sv.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function saveService(svc) {
    try {
      await api.put(`/business/services/${svc.id}`, svc);
      showToast('Service saved!');
    } catch {
      showToast('Failed to save service', { variant: 'destructive' });
    }
  }

  async function deleteService(id) {
    if (!confirm('Remove this service?')) return;
    await api.delete(`/business/services/${id}`);
    setServices((sv) => sv.filter((s) => s.id !== id));
    showToast('Service removed');
  }

  async function importFromCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const csv = await file.text();
      const { data } = await api.post('/business/services/import', { csv });
      const { imported, skippedEmpty, errors } = data;
      if (imported > 0) {
        let msg = `Imported ${imported} service${imported === 1 ? '' : 's'}.`;
        if (skippedEmpty) msg += ` ${skippedEmpty} empty row(s) skipped.`;
        if (errors?.length) {
          msg += ` ${errors.length} row(s) not imported (e.g. plan limit).`;
        }
        showToast(msg);
      } else if (errors?.length) {
        showToast(errors[0].message || 'Import failed', { variant: 'destructive' });
      } else {
        showToast(
          skippedEmpty
            ? 'No valid service names in CSV. Use name, duration, and price columns.'
            : 'Nothing imported.',
          { variant: 'destructive' },
        );
      }
      const list = await api.get('/business/services');
      setServices(list.data.services || []);
    } catch (err) {
      showToast(err.response?.data?.error || 'CSV import failed', { variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="ab-page relative max-w-5xl space-y-4">
      <Toast message={toastMessage} visible={!!toastMessage} variant={toastVariant} />

      <PageHeader
        title="Services"
        description="Manage the services your business offers."
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={importFromCsv}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? 'Importing…' : 'Import CSV'}
            </Button>
            <Button type="button" onClick={addService} size="md" disabled={importing}>
              + Add Service
            </Button>
          </>
        }
      />

      <Card className="border shadow-sm">
        <CardHeader className="space-y-1 px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Your Services</CardTitle>
          <p className="text-xs leading-relaxed text-muted-foreground">
            CSV columns: <span className="font-mono text-[11px]">name</span> (required),{' '}
            <span className="font-mono text-[11px]">duration</span> or{' '}
            <span className="font-mono text-[11px]">duration_minutes</span> (optional, default 30),{' '}
            <span className="font-mono text-[11px]">price</span> (optional). Header row optional.{' '}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-2 hover:text-foreground"
              onClick={downloadServicesTemplate}
            >
              Download template
            </button>
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading services…</div>
          ) : services.filter((sv) => sv.active).length > 0 ? (
            <div className="space-y-3">
              {services
                .filter((sv) => sv.active)
                .map((svc) => (
                  <div key={svc.id} className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_120px_120px_auto] sm:items-center sm:gap-4">
                    <Input
                      className="min-w-0"
                      value={svc.name}
                      onChange={(e) => updateService(svc.id, 'name', e.target.value)}
                      placeholder="e.g. Haircut, Consultation"
                    />
                    <Input
                      type="number"
                      min={5}
                      max={480}
                      value={svc.duration_minutes}
                      onChange={(e) =>
                        updateService(
                          svc.id,
                          'duration_minutes',
                          parseInt(e.target.value, 10) || 30,
                        )
                      }
                      placeholder="30"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={svc.price || ''}
                      onChange={(e) => updateService(svc.id, 'price', e.target.value)}
                      placeholder="₹"
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => saveService(svc)}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => deleteService(svc.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon="📋"
              title="No services yet"
              description="Add a service manually or import a CSV file."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
