"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MessageSquareWarning, Pause, Play, Square } from "lucide-react";

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
function time(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-DK", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

export default function HoursPage() {
  const [active, setActive] = useState<ActiveClock | null>(null);
  const [breakActive, setBreakActive] = useState(false);
  const [eligible, setEligible] = useState(true);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [scheduledMinutes, setScheduledMinutes] = useState(0);
  const [approvedMinutes, setApprovedMinutes] = useState(0);
  const [period, setPeriod] = useState("This week");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    setTimesheets(hoursData.timesheets || []);
    setScheduledMinutes(Number(hoursData.summary?.scheduled_minutes || 0));
    setApprovedMinutes(Number(hoursData.summary?.approved_minutes || 0));
  }, [period]);

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load hours"));
  }, [load]);

  async function clockAction(action: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/time-clock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
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

  async function requestCorrection(timesheet: Timesheet) {
    const reason = window.prompt(`What is wrong with the ${dateLabel(timesheet.work_date)} timesheet?`);
    if (!reason?.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/employee/timesheet-corrections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ timesheetId: timesheet.id, reason: reason.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send correction request");
      await load();
    } catch (reasonValue) {
      setError(reasonValue instanceof Error ? reasonValue.message : "Could not send correction request");
    } finally {
      setBusy(false);
    }
  }

  const started = useMemo(() => active ? time(active.clocked_in_at) : null, [active]);

  return (
    <div className="employee-page">
      <p className="eyebrow">Time &amp; attendance</p>
      <h1>My hours</h1>
      <p className="employee-lead">Clock in and out, then review your scheduled and approved worked hours.</p>

      {error && <div className="employee-error" role="alert">{error}</div>}

      <section className={`clock-card ${active ? "clock-running" : ""}`}>
        <div>
          <small>{active ? breakActive ? "Break in progress" : "Shift in progress" : "Ready to start"}</small>
          <strong>{active ? `Started ${started}` : "Clock in for your next published shift"}</strong>
          <p>{active?.location_name || "Your assigned location"}{active?.scheduled_role ? ` · ${active.scheduled_role}` : ""}</p>
        </div>

        {!eligible ? (
          <p className="clock-unavailable">Your account needs a linked employee profile before time can be recorded.</p>
        ) : !active ? (
          <button disabled={busy} onClick={() => clockAction("CLOCK_IN")}><Play size={19} />{busy ? "Starting…" : "Clock in"}</button>
        ) : (
          <div className="clock-actions">
            <button disabled={busy} onClick={() => clockAction(breakActive ? "BREAK_END" : "BREAK_START")}>
              <Pause size={18} />{breakActive ? "End break" : "Start break"}
            </button>
            <button disabled={busy} className="clock-out" onClick={() => clockAction("CLOCK_OUT")}><Square size={18} />Clock out</button>
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
                <button disabled={busy || item.correction_pending} className="correction-request" onClick={() => requestCorrection(item)}>
                  <MessageSquareWarning size={14} />{item.correction_pending ? "Correction pending" : "Request correction"}
                </button>
              )}
            </div>
          </article>
        ))}
        {!timesheets.length && <div className="empty-portal">No timesheets in this period.</div>}
      </section>

      <p className="hours-note">Worked hours become payroll-ready only after manager approval.</p>
    </div>
  );
}
