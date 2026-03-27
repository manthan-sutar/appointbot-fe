import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { cn } from "@/lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TABS = ["Business", "Services", "Staff", "Working Hours", "No-show", "WhatsApp"];
const TAB_QUERY = ["business", "services", "staff", "hours", "no-show", "whatsapp"];
const TAB_FROM_QUERY = { business: 0, services: 1, staff: 2, hours: 3, "no-show": 4, whatsapp: 5 };

// Normalize time from API (e.g. "09:00:00" -> "09:00") for time inputs
function toTimeValue(t) {
  if (!t) return "";
  const s = String(t).trim();
  return s.length > 5 ? s.slice(0, 5) : s;
}

// Convert flat hours from API to per-day config (7 days, open/close/lunch) for one staff
function hoursToStaffConfig(hours, staffId) {
  const byStaff = (hours || []).filter((h) => h.staff_id === staffId);
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const slots = byStaff
      .filter((h) => h.day_of_week === day)
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
    if (slots.length === 0)
      return {
        day,
        enabled: false,
        open: "09:00",
        close: "18:00",
        lunchStart: "",
        lunchEnd: "",
      };
    if (slots.length === 1)
      return {
        day,
        enabled: true,
        open: toTimeValue(slots[0].start_time),
        close: toTimeValue(slots[0].end_time),
        lunchStart: "",
        lunchEnd: "",
      };
    return {
      day,
      enabled: true,
      open: toTimeValue(slots[0].start_time),
      close: toTimeValue(slots[1].end_time),
      lunchStart: toTimeValue(slots[0].end_time),
      lunchEnd: toTimeValue(slots[1].start_time),
    };
  });
}

