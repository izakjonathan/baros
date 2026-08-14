"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MessageSquareWarning, Pause, Play, Square } from "lucide-react";
import { Dialog, DialogActions } from "@/components/ui/interaction-ui";
import { WorkspaceHeader } from "@/components/ui/workspace-ui";

type ActiveClock = {
  id: string;
  clocked_in_at: string;
  location_name?: string;
  scheduled_role?: string;
  scheduled_start?: string;
  scheduled_end?: string;
};
type Timesheet = {
  id: string;
  work_date: string;
  clocked_in_at: string;
  clocked_out_at?: string | null;
  scheduled_minutes: number;
  worked_minutes: number;
  break_minutes: number;
  status: "OPEN" | "PENDING" | "APPROVED" | "REJECTED";
  correction_pending?: boolean;
};

function periodRange(period: string) {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  if (period === "This week" || period === "Last week") {
    const mondayOffset = (now.getDay() + 6) % 7;
    start.setDate(now.getDate() - mondayOffset + (period === "Last week" ? -7 : 0));
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  } else {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
  }
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { from: iso(start), to: iso(end) };
}
function validDate(value?: string | null, dateOnly = false) {
  if (!value) return null;
  const datePart = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const parsed = new Date(dateOnly && datePart ? `${datePart}T12:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function time(value?: string | null) {
  const parsed = validDate(value);
  if (!parsed) return "—";
  return new Intl.DateTimeFormat("en-DK", { hour: "2-digit", minute: "2-digit", hour12: false }).format(parsed);
}
function dateLabel(value?: string | null) {
  const parsed = validDate(value, true);
  if (!parsed) return "Unknown date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(parsed);
}

function geolocationErrorMessage(reason: unknown) {
  if (typeof GeolocationPositionError !== "undefined" && reason instanceof GeolocationPositionError) {
    if (reason.code === reason.PERMISSION_DENIED) return "Location access was denied. Allow location access in Safari settings and try again.";
    if (reason.code === reason.POSITION_UNAVAILABLE) return "Your location could not be determined. Check Location Services and try again.";
    if (reason.code === reason.TIMEOUT) return "Location check timed out. Move somewhere with a clearer signal and try again.";
  }
  return reason instanceof Error ? reason.message : "Location check failed. Please try again.";
}

export default function HoursPage() {
  const [active, setActive] = useState<ActiveClock | null>(null);
  const [breakActive, setBreakActive] = useState(false);
  const [eligible, setEligible] = useState(true);
  const [eligibilityReason, setEligibilityReason] = useState("");
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [scheduledMinutes, setScheduledMinutes] = useState(0);
  const [approvedMinutes, setApprovedMinutes] = useState(0);
  const [period, setPeriod] = useState("This week");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [requireLocationCheck, setRequireLocationCheck] = useState(false);
  const [timezone, setTimezone] = useState("Europe/Copenhagen");
  const [correction, setCorrection] = useState<Timesheet | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");

  const load = useCallback(async () => {
    setError("");
    const range = periodRange(period);
    const [clockResponse, hoursResponse] = await Promise.all([
      fetch("/api/time-clock", { cache: "no-store" }),
      fetch(`/api/employee/hours-summary?from=${range.from}&to=${range.to}`, { cache: "no-store" }),
    ]);
    const clockData = await clockResponse.json().catch(() => ({}));
    const hoursData = await hoursResponse.json().catch(() => ({}));
    if (!clockResponse.ok) throw new Error(clockData.error || "Could not load time clock");
    if (!hoursResponse.ok) throw new Error(hoursData.error || "Could not load hours");
    setActive(clockData.active || null);
    setBreakActive(Boolean(clockData.breakActive));
    setEligible(clockData.eligible !== false);
    setEligibilityReason(clockData.eligibilityReason || "");
    setRequireLocationCheck(Boolean(clockData.requireLocationCheck));
    setTimezone(clockData.timezone || "Europe/Copenhagen");
    setTimesheets(Array.isArray(hoursData.timesheets) ? hoursData.timesheets : []);
    setScheduledMinutes(Number(hoursData.summary?.scheduled_minutes || 0));
    setApprovedMinutes(Number(hoursData.summary?.approved_minutes || 0));
    setLoading(false);
  }, [period]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load hours");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [load]);

  async function clockAction(action: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT") {
    setBusy(true);
    setError("");
    try {
      let location: { latitude?: number; longitude?: number; accuracy?: number } = {};
      if (action === "CLOCK_IN" && requireLocationCheck) {
        if (!navigator.geolocation) throw new Error("Location services are not available on this device");
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
          });
          location = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
        } catch (reason) {
          throw new Error(geolocationErrorMessage(reason));
        }
      }
      const response = await fetch("/api/time-clock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ...location }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Clock action failed");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Clock action failed");
    } finally {
      setBusy(false);
    }
  }

  async function requestCorrection() {
    if (!correction || !correctionReason.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/employee/timesheet-corrections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ timesheetId: correction.id, reason: correctionReason.trim() }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send correction request");
      setCorrection(null); setCorrectionReason(""); await load();
    } catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : "Could not send correction request"); }
    finally { setBusy(false); }
  }

  const started = useMemo(() => active ? time(active.clocked_in_at) : null, [active]);

  return (
    <div className="employee-page">
      <WorkspaceHeader eyebrow="Time & attendance" title="My hours" description="Clock in and out, then review your scheduled and approved worked hours."/>

      {error && <div className="employee-error" role="alert">{error}</div>}

      {loading && <div className="employee-loading-inline" role="status">Loading your current clock…</div>}

      <section className={`clock-card ${active ? "clock-running" : ""}`}>
        <div>
          <small>{active ? breakActive ? "Break in progress" : "Shift in progress" : "Ready to start"}</small>
          <strong>{active ? `Started ${started}` : "Clock in for your next published shift"}</strong>
          <p>{active?.location_name || "Your assigned location"}{active?.scheduled_role ? ` · ${active.scheduled_role}` : ""}</p>
        </div>

        {!eligible ? (
          <p className="clock-unavailable">{eligibilityReason || "Your account needs a linked employee profile and location before time can be recorded."}</p>
        ) : loading ? null : !active ? (
          <button type="button" disabled={busy} onClick={() => clockAction("CLOCK_IN")}><Play size={19} />{busy ? "Starting…" : "Clock in"}</button>
        ) : (
          <div className="clock-actions">
            <button type="button" disabled={busy} onClick={() => clockAction(breakActive ? "BREAK_END" : "BREAK_START")}>
              <Pause size={18} />{breakActive ? "End break" : "Start break"}
            </button>
            <button type="button" disabled={busy} className="clock-out" onClick={() => clockAction("CLOCK_OUT")}><Square size={18} />Clock out</button>
          </div>
        )}
      </section>

      <div className="hours-period">
        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option>This week</option><option>Last week</option><option>This month</option>
        </select>
      </div>

      <section className="employee-hour-cards">
        <article><CalendarDays /><span>Scheduled<strong>{(scheduledMinutes / 60).toFixed(1)}h</strong></span></article>
        <article><Clock3 /><span>Approved worked<strong>{(approvedMinutes / 60).toFixed(1)}h</strong></span></article>
      </section>

      <h2>Timesheets</h2>
      <section className="hours-history">
        {timesheets.map((item) => (
          <article key={item.id}>
            <div><strong>{dateLabel(item.work_date)}</strong><span>{(Number(item.scheduled_minutes || 0) / 60).toFixed(1)}h scheduled</span></div>
            <div>
              <b>{(Number(item.worked_minutes || 0) / 60).toFixed(2)}h</b>
              <span className={item.status === "APPROVED" ? "approved" : "pending"}>{item.status === "APPROVED" && <CheckCircle2 size={13} />} {item.status[0] + item.status.slice(1).toLowerCase()}</span>
              <small>{time(item.clocked_in_at)}–{time(item.clocked_out_at)} · {item.break_minutes || 0}m break</small>
              {item.status !== "OPEN" && (
                <button type="button" disabled={busy || item.correction_pending} className="correction-request" onClick={() => { setCorrection(item); setCorrectionReason(""); }}>
                  <MessageSquareWarning size={14} />{item.correction_pending ? "Correction pending" : "Request correction"}
                </button>
              )}
            </div>
          </article>
        ))}
        {!timesheets.length && <div className="empty-portal">No timesheets in this period.</div>}
      </section>

      <p className="hours-note">Worked hours become payroll-ready only after manager approval.</p>
      {correction && <Dialog title="Request a correction" description={`${dateLabel(correction.work_date)} · ${time(correction.clocked_in_at)}–${time(correction.clocked_out_at)}`} onClose={()=>setCorrection(null)}><label className="correction-field">What needs correcting?<textarea rows={5} value={correctionReason} onChange={e=>setCorrectionReason(e.target.value)} placeholder="Describe the correct clock-in, clock-out or break time"/></label><DialogActions onClose={()=>setCorrection(null)} onConfirm={requestCorrection} confirmLabel={busy?'Sending…':'Send request'} busy={busy} disabled={!correctionReason.trim()}/></Dialog>}
    </div>
  );
}
