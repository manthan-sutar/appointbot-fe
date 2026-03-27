import { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { Toast, useToastMessage } from '../../components/shared/Toast';

function downloadStaffTemplate() {
  const csv = 'name,role\nJane Doe,Stylist\nJohn Smith,\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'staff-import-template.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Staff() {
  const { message: toastMessage, variant: toastVariant, showToast } = useToastMessage();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/business/staff')
      .then(({ data }) => setStaff(data.staff || []))
      .finally(() => setLoading(false));
  }, []);

  async function addStaff() {
    try {
      const { data } = await api.post('/business/staff', {
        name: 'New Staff Member',
      });
      setStaff((st) => [...st, data.staff]);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add staff', { variant: 'destructive' });
    }
  }

  async function saveStaffMember(member) {
    try {
      await api.put(`/business/staff/${member.id}`, member);
      showToast('Staff saved!');
    } catch {
      showToast('Failed to save staff', { variant: 'destructive' });
    }
  }

  async function deleteStaff(id) {
    if (!confirm('Remove this staff member?')) return;
    await api.delete(`/business/staff/${id}`);
    setStaff((st) => st.filter((s) => s.id !== id));
    showToast('Staff removed');
  }

  async function importFromCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const csv = await file.text();
      const { data } = await api.post('/business/staff/import', { csv });
      const { imported, skippedEmpty, errors } = data;
      if (imported > 0) {
        let msg = `Imported ${imported} staff member${imported === 1 ? '' : 's'}.`;
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
            ? 'No valid names in CSV. Use a name column, or name and role.'
            : 'Nothing imported.',
          { variant: 'destructive' },
        );
      }
      const list = await api.get('/business/staff');
      setStaff(list.data.staff || []);
    } catch (err) {
      showToast(err.response?.data?.error || 'CSV import failed', { variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="ab-page relative max-w-5xl space-y-4">
      <Toast message={toastMessage} visible={!!toastMessage} variant={toastVariant} />

      <PageHeader
        title="Staff"
        description="Manage your team members and their roles."
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
            <Button type="button" onClick={addStaff} size="md" disabled={importing}>
              + Add Staff
            </Button>
          </>
        }
      />

      <Card className="border shadow-sm">
        <CardHeader className="space-y-1 px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Your Team</CardTitle>
          <p className="text-xs leading-relaxed text-muted-foreground">
            CSV columns: <span className="font-mono text-[11px]">name</span> (required),{' '}
            <span className="font-mono text-[11px]">role</span> (optional). You can include a header row.{' '}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-2 hover:text-foreground"
              onClick={downloadStaffTemplate}
            >
              Download template
            </button>
          </p>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading staff…</div>
          ) : staff.filter((m) => m.active).length > 0 ? (
            staff
              .filter((m) => m.active)
              .map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                >
                  <Input
                    className="min-w-0 flex-1 sm:max-w-[200px]"
                    value={member.name}
                    onChange={(e) =>
                      setStaff((st) =>
                        st.map((m) =>
                          m.id === member.id ? { ...m, name: e.target.value } : m,
                        ),
                      )
                    }
                    placeholder="Name"
                  />
                  <Input
                    className="min-w-0 flex-1 sm:max-w-[180px]"
                    value={member.role || ''}
                    onChange={(e) =>
                      setStaff((st) =>
                        st.map((m) =>
                          m.id === member.id ? { ...m, role: e.target.value } : m,
                        ),
                      )
                    }
                    placeholder="Role"
                  />
                  <Button type="button" size="sm" onClick={() => saveStaffMember(member)}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => deleteStaff(member.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))
          ) : (
            <EmptyState
              icon="👤"
              title="No staff yet"
              description="Add staff manually or import a CSV file."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
