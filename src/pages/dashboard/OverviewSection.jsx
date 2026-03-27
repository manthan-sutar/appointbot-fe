import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function NewBusinessBanner({ chatUrl, onCopy }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">🎉 Your bot is live!</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share your booking link to get your first appointment. Customers can book 24/7.
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-3 py-1.5 font-mono text-xs text-foreground">
            {chatUrl}
          </code>
          <Button type="button" size="sm" onClick={onCopy} className="shrink-0">
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats }) {
  const items = [
    { label: "Today's Bookings", value: stats?.today ?? 0, icon: '📅' },
    {
      label: 'This Month',
      value: stats?.thisMonth ?? 0,
      sub: stats?.limits?.bookingsPerMonth != null && stats.limits.bookingsPerMonth !== Infinity
        ? `/ ${stats.limits.bookingsPerMonth}`
        : null,
      icon: '📆',
    },
    { label: 'Total Bookings', value: stats?.total ?? 0, icon: '📊' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </CardTitle>
            <span className="text-lg">{item.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{item.value}</span>
              {item.sub && <span className="text-sm text-muted-foreground">{item.sub}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function BookingLinkCard({ chatUrl, onCopy }) {
  if (!chatUrl) return null;
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Booking Link</p>
            <p className="text-xs text-muted-foreground">Share with your customers</p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end">
            <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-3 py-1.5 font-mono text-xs text-foreground sm:max-w-xs">
              {chatUrl}
            </code>
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onCopy}>
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
