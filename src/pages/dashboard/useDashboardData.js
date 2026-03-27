import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function getHourInTimeZone(tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone: tz,
  }).formatToParts(new Date());
  const hourPart = parts.find((p) => p.type === 'hour')?.value;
  const n = Number(hourPart);
  return Number.isNaN(n) ? 12 : n;
}

export default function useDashboardData() {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [business, setBusiness] = useState(null);
  const [insights, setInsights] = useState(null);
  const [attributionWindowDays, setAttributionWindowDays] = useState(30);
  const [attributionLoading, setAttributionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .get('/business/dashboard')
      .then(({ data }) => {
        setStats(data.stats);
        setBusiness(data.business);
        setInsights(data.insights || null);
        setTodayAppointments(data.todayAppointments || []);
        const appts = data.upcomingAppointments || [];
        const now = new Date();
        setUpcoming(appts.filter((ap) => new Date(ap.scheduled_at) > now).slice(0, 5));
      })
      .catch((err) => {
        console.error('[Dashboard] Load error:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadAttributionWindow = useCallback((days) => {
    const safeDays = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
    setAttributionWindowDays(safeDays);
    setAttributionLoading(true);
    return api
      .get('/business/funnel', { params: { days: safeDays } })
      .then(({ data }) => {
        const campaignPerformance = data.campaignPerformance || data.campaignPerformance30d || [];
        const utmPerformance = data.utmPerformance || data.utmPerformance30d || [];
        const leads = Number(data.leads ?? data.leads30d ?? 0);
        const convertedLeads = Number(data.convertedLeads ?? data.convertedLeads30d ?? 0);
        const droppedLeads = Number(data.droppedLeads ?? data.droppedLeads30d ?? 0);
        const leadConversionRate = Number(data.leadConversionRate ?? data.leadConversionRate30d ?? 0);
        setInsights((prev) => ({
          ...(prev || {}),
          leads,
          convertedLeads,
          droppedLeads,
          leadConversionRate,
          // Keep aliases for existing UI usages.
          leads30d: leads,
          convertedLeads30d: convertedLeads,
          droppedLeads30d: droppedLeads,
          leadConversionRate30d: leadConversionRate,
          leadsBySource30d: data.leadsBySource30d || [],
          campaignPerformance,
          utmPerformance,
          leadCampaignPerformance30d: campaignPerformance,
          leadUtmPerformance30d: utmPerformance,
        }));
      })
      .catch((err) => {
        console.error('[Dashboard] Attribution window load error:', err);
      })
      .finally(() => setAttributionLoading(false));
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV && stats) {
      const listCount = todayAppointments.filter((a) => a.status !== 'cancelled').length;
      if (stats.today !== listCount) {
        console.warn('[Dashboard] Today count mismatch', {
          statsToday: stats.today,
          todayListCount: listCount,
          timezone: business?.timezone || 'Asia/Kolkata',
        });
      }
    }
  }, [stats, todayAppointments, business?.timezone]);

  const tz = business?.timezone || 'Asia/Kolkata';
  const backendBase = import.meta.env.VITE_API_URL || window.location.origin;
  const chatUrl = business?.slug ? `${backendBase}/chat/${business.slug}` : '';
  const isNewBusiness = (stats?.total ?? 0) === 0;

  const todayStr = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }),
    [tz],
  );

  const greeting = useMemo(() => {
    const h = getHourInTimeZone(tz);
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, [tz]);

  return {
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
  };
}
