import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { Toast } from '../../components/shared/Toast';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

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
      showToast(err.response?.data?.error || 'Failed to add staff');
    }
  }

  async function saveStaffMember(member) {
    try {
      await api.put(`/business/staff/${member.id}`, member);
      showToast('Staff saved!');
    } catch {
      showToast('Failed to save staff');
    }
  }

  async function deleteStaff(id) {
    if (!confirm('Remove this staff member?')) return;
    await api.delete(`/business/staff/${id}`);
    setStaff((st) => st.filter((s) => s.id !== id));
    showToast('Staff removed');
  }

  return (
    <div className="ab-page max-w-5xl space-y-4">
      <Toast message={toast} visible={!!toast} />

      <PageHeader
        title="Staff"
        description="Manage your team members and their roles."
        actions={
          <Button type="button" onClick={addStaff} size="md">
            + Add Staff
          </Button>
        }
      />

      <Card className="border border-slate-200/80 shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-5">
          <CardTitle className="text-base">Your Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
          {loading ? (
            <div className="text-sm text-slate-500">Loading staff…</div>
          ) : staff.filter((m) => m.active).length > 0 ? (
            staff
              .filter((m) => m.active)
              .map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-3"
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
              description="Add one above to get started."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
