import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: 'forever',
    color: '#6b7280',
    features: [
      '2 staff members',
      '3 services',
      '50 bookings / month',
      'WhatsApp bot',
      'AI booking assistant',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    color: '#1a1a2e',
    popular: true,
    features: [
      '10 staff members',
      '20 services',
      '500 bookings / month',
      'WhatsApp bot',
      'AI booking assistant',
      'WhatsApp reminders',
      'Priority support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    color: '#7c3aed',
    features: [
      'Unlimited staff',
      'Unlimited services',
      'Unlimited bookings',
      'WhatsApp bot',
      'AI booking assistant',
      'WhatsApp reminders',
      'Analytics dashboard',
      'Dedicated support',
    ],
  },
];

function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function Plan() {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/business/plan')
      .then(({ data }) => setCurrentPlan(data.plan))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function selectPlan(planId) {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      await api.put('/business/plan', { plan: planId });
      setCurrentPlan(planId);
      showToast(`Switched to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
    } catch {
      showToast('Failed to update plan');
    } finally {
      setUpgrading('');
    }
  }

  if (loading) return (
    <div className="ab-page flex items-center justify-center py-10 text-slate-500">Loading plan info…</div>
  );

  return (
    <div className="ab-page relative max-w-[1000px] space-y-5">
      {toast && (
        <div className="fixed right-4 top-4 z-[999] rounded-lg border border-slate-200/80 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg sm:right-6 sm:top-6">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Subscription Plan</h1>
        <p className="mt-0.5 mb-2 text-sm text-slate-500">Choose the plan that fits your business. Upgrade or downgrade anytime.</p>
        <span className="inline-block rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 sm:text-sm">
          🎭 Demo mode — no payment required.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100 p-1.5">
          <button
            type="button"
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">Save 17%</span>
          </button>
        </div>
        {billing === 'yearly' && (
          <p className="m-0 text-sm font-semibold text-emerald-600">🎉 2 months free — billed annually</p>
        )}
      </div>

      <div className="ab-plan-grid">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrading = upgrading === plan.id;
          const price = plan.monthlyPrice === 0
            ? 'Free'
            : billing === 'yearly'
              ? formatPrice(plan.yearlyPrice)
              : formatPrice(plan.monthlyPrice);
          const perLabel = plan.monthlyPrice === 0
            ? 'forever'
            : billing === 'yearly'
              ? '/ year'
              : '/ month';
          const monthlyEquiv = billing === 'yearly' && plan.monthlyPrice > 0
            ? `${formatPrice(Math.round(plan.yearlyPrice / 12))} / mo`
            : null;

          return (
            <Card
              key={plan.id}
              className={`relative flex min-w-[220px] flex-1 flex-col rounded-xl border bg-white p-6 shadow-sm ${
                isCurrent ? 'shadow-md' : 'border-slate-200/80'
              } ${plan.popular ? 'shadow-md' : ''}`}
              style={isCurrent ? { borderColor: plan.color, borderWidth: '2px' } : undefined}
            >
              {plan.popular && (
                <div className="absolute left-1/2 top-[-12px] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-800 px-3.5 py-1 text-[11px] font-bold text-white">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div
                  className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: plan.color }}
                >
                  Current Plan
                </div>
              )}

              <div className="mb-2 text-xl font-extrabold" style={{ color: plan.color }}>{plan.name}</div>

              <div className="mb-5">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-extrabold text-slate-900">{price}</span>
                  <span className="text-[13px] text-slate-500"> {perLabel}</span>
                </div>
                {monthlyEquiv && <div className="mt-0.5 text-xs text-slate-500">≈ {monthlyEquiv}</div>}
                {billing === 'yearly' && plan.monthlyPrice > 0 && (
                  <div className="mt-1 text-xs font-semibold text-green-600">
                    Save {formatPrice(plan.monthlyPrice * 12 - plan.yearlyPrice)} vs monthly
                  </div>
                )}
              </div>

              <ul className="mb-6 list-none flex-1 space-y-2 p-0">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-semibold text-emerald-600">✓</span> {f}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full transition-opacity"
                style={isCurrent ? { background: '#f0f1f5', color: '#888' } : { background: plan.color, color: '#fff' }}
                disabled={isCurrent || !!upgrading}
                onClick={() => selectPlan(plan.id)}
              >
                {isUpgrading ? 'Switching…' : isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Plan Comparison</h2>
        <div className="ab-table-wrap">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-slate-500">Feature</th>
                <th className="border-b border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-slate-500">Free</th>
                <th className="border-b border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-slate-500">Pro</th>
                <th className="border-b border-slate-100 px-4 py-2.5 text-left text-xs font-bold text-slate-500">Business</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Staff members',      '2',       '10',       'Unlimited'],
                ['Services',           '3',       '20',       'Unlimited'],
                ['Bookings / month',   '50',      '500',      'Unlimited'],
                ['WhatsApp bot',       '✓',       '✓',        '✓'],
                ['AI assistant',       '✓',       '✓',        '✓'],
                ['WhatsApp reminders', '—',       '✓',        '✓'],
                ['Analytics',          '—',       '—',        '✓'],
                ['Yearly billing',     '—',       '✓',        '✓'],
                ['Support',            'Email',   'Priority', 'Dedicated'],
              ].map(([feature, ...vals]) => (
                <tr key={feature}>
                  <td className="border-b border-slate-100 px-4 py-2.5 text-[13px] text-slate-700">{feature}</td>
                  {vals.map((v, i) => (
                    <td
                      key={i}
                      className={`border-b border-slate-100 px-4 py-2.5 text-center text-[13px] ${
                        v === '—' ? 'text-slate-300' : v === '✓' ? 'font-bold text-green-600' : 'text-slate-700'
                      }`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
