import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: 'Perfect for trying it out or very small businesses.',
    cta: 'Start for Free',
    highlight: false,
    features: {
      'Bookings / month': '50',
      'Staff members': '1',
      'Services': '3',
      'WhatsApp chat UI': true,
      'AI booking assistant': true,
      'Booking confirmations': true,
      'Reschedule & cancel': true,
      'Customer memory': false,
      'WhatsApp reminders': false,
      'Dedicated WhatsApp number': false,
      'Analytics dashboard': false,
      'Priority support': false,
    },
  },
  {
    name: 'Pro',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    desc: 'For growing businesses that need more capacity.',
    cta: 'Start Pro Trial',
    highlight: true,
    features: {
      'Bookings / month': '500',
      'Staff members': '5',
      'Services': 'Unlimited',
      'WhatsApp chat UI': true,
      'AI booking assistant': true,
      'Booking confirmations': true,
      'Reschedule & cancel': true,
      'Customer memory': true,
      'WhatsApp reminders': true,
      'Dedicated WhatsApp number': false,
      'Analytics dashboard': true,
      'Priority support': true,
    },
  },
  {
    name: 'Business',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    desc: 'For high-volume businesses with dedicated numbers.',
    cta: 'Contact Us',
    highlight: false,
    features: {
      'Bookings / month': 'Unlimited',
      'Staff members': 'Unlimited',
      'Services': 'Unlimited',
      'WhatsApp chat UI': true,
      'AI booking assistant': true,
      'Booking confirmations': true,
      'Reschedule & cancel': true,
      'Customer memory': true,
      'WhatsApp reminders': true,
      'Dedicated WhatsApp number': true,
      'Analytics dashboard': true,
      'Priority support': true,
    },
  },
];

const FEATURE_ROWS = [
  'Bookings / month',
  'Staff members',
  'Services',
  'WhatsApp chat UI',
  'AI booking assistant',
  'Booking confirmations',
  'Reschedule & cancel',
  'Customer memory',
  'WhatsApp reminders',
  'Dedicated WhatsApp number',
  'Analytics dashboard',
  'Priority support',
];

const FAQ = [
  { q: 'Is there really a free plan?', a: 'Yes! The free plan gives you 50 bookings per month, 1 staff member, and 3 services — no credit card required. You can use it forever.' },
  { q: 'How does the WhatsApp integration work?', a: 'On the free and pro plans, you share a chat link with your customers. They click it, open WhatsApp, and start chatting with your AI bot. On the Business plan, you get a dedicated WhatsApp number — customers can message you directly.' },
  { q: 'Are there any additional WhatsApp fees from Meta?', a: 'Yes, Meta charges a small per-message fee for appointment reminders sent to customers outside the chat window (called "utility" messages). Booking conversations that customers start are completely free. For India, reminders cost approximately ₹0.40 per message — a business sending 200 reminders/month pays around ₹80/month, billed directly by Meta to your WhatsApp Business account. This is separate from your AppointBot subscription.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. You can change your plan at any time from your dashboard. Upgrades take effect immediately, downgrades at the end of your billing period.' },
  { q: 'What happens if I exceed my booking limit?', a: 'We\'ll notify you when you\'re approaching your limit. You can upgrade your plan to continue accepting bookings. Existing bookings are never affected.' },
  { q: 'Do my customers need to install anything?', a: 'No. Customers just need WhatsApp, which they already have. They click your link and start chatting — no app downloads, no account creation.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit and at rest. We never share your customer data with third parties.' },
];