// Convert per-day config to flat slots for API (one or two slots per day)
function staffConfigToSlots(config) {
  const slots = [];
  for (const day of config) {
    if (!day.enabled) continue;
    const hasLunch =
      day.lunchStart?.trim() && day.lunchEnd?.trim();
    if (hasLunch) {
      slots.push({
        day_of_week: day.day,
        start_time: day.open,
        end_time: day.lunchStart.trim(),
      });
      slots.push({
        day_of_week: day.day,
        start_time: day.lunchEnd.trim(),
        end_time: day.close,
      });
    } else {
      slots.push({
        day_of_week: day.day,
        start_time: day.open,
        end_time: day.close,
      });
    }
  }
  return slots;
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qTab = searchParams.get("tab");
  const initialTab =
    qTab && TAB_FROM_QUERY[qTab] !== undefined ? TAB_FROM_QUERY[qTab] : 0;
  const [tab, setTab] = useState(initialTab);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [hours, setHours] = useState([]);
  // Per-staff, per-day working hours config (7 days: open/close/lunch). Synced from hours for the Working Hours tab.
  const [staffHoursConfig, setStaffHoursConfig] = useState({});
  // "Apply to all days" input values per staff (for Working Hours tab)
  const [applyAllValues, setApplyAllValues] = useState({});
  const [waConfig, setWaConfig] = useState(null);
  const [bookNowCampaign, setBookNowCampaign] = useState("spring_launch");
  const [bookNowUtmSource, setBookNowUtmSource] = useState("instagram");
  const [noShowSettings, setNoShowSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && TAB_FROM_QUERY[t] !== undefined) {
      setTab(TAB_FROM_QUERY[t]);
    }
  }, [searchParams]);

  function selectTab(i) {
    setTab(i);
    setSearchParams({ tab: TAB_QUERY[i] }, { replace: true });
  }

  useEffect(() => {
    Promise.all([
      api.get("/business"),
      api.get("/business/services"),
      api.get("/business/staff"),
      api.get("/business/hours"),
      api.get("/business/whatsapp"),
      api.get("/business/no-show-settings"),
      api.get("/billing/subscription"),
    ])
      .then(([b, sv, st, h, wa, ns, sub]) => {
        setBusiness(b.data.business);
        setServices(sv.data.services);
        setStaff(st.data.staff);
        setHours(h.data.hours);
        setWaConfig(wa.data.whatsapp || null);
        setNoShowSettings(ns.data.noShowSettings || null);
        setSubscription(sub.data.subscription || null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Keep staffHoursConfig in sync with hours (for Working Hours tab)
  useEffect(() => {
    const next = {};
    staff.forEach((m) => {
      next[m.id] = hoursToStaffConfig(hours, m.id);
    });
    setStaffHoursConfig(next);
  }, [hours, staff]);

  // When WhatsApp connect popup signals success, refresh WhatsApp config
  useEffect(() => {
    function onMessage(e) {
      if (e?.data?.type === "whatsapp-connected") {
        api.get("/business/whatsapp").then(({ data }) => {
          setWaConfig(data?.whatsapp || null);
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Billing / upgrade helpers ─────────────────────────────────────────────
  async function startUpgrade(targetPlan) {
    try {
      const { data } = await api.post("/billing/checkout", { plan: targetPlan });
      if (data.provider === "razorpay") {
        if (data.shortUrl) {
          window.location.href = data.shortUrl;
        } else if (data.subscriptionId) {
          window.open(
            `https://dashboard.razorpay.com/app/subscriptions/${data.subscriptionId}`,
            "_blank",
          );
        } else {
          showToast("Payment session created. Please check Razorpay.");
        }
      } else {
        showToast(data.error || "Payments are not configured for this environment.");
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to start upgrade");
    }
  }

  // ── Business tab ──────────────────────────────────────────────────────────
  async function saveBusiness(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/business", {
        name: business.name,
        phone: business.phone,
        timezone: business.timezone,
      });
      setBusiness(data.business);
      showToast("Business info saved!");
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ── Services tab ──────────────────────────────────────────────────────────
  async function addService() {
    try {
      const { data } = await api.post("/business/services", {
        name: "New Service",
        duration_minutes: 30,
      });
      setServices((sv) => [...sv, data.service]);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add service");
    }
  }

  function updateService(id, field, value) {
    setServices((sv) =>
      sv.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function saveService(svc) {
    try {
      await api.put(`/business/services/${svc.id}`, svc);
      showToast("Service saved!");
    } catch {
      showToast("Failed to save service");
    }
  }

  async function deleteService(id) {
    if (!confirm("Remove this service?")) return;
    await api.delete(`/business/services/${id}`);
    setServices((sv) => sv.filter((s) => s.id !== id));
    showToast("Service removed");
  }

  // ── Staff tab ─────────────────────────────────────────────────────────────
  async function addStaff() {
    try {
      const { data } = await api.post("/business/staff", {
        name: "New Staff Member",
      });
      setStaff((st) => [...st, data.staff]);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add staff");
    }
  }

  async function saveStaffMember(member) {
    try {
      await api.put(`/business/staff/${member.id}`, member);
      showToast("Staff saved!");
    } catch {
      showToast("Failed to save staff");
    }
  }

  async function deleteStaff(id) {
    if (!confirm("Remove this staff member?")) return;
    await api.delete(`/business/staff/${id}`);
    setStaff((st) => st.filter((s) => s.id !== id));
    showToast("Staff removed");
  }

  // ── Hours tab ─────────────────────────────────────────────────────────────
  function updateStaffDay(staffId, dayIndex, field, value) {
    setStaffHoursConfig((prev) => {
      const config = prev[staffId] ? [...prev[staffId]] : hoursToStaffConfig(hours, staffId);
      if (!config[dayIndex]) return prev;
      config[dayIndex] = { ...config[dayIndex], [field]: value };
      return { ...prev, [staffId]: config };
    });
  }

  function toggleStaffDay(staffId, dayIndex) {
    setStaffHoursConfig((prev) => {
      const config = prev[staffId] ? [...prev[staffId]] : hoursToStaffConfig(hours, staffId);
      if (!config[dayIndex]) return prev;
      config[dayIndex] = { ...config[dayIndex], enabled: !config[dayIndex].enabled };
      return { ...prev, [staffId]: config };
    });
  }

  function applyAllDaysToStaff(staffId, open, close, lunchStart, lunchEnd) {
    setStaffHoursConfig((prev) => {
      const config = prev[staffId] ? [...prev[staffId]] : hoursToStaffConfig(hours, staffId);
      const next = config.map((d) => ({
        ...d,
        open: open || d.open,
        close: close || d.close,
        lunchStart: lunchStart ?? d.lunchStart,
        lunchEnd: lunchEnd ?? d.lunchEnd,
      }));
      return { ...prev, [staffId]: next };
    });
  }

  async function saveHours(staffId) {
    const config = staffHoursConfig[staffId];
    if (!config) return;
    setSaving(true);
    try {
      const slots = staffConfigToSlots(config);
      await api.post("/business/hours", { staffId, hours: slots });
      const { data } = await api.get("/business/hours");
      setHours(data.hours);
      showToast("Hours saved!");
    } catch {
      showToast("Failed to save hours");
    } finally {
      setSaving(false);
    }
  }

  // ── WhatsApp tab ───────────────────────────────────────────────────────────
  async function startWaConnect() {
    setSaving(true);
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
        showToast("WhatsApp connect URL not available");
      }
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to start WhatsApp connect",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveNoShowSettings(e) {
    e.preventDefault();
    if (!noShowSettings) return;
    setSaving(true);
    try {
      const payload = {
        reminder24hEnabled: !!noShowSettings.reminder_24h_enabled,
        reminder2hEnabled: !!noShowSettings.reminder_2h_enabled,
        autoCancelUnconfirmedEnabled: !!noShowSettings.auto_cancel_unconfirmed_enabled,
        confirmationCutoffMinutes: Number(noShowSettings.confirmation_cutoff_minutes || 90),
      };
      const { data } = await api.put("/business/no-show-settings", payload);
      setNoShowSettings(data.noShowSettings);
      showToast("No-show settings saved!");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save no-show settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-slate-500">
        Loading settings…
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-0 focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1";

  const currentPlan = subscription?.plan || "free";
  const trialActive = subscription?.trialActive;
  const trialDaysLeft = subscription?.trialDaysLeft || 0;
  const waPhone = String(waConfig?.displayPhone || business?.phone || "").replace(/[^0-9]/g, "");
  const bookNowText = `Hi, I want to book an appointment. #src=whatsapp_book_now #cmp=${(bookNowCampaign || "default").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")} #utm=${(bookNowUtmSource || "unknown").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
  const bookNowLink = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(bookNowText)}` : "";
  const widgetScriptTag = business?.slug
    ? `<script async src="${window.location.origin}/chat/${business.slug}/widget.js"></script>`
    : "";

  return (
    <div className="ab-page relative max-w-4xl space-y-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-slate-200/80 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg sm:right-6 sm:top-6">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Settings
        </h1>
        <Tabs value={TABS[tab]} onValueChange={() => {}}>
          <TabsList className="w-full sm:w-auto">
            {TABS.map((t, i) => (
              <TabsTrigger
                key={t}
                value={t}
                current={TABS[tab]}
                onClick={() => selectTab(i)}
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ── Business ── */}
      {tab === 0 && (
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="px-4 py-3 sm:px-5 space-y-2">
            <CardTitle className="text-base">Business Information</CardTitle>
            {/* Trial / plan badge */}
            {subscription && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge variant="outline" className="border-slate-300 text-slate-700">
                  Plan: {currentPlan === "business" ? "Business" : currentPlan === "pro" ? "Pro" : "Free"}
                </Badge>
                {trialActive && currentPlan === "free" && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    {trialDaysLeft > 0
                      ? `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in trial`
                      : "Trial ending soon"}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4 sm:px-5">
            <form onSubmit={saveBusiness} className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Business Name</label>
                  <input
                    className={inputClass}
                    value={business?.name || ""}
                    onChange={(e) =>
                      setBusiness((b) => ({ ...b, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={business?.phone || ""}
                    onChange={(e) =>
                      setBusiness((b) => ({ ...b, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Timezone</label>
                <select
                  className={inputClass}
                  value={business?.timezone || "Asia/Kolkata"}
                  onChange={(e) =>
                    setBusiness((b) => ({ ...b, timezone: e.target.value }))
                  }
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="America/New_York">
                    America/New_York (EST)
                  </option>
                  <option value="America/Los_Angeles">
                    America/Los_Angeles (PST)
                  </option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Australia/Sydney">
                    Australia/Sydney (AEST)
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Your Chat URL</label>
                <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800">
                  {window.location.origin}/chat/{business?.slug}
                </code>
              </div>
              <div>
                <label className={labelClass}>Embeddable Chat Widget Snippet</label>
                <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-mono text-slate-800 break-all">
                  {widgetScriptTag || "Save business slug to generate snippet"}
                </code>
                {widgetScriptTag && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(widgetScriptTag);
                        showToast("Widget snippet copied!");
                      } catch {
                        showToast("Copy failed. Please copy manually.");
                      }
                    }}
                  >
                    Copy snippet
                  </Button>
                )}
              </div>
              <Button type="submit" size="md" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </form>

            {/* Simple plans section */}
            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Plans
                </span>
                {trialActive && currentPlan === "free" && (
                  <span className="text-[11px] text-slate-400">
                    Your Pro/Business billing will start after your trial ends.
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-semibold text-slate-800">Pro</div>
                      <div className="text-[11px] text-slate-500">For growing clinics & salons</div>
                    </div>
                    <div className="text-right text-slate-900">
                      <div className="text-sm font-semibold">₹999/mo</div>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <li>• 10 staff members</li>
                    <li>• 20 services</li>
                    <li>• 500 bookings / month</li>
                  </ul>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3 w-full bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => startUpgrade("pro")}
                    disabled={currentPlan === "pro" || currentPlan === "business"}
                  >
                    {currentPlan === "pro" ? "Current plan" : "Choose Pro"}
                  </Button>
                </div>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-3 text-xs">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">Business</div>
                      <div className="text-[11px] text-slate-600">For multi‑location teams</div>
                    </div>
                    <div className="text-right text-slate-900">
                      <div className="text-sm font-semibold">₹2,499/mo</div>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                    <li>• Unlimited staff & services</li>
                    <li>• Unlimited bookings</li>
                    <li>• Priority support</li>
                  </ul>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full border-indigo-400 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => startUpgrade("business")}
                    disabled={currentPlan === "business"}
                  >
                    {currentPlan === "business" ? "Current plan" : "Choose Business"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Services ── */}
      {tab === 1 && (
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <CardTitle className="text-base">Services</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addService}
            >
              + Add Service
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-4 sm:px-5">
            <p className="text-xs text-slate-500">
              Add the services you offer. <strong>Duration</strong> is how long each appointment takes (in minutes)—the bot uses it to block slots. <strong>Price</strong> is optional and can be shown to customers.
            </p>
            {services.filter((sv) => sv.active).length > 0 && (
              <div className="grid gap-x-4 gap-y-1 text-xs font-medium text-slate-500 sm:grid-cols-[1fr_100px_100px_auto]">
                <div>Service name</div>
                <div>Duration (min)</div>
                <div>Price (optional)</div>
                <div aria-hidden className="w-20" />
              </div>
            )}
            {services
              .filter((sv) => sv.active)
              .map((svc) => (
                <div key={svc.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px_100px_auto] sm:items-center sm:gap-4">
                  <div>
                    <label htmlFor={`svc-name-${svc.id}`} className="sr-only">Service name</label>
                    <input
                      id={`svc-name-${svc.id}`}
                      className={`min-w-0 flex-1 sm:max-w-none ${inputClass}`}
                      value={svc.name}
                      onChange={(e) =>
                        updateService(svc.id, "name", e.target.value)
                      }
                      placeholder="e.g. Haircut, Consultation"
                    />
                  </div>
                  <div>
                    <label htmlFor={`svc-duration-${svc.id}`} className="sr-only">Duration in minutes</label>
                    <input
                      id={`svc-duration-${svc.id}`}
                      className={`w-full sm:w-20 ${inputClass}`}
                      type="number"
                      min={5}
                      max={480}
                      value={svc.duration_minutes}
                      onChange={(e) =>
                        updateService(
                          svc.id,
                          "duration_minutes",
                          parseInt(e.target.value, 10) || 30,
                        )
                      }
                      placeholder="30"
                      title="How long the appointment takes (minutes)"
                    />
                  </div>
                  <div>
                    <label htmlFor={`svc-price-${svc.id}`} className="sr-only">Price in rupees (optional)</label>
                    <input
                      id={`svc-price-${svc.id}`}
                      className={`w-full sm:w-24 ${inputClass}`}
                      type="number"
                      min={0}
                      step={1}
                      value={svc.price || ""}
                      onChange={(e) =>
                        updateService(svc.id, "price", e.target.value)
                      }
                      placeholder="₹"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveService(svc)}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => deleteService(svc.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            {services.filter((sv) => sv.active).length === 0 && (
              <div className="py-4 text-sm text-slate-500">
                No services yet. Add one above.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Staff ── */}
      {tab === 2 && (
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <CardTitle className="text-base">Staff Members</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addStaff}
            >
              + Add Staff
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4 pt-4 sm:px-5">
            {staff
              .filter((m) => m.active)
              .map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    className={`min-w-0 flex-1 sm:max-w-[160px] ${inputClass}`}
                    value={member.name}
                    onChange={(e) =>
                      setStaff((st) =>
                        st.map((m) =>
                          m.id === member.id
                            ? { ...m, name: e.target.value }
                            : m,
                        ),
                      )
                    }
                    placeholder="Name"
                  />
                  <input
                    className={`min-w-0 flex-1 sm:max-w-[140px] ${inputClass}`}
                    value={member.role || ""}
                    onChange={(e) =>
                      setStaff((st) =>
                        st.map((m) =>
                          m.id === member.id
                            ? { ...m, role: e.target.value }
                            : m,
                        ),
                      )
                    }
                    placeholder="Role"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => saveStaffMember(member)}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => deleteStaff(member.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            {staff.filter((m) => m.active).length === 0 && (
              <div className="py-4 text-sm text-slate-500">
                No staff yet. Add one above.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── No-show ── */}
      {tab === 4 && (
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="px-4 py-3 sm:px-5">
            <CardTitle className="text-base text-slate-900">No-show Prevention</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4 sm:px-5">
            <form onSubmit={saveNoShowSettings} className="space-y-4 text-sm">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!noShowSettings?.reminder_24h_enabled}
                  onChange={(e) =>
                    setNoShowSettings((prev) => ({ ...prev, reminder_24h_enabled: e.target.checked }))
                  }
                />
                <span>Send reminder 24 hours before appointment</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!noShowSettings?.reminder_2h_enabled}
                  onChange={(e) =>
                    setNoShowSettings((prev) => ({ ...prev, reminder_2h_enabled: e.target.checked }))
                  }
                />
                <span>Send reminder 2 hours before and ask for confirmation</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!noShowSettings?.auto_cancel_unconfirmed_enabled}
                  onChange={(e) =>
                    setNoShowSettings((prev) => ({ ...prev, auto_cancel_unconfirmed_enabled: e.target.checked }))
                  }
                />
                <span>Auto-cancel unconfirmed appointments before start</span>
              </label>
              <div>
                <label className={labelClass}>Confirmation cutoff (minutes before appointment)</label>
                <Input
                  type="number"
                  min={15}
                  max={360}
                  value={noShowSettings?.confirmation_cutoff_minutes ?? 90}
                  onChange={(e) =>
                    setNoShowSettings((prev) => ({
                      ...prev,
                      confirmation_cutoff_minutes: parseInt(e.target.value, 10) || 90,
                    }))
                  }
                />
              </div>
              <Button type="submit" size="md" disabled={saving}>
                {saving ? "Saving…" : "Save No-show Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── WhatsApp ── */}
      {tab === 5 && (
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <CardTitle className="text-base text-slate-900">
              WhatsApp Connection
            </CardTitle>
            {waConfig?.phoneNumberId || waConfig?.status === "connected" ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="bg-emerald-600 font-medium text-white">
                  Already connected
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={startWaConnect}
                  disabled={saving}
                >
                  {saving ? "Opening…" : "Update number"}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="md"
                className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                onClick={startWaConnect}
                disabled={saving}
              >
                {saving ? "Opening…" : "Connect WhatsApp Business"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-4 text-sm sm:px-5">
            {waConfig?.phoneNumberId || waConfig?.status === "connected" ? (
              <>
                <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Connected number
                  </span>
                  <p className="font-mono text-base font-medium text-slate-900">
                    {waConfig?.displayPhone || business?.phone || "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700">
                  WhatsApp is linked to your business. Customers can message this number to book appointments. Use <strong>Update number</strong> above to link a different WhatsApp Business number.
                </div>
                <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    WhatsApp Book Now Link (tracked)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Campaign</label>
                      <Input
                        value={bookNowCampaign}
                        onChange={(e) => setBookNowCampaign(e.target.value)}
                        placeholder="e.g. summer_offer"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>UTM Source</label>
                      <Input
                        value={bookNowUtmSource}
                        onChange={(e) => setBookNowUtmSource(e.target.value)}
                        placeholder="e.g. instagram"
                      />
                    </div>
                  </div>
                  <code className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-mono text-slate-800 break-all">
                    {bookNowLink || "Connect a WhatsApp number to generate link"}
                  </code>
                  {bookNowLink && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(bookNowLink);
                            showToast("Book Now link copied!");
                          } catch {
                            showToast("Copy failed. Please copy manually.");
                          }
                        }}
                      >
                        Copy link
                      </Button>
                      <Button type="button" size="sm" onClick={() => window.open(bookNowLink, "_blank")}>
                        Open link
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Leads entering via this link are tagged with source, campaign, and UTM for funnel attribution.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
                Click <strong>Connect WhatsApp Business</strong> above. A window will open to link your WhatsApp Business number with the platform — no webhooks or Meta configuration needed. Your number must already be set up as a WhatsApp Business account in Meta.
              </div>
            )}

            {/* ── Meta fee disclosure ── */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-slate-700">
              <span className="mt-0.5 flex-shrink-0">ℹ️</span>
              <div className="leading-relaxed">
                <p className="mb-1 font-semibold text-slate-800">About Meta's WhatsApp fees</p>
                <p className="mb-1">
                  <span className="font-medium text-emerald-700">Booking conversations</span> (when customers message you first) are <span className="font-medium">free</span>.{' '}
                  <span className="font-medium text-slate-800">Appointment reminders</span> sent by the bot outside the chat window are charged ~<span className="font-medium">₹0.40/message</span> by Meta — billed directly to your WhatsApp Business account, not through AppointBot.
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Hours ── */}
      {tab === 3 && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Set open/close and optional lunch break per day. Appointments cannot be booked during lunch.
          </p>
          {staff
            .filter((m) => m.active)
            .map((member) => {
              const config = staffHoursConfig[member.id] ?? hoursToStaffConfig(hours, member.id);
              const applyAll = applyAllValues[member.id] ?? { open: "09:00", close: "18:00", lunchStart: "", lunchEnd: "" };
              return (
                <Card
                  key={member.id}
                  className="border border-slate-200/80 shadow-sm"
                >
                  <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <CardTitle className="text-base">
                      {member.name}
                      {member.role ? ` — ${member.role}` : ""}
                    </CardTitle>
                    <Button
                      type="button"
                      size="sm"
                      disabled={saving}
                      onClick={() => saveHours(member.id)}
                    >
                      Save
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4 pt-4 text-sm sm:px-5">
                    {/* Apply to all days */}
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-3">
                      <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                        Apply to all days:
                      </span>
                      <Input
                        type="time"
                        className="h-8 w-28 text-xs"
                        value={applyAll.open}
                        onChange={(e) =>
                          setApplyAllValues((prev) => ({
                            ...prev,
                            [member.id]: { ...(prev[member.id] || applyAll), open: e.target.value },
                          }))
                        }
                      />
                      <Input
                        type="time"
                        className="h-8 w-28 text-xs"
                        value={applyAll.close}
                        onChange={(e) =>
                          setApplyAllValues((prev) => ({
                            ...prev,
                            [member.id]: { ...(prev[member.id] || applyAll), close: e.target.value },
                          }))
                        }
                      />
                      <Input
                        type="time"
                        className="h-8 w-28 text-xs"
                        placeholder="Lunch from"
                        value={applyAll.lunchStart}
                        onChange={(e) =>
                          setApplyAllValues((prev) => ({
                            ...prev,
                            [member.id]: { ...(prev[member.id] || applyAll), lunchStart: e.target.value },
                          }))
                        }
                      />
                      <Input
                        type="time"
                        className="h-8 w-28 text-xs"
                        placeholder="Lunch to"
                        value={applyAll.lunchEnd}
                        onChange={(e) =>
                          setApplyAllValues((prev) => ({
                            ...prev,
                            [member.id]: { ...(prev[member.id] || applyAll), lunchEnd: e.target.value },
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          applyAllDaysToStaff(
                            member.id,
                            applyAll.open,
                            applyAll.close,
                            applyAll.lunchStart,
                            applyAll.lunchEnd
                          )
                        }
                      >
                        Apply to all days
                      </Button>
                    </div>

                    {/* Per-day table */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <div className="grid grid-cols-[minmax(3rem,1fr)_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 bg-slate-100/80 text-xs font-medium text-slate-600 border-b border-slate-200">
                        <span>Day</span>
                        <span>Open</span>
                        <span>Close</span>
                        <span>Lunch start</span>
                        <span>Lunch end</span>
                      </div>
                      {config.map((day) => (
                        <div
                          key={day.day}
                          className={cn(
                            "grid grid-cols-[minmax(3rem,1fr)_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 items-center border-b border-slate-100 last:border-b-0",
                            !day.enabled && "bg-slate-50/50 opacity-90"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={cn(
                                "rounded border px-2 py-1 text-xs font-medium transition-colors",
                                day.enabled
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-600"
                              )}
                              onClick={() => toggleStaffDay(member.id, day.day)}
                            >
                              {day.enabled ? "Open" : "Closed"}
                            </button>
                            <span className="text-xs font-medium text-slate-800 w-8">
                              {DAYS[day.day]}
                            </span>
                          </div>
                          <Input
                            type="time"
                            className="h-8 text-xs w-full max-w-[6rem]"
                            value={day.open}
                            onChange={(e) => updateStaffDay(member.id, day.day, "open", e.target.value)}
                            disabled={!day.enabled}
                          />
                          <Input
                            type="time"
                            className="h-8 text-xs w-full max-w-[6rem]"
                            value={day.close}
                            onChange={(e) => updateStaffDay(member.id, day.day, "close", e.target.value)}
                            disabled={!day.enabled}
                          />
                          <Input
                            type="time"
                            className="h-8 text-xs w-full max-w-[6rem]"
                            placeholder="—"
                            value={day.lunchStart}
                            onChange={(e) => updateStaffDay(member.id, day.day, "lunchStart", e.target.value)}
                            disabled={!day.enabled}
                          />
                          <Input
                            type="time"
                            className="h-8 text-xs w-full max-w-[6rem]"
                            placeholder="—"
                            value={day.lunchEnd}
                            onChange={(e) => updateStaffDay(member.id, day.day, "lunchEnd", e.target.value)}
                            disabled={!day.enabled}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
