import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { cn } from '@/lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { PageHeader } from '../../components/shared/PageHeader';
import { Toast, useToastMessage } from '../../components/shared/Toast';
import { EmptyState } from '../../components/shared/EmptyState';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toTimeValue(t) {
  if (!t) return '';
  const s = String(t).trim();
  return s.length > 5 ? s.slice(0, 5) : s;
}

function hoursToStaffConfig(hours, staffId) {
  const byStaff = (hours || []).filter((h) => h.staff_id === staffId);
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const slots = byStaff
      .filter((h) => h.day_of_week === day)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    if (slots.length === 0)
      return {
        day,
        enabled: false,
        open: '09:00',
        close: '18:00',
        lunchStart: '',
        lunchEnd: '',
      };
    if (slots.length === 1)
      return {
        day,
        enabled: true,
        open: toTimeValue(slots[0].start_time),
        close: toTimeValue(slots[0].end_time),
        lunchStart: '',
        lunchEnd: '',
      };
    return {
      day,
      enabled: true,
      open: toTimeValue(slots[0].start_time),
      close: toTimeValue(slots[1].end_time),
      lunchStart: toTimeValue(slots[0].end_time),
      lunchEnd: toTimeValue(slots[1].start_time),
    };
  });
}

function staffConfigToSlots(config) {
  const slots = [];
  for (const day of config) {
    if (!day.enabled) continue;
    const hasLunch = day.lunchStart?.trim() && day.lunchEnd?.trim();
    if (hasLunch) {
      slots.push({
        day_of_week: day.day,
        start_time: day.open,
        end_time: day.lunchStart.trim(),
      });
      slots.push({
        day_of_week: day.day,
        start_time: day.lunchEnd.trim(),
        end_time: day.close,
      });
    } else {
      slots.push({
        day_of_week: day.day,
        start_time: day.open,
        end_time: day.close,
      });
    }
  }
  return slots;
}

