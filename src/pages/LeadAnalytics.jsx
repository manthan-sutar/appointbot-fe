import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { StatCard } from '../components/shared/StatCard';
import useDashboardData from './dashboard/useDashboardData';

export default function LeadAnalytics() {
  const {
    insights,
    loading,
    error,
    loadDashboard,
    attributionWindowDays,
    attributionLoading,
    loadAttributionWindow,
  } = useDashboardData();

  useEffect(() => {
    loadAttributionWindow(30);
  }, [loadAttributionWindow]);

  const campaignPerformance =
    insights?.campaignPerformance || insights?.leadCampaignPerformance30d || [];
  const utmPerformance = insights?.utmPerformance || insights?.leadUtmPerformance30d || [];
  const leads = Number(insights?.leads ?? insights?.leads30d ?? 0);
  const leadConversionRate = Number(insights?.leadConversionRate ?? insights?.leadConversionRate30d ?? 0);
  const droppedLeads = Number(insights?.droppedLeads ?? insights?.droppedLeads30d ?? 0);

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span>Loading lead analytics…</span>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className="ab-page max-w-5xl space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          className="text-sm font-medium text-foreground underline"
          onClick={() => loadDashboard()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="ab-page max-w-5xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Funnel, sources, and campaign / UTM attribution for website chat and tracked links.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`Leads (${attributionWindowDays}d)`} value={Math.round(leads)} />
        <StatCard label={`Conversions (${attributionWindowDays}d)`} value={`${leadConversionRate.toFixed(1)}%`} />
        <StatCard label={`Dropped (${attributionWindowDays}d)`} value={Math.round(droppedLeads)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lead Funnel Timeline (14d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(insights?.leadFunnelTimeline14d || []).length ? (
              insights.leadFunnelTimeline14d.map((d) => {
                const dayLabel = d.day
                  ? new Date(d.day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                  : String(d.day);
                return (
                  <div key={String(d.day)} className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{dayLabel}</span>
                    <div className="flex flex-wrap gap-1.5">
                      <FunnelBadge color="blue" label="L" value={d.leadsCreated} />
                      <FunnelBadge color="green" label="C" value={d.leadsConverted} />
                      <FunnelBadge color="amber" label="D" value={d.leadsDropped} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No funnel events yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lead Sources (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(insights?.leadsBySource30d || []).length ? (
              insights.leadsBySource30d.map((s) => (
                <div
                  key={s.source}
                  className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
                >
                  <span className="capitalize text-foreground">{String(s.source).replace(/_/g, ' ')}</span>
                  <span className="font-semibold tabular-nums">{s.leads}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No lead source data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Campaign Performance ({attributionWindowDays}d)
              </CardTitle>
              <div className="flex gap-1 rounded-md border bg-muted p-0.5">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => loadAttributionWindow(d)}
                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                      attributionWindowDays === d
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {attributionLoading && <p className="text-xs text-muted-foreground">Refreshing…</p>}
            {campaignPerformance.length ? (
              campaignPerformance.map((c) => (
                <AttributionRow
                  key={c.campaign}
                  name={String(c.campaign).replace(/_/g, ' ')}
                  cvr={c.conversionRate}
                  leads={c.leads}
                  converted={c.converted}
                  dropped={c.dropped}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No campaign attribution data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              UTM Source Performance ({attributionWindowDays}d)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {utmPerformance.length ? (
              utmPerformance.map((u) => (
                <AttributionRow
                  key={u.utmSource}
                  name={String(u.utmSource).replace(/_/g, ' ')}
                  cvr={u.conversionRate}
                  leads={u.leads}
                  converted={u.converted}
                  dropped={u.dropped}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No UTM attribution data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FunnelBadge({ color, label, value }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${styles[color]}`}>
      {label} {value}
    </span>
  );
}

function AttributionRow({ name, cvr, leads, converted, dropped }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate font-medium capitalize">{name}</span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{cvr.toFixed(1)}% CVR</span>
      </div>
      <div className="flex gap-1.5 text-xs">
        <FunnelBadge color="blue" label="L" value={leads} />
        <FunnelBadge color="green" label="C" value={converted} />
        <FunnelBadge color="amber" label="D" value={dropped} />
      </div>
    </div>
  );
}
