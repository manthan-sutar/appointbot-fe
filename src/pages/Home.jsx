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
    { name: 'Free trial', monthly: 0, yearly: 0, desc: '14-day trial. No card.', features: ['50 bookings/month', '2 staff', '3 services', 'WhatsApp bot', 'Email support'], cta: 'Start free trial' },
    { name: 'Pro', monthly: 999, yearly: 9990, desc: 'For growing businesses.', features: ['500 bookings/month', '10 staff', '20 services', 'WhatsApp bot', 'Priority support'], cta: 'Start Pro Trial', highlight: true },
    { name: 'Business', monthly: 2499, yearly: 24990, desc: 'For high-volume businesses.', features: ['Unlimited bookings', 'Unlimited staff', 'Dedicated WhatsApp number', 'Analytics', 'Dedicated support'], cta: 'Contact Us' },
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              For salons, clinics & small businesses in India
            </div>
            <h1 className="ab-hero-h1 mb-5 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Stop answering booking calls.<br />
              Let <span className="text-emerald-400">WhatsApp</span> handle it.
            </h1>
            <p className="mb-8 max-w-[440px] text-lg leading-relaxed text-slate-400">
              Customers message; the AI books. No calls, no back-and-forth.
            </p>
            <div className="mb-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-lg bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
                <Link to="/dashboard/signup">Start free trial →</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-lg border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10">
                <Link to="#see-it-work">See it in action</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-5 text-[13px] font-medium text-slate-500">
              <span>✓ No credit card required</span>
              <span>✓ Setup in minutes</span>
              <span>✓ 14-day free trial</span>
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
          <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">One WhatsApp message. Appointment booked.</h2>
          <p className="text-sm text-slate-600">Or they ask for slots, services, reschedule — the AI handles the conversation. That's AppointBot.</p>
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
                  {HERO_CHAT_MESSAGES.map((m, i) => (
                    <div
                      key={i}
                      className={`hero-chat-msg max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-snug ${m.from === 'user' ? 'ml-auto bg-[#dcf8c6]' : 'bg-white shadow-sm'}`}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '📞', title: 'Fewer calls', desc: 'No more "Do you have a slot?" calls.' },
              { icon: '⏱️', title: 'Less manual work', desc: 'No copying names and times.' },
              { icon: '🌙', title: 'Bookings after hours', desc: 'They book when you\'re closed.' },
              { icon: '📅', title: 'One schedule', desc: 'All appointments in one place.' },
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
      <section className="ab-section bg-slate-50 px-6 py-14 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Features</h2>
          <div className="ab-feat-grid mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🤖', title: 'AI understands', desc: '"Haircut tomorrow 5pm" → booked.' },
              { icon: '💬', title: 'On WhatsApp', desc: 'No new app. They message & book.' },
              { icon: '🔔', title: 'Auto confirmations', desc: 'Fewer no-shows.' },
              { icon: '👥', title: 'Staff & services', desc: 'Set who does what, when.' },
              { icon: '⚡', title: 'Simple dashboard', desc: 'No coding. Just add & go.' },
              { icon: '🌙', title: '24/7', desc: 'Bookings anytime you\'re closed.' },
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
      <section className="ab-section bg-slate-50 px-6 py-14 md:py-16">
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
              { n: '3', icon: '📱', title: 'Connect WhatsApp', desc: 'Customers message & book 24/7.' },
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
          <h2 className="ab-cta-h2 mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">Start automating your bookings today.</h2>
          <p className="mb-6 text-sm text-slate-400">14-day free trial. No card.</p>
          <Button asChild className="inline-flex rounded-lg bg-emerald-600 px-9 py-4 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Link to="/dashboard/signup">Start free trial →</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