export default function WorkingHours() {
  const { message: toastMessage, variant: toastVariant, showToast } = useToastMessage();
  const [staff, setStaff] = useState([]);
  const [hours, setHours] = useState([]);
  const [staffHoursConfig, setStaffHoursConfig] = useState({});
  const [applyAllValues, setApplyAllValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/business/staff'), api.get('/business/hours')])
      .then(([st, h]) => {
        setStaff(st.data.staff || []);
        setHours(h.data.hours || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const next = {};
    staff.forEach((m) => {
      next[m.id] = hoursToStaffConfig(hours, m.id);
    });
    setStaffHoursConfig(next);
  }, [hours, staff]);

  function updateStaffDay(staffId, dayIndex, field, value) {
    setStaffHoursConfig((prev) => {
      const config = prev[staffId] ? [...prev[staffId]] : hoursToStaffConfig(hours, staffId);
      if (!config[dayIndex]) return prev;
      config[dayIndex] = { ...config[dayIndex], [field]: value };
      return { ...prev, [staffId]: config };
    });
  }

  function toggleStaffDay(staffId, dayIndex) {
    setStaffHoursConfig((prev) => {
      const config = prev[staffId] ? [...prev[staffId]] : hoursToStaffConfig(hours, staffId);
      if (!config[dayIndex]) return prev;
      config[dayIndex] = { ...config[dayIndex], enabled: !config[dayIndex].enabled };
      return { ...prev, [staffId]: config };
    });
  }

  function applyAllDaysToStaff(staffId, open, close, lunchStart, lunchEnd) {
    setStaffHoursConfig((prev) => {
      const config = prev[staffId] ? [...prev[staffId]] : hoursToStaffConfig(hours, staffId);
      const next = config.map((d) => ({
        ...d,
        open: open || d.open,
        close: close || d.close,
        lunchStart: lunchStart ?? d.lunchStart,
        lunchEnd: lunchEnd ?? d.lunchEnd,
      }));
      return { ...prev, [staffId]: next };
    });
  }

  async function saveHours(staffId) {
    const config = staffHoursConfig[staffId];
    if (!config) return;
    setSaving(true);
    try {
      const slots = staffConfigToSlots(config);
      await api.post('/business/hours', { staffId, hours: slots });
      const { data } = await api.get('/business/hours');
      setHours(data.hours);
      showToast('Hours saved!');
    } catch {
      showToast('Failed to save hours', { variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  const activeStaff = staff.filter((m) => m.active);

  if (loading) {
    return (
      <div className="ab-page flex items-center justify-center py-20 text-sm text-muted-foreground">
        Loading working hours…
      </div>
    );
  }

  return (
    <div className="ab-page relative max-w-4xl space-y-4">
      <Toast message={toastMessage} visible={!!toastMessage} variant={toastVariant} />

      <PageHeader
        title="Working hours"
        description="Set open/close and optional lunch break per day for each staff member. Appointments cannot be booked during lunch."
      />

      {activeStaff.length === 0 ? (
        <EmptyState
          title="No staff yet"
          description="Add team members under Operate → Staff, then set their schedules here."
        />
      ) : (
        <div className="space-y-6">
          {activeStaff.map((member) => {
            const config = staffHoursConfig[member.id] ?? hoursToStaffConfig(hours, member.id);
            const applyAll = applyAllValues[member.id] ?? {
              open: '09:00',
              close: '18:00',
              lunchStart: '',
              lunchEnd: '',
            };
            return (
              <Card key={member.id} className="border shadow-sm">
                <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <CardTitle className="text-base">
                    {member.name}
                    {member.role ? ` — ${member.role}` : ''}
                  </CardTitle>
                  <Button type="button" size="sm" disabled={saving} onClick={() => saveHours(member.id)}>
                    Save
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 pt-4 text-sm sm:px-5">
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-muted/50 px-3 py-3">
                    <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                      Apply to all days:
                    </span>
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      value={applyAll.open}
                      onChange={(e) =>
                        setApplyAllValues((prev) => ({
                          ...prev,
                          [member.id]: { ...(prev[member.id] || applyAll), open: e.target.value },
                        }))
                      }
                    />
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      value={applyAll.close}
                      onChange={(e) =>
                        setApplyAllValues((prev) => ({
                          ...prev,
                          [member.id]: { ...(prev[member.id] || applyAll), close: e.target.value },
                        }))
                      }
                    />
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      placeholder="Lunch from"
                      value={applyAll.lunchStart}
                      onChange={(e) =>
                        setApplyAllValues((prev) => ({
                          ...prev,
                          [member.id]: { ...(prev[member.id] || applyAll), lunchStart: e.target.value },
                        }))
                      }
                    />
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      placeholder="Lunch to"
                      value={applyAll.lunchEnd}
                      onChange={(e) =>
                        setApplyAllValues((prev) => ({
                          ...prev,
                          [member.id]: { ...(prev[member.id] || applyAll), lunchEnd: e.target.value },
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() =>
                        applyAllDaysToStaff(
                          member.id,
                          applyAll.open,
                          applyAll.close,
                          applyAll.lunchStart,
                          applyAll.lunchEnd
                        )
                      }
                    >
                      Apply to all days
                    </Button>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-[minmax(3rem,1fr)_1fr_1fr_1fr_1fr] gap-2 border-b border bg-muted/80 px-3 py-2 text-xs font-medium text-muted-foreground">
                      <span>Day</span>
                      <span>Open</span>
                      <span>Close</span>
                      <span>Lunch start</span>
                      <span>Lunch end</span>
                    </div>
                    {config.map((day) => (
                      <div
                        key={day.day}
                        className={cn(
                          'grid grid-cols-[minmax(3rem,1fr)_1fr_1fr_1fr_1fr] items-center gap-2 border-b border px-3 py-2 last:border-b-0',
                          !day.enabled && 'bg-muted/50 opacity-90'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={cn(
                              'rounded border px-2 py-1 text-xs font-medium transition-colors',
                              day.enabled
                                ? 'border-foreground bg-foreground text-background'
                                : 'border bg-card text-muted-foreground'
                            )}
                            onClick={() => toggleStaffDay(member.id, day.day)}
                          >
                            {day.enabled ? 'Open' : 'Closed'}
                          </button>
                          <span className="w-8 text-xs font-medium text-foreground">{DAYS[day.day]}</span>
                        </div>
                        <Input
                          type="time"
                          className="h-8 w-full max-w-[6rem] text-xs"
                          value={day.open}
                          onChange={(e) => updateStaffDay(member.id, day.day, 'open', e.target.value)}
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          className="h-8 w-full max-w-[6rem] text-xs"
                          value={day.close}
                          onChange={(e) => updateStaffDay(member.id, day.day, 'close', e.target.value)}
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          className="h-8 w-full max-w-[6rem] text-xs"
                          placeholder="—"
                          value={day.lunchStart}
                          onChange={(e) => updateStaffDay(member.id, day.day, 'lunchStart', e.target.value)}
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          className="h-8 w-full max-w-[6rem] text-xs"
                          placeholder="—"
                          value={day.lunchEnd}
                          onChange={(e) => updateStaffDay(member.id, day.day, 'lunchEnd', e.target.value)}
                          disabled={!day.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
