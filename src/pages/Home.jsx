import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';


/* ─── Home billing toggle + plan cards ──────────────────────────────────── */
function HomeBillingToggle() {
  const [billing, setBilling] = useState('monthly');

  const plans = [
    { name: 'Free trial', monthly: 0, yearly: 0, desc: 'Test it', features: ['50 bookings/month', '2 staff', '3 services', 'WhatsApp bot', 'Email support'], cta: 'Start free trial' },
    { name: 'Pro', monthly: 999, yearly: 9990, desc: 'Run it', features: ['500 bookings/month', '10 staff members', '20 services', 'WhatsApp + Web Chat + Website Widget', 'Auto reminders & confirmations', 'Dropped lead follow-up automation', 'Basic analytics dashboard', 'Priority support'], cta: 'Start Pro Trial', highlight: true },
    { name: 'Business', monthly: 2499, yearly: 24990, desc: 'Grow with it', features: ['Unlimited bookings', 'Unlimited staff & services', 'Dedicated WhatsApp number', 'WhatsApp campaigns & audience targeting', 'Advanced analytics (revenue, no-shows, funnels, UTM)', 'Campaign performance tracking & CSV export', 'At-risk customer alerts', 'Dedicated support'], cta: 'Contact Us' },
  ];

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center gap-4">
        <div className="flex gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100 p-1.5">
          <button type="button" className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${billing === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setBilling('monthly')}>Monthly</button>
          <button type="button" className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${billing === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setBilling('yearly')}>
            Yearly <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">Save 17%</span>
          </button>
        </div>
        {billing === 'yearly' && <span className="text-sm font-semibold text-emerald-600">🎉 2 months free</span>}
      </div>
      <div className="ab-plan-grid mb-6">
        {plans.map((plan, i) => {
          const price = plan.monthly === 0 ? 'Free' : billing === 'yearly' ? `₹${plan.yearly.toLocaleString('en-IN')}` : `₹${plan.monthly.toLocaleString('en-IN')}`;
          const per = plan.monthly === 0 ? '' : billing === 'yearly' ? '/yr' : '/mo';
          const equiv = billing === 'yearly' && plan.monthly > 0 ? `≈ ₹${Math.round(plan.yearly / 12).toLocaleString('en-IN')}/mo` : null;
          return (
            <Card key={i} className={`relative flex min-w-[220px] flex-1 flex-col rounded-2xl border border-slate-200/80 p-6 shadow-sm ${plan.highlight ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : ''}`}>
              {plan.highlight && <div className="absolute left-1/2 top-[-12px] -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Most Popular</div>}
              <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{plan.name}</div>
              <div className="mb-0.5 flex items-baseline gap-0.5">
                <span className="text-3xl font-bold text-slate-900">{price}</span>
                {per && <span className="ml-0.5 text-sm text-slate-500">{per}</span>}
              </div>
              {equiv && <div className="mb-1.5 text-xs text-slate-500">{equiv}</div>}
              <p className="mb-4 text-sm leading-relaxed text-slate-600">{plan.desc}</p>
              <ul className="mb-5 flex flex-1 flex-col gap-2 p-0 text-sm text-slate-700 [list-style:none]">
                {plan.features.map((f, j) => <li key={j} className="flex items-start gap-2"><span className="flex-shrink-0 font-semibold text-emerald-600">✓</span>{f}</li>)}
              </ul>
              <Button asChild className={plan.highlight ? 'mt-auto rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700' : 'mt-auto rounded-lg bg-slate-100 py-2.5 font-semibold text-slate-900 hover:bg-slate-200'}>
                <Link to="/dashboard/signup" className="block w-full text-center">{plan.cta}</Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Hero chat messages (loop animation every 5s) ─────────────────────────── */
const HERO_CHAT_MESSAGES = [
  { from: 'bot', text: '👋 Hi! I\'m the AI booking assistant for Glow Salon. How can I help?' },
  { from: 'user', text: 'Book a haircut tomorrow at 5pm' },
  { from: 'bot', text: '✅ Done! Haircut on Friday at 5:00 PM. See you then! 💇' },
];

/* Second chat demo — "See it in action" (reschedule flow) */
const SEE_IT_WORK_CHAT_MESSAGES = [
  { from: 'user', text: 'Can I reschedule my appointment to Saturday morning?' },
  { from: 'bot', text: 'Of course! I have Saturday at 10:00 AM and 11:30 AM available.\nWhich works for you? 😊' },
];

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [heroChatKey, setHeroChatKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHeroChatKey((k) => k + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      <Navbar />

      {/* 1. Attention Hook — problem-based hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-20 md:py-24">
        <div className="ab-hero-inner mx-auto max-w-[1120px]">
          <div className="ab-hero-left">
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
              <span className="text-left">For salons, clinics & small businesses in India — now with campaigns & lead retargeting</span>
            </div>
            <h1 className="ab-hero-h1 mb-5 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Book more. Lose fewer. Bring back the rest.
            </h1>
            <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-slate-400">
              Customers book on WhatsApp, your website, or web chat.
              <br />
              The AI handles it. Reminders go out automatically.
              <br />
              Dropped leads get followed up. You just show up.
            </p>
            <div className="mb-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-lg bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
                <Link to="/dashboard/signup">Start free trial →</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-lg border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10">
                <Link to="#see-it-work">See it in action</Link>
              </Button>
            </div>
            <div className="flex max-w-[520px] flex-col gap-2 text-[13px] font-medium text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              <span>✓ No credit card required</span>
              <span>✓ Setup in minutes</span>
              <span>✓ 14-day free trial</span>
              <span className="sm:basis-full">✓ WhatsApp + Web + Widget — all channels included</span>
            </div>
          </div>

          <div className="ab-hero-right flex justify-center">
            <div className="w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
              <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">💇</div>
                <div>
                  <div className="text-sm font-semibold text-white">Glow Salon</div>
                  <div className="text-[11px] text-emerald-200">● Online</div>
                </div>
              </div>
              <div className="flex min-h-[200px] flex-col gap-2 bg-[#ece5dd] p-3">
                <div key={heroChatKey} className="flex flex-col gap-2">
                  {HERO_CHAT_MESSAGES.map((m, i) => (
                    <div
                      key={i}
                      className={`hero-chat-msg max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-snug ${m.from === 'user' ? 'ml-auto bg-[#dcf8c6]' : 'bg-white shadow-sm'}`}
                      style={{ animationDelay: `${0.4 + i * 0.55}s` }}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="border-b border-slate-200 bg-slate-100/80">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-4 px-6 py-4">
          <span className="mr-2 text-sm font-medium text-slate-600">Trusted by salons, clinics, and dentists across India</span>
          {['💇 Salons', '🩺 Clinics', '🦷 Dentists', '📚 Tutors', '🏢 Businesses'].map(b => (
            <span key={b} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">{b}</span>
          ))}
        </div>
      </div>

      {/* 2. Relatable Problem */}
      <section className="ab-section bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[640px]">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Sound familiar?</h2>
          <ul className="space-y-2 text-sm text-slate-600 md:text-base">
            <li>• Missed call = lost booking</li>
            <li>• Same question again and again: "Do you have a slot?"</li>
            <li>• Slots in notes, WhatsApp, diary — a mess</li>
            <li>• 10 PM messages, you're still replying</li>
          </ul>
          <p className="mt-6 text-sm text-slate-500">There's a better way.</p>
        </div>
      </section>

      {/* 3. Introduce the Idea */}
      <section className="ab-section bg-slate-50 px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">One message. Any channel. Appointment booked.</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            WhatsApp, your website chat, or an embedded widget — the AI handles booking, rescheduling, and cancellations across all channels. That's Booklyft.
          </p>
        </div>
      </section>

      {/* 4. Visual Example */}
      <section id="see-it-work" className="ab-section bg-white px-6 py-14 md:py-16 scroll-mt-6">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">See it in action</div>
          <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Book in one message. Or chat for slots & services.</h2>
          <p className="mb-10 text-sm text-slate-600">They type; the bot confirms. Simple.</p>
          <div className="flex justify-center">
            <div className="w-full max-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">💇</div>
                <div>
                  <div className="text-sm font-semibold text-white">Glow Salon</div>
                  <div className="text-[11px] text-emerald-200">● Online</div>
                </div>
              </div>
              <div className="flex min-h-[200px] flex-col gap-2 bg-[#ece5dd] p-3">
                <div key={heroChatKey} className="flex flex-col gap-2">
                  {SEE_IT_WORK_CHAT_MESSAGES.map((m, i) => (
                    <div
                      key={i}
                      className={`hero-chat-msg max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[13px] leading-snug ${m.from === 'user' ? 'ml-auto bg-[#dcf8c6]' : 'bg-white shadow-sm'}`}
                      style={{ animationDelay: `${0.3 + i * 0.5}s` }}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Benefits */}
      <section className="ab-section bg-slate-50 px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">What you get</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '📞', title: 'Fewer calls', desc: 'No more "Do you have a slot?" calls. The AI answers 24/7.' },
              { icon: '🔁', title: 'Win back dropped leads', desc: 'Someone asked about a slot but never booked? Booklyft follows up automatically.' },
              { icon: '🌙', title: 'Bookings after hours', desc: "They book when you're closed. You see it in the morning." },
              { icon: '📢', title: 'Send campaigns on WhatsApp', desc: 'Message all customers, recent visitors, or lost leads — with one click.' },
              { icon: '📊', title: 'Know your numbers', desc: 'Revenue, no-show rate, repeat customers — updated every day.' },
              { icon: '📅', title: 'One schedule, every channel', desc: 'WhatsApp, web chat, and website widget — all synced in one calendar.' },
            ].map((b, i) => (
              <Card key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-2 text-2xl">{b.icon}</div>
                <h3 className="mb-0.5 font-semibold text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-600">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Channels — works everywhere */}
      <section id="channels" className="ab-section bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px] rounded-2xl border border-indigo-200/70 bg-indigo-50/50 px-5 py-10 shadow-sm md:px-8 md:py-12">
          <h2 className="mb-3 text-center text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Works everywhere your customers find you</h2>
          <p className="mx-auto mb-8 max-w-[560px] text-center text-sm leading-relaxed text-slate-600">One platform. Three booking channels. All synced.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: '💬', title: 'WhatsApp', desc: 'Customers message your WhatsApp number and the AI books instantly. Works with Meta WhatsApp Cloud API. Supports text and voice messages.' },
              { icon: '🌐', title: 'Web Chat', desc: 'Every business gets a hosted booking page at booklyft.com/chat/yourname. Share the link anywhere — Instagram bio, Google listing, email signature.' },
              { icon: '🔌', title: 'Website Widget', desc: 'Drop one line of code onto any website. A booking widget appears. No dependencies. No extra setup. Works on any site.' },
            ].map((c, i) => (
              <Card key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-2 text-2xl">{c.icon}</div>
                <h3 className="mb-1 font-semibold text-slate-900">{c.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{c.desc}</p>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">All channels share the same calendar, staff, and services. No double bookings.</p>
          <p className="mt-3 text-center">
            <a href="#features" className="text-xs font-semibold text-slate-600 hover:text-slate-900">See how the widget works →</a>
          </p>
        </div>
      </section>

      {/* Dropped lead follow-up spotlight */}
      <section className="ab-section bg-slate-50 px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px] rounded-2xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-50/90 to-white px-5 py-10 shadow-md md:px-8 md:py-12">
          <h2 className="mb-3 text-center text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Dropped a lead? We follow up for you.</h2>
          <p className="mx-auto mb-10 max-w-[640px] text-center text-sm leading-relaxed text-slate-600">
            Most businesses lose 40–60% of interested customers who never actually book. Booklyft catches them automatically.
          </p>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <ol className="m-0 list-none space-y-0 p-0">
                {[
                  { text: 'Customer asks about a haircut on WhatsApp', emoji: '🟢' },
                  { text: 'AI responds with available slots', emoji: '💬' },
                  { text: "Customer goes quiet. Doesn't book.", emoji: '❌' },
                  { text: '24 hours later — Booklyft sends a follow-up automatically', emoji: '⏱️' },
                  { text: 'Customer books.', emoji: '✅' },
                ].map((step, i, arr) => (
                  <li key={i} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex w-8 flex-shrink-0 flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base shadow-sm">{step.emoji}</div>
                      {i < arr.length - 1 ? <div className="mt-1 w-px flex-1 min-h-[1.25rem] bg-slate-300" aria-hidden /> : null}
                    </div>
                    <p className="m-0 pt-1 text-sm leading-relaxed text-slate-700">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: '🔁', title: 'Automatic follow-up', body: 'Dropped leads get a personalized WhatsApp message. No action needed from you.' },
                { icon: '🎯', title: 'Smart audience targeting', body: 'Send campaigns to all leads, converted customers, or only the ones who never booked.' },
                { icon: '📈', title: 'Track what\'s working', body: 'See how many leads converted, which campaigns performed, and your overall funnel health.' },
              ].map((card, i) => (
                <Card key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="mb-2 text-2xl">{card.icon}</div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-600">{card.body}</p>
                </Card>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Button asChild className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">
              <a href="#pricing">See it in the Pro & Business plans →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Analytics mock dashboard */}
      <section id="analytics-glance" className="ab-section bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-3 text-center text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Finally know if your business is actually growing</h2>
          <p className="mx-auto mb-8 max-w-[640px] text-center text-sm leading-relaxed text-slate-600">
            Stop guessing. Know exactly how your business is performing — bookings, revenue, no-shows, and at-risk customers. Updated daily.
          </p>
          <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-6 shadow-xl md:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: '📅', label: 'Bookings this month', value: '143' },
                { icon: '💰', label: 'Revenue this month', value: '₹71,500' },
                { icon: '🔁', label: 'Repeat customers', value: '68%' },
                { icon: '❌', label: 'No-show rate', value: '4.2%' },
                { icon: '⚠️', label: 'At-risk customers', value: '11' },
                { icon: '📢', label: 'Campaign conversion', value: '22%' },
              ].map((m, i) => (
                <div key={i} className="rounded-xl border border-slate-700/80 bg-slate-800/50 p-4">
                  <div className="mb-2 text-lg">{m.icon}</div>
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{m.label}</div>
                  <div className="text-2xl font-bold tracking-tight text-white">{m.value}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-slate-500">Available on Pro and Business plans</p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="ab-section bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Salons, clinics, dentists & more</h2>
          <div className="ab-biz-grid grid gap-4 md:grid-cols-3">
            {[
              { icon: '💇', type: 'Salon & Spa', color: 'bg-fuchsia-50', border: 'border-fuchsia-200', services: ['Haircut', 'Colour', 'Facial'], desc: 'Book without calling.' },
              { icon: '🩺', type: 'Clinic', color: 'bg-emerald-50', border: 'border-emerald-200', services: ['Consultation', 'Follow-up', 'Tests'], desc: 'Patients self-schedule.' },
              { icon: '🦷', type: 'Dentist', color: 'bg-blue-50', border: 'border-blue-200', services: ['Checkup', 'X-Ray', 'Whitening'], desc: 'Calendar fills automatically.' },
            ].map((b, i) => (
              <Card key={i} className={`rounded-xl border ${b.border} ${b.color} p-5 shadow-sm`}>
                <div className="mb-2 text-3xl">{b.icon}</div>
                <h3 className="mb-1 font-semibold text-slate-900">{b.type}</h3>
                <p className="mb-3 text-xs text-slate-600">{b.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {b.services.map(sv => <span key={sv} className="rounded border border-slate-200/80 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">{sv}</span>)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Features */}
      <section id="features" className="ab-section bg-slate-50 px-6 py-14 md:py-16 scroll-mt-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Features</h2>
          <div className="ab-feat-grid mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🤖', title: 'AI booking assistant', desc: '"Haircut tomorrow 5pm" → confirmed. Handles booking, rescheduling, and cancellations in natural language.' },
              { icon: '💬', title: 'WhatsApp + Web + Widget', desc: 'Three channels, one calendar. Customers book where they already are.' },
              { icon: '🔔', title: 'Smart reminders', desc: '24-hour and 2-hour reminders go out automatically. Unconfirmed appointments cancel themselves.' },
              { icon: '📢', title: 'WhatsApp campaigns', desc: 'Send targeted messages to all customers, recent visitors, or dropped leads in one click.' },
              { icon: '📊', title: 'Analytics & insights', desc: 'Revenue, no-show trends, repeat rate, campaign performance — all in one dashboard.' },
              { icon: '🌙', title: '24/7, fully automated', desc: "Bookings, reminders, follow-ups — running even when you're asleep." },
            ].map((f, i) => (
              <Card key={i} className="rounded-xl border border-slate-200/80 p-5 shadow-sm">
                <div className="mb-2 text-2xl">{f.icon}</div>
                <h3 className="mb-0.5 text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600">{f.desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/features" className="text-xs font-semibold text-slate-600 hover:text-slate-900">All features →</Link>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="ab-section bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">What owners say</h2>
          <div className="ab-test-grid grid gap-4 md:grid-cols-3">
            {[
              { name: 'Priya S.', biz: 'Salon, Mumbai', avatar: '💇', quote: '2 hours of calls → zero. Clients just WhatsApp.' },
              { name: 'Dr. Arjun M.', biz: 'Clinic, Pune', avatar: '🩺', quote: 'Fewer calls, fewer mix-ups. Front desk breathes.' },
              { name: 'Sneha P.', biz: 'Dental, Ahmedabad', avatar: '🦷', quote: 'Setup in minutes. Fewer no-shows.' },
            ].map((t, i) => (
              <Card key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs italic text-slate-700">"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-base">{t.avatar}</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500">{t.biz}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing */}
      <section id="pricing" className="ab-section bg-slate-50 px-6 py-14 md:py-16 scroll-mt-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Pricing</h2>
          <p className="mb-8 text-sm text-slate-600">No card required. Cancel anytime.</p>
          <HomeBillingToggle />
          <div className="mt-4 text-center">
            <Link to="/pricing" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Compare all plans →</Link>
          </div>
        </div>
      </section>

      {/* 9. Steps */}
      <section className="ab-section bg-white px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Three steps. You're live.</h2>
          <div className="ab-steps-grid grid gap-4 md:grid-cols-3">
            {[
              { n: '1', icon: '✍️', title: 'Sign up', desc: 'Business name & type. Under 2 min.' },
              { n: '2', icon: '⚙️', title: 'Add services & hours', desc: 'What you offer, when you\'re open.' },
              { n: '3', icon: '📱', title: 'Connect your channels', desc: 'WhatsApp, web chat, or website widget. Customers book 24/7 from wherever they find you.' },
            ].map((step, i) => (
              <Card key={i} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-2 text-xs font-bold text-slate-500">{step.n}</div>
                <div className="mb-3 text-2xl">{step.icon}</div>
                <h3 className="mb-0.5 font-semibold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-600">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-16">
        <div className="mx-auto max-w-[560px] text-center">
          <h2 className="ab-cta-h2 mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">Start booking, retaining, and growing — automatically.</h2>
          <p className="mb-6 text-sm text-slate-400">14-day free trial. No card. All channels included from day one.</p>
          <Button asChild className="inline-flex rounded-lg bg-emerald-600 px-9 py-4 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Link to="/dashboard/signup">Start free trial →</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
