import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import useDashboardData, { copyToClipboard } from './dashboard/useDashboardData';
import { DashboardHeader, QuickActions } from './dashboard/HeaderSection';
import { BookingLinkCard, NewBusinessBanner, StatsCards } from './dashboard/OverviewSection';
import { AppointmentPanels } from './dashboard/AppointmentsSection';
import { StatCard } from '../components/shared/StatCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Dashboard() {
  const { owner } = useAuth();

  const {
    stats,
    todayAppointments,
    upcoming,
    business,
    insights,
    loading,
    error,
    loadDashboard,
    tz,
    chatUrl,
    isNewBusiness,
    todayStr,
    greeting,
  } = useDashboardData();

  async function copyUrl() {
    const ok = await copyToClipboard(chatUrl);
    if (ok) toast.success('Link copied!');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="ab-page max-w-5xl space-y-6">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span className="flex-1">{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => loadDashboard()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="ab-page max-w-5xl space-y-6">
      <DashboardHeader
        greeting={greeting}
        ownerEmail={owner?.email}
        todayStr={todayStr}
        businessName={business?.name}
      />

      {/* Today & upcoming first */}
      <AppointmentPanels todayAppointments={todayAppointments} upcoming={upcoming} tz={tz} />

      {isNewBusiness && <NewBusinessBanner chatUrl={chatUrl} onCopy={copyUrl} />}

      <QuickActions />

      {!isNewBusiness && <BookingLinkCard chatUrl={chatUrl} onCopy={copyUrl} />}

      <StatsCards stats={stats} />

      {/* Business metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (30d)" value={`₹${Math.round(insights?.revenue30d || 0).toLocaleString()}`} />
        <StatCard label="No-show Rate (30d)" value={`${(insights?.noShowRate30d || 0).toFixed(1)}%`} />
        <StatCard label="Repeat Customers (90d)" value={`${(insights?.repeatCustomerRate90d || 0).toFixed(1)}%`} />
      </div>

      {/* Campaign summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Campaigns (30d)" value={insights?.campaignSummary30d?.campaigns ?? 0} />
        <StatCard label="Recipients" value={insights?.campaignSummary30d?.recipients ?? 0} />
        <StatCard label="Sent" value={insights?.campaignSummary30d?.sent ?? 0} />
        <StatCard label="Delivery Rate" value={`${Number(insights?.campaignSummary30d?.deliveryRate || 0).toFixed(1)}%`} />
      </div>

      {/* No-show trend + top risk customers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Auto-cancel Trend (14d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(insights?.noShowTrend14d || []).length ? (
              insights.noShowTrend14d.map((d) => {
                const max = Math.max(...insights.noShowTrend14d.map((x) => x.autoCancellations || 0), 1);
                const width = Math.max(4, Math.round(((d.autoCancellations || 0) / max) * 100));
                return (
                  <div key={String(d.day)} className="flex items-center gap-2 text-xs">
                    <span className="w-20 shrink-0 text-muted-foreground">{String(d.day)}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-foreground/60" style={{ width: `${width}%` }} />
                    </div>
                    <span className="w-6 text-right font-semibold tabular-nums">{d.autoCancellations}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No auto-cancellations in the last 14 days.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Top Risk Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(insights?.topRiskCustomers || []).length ? (
              insights.topRiskCustomers.map((c) => (
                <Link
                  key={c.phone}
                  to={`/dashboard/customers?phone=${encodeURIComponent(c.phone)}`}
                  className="flex items-center justify-between rounded-md border bg-card px-3 py-2 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name || c.phone}</div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-destructive">{c.noShows120d} no-shows</div>
                    <div className="text-xs text-muted-foreground">{c.noShowRatePct.toFixed(1)}%</div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No at-risk customers detected yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <Link to="/dashboard/leads" className="font-medium text-foreground underline-offset-4 hover:underline">
          Lead funnel &amp; attribution
        </Link>
        {' — '}
        view on the Lead analytics page.
      </p>
    </div>
  );
}
