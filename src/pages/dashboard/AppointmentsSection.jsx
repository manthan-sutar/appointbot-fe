import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

function formatTime(isoStr, tz = 'Asia/Kolkata') {
  return new Date(isoStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz,
  });
}

function formatDate(isoStr, tz = 'Asia/Kolkata') {
  return new Date(isoStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: tz,
  });
}

const STATUS_VARIANT = {
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
  no_show: 'outline',
};

function AppointmentListCard({ title, count, emptyTitle, emptySubtitle, items, tz, showDate = false, footerLink = false }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-bold text-background">
          {count}
        </span>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{emptySubtitle}</p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40">
                <div className="w-14 shrink-0 text-center">
                  {showDate && (
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {formatDate(a.scheduled_at, tz)}
                    </div>
                  )}
                  <div className="text-sm font-semibold tabular-nums">{formatTime(a.scheduled_at, tz)}</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.service_name || 'Appointment'}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {a.customer_name || a.customer_phone}
                    {a.staff_name ? ` · ${a.staff_name}` : ''}
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[a.status] || 'outline'} className="shrink-0 capitalize text-[11px]">
                  {a.status === 'no_show' ? 'No Show' : a.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {footerLink && items.length > 0 && (
          <div className="border-t px-6 py-3">
            <Link to="/dashboard/appointments" className="text-xs font-medium text-foreground hover:underline">
              View all appointments →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AppointmentPanels({ todayAppointments, upcoming, tz }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AppointmentListCard
        title="Today"
        count={todayAppointments.length}
        emptyTitle="No appointments today"
        emptySubtitle="Share your chat link to start getting bookings."
        items={todayAppointments}
        tz={tz}
      />
      <AppointmentListCard
        title="Upcoming"
        count={upcoming.length}
        emptyTitle="No upcoming appointments"
        emptySubtitle="Future bookings will appear here."
        items={upcoming}
        tz={tz}
        showDate
        footerLink
      />
    </div>
  );
}
