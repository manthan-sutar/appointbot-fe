import { useState, Fragment, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { value: "salon", label: "💇 Salon / Spa", desc: "Hair, beauty, wellness" },
  {
    value: "doctor",
    label: "🩺 Doctor / Clinic",
    desc: "Medical consultations",
  },
  { value: "dentist", label: "🦷 Dentist", desc: "Dental care" },
  { value: "tutor", label: "📚 Tutor / Coach", desc: "Education & coaching" },
  {
    value: "other",
    label: "🏢 Other Business",
    desc: "Any appointment-based service",
  },
];

const DEFAULT_SERVICES = {
  salon: [
    { name: "Haircut", duration_minutes: 30, price: "" },
    { name: "Hair Colour", duration_minutes: 90, price: "" },
  ],
  doctor: [{ name: "General Consultation", duration_minutes: 20, price: "" }],
  dentist: [{ name: "Checkup & Cleaning", duration_minutes: 45, price: "" }],
  tutor: [{ name: "1-on-1 Session", duration_minutes: 60, price: "" }],
  other: [{ name: "Appointment", duration_minutes: 30, price: "" }],
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STEP_META = [
  {
    label: "Business details",
    icon: "🏢",
    tip: "Tell us about your business — name, type, and contact.",
  },
  {
    label: "Services",
    icon: "📋",
    tip: "Add the services you offer. You can always edit these later.",
  },
  {
    label: "Team & hours",
    icon: "👥",
    tip: "Add your team and set business working hours (same for everyone).",
  },
  {
    label: "Connect WhatsApp",
    icon: "💬",
    tip: "Link your WhatsApp Business number so customers can book via chat.",
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Onboarding() {
  const { owner, setOwner } = useAuth();
  // Steps 1–3 are temporary (no API). Save happens only at end of step 3. If user already has a business, start at step 4 (WhatsApp).
  const [step, setStep] = useState(owner?.businessId ? 4 : 1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [bizForm, setBizForm] = useState({
    name: "",
    type: "",
    phone: "",
    timezone: "Asia/Kolkata",
  });
  const [services, setServices] = useState(
    owner?.businessId
      ? DEFAULT_SERVICES.other
      : [{ name: "", duration_minutes: 30, price: "" }],
  );
  const [staff, setStaff] = useState([{ name: "", role: "" }]);
  // Business hours: per-day open/close + optional lunch (same for all staff). 0=Sun … 6=Sat
  const [businessHours, setBusinessHours] = useState(() =>
    [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      day: d,
      enabled: d >= 1 && d <= 5, // Mon–Fri
      open: "09:00",
      close: "18:00",
      lunchStart: "",
      lunchEnd: "",
    }))
  );
  // "Apply to all days" quick-set values
  const [applyAllHours, setApplyAllHours] = useState({
    open: "09:00",
    close: "18:00",
    lunchStart: "",
    lunchEnd: "",
  });
  const [business, setBusiness] = useState(
    owner?.businessId ? { id: owner.businessId, slug: owner.slug } : null,
  );

  // WhatsApp step state
  const [waConnecting, setWaConnecting] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [metaFeeOpen, setMetaFeeOpen] = useState(false);
  const navigate = useNavigate();

  const TOTAL_STEPS = 4;

  // When on step 4, check if WhatsApp is already connected
  useEffect(() => {
    if (step !== 4 || !business?.id) return;
    let cancelled = false;
    api
      .get("/business/whatsapp")
      .then(({ data }) => {
        if (cancelled) return;
        const wa = data?.whatsapp;
        const connected =
          wa?.status === "connected" || !!wa?.phoneNumberId || !!wa?.hasAccessToken;
        setWaConnected(!!connected);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [step, business?.id]);

  // Listen for success from WhatsApp connect popup
  useEffect(() => {
    function onMessage(e) {
      if (e?.data?.type === "whatsapp-connected") setWaConnected(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const chatUrl = business?.slug
    ? `${window.location.origin}/chat/${business.slug}`
    : "";

  // ── Step 1: Business (temporary — no API) ───────────────────────────────────
  function submitStep1(e) {
    e.preventDefault();
    setError("");
    if (!bizForm.type) return setError("Please select a business type");
    if (!bizForm.name.trim()) return setError("Please enter a business name");
    // Prefill suggested services for step 2
    setServices(DEFAULT_SERVICES[bizForm.type] || DEFAULT_SERVICES.other);
    setStep(2);
  }

  // ── Step 2: Services (temporary — no API) ──────────────────────────────────
  function submitStep2Services(e) {
    e.preventDefault();
    setError("");
    const withName = services.filter((s) => s.name.trim());
    if (withName.length === 0)
      return setError("Add at least one service with a name");
    setStep(3);
  }

  // ── Step 3: Staff + Hours — "Continue and Save" persists everything ─────────
  async function submitStep3(e) {
    e.preventDefault();
    setError("");
    const staffWithName = staff.filter((s) => s.name.trim());
    if (staffWithName.length === 0)
      return setError("Add at least one staff member with a name");
    setLoading(true);
    try {
      // 1. Create business (first time only)
      const { data } = await api.post("/business/onboard", bizForm);
      setBusiness(data.business);
      if (data.token) localStorage.setItem("token", data.token);
      const updatedOwner = {
        ...owner,
        businessId: data.business.id,
        slug: data.business.slug,
        onboarded: true,
      };
      setOwner(updatedOwner);
      localStorage.setItem("owner", JSON.stringify(updatedOwner));

      // 2. Save services
      for (const svc of services.filter((s) => s.name.trim())) {
        await api.post("/business/services", svc);
      }

      // 3. Save staff and default working hours
      const created = [];
      for (const s of staffWithName) {
        const { data: staffData } = await api.post("/business/staff", s);
        created.push(staffData.staff);
      }
      // Build slots: per-day open/close; lunch break splits a day into two slots
      const slots = [];
      for (const day of businessHours) {
        if (!day.enabled) continue;
        const open = day.open || "09:00";
        const close = day.close || "18:00";
        const hasLunch =
          day.lunchStart?.trim() && day.lunchEnd?.trim();
        if (hasLunch) {
          slots.push({
            day_of_week: day.day,
            start_time: open,
            end_time: day.lunchStart.trim(),
          });
          slots.push({
            day_of_week: day.day,
            start_time: day.lunchEnd.trim(),
            end_time: close,
          });
        } else {
          slots.push({
            day_of_week: day.day,
            start_time: open,
            end_time: close,
          });
        }
      }
      for (const s of created) {
        await api.post("/business/hours", {
          staffId: s.id,
          hours: slots,
        });
      }

      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 4: WhatsApp ───────────────────────────────────────────────────────
  async function startWaConnect() {
    if (!business?.id) {
      setError(
        "Please complete the previous steps before connecting WhatsApp.",
      );
      return;
    }
    setError("");
    setWaConnecting(true);
    try {
      const { data } = await api.get("/whatsapp-connect/start", {
        params: { origin: window.location.origin },
      });
      if (data.url) {
        const w = 560;
        const h = 620;
        const left = Math.round((window.screen.width - w) / 2);
        const top = Math.round((window.screen.height - h) / 2);
        window.open(
          data.url,
          "whatsapp-connect",
          `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
      } else {
        setError(
          "WhatsApp connect URL not available. Please check Settings → WhatsApp later.",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to start WhatsApp connect. You can also complete setup later from Settings → WhatsApp.",
      );
    } finally {
      setWaConnecting(false);
    }
  }

  function goToSuccess() {
    setStep(6); // success screen
  }

  function copyUrl() {
    navigator.clipboard.writeText(chatUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const TIMEZONES = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Europe/Paris", label: "Europe/Paris (CET)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  ];

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 6) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6 onb-page-enter"
        style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #0f172a, #1e293b)" }}
      >
        <Card className="max-w-md w-full text-center onb-success-enter" style={{ backgroundColor: "#fff", color: "#0f172a" }}>
          <CardHeader>
            <div className="text-5xl mb-4 onb-success-icon">🎉</div>
            <CardTitle className="text-2xl">You're all set!</CardTitle>
            <CardDescription>
              Your AI booking bot is live. Share the link below with your
              customers and they can start booking instantly via WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <code className="flex-1 text-sm truncate text-left">{chatUrl}</code>
              <Button variant="secondary" size="sm" onClick={copyUrl}>
                {copied ? "✓ Copied!" : "Copy"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={chatUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                💬 Open Chat UI
              </a>
              <Link
                to="/dashboard/"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Go to Dashboard →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              You can update your services, staff, and hours anytime from the
              dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="onb-page-enter flex min-h-screen items-start justify-center bg-slate-50 p-4 sm:p-6 md:p-8">
      <Card className="onb-page-enter w-full max-w-2xl overflow-hidden border-0 bg-white shadow-sm sm:rounded-xl">
        <CardHeader className="space-y-6 border-b-0 px-5 pt-5 sm:px-8 sm:pt-8">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 font-semibold text-foreground no-underline"
          >
            <span className="text-xl">📅</span>
            <span>appointbot</span>
          </Link>

          {/* Stepper: circle–connector–circle–connector–circle–connector–circle (3 equal connectors) */}
          <div className="w-full">
            <div className="flex items-center">
              {STEP_META.map((meta, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                const connectorAfterDone = i < STEP_META.length - 1 && step > stepNum;
                return (
                  <Fragment key={stepNum}>
                    <div
                      className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                        isActive && "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2",
                        isDone && "bg-emerald-500 text-white",
                        !isActive && !isDone && "bg-slate-200 text-slate-500"
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {isDone ? "✓" : stepNum}
                    </div>
                    {i < STEP_META.length - 1 && (
                      <div
                        className={cn(
                          "mx-0.5 h-0.5 min-w-[12px] flex-1 rounded-full sm:mx-1",
                          connectorAfterDone ? "bg-emerald-500" : "bg-slate-200"
                        )}
                        aria-hidden
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
            <div className="mt-3 flex">
              {STEP_META.map((meta, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 text-center text-[11px] font-medium sm:text-xs",
                    step === i + 1 && "text-slate-900",
                    step > i + 1 && "text-slate-500",
                    step < i + 1 && "text-slate-400"
                  )}
                >
                  {meta.label}
                </span>
              ))}
            </div>
          </div>

          {/* Step title block — no border; spacing via padding */}
          <div className="flex items-start gap-4 pb-2">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">
              {STEP_META[step - 1]?.icon}
            </span>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {STEP_META[step - 1]?.label}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {STEP_META[step - 1]?.tip}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div key={step} className="onb-step-enter space-y-6">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <form onSubmit={submitStep1} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <Label htmlFor="biz-name">Business Name *</Label>
                  <Input
                    id="biz-name"
                    placeholder="e.g. Priya's Salon"
                    value={bizForm.name}
                    onChange={(e) =>
                      setBizForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                  {bizForm.name && (
                    <p className="text-xs text-primary font-medium">
                      Your chat URL:{" "}
                      <code className="bg-primary/10 px-1.5 py-0.5 rounded">
                        {window.location.origin}/chat/{slugify(bizForm.name)}
                      </code>
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Business Type *</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                    {BUSINESS_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        className={cn(
                          "rounded-lg border p-3 text-left transition-colors",
                          bizForm.type === t.value
                            ? "border-primary bg-primary/10 ring-2 ring-primary"
                            : "border-border hover:bg-muted/50"
                        )}
                        onClick={() => {
                          setBizForm((f) => ({ ...f, type: t.value }));
                          setServices(
                            DEFAULT_SERVICES[t.value] || DEFAULT_SERVICES.other
                          );
                        }}
                      >
                        <div className="font-medium text-sm">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biz-phone">Business contact number *</Label>
                  <Input
                    id="biz-phone"
                    placeholder="+91XXXXXXXXXX"
                    value={bizForm.phone}
                    onChange={(e) =>
                      setBizForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    For our records so we can reach you.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biz-timezone">Timezone</Label>
                  <select
                    id="biz-timezone"
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={bizForm.timezone}
                    onChange={(e) =>
                      setBizForm((f) => ({ ...f, timezone: e.target.value }))
                    }
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <Button type="submit">Continue →</Button>
                </div>
              </form>
            )}

            {/* ── Step 2: Services ── */}
            {step === 2 && (
              <form onSubmit={submitStep2Services} className="flex flex-col gap-6">
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
                  ✨ Suggested services for your business type — edit or add more
                </p>
                <div className="space-y-3">
                  {services.map((svc, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <Input
                        className="flex-1 min-w-[140px]"
                        placeholder="Service name"
                        value={svc.name}
                        onChange={(e) =>
                          setServices((sv) =>
                            sv.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x
                            )
                          )
                        }
                      />
                      <Input
                        className="w-20"
                        type="number"
                        placeholder="Mins"
                        value={svc.duration_minutes}
                        onChange={(e) =>
                          setServices((sv) =>
                            sv.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    duration_minutes:
                                      parseInt(e.target.value) || 30,
                                  }
                                : x
                            )
                          )
                        }
                      />
                      <Input
                        className="w-24"
                        type="number"
                        placeholder="Price (₹)"
                        value={svc.price}
                        onChange={(e) =>
                          setServices((sv) =>
                            sv.map((x, j) =>
                              j === i ? { ...x, price: e.target.value } : x
                            )
                          )
                        }
                      />
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setServices((sv) => sv.filter((_, j) => j !== i))
                          }
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setServices((sv) => [
                      ...sv,
                      { name: "", duration_minutes: 30, price: "" },
                    ])
                  }
                >
                  + Add Service
                </Button>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <div className="pt-2">
                    <Button type="submit">Continue →</Button>
                  </div>
                </div>
              </form>
            )}

            {/* ── Step 3: Staff ── */}
            {step === 3 && (
              <form onSubmit={submitStep3} className="flex flex-col gap-6">
                <div className="space-y-3">
                  {staff.map((member, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <Input
                        className="flex-1 min-w-[140px]"
                        placeholder="Full name"
                        value={member.name}
                        onChange={(e) =>
                          setStaff((st) =>
                            st.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x
                            )
                          )
                        }
                        required={i === 0}
                      />
                      <Input
                        className="flex-1 min-w-[140px]"
                        placeholder="Role (e.g. Senior Stylist)"
                        value={member.role}
                        onChange={(e) =>
                          setStaff((st) =>
                            st.map((x, j) =>
                              j === i ? { ...x, role: e.target.value } : x
                            )
                          )
                        }
                      />
                      {staff.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setStaff((st) => st.filter((_, j) => j !== i))
                          }
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setStaff((st) => [...st, { name: "", role: "" }])
                  }
                >
                  + Add Staff Member
                </Button>

                {/* Business hours: per-day open/close + optional lunch (Google-style), same for everyone */}
                <div className="space-y-4 border-t pt-6">
                  <div>
                    <h4 className="font-medium text-sm">Working hours</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Set open/close and optional lunch break per day. Appointments can&apos;t be booked during lunch. Same schedule applies to everyone.
                    </p>
                  </div>
                  {/* Apply same hours to all days */}
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      Apply to all days:
                    </span>
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      value={applyAllHours.open}
                      onChange={(e) =>
                        setApplyAllHours((a) => ({ ...a, open: e.target.value }))
                      }
                    />
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      value={applyAllHours.close}
                      onChange={(e) =>
                        setApplyAllHours((a) => ({ ...a, close: e.target.value }))
                      }
                    />
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      placeholder="Lunch from"
                      value={applyAllHours.lunchStart}
                      onChange={(e) =>
                        setApplyAllHours((a) => ({
                          ...a,
                          lunchStart: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="time"
                      className="h-8 w-28 text-xs"
                      placeholder="Lunch to"
                      value={applyAllHours.lunchEnd}
                      onChange={(e) =>
                        setApplyAllHours((a) => ({
                          ...a,
                          lunchEnd: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() =>
                        setBusinessHours((prev) =>
                          prev.map((d) => ({
                            ...d,
                            open: applyAllHours.open,
                            close: applyAllHours.close,
                            lunchStart: applyAllHours.lunchStart,
                            lunchEnd: applyAllHours.lunchEnd,
                          }))
                        )
                      }
                    >
                      Apply to all days
                    </Button>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="grid grid-cols-[minmax(3rem,1fr)_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
                      <span>Day</span>
                      <span>Open</span>
                      <span>Close</span>
                      <span>Lunch start</span>
                      <span>Lunch end</span>
                    </div>
                    {businessHours.map((day) => (
                      <div
                        key={day.day}
                        className={cn(
                          "grid grid-cols-[minmax(3rem,1fr)_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 items-center border-b border-border last:border-b-0",
                          !day.enabled && "bg-muted/20 opacity-80"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={cn(
                              "rounded border px-2 py-1 text-xs font-medium transition-colors",
                              day.enabled
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/30 text-muted-foreground"
                            )}
                            onClick={() =>
                              setBusinessHours((prev) =>
                                prev.map((x) =>
                                  x.day === day.day
                                    ? { ...x, enabled: !x.enabled }
                                    : x
                                )
                              )
                            }
                          >
                            {day.enabled ? "Open" : "Closed"}
                          </button>
                          <span className="text-xs font-medium text-foreground w-8">
                            {DAYS[day.day]}
                          </span>
                        </div>
                        <Input
                          type="time"
                          className="h-8 text-xs w-full max-w-[6rem]"
                          value={day.open}
                          onChange={(e) =>
                            setBusinessHours((prev) =>
                              prev.map((x) =>
                                x.day === day.day
                                  ? { ...x, open: e.target.value }
                                  : x
                              )
                            )
                          }
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          className="h-8 text-xs w-full max-w-[6rem]"
                          value={day.close}
                          onChange={(e) =>
                            setBusinessHours((prev) =>
                              prev.map((x) =>
                                x.day === day.day
                                  ? { ...x, close: e.target.value }
                                  : x
                              )
                            )
                          }
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          className="h-8 text-xs w-full max-w-[6rem]"
                          placeholder="—"
                          value={day.lunchStart}
                          onChange={(e) =>
                            setBusinessHours((prev) =>
                              prev.map((x) =>
                                x.day === day.day
                                  ? { ...x, lunchStart: e.target.value }
                                  : x
                              )
                            )
                          }
                          disabled={!day.enabled}
                        />
                        <Input
                          type="time"
                          className="h-8 text-xs w-full max-w-[6rem]"
                          placeholder="—"
                          value={day.lunchEnd}
                          onChange={(e) =>
                            setBusinessHours((prev) =>
                              prev.map((x) =>
                                x.day === day.day
                                  ? { ...x, lunchEnd: e.target.value }
                                  : x
                              )
                            )
                          }
                          disabled={!day.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Your business, services, team, and hours will be saved when you click below. Next step: connect WhatsApp.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    ← Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving…" : "Continue and Save →"}
                  </Button>
                </div>
              </form>
            )}

            {/* ── Step 4: WhatsApp ── */}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                {waConnected ? (
                  <>
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                      <p className="font-medium text-primary">WhatsApp connected</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You&apos;re all set. Head to the dashboard to manage appointments and chat.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={() => navigate("/dashboard")}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Connect your WhatsApp Business number so customers can book via chat. A new window will open to link your number with Meta.
                    </p>

                    {/* ── Meta fee disclosure ── */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 bg-transparent border-0 p-0 text-left font-medium text-slate-700 hover:text-slate-900"
                        onClick={() => setMetaFeeOpen(o => !o)}
                      >
                        <span className="flex items-center gap-2">
                          <span>ℹ️</span>
                          <span>About Meta's WhatsApp fees</span>
                        </span>
                        <span className={`text-slate-400 transition-transform text-xs ${metaFeeOpen ? 'rotate-180' : ''}`}>▾</span>
                      </button>
                      {metaFeeOpen && (
                        <div className="mt-2.5 space-y-1.5 border-t border-blue-200 pt-2.5 text-slate-600 leading-relaxed">
                          <p>
                            <span className="font-medium text-emerald-700">✓ Booking conversations</span> — when customers message you first, the entire chat is <span className="font-medium">free</span>.
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">⚡ Appointment reminders</span> — messages your bot sends outside the chat window (e.g. a reminder the day before) cost <span className="font-medium">~₹0.40 per message</span> (India). This is charged by Meta directly to your WhatsApp Business account.
                          </p>
                          <p className="text-xs text-slate-500">
                            Most businesses pay under ₹100/month in Meta fees.{' '}
                            <a
                              href="https://business.whatsapp.com/products/platform-pricing"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                            >
                              View Meta's pricing →
                            </a>
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="default"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={startWaConnect}
                      disabled={waConnecting}
                    >
                      {waConnecting ? "Opening…" : "Connect to WhatsApp"}
                    </Button>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setStep(3)}>
                        ← Back
                      </Button>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                        onClick={goToSuccess}
                      >
                        Skip for now
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
