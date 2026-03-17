import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Natural Language Booking',
    desc: 'Customers just type what they want — "Book a haircut tomorrow at 5pm" — and the AI understands it perfectly. No menus, no forms, no friction.',
    detail: ['Understands fuzzy times like "evening", "morning", "around 3"', 'Handles typos and informal language', 'Extracts service, date, time in one message', 'Powered by state-of-the-art LLMs'],
  },
  {
    icon: '💬',
    title: 'WhatsApp Native',
    desc: 'Your customers already use WhatsApp every day. appointbot meets them there — no app downloads, no account creation, just a message.',
    detail: ['Works on any WhatsApp number', 'Customers get instant replies 24/7', 'Booking confirmations sent automatically', 'Sandbox mode for testing, dedicated numbers for production'],
  },
  {
    icon: '📅',
    title: 'Smart Availability Management',
    desc: 'The bot checks real-time availability and only offers slots that are actually free. No double bookings, no confusion.',
    detail: ['Per-staff availability schedules', 'Automatic conflict detection', 'Shows available slots when requested time is taken', '"What\'s free this week?" intent supported'],
  },
  {
    icon: '🔄',
    title: 'Reschedule & Cancel Flow',
    desc: 'Customers can reschedule or cancel existing appointments through the same WhatsApp chat — no calls needed.',
    detail: ['Natural language reschedule requests', 'Shows existing bookings before cancelling', 'Instant confirmation of changes', 'Frees up slots for other customers'],
  },
  {
    icon: '👤',
    title: 'Customer Memory',
    desc: 'appointbot remembers returning customers by their phone number — no need to re-enter their name every time.',
    detail: ['Greets returning customers by name', 'Stores customer profiles securely', 'Faster booking for repeat customers', 'Works across all conversations'],
  },
  {
    icon: '👥',
    title: 'Multi-Staff Management',
    desc: 'Manage your entire team from one dashboard. Each staff member has their own schedule, and customers can request specific people.',
    detail: ['Individual working hours per staff', 'Staff selection in booking flow', 'Per-staff availability checking', 'Easy to add or remove team members'],
  },
  {
    icon: '⚡',
    title: 'No-Code Dashboard',
    desc: 'Everything is configurable from a simple web dashboard. Add services, update hours, view appointments — no developers needed.',
    detail: ['Drag-and-drop service management', 'Visual schedule builder', 'Real-time appointment view', 'Mobile-friendly interface'],
  },
  {
    icon: '📊',
    title: 'Appointment Dashboard',
    desc: 'See all your bookings in one place. Today\'s schedule, upcoming appointments, and monthly stats at a glance.',
    detail: ['Today\'s appointments at a glance', 'Monthly booking statistics', 'Customer details and history', 'Export-ready data'],
  },
  {
    icon: '🌙',
    title: 'Works 24/7',
    desc: 'Your AI booking assistant never sleeps. Customers can book at midnight, on weekends, on holidays — whenever they need.',
    detail: ['Zero downtime booking system', 'Instant responses at any hour', 'No staff required to manage bookings', 'Handles multiple conversations simultaneously'],
  },
];

export default function Features() {
  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      <Navbar />

      <section className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-20">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Features</div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white">Everything your booking system needs</h1>
          <p className="mb-8 text-lg leading-relaxed text-slate-400">
            appointbot combines AI, WhatsApp, and a powerful dashboard to give you a complete booking solution — without the complexity.
          </p>
          <Button asChild className="inline-flex rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Link to="/dashboard/signup">Start for Free →</Link>
          </Button>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-[1120px]">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`flex flex-wrap items-start gap-12 border-b border-slate-200/80 py-12 ${i % 2 === 1 ? 'rounded-2xl bg-slate-50/80 px-8 -mx-8' : ''}`}
            >
              <div className="min-w-0 flex-[0_0_340px]">
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h2 className="mb-2.5 text-xl font-semibold tracking-tight text-slate-900">{f.title}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
              <div className="min-w-[240px] flex-1 pt-2">
                <ul className="flex flex-col gap-3 p-0 [list-style:none]">
                  {f.detail.map((d, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                      <span className="mt-0.5 flex-shrink-0 font-semibold text-emerald-600">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <h2 className="mb-3 text-4xl font-bold tracking-tight text-white">Ready to get started?</h2>
          <p className="mb-8 text-base text-slate-400">Free plan available. No credit card required.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
              <Link to="/dashboard/signup">Try for Free →</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20">
              <Link to="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
