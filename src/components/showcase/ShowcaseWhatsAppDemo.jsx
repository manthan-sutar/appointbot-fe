import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { ChevronLeft, MoreVertical, Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mirrors real bot flow: date/time → service list → combo → name → YES → confirmed (short copy). */
const STEPS_NORMAL = [
  { kind: "msg", role: "user", text: "Book tomorrow 10am please" },
  { kind: "pause", ms: 420 },
  { kind: "typing", ms: 1000 },
  {
    kind: "msg",
    role: "bot",
    text:
      "Which service?\n\n1. Beard trim — 20 min\n2. Facial — 60 min\n3. Hair colour — 90 min\n4. Haircut — 30 min\n\nReply number or name.",
  },
  { kind: "pause", ms: 520 },
  { kind: "msg", role: "user", text: "beard trim and facial" },
  { kind: "pause", ms: 400 },
  { kind: "typing", ms: 900 },
  {
    kind: "msg",
    role: "bot",
    text:
      "Beard trim, Facial — great!\n\nWhat name should we put the booking under?",
  },
  { kind: "pause", ms: 480 },
  { kind: "msg", role: "user", text: "Manthan sutar" },
  { kind: "pause", ms: 380 },
  { kind: "typing", ms: 1100 },
  {
    kind: "msg",
    role: "bot",
    text:
      "Please confirm:\nBeard trim, Facial · Priya\nMon 20 Apr · 10:00 AM\nName: Manthan sutar · ₹1,498\n\nReply YES or NO.",
  },
  { kind: "pause", ms: 520 },
  { kind: "msg", role: "user", text: "YES" },
  { kind: "pause", ms: 380 },
  { kind: "typing", ms: 1000 },
  {
    kind: "msg",
    role: "bot",
    text:
      "✅ Booking confirmed! Ref #24\nMon 20 Apr · 10:00 AM\nReminder ~1h before.\nSee you! 😊",
  },
  { kind: "pause", ms: 3000 },
];

/** Same story, tuned for the timed reel (slightly tighter gaps). */
const STEPS_SHOWCASE = [
  { kind: "msg", role: "user", text: "Book tomorrow 10am please" },
  { kind: "pause", ms: 320 },
  { kind: "typing", ms: 780 },
  {
    kind: "msg",
    role: "bot",
    text:
      "Which service?\n\n1. Beard trim — 20 min\n2. Facial — 60 min\n3. Hair colour — 90 min\n4. Haircut — 30 min\n\nReply number or name.",
  },
  { kind: "pause", ms: 420 },
  { kind: "msg", role: "user", text: "beard trim and facial" },
  { kind: "pause", ms: 320 },
  { kind: "typing", ms: 720 },
  {
    kind: "msg",
    role: "bot",
    text:
      "Beard trim, Facial — great!\n\nWhat name should we put the booking under?",
  },
  { kind: "pause", ms: 380 },
  { kind: "msg", role: "user", text: "Manthan sutar" },
  { kind: "pause", ms: 280 },
  { kind: "typing", ms: 880 },
  {
    kind: "msg",
    role: "bot",
    text:
      "Please confirm:\nBeard trim, Facial · Priya\nMon 20 Apr · 10:00 AM\nName: Manthan sutar · ₹1,498\n\nReply YES or NO.",
  },
  { kind: "pause", ms: 440 },
  { kind: "msg", role: "user", text: "YES" },
  { kind: "pause", ms: 280 },
  { kind: "typing", ms: 820 },
  {
    kind: "msg",
    role: "bot",
    text:
      "✅ Booking confirmed! Ref #24\nMon 20 Apr · 10:00 AM\nReminder ~1h before.\nSee you! 😊",
  },
  { kind: "pause", ms: 2000 },
];

/** Must match `delayAfterMessageMs` for `playback === "showcase"` in `runScript`. */
const SHOWCASE_DELAY_AFTER_MSG_MS = 460;

/**
 * Wall-clock time for one full STEPS_SHOWCASE run until the script completes (before internal loop restart).
 * Used by the marketing carousel intro slide: duration + post-animation pause → next scene.
 */
export function getShowcaseScriptDurationMs() {
  let t = 0;
  for (const step of STEPS_SHOWCASE) {
    if (step.kind === "msg") t += SHOWCASE_DELAY_AFTER_MSG_MS;
    else if (step.kind === "pause" || step.kind === "typing") t += step.ms;
  }
  return t;
}

function TypingDots() {
  return (
    <div className="flex gap-1 px-1 py-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-pulse rounded-full bg-slate-400/90"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * @param {object} props
 * @param {string} [props.playback] - `normal` (default) | `showcase` (faster, for timed reel)
 * @param {boolean} [props.controlled] - If true, use `active` instead of IntersectionObserver
 * @param {boolean} [props.active] - When controlled: run script while true
 * @param {number} [props.restartKey] - Bump to restart the script (e.g. when scene re-enters)
 * @param {string} [props.chatHeightClass] - Tailwind height for chat area (reel uses shorter)
 */
export function ShowcaseWhatsAppDemo({
  className,
  playback = "normal",
  controlled = false,
  active = true,
  restartKey = 0,
  chatHeightClass = "h-[min(380px,52vh)]",
}) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const messageIdRef = useRef(0);
  const runGenRef = useRef(0);
  const runScriptRef = useRef(() => {});
  const [visible, setVisible] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingSeq, setTypingSeq] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timersRef = useRef([]);

  /** Showcase reel should always play one message at a time (never dump all bubbles). */
  const showAllAtOnce = reduceMotion && playback !== "showcase";
  /** CSS bubble animations: on for normal; for showcase ignore OS reduced-motion so the demo reads in marketing. */
  const bubbleAnimate = !reduceMotion || playback === "showcase";

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visible, typing]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const runScript = useCallback(() => {
    clearTimers();
    const gen = ++runGenRef.current;
    messageIdRef.current = 0;
    setVisible([]);
    setTyping(false);

    const script = playback === "showcase" ? STEPS_SHOWCASE : STEPS_NORMAL;

    if (showAllAtOnce) {
      const msgs = script
        .filter((s) => s.kind === "msg")
        .map((s) => ({
          id: ++messageIdRef.current,
          role: s.role,
          text: s.text,
        }));
      setVisible(msgs);
      return;
    }

    /** Wait after each bubble so layout + CSS animation (~420ms) complete before the next step. */
    const delayAfterMessageMs =
      playback === "showcase" ? SHOWCASE_DELAY_AFTER_MSG_MS : 48;

    const push = (fn, ms) => {
      const id = setTimeout(() => {
        if (gen !== runGenRef.current) return;
        fn();
      }, ms);
      timersRef.current.push(id);
    };

    let i = 0;
    const tick = () => {
      if (gen !== runGenRef.current) return;
      if (i >= script.length) {
        if (playback === "showcase") {
          push(() => runScriptRef.current(), 1000);
        } else {
          push(() => runScriptRef.current(), 800);
        }
        return;
      }
      const step = script[i];
      i += 1;

      if (step.kind === "pause") {
        push(tick, step.ms);
        return;
      }
      if (step.kind === "typing") {
        setTypingSeq((s) => s + 1);
        setTyping(true);
        push(() => {
          if (gen !== runGenRef.current) return;
          setTyping(false);
          tick();
        }, step.ms);
        return;
      }
      if (step.kind === "msg") {
        setVisible((v) => [
          ...v,
          {
            id: ++messageIdRef.current,
            role: step.role,
            text: step.text,
          },
        ]);
        push(tick, delayAfterMessageMs);
      }
    };

    tick();
  }, [clearTimers, showAllAtOnce, playback]);

  useEffect(() => {
    runScriptRef.current = runScript;
  }, [runScript]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (controlled) {
      if (active) runScript();
      else {
        clearTimers();
        setVisible([]);
        setTyping(false);
      }
      return () => clearTimers();
    }

    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) runScript();
        else {
          clearTimers();
          setVisible([]);
          setTyping(false);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimers();
    };
  }, [controlled, active, clearTimers, runScript, restartKey]);

  return (
    <div
      ref={rootRef}
      className={cn("w-full max-w-[320px]", className)}
      aria-hidden="true"
    >
      <p className="sr-only">
        Animated demo: customer asks to book, picks services, gives a name,
        confirms with YES, and receives a booking confirmation on WhatsApp.
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/40 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3 text-white">
          <ChevronLeft className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2.5} />
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold leading-none">
              BL
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold leading-tight">
                Booklyft Demo Salon
              </div>
              <div className="text-[11px] text-emerald-100/90">online</div>
            </div>
          </div>
          <Video className="h-5 w-5 shrink-0 opacity-90" />
          <Phone className="h-5 w-5 shrink-0 opacity-90" />
          <MoreVertical className="h-5 w-5 shrink-0 opacity-90" />
        </div>

        <div
          ref={scrollRef}
          className={cn(
            "relative overflow-y-auto bg-[#ece5dd] p-3",
            chatHeightClass
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4bc' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="flex min-h-full flex-col justify-end gap-2">
            {visible.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[92%] whitespace-pre-line rounded-lg px-2.5 py-1.5 text-[11px] leading-snug shadow-sm",
                  m.role === "user"
                    ? "ml-auto bg-[#dcf8c6] text-slate-900"
                    : "mr-auto bg-white text-slate-900",
                  bubbleAnimate &&
                    (m.role === "user"
                      ? "origin-bottom-right animate-wa-msg-user-in"
                      : "origin-bottom-left animate-wa-msg-bot-in")
                )}
              >
                {m.text.split("\n").map((line, li) => (
                  <span key={li}>
                    {li > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </div>
            ))}
            {typing ? (
              <div
                key={`typing-${typingSeq}`}
                className={cn(
                  "mr-auto flex origin-bottom-left items-center rounded-xl bg-white px-3 py-2 shadow-sm",
                  bubbleAnimate && "animate-wa-typing-in"
                )}
              >
                <TypingDots />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
