import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Toast } from "../components/shared/Toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";

function formatBillingDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return null;
  }
}

const TABS = ["Business", "No-show", "WhatsApp", "Widget", "Billing"];
const TAB_QUERY = ["business", "no-show", "whatsapp", "widget", "billing"];
const TAB_FROM_QUERY = { business: 0, "no-show": 1, whatsapp: 2, widget: 3, billing: 4 };

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const qTab = searchParams.get("tab");
  const initialTab =
    qTab && TAB_FROM_QUERY[qTab] !== undefined ? TAB_FROM_QUERY[qTab] : 0;
  const [tab, setTab] = useState(initialTab);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [waConfig, setWaConfig] = useState(null);
  const [bookNowCampaign, setBookNowCampaign] = useState("spring_launch");
  const [bookNowUtmSource, setBookNowUtmSource] = useState("instagram");
  const [noShowSettings, setNoShowSettings] = useState(null);
  const [widgetApiKey, setWidgetApiKey] = useState(null);
  const [widgetUrl, setWidgetUrl] = useState(null);
  const [widgetEmbedCode, setWidgetEmbedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "hours") {
      navigate("/dashboard/operate/working-hours", { replace: true });
      return;
    }
    if (t && TAB_FROM_QUERY[t] !== undefined) {
      setTab(TAB_FROM_QUERY[t]);
    }
  }, [searchParams, navigate]);

  function selectTab(i) {
    setTab(i);
    setSearchParams({ tab: TAB_QUERY[i] }, { replace: true });
  }

  useEffect(() => {
    Promise.all([
      api.get("/business"),
      api.get("/business/whatsapp"),
      api.get("/business/no-show-settings"),
      api.get("/billing/subscription"),
      api.get("/business/widget-api-key"),
    ])
      .then(([b, wa, ns, sub, wk]) => {
        setBusiness(b.data.business);
        setWaConfig(wa.data.whatsapp || null);
        setNoShowSettings(ns.data.noShowSettings || null);
        setSubscription(sub.data.subscription || null);
        setWidgetApiKey(wk.data.apiKey || null);
        setWidgetUrl(wk.data.widgetUrl || null);
        setWidgetEmbedCode(wk.data.embedCode || "");
      })
      .finally(() => setLoading(false));
  }, []);

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

  // ── Billing helpers ───────────────────────────────────────────────────────
  async function refreshSubscription() {
    try {
      const { data } = await api.get("/billing/subscription");
      setSubscription(data.subscription || null);
    } catch {
      /* ignore */
    }
  }

  async function confirmCancelSubscription() {
    setCancelSubmitting(true);
    try {
      await api.post("/billing/cancel", { cancelAtPeriodEnd: !cancelImmediate });
      await refreshSubscription();
      setCancelDialogOpen(false);
      setCancelImmediate(false);
      showToast(
        cancelImmediate
          ? "Your subscription has been canceled."
          : "Cancellation scheduled — you keep access until the end of this billing period.",
      );
    } catch (err) {
      showToast(err.response?.data?.error || "Could not cancel subscription");
    } finally {
      setCancelSubmitting(false);
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

  // Services, staff, and working hours are under Operate in the sidebar.

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

  // ── Widget API key management ─────────────────────────────────────────────
  async function regenerateWidgetApiKey() {
    if (!confirm("This will invalidate your current widget API key. Widgets on external websites will stop working until you update them with the new key. Continue?")) {
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/business/widget-api-key/regenerate");
      setWidgetApiKey(data.apiKey);
      setWidgetUrl(data.widgetUrl || null);
      setWidgetEmbedCode(data.embedCode);
      showToast("Widget API key regenerated!");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to regenerate API key");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-muted-foreground">
        Loading settings…
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1";

  const currentPlan = subscription?.plan || "free";
  const trialActive = subscription?.trialActive;
  const trialDaysLeft = subscription?.trialDaysLeft || 0;
  const renewalLabel = subscription?.current_period_end
    ? formatBillingDate(subscription.current_period_end)
    : null;
  const trialEndLabel = subscription?.trial_ends_at
    ? formatBillingDate(subscription.trial_ends_at)
    : null;
  const hasRazorpayBilling =
    subscription?.gateway === "razorpay" && !!subscription?.external_subscription_id;
  const canManageCancel =
    hasRazorpayBilling &&
    subscription?.status !== "canceled" &&
    !subscription?.cancel_at_period_end;
  const cancelScheduled = !!subscription?.cancel_at_period_end;
  const backendBase = import.meta.env.VITE_API_URL || window.location.origin;
  const waPhone = String(waConfig?.displayPhone || business?.phone || "").replace(/[^0-9]/g, "");
  const bookNowText = `Hi, I want to book an appointment. #src=whatsapp_book_now #cmp=${(bookNowCampaign || "default").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")} #utm=${(bookNowUtmSource || "unknown").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
  const bookNowLink = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(bookNowText)}` : "";
  const widgetScriptTag = widgetUrl
    ? `<script async src="${widgetUrl}"></script>`
    : "";

  return (
    <div className="ab-page relative max-w-4xl space-y-4">
      <Toast message={toast} visible={!!toast} />

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) setCancelImmediate(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription className="text-left leading-relaxed">
              {cancelImmediate ? (
                <>
                  Your paid access ends right away and your workspace moves to the free limits. This
                  cannot be undone from here — you can subscribe again anytime from Billing.
                </>
              ) : (
                <>
                  You keep your current plan benefits until{" "}
                  <span className="font-medium text-foreground">
                    {renewalLabel || "the end of this billing period"}
                  </span>
                  . After that, your workspace reverts to the free tier.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
            <Checkbox
              id="cancel-immediate"
              checked={cancelImmediate}
              onCheckedChange={(c) => setCancelImmediate(!!c)}
            />
            <label htmlFor="cancel-immediate" className="cursor-pointer leading-snug">
              <span className="font-medium text-foreground">Cancel immediately</span>
              <span className="block text-xs text-muted-foreground">
                Lose paid features now instead of at the end of the period.
              </span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelSubmitting}
            >
              Keep subscription
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancelSubscription}
              disabled={cancelSubmitting}
            >
              {cancelSubmitting ? "Working…" : "Confirm cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
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
        <Card className="border shadow-sm">
          <CardHeader className="px-4 py-3 sm:px-5 space-y-2">
            <CardTitle className="text-base">Business Information</CardTitle>
            <p className="text-xs text-muted-foreground">
              Subscription and invoices are managed in the{" "}
              <button
                type="button"
                className="font-medium text-foreground underline underline-offset-2 hover:text-foreground"
                onClick={() => selectTab(4)}
              >
                Billing
              </button>{" "}
              tab.
            </p>
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
                <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground">
                  {backendBase}/chat/{business?.slug}
                </code>
              </div>
              <div>
                <label className={labelClass}>Embeddable Chat Widget Snippet</label>
                <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-[11px] font-mono text-foreground break-all">
                  {widgetScriptTag || "Generate a widget API key (Widget tab) to see the embed snippet with your server URL"}
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
          </CardContent>
        </Card>
      )}

      {/* Services and Staff tabs removed - now in Operate module */}

      {/* ── No-show ── */}
      {tab === 1 && (
        <Card className="border shadow-sm">
          <CardHeader className="px-4 py-3 sm:px-5">
            <CardTitle className="text-base text-foreground">No-show Prevention</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4 sm:px-5">
            <form onSubmit={saveNoShowSettings} className="space-y-4 text-sm">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <Label htmlFor="reminder-24h" className="flex-1 cursor-pointer">
                  <div className="font-medium">Send reminder 24 hours before appointment</div>
                  <div className="text-xs text-muted-foreground">Automatic SMS/WhatsApp reminder</div>
                </Label>
                <Switch
                  id="reminder-24h"
                  checked={!!noShowSettings?.reminder_24h_enabled}
                  onCheckedChange={(checked) =>
                    setNoShowSettings((prev) => ({ ...prev, reminder_24h_enabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <Label htmlFor="reminder-2h" className="flex-1 cursor-pointer">
                  <div className="font-medium">Send reminder 2 hours before and ask for confirmation</div>
                  <div className="text-xs text-muted-foreground">Requires customer confirmation</div>
                </Label>
                <Switch
                  id="reminder-2h"
                  checked={!!noShowSettings?.reminder_2h_enabled}
                  onCheckedChange={(checked) =>
                    setNoShowSettings((prev) => ({ ...prev, reminder_2h_enabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <Label htmlFor="auto-cancel" className="flex-1 cursor-pointer">
                  <div className="font-medium">Auto-cancel unconfirmed appointments before start</div>
                  <div className="text-xs text-muted-foreground">Cancels appointments not confirmed by cutoff time</div>
                </Label>
                <Switch
                  id="auto-cancel"
                  checked={!!noShowSettings?.auto_cancel_unconfirmed_enabled}
                  onCheckedChange={(checked) =>
                    setNoShowSettings((prev) => ({ ...prev, auto_cancel_unconfirmed_enabled: checked }))
                  }
                />
              </div>
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
      {tab === 2 && (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <CardTitle className="text-base text-foreground">
              WhatsApp Connection
            </CardTitle>
            {waConfig?.phoneNumberId || waConfig?.status === "connected" ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
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
                <div className="flex flex-col gap-1.5 border-b pb-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Connected number
                  </span>
                  <p className="font-mono text-base font-medium text-foreground">
                    {waConfig?.displayPhone || business?.phone || "—"}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-foreground">
                  WhatsApp is linked to your business. Customers can message this number to book appointments. Use <strong>Update number</strong> above to link a different WhatsApp Business number.
                </div>
                <div className="space-y-3 rounded-lg border bg-card px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                  <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-[11px] font-mono text-foreground break-all">
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
                  <p className="text-xs text-muted-foreground">
                    Leads entering via this link are tagged with source, campaign, and UTM for funnel attribution.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Click <strong>Connect WhatsApp Business</strong> above. A window will open to link your WhatsApp Business number with the platform — no webhooks or Meta configuration needed. Your number must already be set up as a WhatsApp Business account in Meta.
              </div>
            )}

            {/* ── Meta fee disclosure ── */}
            <div className="flex items-start gap-3 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-foreground">
              <span className="mt-0.5 flex-shrink-0">ℹ️</span>
              <div className="leading-relaxed">
                <p className="mb-1 font-semibold text-foreground">About Meta's WhatsApp fees</p>
                <p className="mb-1">
                  <span className="font-medium text-foreground">Booking conversations</span> (when customers message you first) are <span className="font-medium">free</span>.{' '}
                  <span className="font-medium text-foreground">Appointment reminders</span> sent by the bot outside the chat window are charged ~<span className="font-medium">₹0.40/message</span> by Meta — billed directly to your WhatsApp Business account, not through Booklyft.
                </p>
                <p className="text-xs text-muted-foreground">
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

      {/* ── Widget ── */}
      {tab === 3 && (
        <Card className="border shadow-sm">
          <CardHeader className="px-4 py-3 sm:px-5">
            <CardTitle className="text-base text-foreground">Chat Widget</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Embed the chat widget on your website to let visitors book appointments.
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4 sm:px-5 space-y-5">
            {/* API Key Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Widget API Key</label>
                {widgetApiKey && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={regenerateWidgetApiKey}
                    disabled={saving}
                    className="h-8 text-xs"
                  >
                    {saving ? "Generating…" : "Regenerate Key"}
                  </Button>
                )}
              </div>
              
              {widgetApiKey ? (
                <div className="space-y-2">
                  <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground break-all">
                    {widgetApiKey}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(widgetApiKey);
                        showToast("API key copied!");
                      } catch {
                        showToast("Copy failed. Please copy manually.");
                      }
                    }}
                  >
                    Copy API Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    No API key found. Generate one to enable the widget.
                  </div>
                  <Button
                    type="button"
                    size="md"
                    onClick={regenerateWidgetApiKey}
                    disabled={saving}
                  >
                    {saving ? "Generating…" : "Generate API Key"}
                  </Button>
                </div>
              )}
            </div>

            {/* Embed Code Section */}
            {widgetApiKey && widgetEmbedCode && (
              <div className="space-y-3">
                <label className={labelClass}>Embed Code (Add to your website)</label>
                <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-[11px] font-mono text-foreground break-all">
                  {widgetEmbedCode}
                </code>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(widgetEmbedCode);
                        showToast("Embed code copied!");
                      } catch {
                        showToast("Copy failed. Please copy manually.");
                      }
                    }}
                  >
                    Copy Embed Code
                  </Button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-3 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-foreground">
              <span className="mt-0.5 flex-shrink-0">🔒</span>
              <div className="leading-relaxed">
                <p className="mb-1 font-semibold text-foreground">Secure Widget Integration</p>
                <p className="mb-1">
                  Your widget is protected by a unique API key. Only websites with your API key can embed the chat widget. Keep this key secure and regenerate it if you suspect it's been compromised.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  The widget will appear as a floating chat button in the bottom-right corner of your website.
                </p>
              </div>
            </div>

            {/* Usage Instructions */}
            {widgetApiKey && (
              <div className="space-y-2 rounded-lg border bg-card px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  How to Use
                </p>
                <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                  <li>Copy the embed code above</li>
                  <li>Paste it in your website's HTML, just before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag</li>
                  <li>The chat widget will appear automatically on all pages</li>
                </ol>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-foreground hover:text-foreground">
                    Advanced customization
                  </summary>
                  <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                    <p>Same script tag the API returns (uses your deployed backend URL):</p>
                    <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-[11px] font-mono text-foreground break-all">
                      {widgetUrl ? `<script async src="${widgetUrl}"></script>` : "—"}
                    </code>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Billing ── */}
      {tab === 4 && (
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="space-y-2 px-5 pb-2 pt-6 sm:px-6">
              <CardTitle className="text-base leading-snug">Current plan</CardTitle>
              <p className="text-xs leading-relaxed text-muted-foreground">
                View your plan status, next billing date, and cancellation options. To change plans,
                open{" "}
                <Link
                  to="/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  pricing
                </Link>
                .
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-5 pb-6 pt-4 sm:px-6">
              <div className="rounded-xl border border-border/80 bg-card px-5 py-6 sm:px-6 sm:py-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-lg font-semibold leading-none tracking-tight">
                          {currentPlan === "business"
                            ? "Business"
                            : currentPlan === "pro"
                              ? "Pro"
                              : "Free"}
                        </span>
                        {subscription?.status && (
                          <Badge variant="secondary" className="font-normal capitalize">
                            {subscription.status === "canceled"
                              ? "Canceled"
                              : cancelScheduled
                                ? "Canceling"
                                : subscription.status}
                          </Badge>
                        )}
                      </div>
                      {trialActive && currentPlan === "free" && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {trialDaysLeft > 0
                            ? `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your trial — limits match Pro until then.`
                            : "Trial ending soon."}
                        </p>
                      )}
                    </div>
                    <dl className="space-y-3 border-t border-border pt-5 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <dt className="text-muted-foreground">
                          {cancelScheduled ? "Current period ends" : "Next billing date"}
                        </dt>
                        <dd className="font-medium tabular-nums text-foreground text-right">
                          {renewalLabel
                            ? renewalLabel
                            : trialActive && trialEndLabel && !hasRazorpayBilling
                              ? `After trial (${trialEndLabel})`
                              : "—"}
                        </dd>
                      </div>
                      {trialActive && trialEndLabel && (
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-xs">
                          <dt className="text-muted-foreground">Trial ends</dt>
                          <dd className="tabular-nums text-muted-foreground text-right">{trialEndLabel}</dd>
                        </div>
                      )}
                    </dl>
                    {cancelScheduled && renewalLabel && (
                      <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200/90">
                        Access until{" "}
                        <span className="font-medium">{renewalLabel}</span>, then your workspace
                        moves to the free tier.
                      </p>
                    )}
                    {subscription?.status === "canceled" && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        You are on the free tier. Open{" "}
                        <Link
                          to="/pricing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground underline underline-offset-2"
                        >
                          pricing
                        </Link>{" "}
                        to subscribe again.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-semibold leading-snug text-foreground">
                    Cancel subscription
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {canManageCancel
                      ? "Stop future charges. You can keep access until the end of the period, or end immediately."
                      : cancelScheduled
                        ? "You already have cancellation scheduled. Your access continues until the date above."
                        : subscription?.status === "canceled"
                          ? "Your paid subscription has ended. You are on the free plan."
                          : !hasRazorpayBilling
                            ? "Paid cancellation applies after you subscribe with a card through checkout. Trial and free plans do not require cancellation."
                            : "No further cancellation action is available for this billing profile."}
                  </p>
                </div>
                {canManageCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancel subscription
                  </Button>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Payments are processed securely by Razorpay. For receipts and payment history, use the
                confirmation email from Razorpay or your bank statement.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
