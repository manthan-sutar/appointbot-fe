import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export function DashboardHeader({ greeting, ownerEmail, todayStr, businessName }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {greeting}, {ownerEmail?.split('@')[0] || 'there'}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {todayStr} &middot; {businessName || 'Dashboard'}
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/dashboard/appointments">View All Appointments</Link>
      </Button>
    </div>
  );
}

const QUICK_LINKS = [
  { to: '/dashboard/appointments', icon: '📅', label: 'Appointments' },
  { to: '/dashboard/operate/services', icon: '📋', label: 'Services' },
  { to: '/dashboard/operate/staff', icon: '👤', label: 'Staff' },
  { to: '/dashboard/customers', icon: '🧾', label: 'Customers' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_LINKS.map(({ to, icon, label }) => (
        <Link key={to} to={to} className="group">
          <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-accent sm:p-5">
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {label}
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
