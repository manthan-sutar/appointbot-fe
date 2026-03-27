import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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
      toast.error(err.response?.data?.error || 'Failed to add service');
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
      toast.success('Service saved!');
    } catch {
      toast.error('Failed to save service');
    }
  }

  async function deleteService(id) {
    if (!confirm('Remove this service?')) return;
    await api.delete(`/business/services/${id}`);
    setServices((sv) => sv.filter((s) => s.id !== id));
    toast.success('Service removed');
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-0 focus:border-slate-400 focus:ring-2 focus:ring-slate-200';

  return (
    <div className="ab-page max-w-5xl space-y-4">
      <Toast message={toast} visible={!!toast} />

      <PageHeader
        title="Services"
        description="Manage the services your business offers."
        actions={
          <Button type="button" onClick={addService} size="md">
            + Add Service
          </Button>
        }
      />

      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Your Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="text-sm text-slate-500">Loading services…</div>
          ) : services.filter((sv) => sv.active).length > 0 ? (
            <div className="space-y-3">
              {services
                .filter((sv) => sv.active)
                .map((svc) => (
                  <div key={svc.id} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_120px_120px_auto] sm:items-center sm:gap-4">
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
              description="Add one above to get started."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
