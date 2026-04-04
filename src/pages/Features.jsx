import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const NAV_LINKS = [
  { id: 'ai-assistant', label: 'AI Assistant' },
  { id: 'channels', label: 'Channels' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'automation', label: 'Automation' },
  { id: 'analytics', label: 'Analytics' },
];

const FEATURE_SECTIONS = [
  {
    id: 'ai-assistant',
    title: 'AI Booking Assistant',
    subtitle: 'Understands your customers. Books for them instantly.',
    cards: [
      {
        icon: '🤖',
        title: 'AI-Powered Natural Language Booking',
        desc: 'Customers just type what they want — "Book a haircut tomorrow at 5pm" — and the AI understands it perfectly. No menus, no forms, no friction.',
        detail: ['Understands fuzzy times like "evening", "morning", "around 3"', 'Handles typos and informal language', 'Extracts service, date, time in one message', 'Powered by state-of-the-art LLMs'],
      },
      {
        icon: '👤',
        title: 'Customer Memory',
        desc: 'Booklyft remembers returning customers by their phone number — no need to re-enter their name every time.',
        detail: ['Greets returning customers by name', 'Stores customer profiles securely', 'Faster booking for repeat customers', 'Works across all conversations'],
      },
      {
        icon: '🎙️',
        title: 'Voice Message Support',
        desc: 'Customers can send voice notes on WhatsApp. Booklyft transcribes them automatically and processes the booking request — no typing needed.',
        detail: ['Auto-transcription of WhatsApp voice messages', 'Extracts service, time, and date from speech', 'Same AI flow as text messages', 'Useful for customers who prefer talking over typing'],
      },
      {
        icon: '🔁',
        title: 'Session & Context Management',
        desc: 'The AI remembers what was said earlier in the conversation. No need to repeat yourself — it picks up where you left off.',
        detail: ['Multi-turn conversation support', 'Session state preserved across messages', 'Auto-timeout for idle conversations', 'Handles topic switches gracefully'],
      },
    ],
  },
  {
    id: 'channels',
    title: 'Booking Channels',
    subtitle: 'Meet customers wherever they are — WhatsApp, web, or your own site.',
    cards: [
      {
        icon: '💬',
        title: 'WhatsApp Native',
        desc: 'Your customers already use WhatsApp every day. Booklyft meets them there — no app downloads, no account creation, just a message.',
        detail: ['Works on any WhatsApp number', 'Customers get instant replies 24/7', 'Booking confirmations sent automatically', 'Sandbox mode for testing, dedicated numbers for production'],
      },
      {
        icon: '🌐',
        title: 'Hosted Web Chat',
        badge: 'pro',
        desc: 'Every Booklyft business gets a public booking page at booklyft.com/chat/yourname. Share it anywhere — no website needed.',
        detail: ['Instant hosted booking page, no setup', 'Share on Instagram bio, Google listing, email signature', 'Full AI booking assistant in the browser', 'Automatic lead tracking with UTM attribution'],
      },
      {
        icon: '🔌',
        title: 'Embeddable Website Widget',
        badge: 'pro',
        desc: 'Add a booking widget to any existing website with one line of code. No dependencies, no frameworks, no developer needed.',
        detail: ['Self-contained widget — paste one script tag', 'Works on any website (WordPress, Wix, custom HTML)', 'Matches your booking flow exactly', 'Tracks leads and campaign source automatically'],
      },
      {
        icon: '📡',
        title: 'API Access',
        badge: 'pro',
        desc: 'Connect Booklyft to your own tools with our API. Programmatically create bookings, fetch appointments, and manage your schedule.',
        detail: ['REST API for booking management', 'API key management from dashboard', 'Suitable for custom integrations', 'Available on Pro and Business plans'],
      },
    ],
  },
  {
    id: 'appointments',
    title: 'Appointment Management',
    subtitle: 'Full control over every booking, from confirmation to completion.',
    cards: [
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
      {
        icon: '📋',
        title: 'Full Appointment Lifecycle',
        desc: 'Track every appointment through its full journey — confirmed, completed, cancelled, no-show, or auto-cancelled.',
        detail: ['Status tracking: confirmed, completed, cancelled, no-show', 'Manual booking from the dashboard', 'Staff-aware booking and conflict detection', 'Appointment stats: today, this month, all-time'],
      },
      {
        icon: '👤',
        title: 'Customer Directory',
        desc: 'Every customer gets a profile — built automatically from their phone number. See their full history, notes, and context.',
        detail: ['Phone-based customer profiles (auto-created)', 'Full appointment history per customer', 'Internal notes and context per customer', 'Repeat customer tracking'],
      },
    ],
  },
  {
    id: 'campaigns',
    title: 'Marketing & Campaigns',
    subtitle: 'Turn your customer list into a growth engine.',
    cards: [
      {
        icon: '📢',
        title: 'WhatsApp Campaigns',
        badge: 'business',
        desc: 'Send targeted WhatsApp messages to your entire customer list or a specific segment — right from the dashboard.',
        detail: ['Free text mode or pre-approved WhatsApp templates', 'Send immediately or schedule for later', 'Works on Business plan with Meta-approved templates', 'Track performance per campaign'],
      },
      {
        icon: '🎯',
        title: 'Smart Audience Targeting',
        badge: 'business',
        desc: 'Don\'t message everyone — message the right people. Segment your audience based on behaviour and history.',
        detail: ['All leads, dropped leads, or converted leads', 'Recent customers (configurable time window)', 'Per-recipient opt-out and messaging preferences', 'Failed recipient retry logic'],
      },
      {
        icon: '🔁',
        title: 'Dropped Lead Follow-Up',
        badge: 'pro',
        desc: 'When a customer shows interest but never books, Booklyft sends a follow-up automatically — no action needed.',
        detail: ['Detects customers who engaged but didn\'t book', 'Sends personalized follow-up message automatically', 'Configurable follow-up timing', 'Tracked separately in lead analytics'],
      },
      {
        icon: '📄',
        title: 'Reusable Campaign Templates',
        badge: 'business',
        desc: 'Save your best-performing messages as templates and reuse them for future campaigns in seconds.',
        detail: ['Save and manage message templates', 'Use templates in any new campaign', 'Free text and WhatsApp-approved template modes', 'CSV export of campaign results'],
      },
      {
        icon: '🔗',
        title: 'UTM & Lead Attribution',
        badge: 'business',
        desc: 'Know exactly where your bookings are coming from. Every lead is tracked with source, campaign, and UTM data.',
        detail: ['Automatic UTM parameter capture', 'Lead source tracking: WhatsApp, web chat, widget', 'Campaign attribution per booking', 'Source breakdown in analytics'],
      },
    ],
  },
  {
    id: 'automation',
    title: 'Automation & Reminders',
    subtitle: 'Set it once. Let Booklyft handle the rest.',
    cards: [
      {
        icon: '🔔',
        title: '24-Hour Pre-Appointment Reminder',
        badge: 'pro',
        desc: 'The day before every appointment, Booklyft sends a reminder to the customer on WhatsApp automatically.',
        detail: ['Sent automatically 24 hours before', 'Includes appointment details and staff name', 'No action needed from you', 'Configurable per business'],
      },
      {
        icon: '⏱️',
        title: '2-Hour Confirmation Reminder',
        badge: 'pro',
        desc: 'Two hours before the appointment, customers get a confirmation prompt. They confirm or cancel — you always know.',
        detail: ['Sent 2 hours before the appointment', 'Customer can confirm or cancel via WhatsApp reply', 'Reduces last-minute no-shows', 'Updates appointment status in real time'],
      },
      {
        icon: '❌',
        title: 'Auto-Cancel Unconfirmed Appointments',
        badge: 'pro',
        desc: 'If a customer doesn\'t confirm their appointment, Booklyft cancels it automatically — freeing up the slot.',
        detail: ['Auto-cancels if no confirmation received', 'Configurable cancellation window', 'Slot becomes available instantly for new bookings', 'Customer is notified on cancellation'],
      },
      {
        icon: '🚫',
        title: 'No-Show Management',
        desc: 'Track and manage no-shows with configurable policies. Flag repeat no-shows and protect your schedule.',
        detail: ['Mark appointments as no-show from dashboard', 'No-show rate tracked in analytics', 'Configurable no-show policy per business', 'Auto-cancellation rules for repeat offenders'],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    subtitle: 'Know your numbers. Make better decisions.',
    cards: [
      {
        icon: '📊',
        title: 'Dashboard KPIs',
        desc: 'The moment you open Booklyft, you see what matters — bookings, revenue, no-shows, and repeat customer rate.',
        detail: ['Total bookings: today, this month, all-time', 'Revenue based on service pricing', 'Repeat customer percentage', 'Booking volume trends'],
      },
      {
        icon: '❌',
        title: 'No-Show & Cancellation Tracking',
        badge: 'business',
        desc: 'See your no-show rate over time and understand where appointments are being lost.',
        detail: ['No-show rate trends over time', 'Auto-cancellation metrics', 'Per-staff no-show breakdown (Business plan)', 'Helps you optimize your reminder strategy'],
      },
      {
        icon: '⚠️',
        title: 'At-Risk Customer Alerts',
        badge: 'business',
        desc: 'Booklyft flags customers who haven\'t returned in a while so you can proactively reach out before you lose them.',
        detail: ['Automatic at-risk customer detection', 'Highlighted in the dashboard', 'Re-engage with a targeted campaign', 'Configurable inactivity threshold'],
      },
      {
        icon: '🔽',
        title: 'Lead Funnel Analytics',
        badge: 'pro',
        desc: 'See the full customer journey — from first message to booked appointment — and find where you\'re losing people.',
        detail: ['Lead volume and conversion rate', 'Dropped lead tracking', 'Funnel timeline: 7, 30, or 90-day views', 'Campaign performance attribution'],
      },
      {
        icon: '💰',
        title: 'Revenue Tracking',
        badge: 'pro',
        desc: 'Booklyft calculates estimated revenue from completed appointments based on your service pricing. No spreadsheet needed.',
        detail: ['Revenue by day, month, and all-time', 'Based on completed appointments and service price', 'Trends over time', 'Available on Pro and Business plans'],
      },
    ],
  },
];

function PlanBadge({ type }) {
  if (type === 'pro') {
    return (
      <span className="absolute right-4 top-4 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800">
        Pro
      </span>
    );
  }
  if (type === 'business') {
    return (
      <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
        Business
      </span>
    );
  }
  return null;
}

function FeatureCard({ icon, title, desc, detail, badge }) {
  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7">
      <PlanBadge type={badge} />
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className={`mb-2.5 text-lg font-semibold tracking-tight text-slate-900 md:text-xl ${badge ? 'pr-16' : ''}`}>{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">{desc}</p>
      <ul className="mt-auto flex flex-col gap-3 p-0 [list-style:none]">
        {detail.map((d, j) => (
          <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
            <span className="mt-0.5 flex-shrink-0 font-semibold text-emerald-600">✓</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Features() {
  const [activeSection, setActiveSection] = useState('ai-assistant');

  const updateActiveFromScroll = useCallback(() => {
    const marker = window.scrollY + 64 + 52 + 8;
    let current = NAV_LINKS[0].id;
    for (const { id } of NAV_LINKS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) current = id;
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    updateActiveFromScroll();
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    window.addEventListener('resize', updateActiveFromScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateActiveFromScroll);
      window.removeEventListener('resize', updateActiveFromScroll);
    };
  }, [updateActiveFromScroll]);

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      <Navbar />

      <section className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-20">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Features</div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white">Everything you need to book, retain, and grow</h1>
          <p className="mb-8 text-lg leading-relaxed text-slate-400">
            From AI booking to WhatsApp campaigns, automated reminders, and revenue analytics — Booklyft is the complete growth platform for salons, clinics, and small businesses.
          </p>
          <Button asChild className="inline-flex rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Link to="/demo">Request Demo →</Link>
          </Button>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-[1120px] overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <nav className="flex min-w-max gap-2 px-4 py-3 md:px-6 md:justify-center" aria-label="Features sections">
            {NAV_LINKS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition md:px-4 ${
                  activeSection === id
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {FEATURE_SECTIONS.map((section, si) => (
        <section
          key={section.id}
          id={section.id}
          className={`scroll-mt-32 px-6 py-16 md:py-20 ${si % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'}`}
        >
          <div className="mx-auto max-w-[1120px]">
            <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-slate-900 md:text-left md:text-3xl">{section.title}</h2>
            <p className="mb-10 text-center text-sm text-slate-500 md:text-left md:text-base">{section.subtitle}</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.cards.map((card, ci) => (
                <FeatureCard key={`${section.id}-${ci}`} {...card} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <h2 className="mb-3 text-4xl font-bold tracking-tight text-white">Ready to get started?</h2>
          <p className="mb-8 text-base text-slate-400">Tell us about your business — we&apos;ll follow up with a walkthrough.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-700">
              <Link to="/demo">Request Demo →</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