function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function Check({ val }) {
  if (val === true) return <span className="font-semibold text-emerald-600">✓</span>;
  if (val === false) return <span className="text-slate-300">—</span>;
  return <span className="text-sm font-medium text-slate-700">{val}</span>;
}

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      <Navbar />

      <section className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Pricing</div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-400">Start free. No credit card required. Upgrade when you need more.</p>
        </div>
      </section>

      <section className="flex flex-col items-center gap-2 bg-slate-50 px-6 pb-2">
        <div className="flex gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100 p-1.5">
          <button type="button" className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setBilling('monthly')}>Monthly</button>
          <button type="button" className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setBilling('yearly')}>
            Yearly <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">Save 17%</span>
          </button>
        </div>
        {billing === 'yearly' && <p className="m-0 text-sm font-semibold text-emerald-600">🎉 2 months free — billed as one annual payment</p>}
      </section>

      <section className="bg-slate-50 px-6 py-8 md:py-16">
        <div className="mx-auto flex max-w-[1000px] flex-wrap gap-6">
          {PLANS.map((plan, i) => {
            const price = plan.monthlyPrice === 0 ? 'Free' : billing === 'yearly' ? formatPrice(plan.yearlyPrice) : formatPrice(plan.monthlyPrice);
            const perLabel = plan.monthlyPrice === 0 ? '' : billing === 'yearly' ? '/yr' : '/mo';
            const monthlyEquiv = billing === 'yearly' && plan.monthlyPrice > 0 ? `${formatPrice(Math.round(plan.yearlyPrice / 12))}/mo` : null;
            const saving = billing === 'yearly' && plan.monthlyPrice > 0 ? plan.monthlyPrice * 12 - plan.yearlyPrice : null;
            return (
              <Card key={i} className={`relative flex min-w-[260px] flex-1 flex-col rounded-2xl border p-7 shadow-sm ${plan.highlight ? 'border-indigo-500 shadow-md shadow-indigo-500/15' : 'border-slate-200/80 bg-white'}`}>
                {plan.highlight && <div className="absolute left-1/2 top-[-12px] -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most Popular</div>}
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.name}</div>
                <div className="mb-2">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-4xl font-extrabold text-slate-900">{price}</span>
                    {perLabel && <span className="ml-0.5 text-base text-slate-500">{perLabel}</span>}
                  </div>
                  {monthlyEquiv && <div className="mt-0.5 text-xs text-slate-500">≈ {monthlyEquiv}</div>}
                  {saving && <div className="mt-1 text-xs font-semibold text-green-600">Save {formatPrice(saving)} vs monthly</div>}
                </div>
                <p className="mb-5 text-[13px] leading-relaxed text-slate-600">{plan.desc}</p>
                <Button asChild className={plan.highlight ? 'mb-6 rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700' : 'mb-6 rounded-lg bg-slate-100 py-2.5 font-semibold text-slate-900 hover:bg-slate-200'}>
                  <Link to="/dashboard/signup" className="block w-full text-center">{plan.cta}</Link>
                </Button>
                <ul className="flex flex-col gap-2.5 p-0 [list-style:none]">
                  {Object.entries(plan.features).map(([k, v]) => (
                    <li key={k} className="flex items-center gap-2 text-[13px] text-slate-700">
                      <Check val={v} />
                      <span>{k === 'Bookings / month' ? `${v} bookings/mo` : k === 'Staff members' ? `${v} staff` : k === 'Services' ? `${v} services` : k}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Meta / WhatsApp fee disclosure ── */}
      <section className="bg-slate-50 px-6 pb-10">
        <div className="mx-auto max-w-[1000px]">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-slate-700">
            <span className="mt-0.5 flex-shrink-0 text-base">ℹ️</span>
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-900">A note on WhatsApp fees:</span>{' '}
              AppointBot uses Meta's WhatsApp Business API to power the chat. Meta charges a small per-message fee for certain messages —
              specifically <span className="font-medium">appointment reminders</span> sent to customers (called "utility" messages).
              Booking conversations started by your customers are <span className="font-medium text-emerald-700">free</span>.
              Reminders typically cost <span className="font-medium">~₹0.40 per message</span> (India) — for a business with 200 bookings/month,
              that's roughly <span className="font-medium">₹80/month</span> in Meta fees, billed directly to your WhatsApp Business account.{' '}
              <a
                href="https://business.whatsapp.com/products/platform-pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
              >
                View Meta's pricing →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-[900px]">
          <h2 className="mb-7 text-3xl font-bold tracking-tight text-slate-900">Compare plans</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-[40%] border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-left text-[13px] font-bold text-slate-900">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.name} className={`border-b border-slate-200 px-5 py-3.5 text-center text-[13px] font-bold ${p.highlight ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-900'}`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr key={row} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                    <td className="border-b border-slate-100 px-5 py-3 text-[13px] font-medium text-slate-700">{row}</td>
                    {PLANS.map(p => (
                      <td key={p.name} className={`border-b border-slate-100 px-5 py-3 text-center ${p.highlight ? 'bg-indigo-50/50' : ''}`}>
                        <Check val={p.features[row]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-7 text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>
          <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0">
                <button type="button" className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50/50 transition" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className={`flex-shrink-0 text-lg text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {openFaq === i && <p className="border-t border-slate-100 bg-slate-50/30 px-5 pb-4 pt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <h2 className="mb-3 text-4xl font-bold tracking-tight text-white">Start free today</h2>
          <p className="mb-8 text-base text-slate-400">No credit card. No commitment. Just a better booking experience.</p>
          <Button asChild className="inline-flex rounded-lg bg-emerald-600 px-9 py-4 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Link to="/dashboard/signup">Get Started Free →</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
