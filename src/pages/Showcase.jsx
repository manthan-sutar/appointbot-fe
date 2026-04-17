import { useEffect, useRef, useState, useCallback, createElement } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  Calendar,
  MessageCircle,
  Sparkles,
  Bell,
  Megaphone,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Fade-up when section enters viewport (once). */
function Reveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setShow(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-[650ms] ease-out will-change-transform",
        show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const SECTION_IDS = [
  "hero",
  "problem",
  "solution",
  "channels",
  "reminders",
  "campaigns",
  "dashboard",
  "proof",
  "cta",
];

export default function Showcase() {
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const updateScroll = useCallback(() => {
    const scrollH = document.documentElement.scrollHeight - window.innerHeight;
    const p = scrollH > 0 ? (window.scrollY / scrollH) * 100 : 0;
    setProgress(Math.min(100, Math.max(0, p)));

    const mid = window.scrollY + window.innerHeight * 0.35;
    let best = 0;
    let bestDist = Infinity;
    SECTION_IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const center = r.top + window.scrollY + r.height / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActiveIdx(best);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateScroll, { passive: true });
    const id = requestAnimationFrame(() => updateScroll());
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", updateScroll);
    };
  }, [updateScroll]);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 antialiased">
      {/* Scroll progress */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[3px] bg-slate-800/80"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Minimal sticky header — mobile-first */}
      <header className="fixed left-0 right-0 top-[3px] z-50 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div
          className="mx-auto flex h-12 max-w-lg items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)]"
          style={{ minHeight: "calc(3rem + env(safe-area-inset-top, 0px))" }}
        >
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-white/90 transition hover:text-white"
          >
            ← Booklyft
          </Link>
          <Button
            asChild
            size="sm"
            className="h-9 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-400"
          >
            <Link to="/demo">Get demo</Link>
          </Button>
        </div>
      </header>

      {/* Dot nav — thumb-friendly, mobile */}
      <nav
        className="fixed right-1.5 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1.5 sm:right-3 sm:gap-2"
        aria-label="Section"
      >
        {SECTION_IDS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "block h-2 w-2 rounded-full transition-all duration-300",
              activeIdx === i
                ? "scale-125 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                : "bg-white/25 hover:bg-white/45"
            )}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </nav>

      <main className="snap-y snap-mandatory overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)] pr-7 sm:pr-0">
        {/* 1 — Hero */}
        <section
          id="hero"
          className="relative flex min-h-[100dvh] snap-start snap-always flex-col justify-end bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-5 pb-12 pt-24 sm:justify-center sm:pb-20 sm:pt-28"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-[80px]" />
            <div className="absolute -left-16 bottom-40 h-56 w-56 rounded-full bg-teal-500/10 blur-[70px]" />
          </div>
          <Reveal>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
              <Sparkles className="h-3.5 w-3.5" />
              Product tour
            </p>
            <h1 className="max-w-[18ch] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-[2.75rem]">
              Book more.
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Lose fewer.
              </span>
            </h1>
            <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-slate-400">
              AI booking for salons, clinics & small businesses in India — on WhatsApp, your site, and web chat.
            </p>
            <div className="mt-10 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex animate-bounce items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
                <ArrowDown className="h-3.5 w-3.5" />
                Scroll the story
              </span>
            </div>
          </Reveal>
        </section>

        {/* 2 — Problem */}
        <section
          id="problem"
          className="flex min-h-[100dvh] snap-start snap-always flex-col justify-center bg-slate-100 px-5 py-16 text-slate-900"
        >
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              The problem
            </span>
            <h2 className="mt-3 max-w-[20ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Missed calls become missed revenue.
            </h2>
            <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-slate-600">
              Customers message after hours. Staff juggle DMs and phone tags. No-shows eat your calendar — and dropped leads never come back.
            </p>
            <ul className="mt-8 space-y-3 text-sm font-medium text-slate-700">
              {[
                "Reception can’t answer 24/7",
                "Booking info scattered across channels",
                "Reminders slip — slots go empty",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    ×
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* 3 — Solution */}
        <section
          id="solution"
          className="flex min-h-[100dvh] snap-start snap-always flex-col justify-center bg-white px-5 py-16 text-slate-900"
        >
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              The fix
            </span>
            <h2 className="mt-3 max-w-[22ch] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              One AI layer for every booking touchpoint.
            </h2>
            <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-slate-600">
              Booklyft answers instantly, checks real availability, confirms appointments, and keeps your brand voice — so you focus on service, not inbox triage.
            </p>
            <div className="mt-10 grid gap-3">
              {[
                { icon: CheckCircle2, text: "Real-time slots from your calendar" },
                { icon: CheckCircle2, text: "Works with your services & staff rules" },
                { icon: CheckCircle2, text: "Built for Indian businesses & workflows" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5"
                >
                  {createElement(icon, {
                    className: "mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600",
                  })}
                  <span className="text-sm font-medium text-slate-800">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 4 — Channels */}
        <section
          id="channels"
          className="relative flex min-h-[100dvh] snap-start snap-always flex-col justify-center overflow-hidden bg-gradient-to-b from-emerald-950 to-slate-950 px-5 py-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.25),transparent)]" />
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/90">
              Omnichannel
            </span>
            <h2 className="mt-3 max-w-[20ch] text-3xl font-bold leading-tight text-white sm:text-4xl">
              Meet customers where they already are.
            </h2>
            <div className="mt-10 space-y-4">
              {[
                {
                  icon: MessageCircle,
                  title: "WhatsApp",
                  desc: "Natural chats that book, reschedule, and confirm — no app download.",
                  accent: "from-[#25D366]/20 to-emerald-900/40",
                },
                {
                  icon: Calendar,
                  title: "Website widget",
                  desc: "Embed a chat that knows your services and hours.",
                  accent: "from-teal-500/20 to-slate-900/50",
                },
                {
                  icon: Sparkles,
                  title: "Web chat",
                  desc: "Same brain everywhere — one calendar, zero double-bookings.",
                  accent: "from-cyan-500/15 to-slate-900/50",
                },
              ].map(({ icon, title, desc, accent }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div
                    className={cn(
                      "flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-br p-4 backdrop-blur-sm",
                      accent
                    )}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      {createElement(icon, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 5 — Reminders */}
        <section
          id="reminders"
          className="flex min-h-[100dvh] snap-start snap-always flex-col justify-center bg-slate-50 px-5 py-16 text-slate-900"
        >
          <Reveal>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Bell className="h-7 w-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700/80">
              No-shows
            </span>
            <h2 className="mt-3 max-w-[18ch] text-3xl font-bold leading-tight sm:text-4xl">
              Automatic reminders that actually get seen.
            </h2>
            <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-slate-600">
              Timely nudges over WhatsApp (and more) so customers remember — and you keep slots full without chasing manually.
            </p>
          </Reveal>
        </section>

        {/* 6 — Campaigns */}
        <section
          id="campaigns"
          className="flex min-h-[100dvh] snap-start snap-always flex-col justify-center bg-slate-900 px-5 py-16 text-white"
        >
          <Reveal>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
              <Megaphone className="h-7 w-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-violet-300/90">
              Growth
            </span>
            <h2 className="mt-3 max-w-[20ch] text-3xl font-bold leading-tight sm:text-4xl">
              Bring back leads that didn’t convert.
            </h2>
            <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-slate-400">
              Campaigns and retargeting help you re-engage dropped conversations — turn interest into booked appointments.
            </p>
          </Reveal>
        </section>

        {/* 7 — Dashboard */}
        <section
          id="dashboard"
          className="flex min-h-[100dvh] snap-start snap-always flex-col justify-center bg-gradient-to-br from-slate-800 to-slate-950 px-5 py-16"
        >
          <Reveal>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Control
            </span>
            <h2 className="mt-3 max-w-[20ch] text-3xl font-bold leading-tight text-white sm:text-4xl">
              One dashboard. Full picture.
            </h2>
            <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-slate-400">
              Appointments, customers, services, staff, and campaigns — organized so your team runs on data, not guesswork.
            </p>
          </Reveal>
        </section>

        {/* 8 — Proof */}
        <section
          id="proof"
          className="flex min-h-[100dvh] snap-start snap-always flex-col justify-center bg-white px-5 py-16 text-slate-900"
        >
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Built for operators
            </span>
            <h2 className="mt-3 max-w-[22ch] text-2xl font-bold leading-tight sm:text-3xl">
              Designed for busy front desks & owners who can’t afford another tool to babysit.
            </h2>
            <div className="mt-10 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "24/7", l: "AI coverage" },
                { k: "1", l: "Inbox for bookings" },
                { k: "∞", l: "Channels" },
              ].map(({ k, l }) => (
                <div
                  key={l}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-2 py-5"
                >
                  <div className="text-2xl font-bold text-emerald-600 sm:text-3xl">{k}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 9 — CTA */}
        <section
          id="cta"
          className="relative flex min-h-[100dvh] snap-start snap-always flex-col justify-center overflow-hidden bg-gradient-to-b from-emerald-600 via-teal-600 to-slate-950 px-5 py-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <Reveal>
            <h2 className="max-w-[16ch] text-3xl font-bold leading-tight text-white sm:text-4xl">
              Ready to see it on your business?
            </h2>
            <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-emerald-50/90">
              Get a personal walkthrough — we’ll show you WhatsApp, widget, and dashboard with zero obligation.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-emerald-700 shadow-xl hover:bg-emerald-50"
              >
                <Link to="/demo">Request a demo →</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 rounded-full text-white/90 hover:bg-white/10 hover:text-white"
              >
                <Link to="/features">Explore features</Link>
              </Button>
            </div>
            <p className="mt-10 text-center text-xs text-white/50">
              <Link to="/" className="underline decoration-white/30 underline-offset-4 hover:text-white">
                Back to home
              </Link>
            </p>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
