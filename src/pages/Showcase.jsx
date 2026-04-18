import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bell,
  Megaphone,
  LayoutDashboard,
  CheckCircle2,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShowcaseWhatsAppDemo } from "@/components/showcase/ShowcaseWhatsAppDemo";

const DEFAULT_SCENE_MS = 3000;
/** Longer so the slower WhatsApp demo can complete at least one full loop. */
const WHATSAPP_SCENE_MS = 12000;

const SCENES = [
  { id: "intro", label: "Intro", durationMs: DEFAULT_SCENE_MS },
  { id: "problem", label: "Problem", durationMs: DEFAULT_SCENE_MS },
  { id: "solution", label: "Solution", durationMs: DEFAULT_SCENE_MS },
  { id: "whatsapp", label: "WhatsApp", durationMs: WHATSAPP_SCENE_MS },
  { id: "reminders", label: "Reminders", durationMs: DEFAULT_SCENE_MS },
  { id: "campaigns", label: "Campaigns", durationMs: DEFAULT_SCENE_MS },
  { id: "dashboard", label: "Dashboard", durationMs: DEFAULT_SCENE_MS },
  { id: "cta", label: "CTA", durationMs: DEFAULT_SCENE_MS },
];

const SCENE_BG = {
  intro: "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
  problem: "bg-slate-100",
  solution: "bg-white",
  whatsapp: "bg-gradient-to-b from-emerald-950 to-slate-950",
  reminders: "bg-slate-50",
  campaigns: "bg-slate-900",
  dashboard: "bg-gradient-to-br from-slate-800 to-slate-950",
  cta: "bg-slate-950",
};

