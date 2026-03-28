import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const COMPARISON_GROUPS = [
  {
    label: 'Limits',
    rows: [
      { feature: 'Bookings / month', free: '50', pro: '500', business: 'Unlimited' },
      { feature: 'Staff members', free: '1', pro: '5', business: 'Unlimited' },
      { feature: 'Services', free: '3', pro: '15', business: 'Unlimited' },
    ],
  },
  {
    label: 'AI Booking',
    rows: [
      { feature: 'AI booking assistant', free: 'check', pro: 'check', business: 'check' },
      { feature: 'WhatsApp chat', free: 'check', pro: 'check', business: 'check' },
      { feature: 'Hosted web chat page', free: 'check', pro: 'check', business: 'check' },
      { feature: 'Website widget', free: 'dash', pro: 'check', business: 'check' },
      { feature: 'Voice message support', free: 'dash', pro: 'check', business: 'check' },
      { feature: 'Customer memory', free: 'dash', pro: 'check', business: 'check' },
      { feature: 'Reschedule & cancel', free: 'check', pro: 'check', business: 'check' },
    ],
  },
  {
    label: 'Reminders & Automation',
    rows: [
      { feature: '24-hour reminders', free: 'dash', pro: 'check', business: 'check' },
      { feature: '2-hour reminders', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Auto-cancel unconfirmed', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'No-show management', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Dropped lead follow-up', free: 'dash', pro: 'dash', business: 'check' },
    ],
  },
  {
    label: 'Marketing & Campaigns',
    rows: [
      { feature: 'WhatsApp campaigns', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Audience targeting', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Campaign templates', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'UTM & lead attribution', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Campaign CSV export', free: 'dash', pro: 'dash', business: 'check' },
    ],
  },
  {
    label: 'Analytics',
    rows: [
      { feature: 'Basic bookings dashboard', free: 'dash', pro: 'check', business: 'check' },
      { feature: 'Revenue tracking', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'No-show rate & trends', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Lead funnel analytics', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'At-risk customer alerts', free: 'dash', pro: 'dash', business: 'check' },
    ],
  },
  {
    label: 'Support',
    rows: [
      { feature: 'Email support', free: 'check', pro: 'check', business: 'check' },
      { feature: 'Priority support', free: 'dash', pro: 'check', business: 'check' },
      { feature: 'Dedicated support', free: 'dash', pro: 'dash', business: 'check' },
      { feature: 'Onboarding assistance', free: 'dash', pro: 'dash', business: 'check' },
    ],
  },
];

const FAQ = [
  { q: 'Is there really a free plan?', a: 'Yes! The free plan gives you 50 bookings per month, 1 staff member, and 3 services — no credit card required. You can use it forever.' },
  { q: 'How does the WhatsApp integration work?', a: 'On the free and pro plans, you share a chat link with your customers. They click it, open WhatsApp, and start chatting with your AI bot. On the Business plan, you get a dedicated WhatsApp number — customers can message you directly.' },
  { q: 'Are there any additional WhatsApp fees from Meta?', a: 'Yes, Meta charges a small per-message fee for appointment reminders sent to customers outside the chat window (called "utility" messages). Booking conversations that customers start are completely free. For India, reminders cost approximately ₹0.40 per message — a business sending 200 reminders/month pays around ₹80/month, billed directly by Meta to your WhatsApp Business account. This is separate from your Booklyft subscription.' },
  { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. You can change your plan at any time from your dashboard. Upgrades take effect immediately, downgrades at the end of your billing period.' },
  { q: 'What happens if I exceed my booking limit?', a: 'We\'ll notify you when you\'re approaching your limit. You can upgrade your plan to continue accepting bookings. Existing bookings are never affected.' },
  { q: 'Do my customers need to install anything?', a: 'No. Customers just need WhatsApp, which they already have. They click your link and start chatting — no app downloads, no account creation.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit and at rest. We never share your customer data with third parties.' },
  {
    q: "What's the difference between Pro and Business?",
    a: 'Pro gives you everything you need to run your bookings smoothly — AI booking, reminders, and a clean dashboard. Business adds the growth layer: WhatsApp campaigns, dropped lead follow-up, revenue analytics, funnel tracking, and at-risk customer alerts. If you want to just manage appointments, Pro is great. If you want to actively grow your customer base, Business is built for that.',
  },
  {
    q: 'Can I try Business features before paying?',
    a: "Your 14-day free trial gives you access to Pro-level features. To explore Business features like campaigns and advanced analytics, contact us — we're happy to enable a Business trial or walk you through a demo.",
  },
  {
    q: "What are 'dropped leads' and why do they matter?",
    a: "A dropped lead is someone who messaged your business, showed interest, but never actually booked an appointment. Most businesses lose 40–60% of interested customers this way without realizing it. The Business plan detects these automatically and sends a follow-up WhatsApp message — recovering bookings you would have otherwise lost forever.",
  },
];

function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function TableCell({ children, businessCol }) {
  return (
    <td className={`border-b border-slate-100 px-4 py-3 text-center text-[13px] md:px-5 ${businessCol ? 'bg-emerald-50/45' : ''}`}>{children}</td>
  );
}

function TableSymbol({ val }) {
  if (val === 'check') return <span className="font-semibold text-emerald-600">✓</span>;
  if (val === 'dash') return <span className="text-slate-300">—</span>;
  return <span className="font-medium text-slate-700">{val}</span>;
}

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [billing, setBilling] = useState('monthly');

  const proYearlyMonthly = Math.round(9990 / 12);
  const bizYearlyMonthly = Math.round(24990 / 12);

  const freeFeatures = [
    { on: true, text: '50 bookings/month' },
    { on: true, text: '1 staff member' },
    { on: true, text: '3 services' },
    { on: true, text: 'AI booking assistant (WhatsApp)' },
    { on: true, text: 'Hosted web chat page' },
    { on: true, text: 'Booking confirmations' },
    { on: true, text: 'Reschedule & cancel via WhatsApp' },
    { on: false, text: 'Customer memory' },
    { on: false, text: 'WhatsApp reminders' },
    { on: false, text: 'Website widget' },
    { on: false, text: 'Campaigns' },
    { on: false, text: 'Analytics' },
    { on: false, text: 'Priority support' },
  ];

  const proBookingOps = [
    '500 bookings/month',
    '5 staff members',
    '15 services',
    'AI booking assistant (WhatsApp + Web Chat)',
    'Embeddable website widget',
    'Customer memory & profiles',
    '24-hour appointment reminders',
    'Reschedule & cancel flows',
    'Basic bookings dashboard',
    'Priority support',
  ];

  const proLocked = [
    'WhatsApp campaigns',
    'Dropped lead follow-up',
    '2-hour reminders + auto-cancel',
    'Advanced analytics & revenue tracking',
    'At-risk customer alerts',
    'Dedicated WhatsApp number',
  ];

  const businessSections = [
    {
      label: 'Everything in Pro, plus:',
      items: ['Unlimited bookings', 'Unlimited staff & services', 'Dedicated WhatsApp number'],
    },
    {
      label: 'Marketing & Campaigns',
      items: [
        'WhatsApp campaigns (free text & templates)',
        'Audience targeting (all, dropped, converted, recent)',
        'Dropped lead follow-up — automated',
        'Reusable campaign templates',
        'Campaign CSV export',
      ],
    },
    {
      label: 'Automation',
      items: ['2-hour confirmation reminders', 'Auto-cancel unconfirmed appointments', 'No-show management & policies'],
    },
    {
      label: 'Analytics',
      items: [
        'Full analytics dashboard',
        'Revenue tracking (daily, monthly, all-time)',
        'No-show rate & trends',
        'Lead funnel (7/30/90-day views)',
        'UTM & campaign attribution',
        'At-risk customer alerts',
      ],
    },
    {
      label: 'Support',
      items: ['Dedicated support', 'Onboarding assistance'],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      <Navbar />

      <section className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Pricing</div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">Pricing that grows with you</h1>
          <p className="text-lg leading-relaxed text-slate-400">
            Start free and see the AI work. Upgrade when you&apos;re ready to stop losing bookings and start growing.
          </p>
        </div>
      </section>

      <section className="flex flex-col items-center gap-2 bg-slate-50 px-6 pb-2 pt-4">
        <div className="flex gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100 p-1.5">
          <button
            type="button"
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition ${billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">Save 17%</span>
          </button>
        </div>
        {billing === 'yearly' && <p className="m-0 text-sm font-semibold text-emerald-600">🎉 2 months free — billed as one annual payment</p>}
      </section>

      <div className="w-full border-y border-slate-200/60 bg-slate-100/80">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-6 px-6 py-5 md:flex-row md:justify-center md:gap-10">
          <div className="max-w-md text-center">
            <p className="text-sm font-normal italic leading-relaxed text-slate-700 md:text-[15px]">
              &ldquo;Switched to Business for the campaigns. Recovered 22 bookings in the first month.&rdquo;
            </p>
            <p className="mt-2 text-xs text-slate-500">— Riya K., Salon owner, Bangalore</p>
          </div>
          <span className="text-lg leading-none text-slate-300 md:hidden" aria-hidden>
            •
          </span>
          <div className="hidden h-auto min-h-[3rem] w-px shrink-0 self-stretch bg-slate-300 md:block" aria-hidden />
          <div className="max-w-md text-center">
            <p className="text-sm font-normal italic leading-relaxed text-slate-700 md:text-[15px]">
              &ldquo;The dropped lead follow-up alone is worth it. Clients come back without me doing anything.&rdquo;
            </p>
            <p className="mt-2 text-xs text-slate-500">— Dr. Mehta, Clinic, Surat</p>
          </div>
        </div>
      </div>

      <section className="bg-slate-50 px-6 py-8 md:py-14">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-stretch justify-center gap-5 lg:gap-6">
          {/* Free */}
          <Card className="relative flex min-w-[260px] max-w-[340px] flex-1 flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7 lg:flex-[0.95]">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Free</div>
            <div className="mb-1 flex items-baseline gap-0.5">
              <span className="text-4xl font-extrabold text-slate-900">{formatPrice(0)}</span>
            </div>
            <p className="mb-1 text-[13px] leading-relaxed text-slate-600">Try the AI booking assistant. No card needed.</p>
            <p className="mb-5 text-[12px] text-slate-500">
              <span className="font-medium text-slate-600">Recommended for:</span> Individuals testing the platform
            </p>
            <Button asChild variant="outline" className="mb-6 rounded-lg border-slate-300 bg-transparent py-2.5 font-semibold text-slate-700 shadow-none hover:bg-slate-50">
              <Link to="/dashboard/signup" className="block w-full text-center">
                Start for Free
              </Link>
            </Button>
            <ul className="flex flex-col gap-2 p-0 [list-style:none]">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-[13px] text-slate-700">
                  {f.on ? <span className="mt-0.5 flex-shrink-0 font-semibold text-emerald-600">✓</span> : <span className="mt-0.5 flex-shrink-0 text-slate-300">—</span>}
                  <span className={f.on ? '' : 'text-slate-500'}>{f.text}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Pro — middle child */}
          <Card className="relative flex min-w-[260px] max-w-[340px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7 lg:flex-[0.95]">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Pro</div>
            <div className="mb-1 flex items-baseline gap-0.5">
              <span className="text-4xl font-extrabold text-slate-900">{billing === 'yearly' ? formatPrice(9990) : formatPrice(999)}</span>
              <span className="ml-0.5 text-base text-slate-500">{billing === 'yearly' ? '/yr' : '/mo'}</span>
            </div>
            {billing === 'yearly' && <div className="mb-1 text-xs text-slate-500">≈ {formatPrice(proYearlyMonthly)}/mo</div>}
            <p className="mb-1 text-[13px] leading-relaxed text-slate-600">Run your bookings without lifting a finger.</p>
            <p className="mb-5 text-[12px] text-slate-500">
              <span className="font-medium text-slate-600">Recommended for:</span> Small businesses managing daily appointments
            </p>
            <Button asChild className="mb-6 rounded-lg bg-slate-700 py-2.5 font-semibold text-white shadow-sm hover:bg-slate-800">
              <Link to="/dashboard/signup" className="block w-full text-center">
                Start Pro Trial
              </Link>
            </Button>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Booking Operations</div>
            <ul className="mb-5 flex flex-col gap-2 p-0 [list-style:none]">
              {proBookingOps.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <span className="mt-0.5 flex-shrink-0 font-semibold text-emerald-600">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Marketing & Growth</div>
            <ul className="mb-2 flex flex-col gap-2 p-0 [list-style:none]">
              {proLocked.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[13px] text-slate-500">
                  <span className="mt-0.5 flex-shrink-0 text-slate-300">—</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] italic leading-relaxed text-slate-400">Available on Business plan</p>
          </Card>

          {/* Business — hero plan */}
          <div className="flex min-w-[260px] w-full max-w-[380px] flex-1 flex-col lg:max-w-[400px] lg:flex-[1.08]">
            <Card className="relative flex h-full flex-col rounded-2xl border-2 border-emerald-500/70 bg-white p-6 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-400/30 md:p-8">
              <div className="absolute left-1/2 top-[-12px] z-[1] -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                Most Popular
              </div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Business</div>
              <div className="mb-1 flex items-baseline gap-0.5">
                <span className="text-4xl font-extrabold text-slate-900 md:text-[2.5rem]">{billing === 'yearly' ? formatPrice(24990) : formatPrice(2499)}</span>
                <span className="ml-0.5 text-base text-slate-500">{billing === 'yearly' ? '/yr' : '/mo'}</span>
              </div>
              {billing === 'yearly' && <div className="mb-1 text-xs text-slate-500">≈ {formatPrice(bizYearlyMonthly)}/mo</div>}
              <p className="mb-1 text-[13px] leading-relaxed text-slate-600">Book more, retain more, and grow — on autopilot.</p>
              <p className="mb-5 text-[12px] text-slate-500">
                <span className="font-medium text-slate-600">Recommended for:</span> Growing businesses serious about retention & revenue
              </p>
              <Button asChild className="mb-6 rounded-lg bg-emerald-600 py-3 text-base font-bold text-white shadow-md hover:bg-emerald-700 md:py-3.5">
                <Link to="/dashboard/signup" className="block w-full text-center">
                  Get Business
                </Link>
              </Button>
              {businessSections.map((sec) => (
                <div key={sec.label} className="mb-5 last:mb-0">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{sec.label}</div>
                  <ul className="flex flex-col gap-2 p-0 [list-style:none]">
                    {sec.items.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-[13px] text-slate-700">
                        <span className="mt-0.5 flex-shrink-0 font-semibold text-emerald-600">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card>
            <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-[13px] leading-relaxed text-slate-700 shadow-sm">
              💡 On average, one recovered dropped lead covers a week of Booklyft. Most Business customers recover 15–30 leads per month.
            </div>
          </div>
        </div>
      </section>

      {/* Why Business — between plan cards and comparison table */}
      <section className="bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Why do most growing businesses choose Business?</h2>
          <div className="mb-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: '🔁',
                title: "You're losing leads without knowing it",
                body: "Every customer who messages and doesn't book is a dropped lead. Business automatically follows up. Pro doesn't.",
              },
              {
                icon: '📢',
                title: 'One campaign can pay for months',
                body: "A single WhatsApp campaign to 200 past customers typically brings back 20–40 bookings. That's only on Business.",
              },
              {
                icon: '📊',
                title: "You can't improve what you can't see",
                body: 'Revenue trends, no-show rates, at-risk customers, funnel analytics — all Business-only. Pro shows you bookings. Business shows you your business.',
              },
            ].map((c) => (
              <Card key={c.title} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm">
                <div className="mb-3 text-3xl">{c.icon}</div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">{c.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{c.body}</p>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild className="rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
              <Link to="/dashboard/signup">Get Business →</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-[960px]">
          <h2 className="mb-7 text-3xl font-bold tracking-tight text-slate-900">Compare plans</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 bg-slate-100 px-4 py-3.5 text-left text-[13px] font-bold text-slate-900 md:px-5">Feature</th>
                  <th className="border-b border-slate-200 bg-slate-100 px-4 py-3.5 text-center text-[13px] font-bold text-slate-900 md:px-5">Free</th>
                  <th className="border-b border-slate-200 bg-slate-100 px-4 py-3.5 text-center text-[13px] font-bold text-slate-900 md:px-5">Pro</th>
                  <th className="border-b border-slate-200 bg-emerald-100/70 px-4 py-3.5 text-center text-[13px] font-bold text-emerald-900 md:px-5">Business</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_GROUPS.map((group) => (
                  <Fragment key={group.label}>
                    <tr className="bg-slate-200/70">
                      <td colSpan={4} className="px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-slate-800 md:px-5">
                        {group.label}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={`${group.label}-${row.feature}`} className="bg-white">
                        <td className="border-b border-slate-100 px-4 py-3 text-[13px] font-medium text-slate-700 md:px-5">{row.feature}</td>
                        <TableCell businessCol={false}>
                          <TableSymbol val={row.free} />
                        </TableCell>
                        <TableCell businessCol={false}>
                          <TableSymbol val={row.pro} />
                        </TableCell>
                        <TableCell businessCol>
                          <TableSymbol val={row.business} />
                        </TableCell>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Meta / WhatsApp fee disclosure ── */}
      <section className="bg-slate-50 px-6 pb-16 pt-0">
        <div className="mx-auto max-w-[960px]">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-slate-700">
            <span className="mt-0.5 flex-shrink-0 text-base">ℹ️</span>
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-900">A note on WhatsApp fees:</span>{' '}
              Booklyft uses Meta&apos;s WhatsApp Business API to power the chat. Meta charges a small per-message fee for certain messages —
              specifically <span className="font-medium">appointment reminders</span> sent to customers (called &quot;utility&quot; messages).
              Booking conversations started by your customers are <span className="font-medium text-emerald-700">free</span>.
              Reminders typically cost <span className="font-medium">~₹0.40 per message</span> (India) — for a business with 200 bookings/month,
              that&apos;s roughly <span className="font-medium">₹80/month</span> in Meta fees, billed directly to your WhatsApp Business account.{' '}
              <a
                href="https://business.whatsapp.com/products/platform-pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
              >
                View Meta&apos;s pricing →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-7 text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50/50"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
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
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Not sure which plan? Start free, decide later.</h2>
          <p className="mb-8 text-base leading-relaxed text-slate-400">
            Try the AI booking assistant free for 14 days.
            <br />
            <br />
            Most businesses upgrade to Business within the first month — not because they have to, but because they can see exactly what they&apos;ve been missing.
          </p>
          <Button asChild className="inline-flex rounded-lg bg-emerald-600 px-9 py-4 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Link to="/dashboard/signup">Get Started Free →</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
