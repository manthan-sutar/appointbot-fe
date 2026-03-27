import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import useDashboardData, { copyToClipboard } from './dashboard/useDashboardData';
import { DashboardHeader, QuickActions } from './dashboard/HeaderSection';
import { BookingLinkCard, NewBusinessBanner, StatsCards } from './dashboard/OverviewSection';
import { AppointmentPanels } from './dashboard/AppointmentsSection';
import { StatCard } from '../components/shared/StatCard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { owner } = useAuth();
  const [copied, setCopied] = useState(false);

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
    attributionWindowDays,
    attributionLoading,
    loadAttributionWindow,
  } = useDashboardData();

  useEffect(() => {
    loadAttributionWindow(30);
  }, [loadAttributionWindow]);

  async function copyUrl() {
    const ok = await copyToClipboard(chatUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const campaignPerformance = insights?.campaignPerformance || insights?.leadCampaignPerformance30d || [];
  const utmPerformance = insights?.utmPerformance || insights?.leadUtmPerformance30d || [];
  const leads = Number(insights?.leads ?? insights?.leads30d ?? 0);
  const leadConversionRate = Number(insights?.leadConversionRate ?? insights?.leadConversionRate30d ?? 0);
  const droppedLeads = Number(insights?.droppedLeads ?? insights?.droppedLeads30d ?? 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-20 text-sm text-slate-500">
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="ab-page max-w-[1100px] space-y-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Dashboard</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-red-300 text-red-800 hover:bg-red-100"
            onClick={() => loadDashboard()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ab-page max-w-[1100px] space-y-6">
      <DashboardHeader
        greeting={greeting}
        ownerEmail={owner?.email}
        todayStr={todayStr}
        businessName={business?.name}
        chatUrl={chatUrl}
      />

      {isNewBusiness && <NewBusinessBanner chatUrl={chatUrl} copied={copied} onCopy={copyUrl} />}

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (30d)" value={`₹${Math.round(insights?.revenue30d || 0)}`} />
        <StatCard label="No-show Rate (30d)" value={`${(insights?.noShowRate30d || 0).toFixed(1)}%`} />
        <StatCard label="Repeat Customers (90d)" value={`${(insights?.repeatCustomerRate90d || 0).toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Campaigns (30d)" value={insights?.campaignSummary30d?.campaigns || 0} />
        <StatCard label="Campaign Recipients" value={insights?.campaignSummary30d?.recipients || 0} />
        <StatCard label="Campaign Sent" value={insights?.campaignSummary30d?.sent || 0} variant="emerald" />
        <StatCard label="Campaign Delivery Rate" value={`${Number(insights?.campaignSummary30d?.deliveryRate || 0).toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lead Funnel Timeline (14d)
          </div>
          <div className="space-y-2">
            {(insights?.leadFunnelTimeline14d || []).length ? (
              insights.leadFunnelTimeline14d.map((d) => {
                const dayLabel = d.day ? new Date(d.day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : String(d.day);
                return (
                  <div key={String(d.day)} className="grid grid-cols-[80px_1fr] items-center gap-2 text-xs">
                    <span className="text-slate-500">{dayLabel}</span>
                    <div className="flex gap-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">L {d.leadsCreated}</span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">C {d.leadsConverted}</span>
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">D {d.leadsDropped}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">No funnel events yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lead Sources (30d)
          </div>
          {(insights?.leadsBySource30d || []).length ? (
            <div className="space-y-2">
              {insights.leadsBySource30d.map((s) => (
                <div key={s.source} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <span className="capitalize text-slate-700">{String(s.source).replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-slate-900">{s.leads}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No lead source data yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Campaign Performance ({attributionWindowDays}d)
            </div>
            <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => loadAttributionWindow(d)}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    attributionWindowDays === d ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {attributionLoading && <div className="mb-2 text-xs text-slate-500">Refreshing attribution…</div>}
          {campaignPerformance.length ? (
            <div className="space-y-2">
              {campaignPerformance.map((c) => (
                <div key={c.campaign} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{String(c.campaign).replace(/_/g, ' ')}</span>
                    <span className="text-xs font-semibold text-slate-600">{c.conversionRate.toFixed(1)}% CVR</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">L {c.leads}</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">C {c.converted}</span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">D {c.dropped}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No campaign attribution data yet.</div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            UTM Source Performance ({attributionWindowDays}d)
          </div>
          {utmPerformance.length ? (
            <div className="space-y-2">
              {utmPerformance.map((u) => (
                <div key={u.utmSource} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{String(u.utmSource).replace(/_/g, ' ')}</span>
                    <span className="text-xs font-semibold text-slate-600">{u.conversionRate.toFixed(1)}% CVR</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">L {u.leads}</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">C {u.converted}</span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">D {u.dropped}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No UTM source attribution data yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`Leads (${attributionWindowDays}d)`} value={Math.round(leads)} variant="blue" />
        <StatCard label={`Lead Conversion (${attributionWindowDays}d)`} value={`${leadConversionRate.toFixed(1)}%`} variant="emerald" />
        <StatCard label={`Dropped Leads (${attributionWindowDays}d)`} value={Math.round(droppedLeads)} variant="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Auto-cancel Trend (14d)
          </div>
          <div className="space-y-2">
            {(insights?.noShowTrend14d || []).length ? (
              insights.noShowTrend14d.map((d) => {
                const max = Math.max(...insights.noShowTrend14d.map((x) => x.autoCancellations || 0), 1);
                const width = Math.max(8, Math.round(((d.autoCancellations || 0) / max) * 100));
                return (
                  <div key={String(d.day)} className="flex items-center gap-2 text-xs">
                    <span className="w-20 shrink-0 text-slate-500">{String(d.day)}</span>
                    <div className="h-2 flex-1 rounded bg-slate-100">
                      <div className="h-2 rounded bg-amber-500" style={{ width: `${width}%` }} />
                    </div>
                    <span className="w-8 text-right font-semibold text-slate-700">{d.autoCancellations}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">No auto-cancellations in the last 14 days.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Top Risk Customers
          </div>
          {(insights?.topRiskCustomers || []).length ? (
            <div className="space-y-2">
              {insights.topRiskCustomers.map((c) => (
                <Link
                  key={c.phone}
                  to={`/dashboard/customers?phone=${encodeURIComponent(c.phone)}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">{c.name || c.phone}</div>
                    <div className="text-xs text-slate-500">{c.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-amber-700">{c.noShows120d} no-shows</div>
                    <div className="text-xs text-slate-500">{c.noShowRatePct.toFixed(1)}%</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No at-risk customers detected yet.</div>
          )}
        </div>
      </div>

      {!isNewBusiness && <BookingLinkCard chatUrl={chatUrl} copied={copied} onCopy={copyUrl} />}

      <QuickActions chatUrl={chatUrl} />

      <AppointmentPanels todayAppointments={todayAppointments} upcoming={upcoming} tz={tz} />
    </div>
  );
}