export default function Showcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [loopGen, setLoopGen] = useState(0);
  const advanceRef = useRef(null);

  const scene = SCENES[index];
  const total = SCENES.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => {
      const n = (i + 1) % total;
      if (n === 0) setLoopGen((g) => g + 1);
      return n;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused) return undefined;
    clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(goNext, scene.durationMs);
    return () => clearTimeout(advanceRef.current);
  }, [index, paused, scene.durationMs, goNext]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden bg-slate-950 text-slate-100 antialiased">
      <header className="relative z-20 flex shrink-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div
          className="mx-auto flex h-12 w-full max-w-[1120px] items-center justify-between px-6 pt-[env(safe-area-inset-top,0px)]"
          style={{ minHeight: "calc(3rem + env(safe-area-inset-top, 0px))" }}
        >
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-white/90 transition hover:text-white"
          >
            ← Booklyft
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90 transition hover:bg-white/10"
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-400"
            >
              <Link to="/demo">Get demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <div
        className="relative min-h-0 flex-1"
        role="region"
        aria-roledescription="carousel"
        aria-label="Product showcase"
      >
        <p className="sr-only" aria-live="polite">
          Scene {index + 1} of {total}: {scene.label}
          {paused ? " — paused" : ""}
        </p>

        {SCENES.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 flex flex-col overflow-hidden transition-opacity duration-700 ease-out",
              SCENE_BG[s.id],
              i === index ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            )}
            aria-hidden={i !== index}
          >
            {s.id === "intro" ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-[80px]" />
                <div className="absolute -left-16 bottom-40 h-56 w-56 rounded-full bg-teal-500/10 blur-[70px]" />
              </div>
            ) : null}
            {s.id === "whatsapp" ? (
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.25),transparent)]" />
            ) : null}

            {i === index ? (
              <div
                key={`${s.id}-${loopGen}`}
                className={cn(
                  "relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8",
                  !reduceMotion && "showcase-scene-layer"
                )}
              >
                <SceneBody sceneId={s.id} />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <footer className="relative z-20 shrink-0 border-t border-white/5 bg-slate-950/90 px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto max-w-[1120px]">
          <div
            className="mb-3 flex justify-center gap-1.5 sm:gap-2"
            role="tablist"
            aria-label="Showcase scenes"
          >
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.label}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index
                    ? "w-6 bg-emerald-400"
                    : "w-2 bg-white/25 hover:bg-white/40"
                )}
              />
            ))}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              key={`${index}-${loopGen}`}
              className={cn(
                "h-full bg-gradient-to-r from-emerald-500 to-teal-400",
                !reduceMotion && !paused && "showcase-progress-fill w-full",
                reduceMotion && "w-full opacity-50"
              )}
              style={
                reduceMotion
                  ? undefined
                  : {
                      animationDuration: `${scene.durationMs}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }
              }
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-500 sm:text-[11px]">
            {reduceMotion
              ? `This scene ${Math.round(scene.durationMs / 1000)}s · tap dots to jump · Space to pause`
              : `This scene ${Math.round(scene.durationMs / 1000)}s · Space to pause · ← → to step · tap dots to jump`}
          </p>
        </div>
      </footer>
    </div>
  );
}

function SceneBody({ sceneId }) {
  switch (sceneId) {
    case "intro":
      return (
        <div className="flex w-full max-w-[1120px] flex-col items-start justify-center text-left">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
            <Sparkles className="h-3.5 w-3.5" />
            Product tour
          </p>
          <h1 className="max-w-[16ch] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Book more.
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Lose fewer.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            AI booking for salons, clinics & small businesses in India — on WhatsApp, your site, and web chat.
          </p>
        </div>
      );
    case "problem":
      return (
        <div className="w-full max-w-[640px] rounded-3xl border border-slate-200/80 bg-white/80 px-6 py-10 shadow-xl backdrop-blur-sm sm:px-10 sm:py-12">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            The problem
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Missed calls become missed revenue.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
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
        </div>
      );
    case "solution":
      return (
        <div className="w-full max-w-[640px] px-2 sm:px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            The fix
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            One AI layer for every booking touchpoint.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Booklyft answers instantly, checks real availability, confirms appointments, and keeps your brand voice.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Real-time slots from your calendar",
              "Works with your services & staff rules",
              "Built for Indian businesses & workflows",
            ].map((text) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <span className="text-sm font-medium text-slate-800">{text}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "whatsapp":
      return (
        <div className="relative z-10 flex w-full max-w-[1120px] flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:gap-14 lg:text-left">
          <div className="max-w-md flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/90">
              Omnichannel
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Booking on WhatsApp — like production.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Service → time slots → confirmation. Same flow your customers get live.
            </p>
          </div>
          <div className="flex shrink-0 justify-center">
            <ShowcaseWhatsAppDemo
              controlled
              active
              playback="showcase"
              caption
              chatHeightClass="h-[260px]"
            />
          </div>
        </div>
      );
    case "reminders":
      return (
        <div className="w-full max-w-[640px] rounded-3xl border border-amber-200/60 bg-white/90 px-6 py-10 text-slate-900 shadow-xl backdrop-blur-sm sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Bell className="h-7 w-7" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800/90">
                No-shows
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Automatic reminders that actually get seen.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-700">
                Timely nudges over WhatsApp so customers remember — and you keep slots full without chasing manually.
              </p>
            </div>
          </div>
        </div>
      );
    case "campaigns":
      return (
        <div className="w-full max-w-[640px] rounded-3xl border border-violet-500/25 bg-slate-800/80 px-6 py-10 text-white shadow-xl backdrop-blur-sm sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
              <Megaphone className="h-7 w-7" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-300/90">
                Growth
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Bring back leads that didn’t convert.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-400">
                Campaigns and retargeting re-engage dropped conversations — turn interest into booked appointments.
              </p>
            </div>
          </div>
        </div>
      );
    case "dashboard":
      return (
        <div className="w-full max-w-[640px] rounded-3xl border border-white/10 bg-slate-900/50 px-6 py-10 text-white shadow-xl backdrop-blur-sm sm:px-10 sm:py-12">
          <div className="flex flex-col gap-6">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Control
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                One dashboard. Full picture.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-400">
                Appointments, customers, services, staff, and campaigns — organized so your team runs on data.
              </p>
            </div>
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="w-full max-w-[1120px] rounded-3xl border border-emerald-400/35 bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-900 px-6 py-10 text-center shadow-2xl sm:px-12 sm:py-14">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 text-center sm:gap-4">
            {[
              { k: "24/7", l: "AI coverage" },
              { k: "1", l: "Booking inbox" },
              { k: "∞", l: "Channels" },
            ].map(({ k, l }) => (
              <div
                key={l}
                className="rounded-2xl border border-white/15 bg-white/10 px-2 py-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-white sm:text-3xl">{k}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/90 sm:text-xs">
                  {l}
                </div>
              </div>
            ))}
          </div>
          <h2 className="mx-auto mt-10 max-w-xl text-2xl font-bold leading-tight text-white sm:text-4xl">
            Ready to see it on your business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-emerald-50/95">
            Get a personal walkthrough — WhatsApp, widget, and dashboard with zero obligation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              className="h-12 rounded-full text-white/95 hover:bg-white/10 hover:text-white"
            >
              <Link to="/features">Explore features</Link>
            </Button>
          </div>
        </div>
      );
    default:
      return null;
  }
}
