"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

type WeeklyRule = { weekday: number; available: boolean; available_from: string | null; available_to: string | null; note?: string | null };
type DateRule = { date: string; available: boolean; available_from: string | null; available_to: string | null };
type ApiDateRule = { valid_from: string; available: boolean; available_from: string | null; available_to: string | null };

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const defaults: WeeklyRule[] = days.map((_, weekday) => ({ weekday, available: true, available_from: "09:00", available_to: "17:00" }));

function monthValue(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function shiftMonth(month: string, amount: number) { const [year, value] = month.split("-").map(Number); return monthValue(new Date(year, value - 1 + amount, 1)); }
function dateOnly(value: string) { return value.slice(0, 10); }
function datesInMonth(month: string) {
  const [year, value] = month.split("-").map(Number);
  const count = new Date(year, value, 0).getDate();
  return Array.from({ length: count }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`);
}
function labelForDate(value: string) { const date = new Date(`${value}T12:00:00`); return { day: shortDays[date.getDay()], number: date.getDate() }; }
function monthLabel(value: string) { const [year, month] = value.split("-").map(Number); return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1)); }

async function readJson(response: Response) { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Request failed"); return data; }

export function AvailabilityEditor() {
  const [mode, setMode] = useState<"weekly" | "monthly">("monthly");
  const [weekly, setWeekly] = useState<WeeklyRule[]>(defaults);
  const [month, setMonth] = useState(monthValue());
  const [dates, setDates] = useState<DateRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true); setMessage("");
      fetch(`/api/availability?month=${month}`, { cache: "no-store" })
        .then(readJson)
        .then((data: { weekly: WeeklyRule[]; dates: ApiDateRule[] }) => {
          if (!active) return;
          const weeklyMap = new Map((data.weekly || []).map(rule => [rule.weekday, rule]));
          const normalizedWeekly = defaults.map(rule => weeklyMap.get(rule.weekday) || rule);
          setWeekly(normalizedWeekly);
          const specific = new Map((data.dates || []).map(rule => [dateOnly(rule.valid_from), rule]));
          setDates(datesInMonth(month).map(date => {
            const exact = specific.get(date);
            if (exact) return { date, available: exact.available, available_from: exact.available_from, available_to: exact.available_to };
            const weekday = new Date(`${date}T12:00:00`).getDay();
            const fallback = normalizedWeekly[weekday];
            return { date, available: fallback.available, available_from: fallback.available_from, available_to: fallback.available_to };
          }));
        })
        .catch(error => active && setMessage(error instanceof Error ? error.message : "Could not load availability."))
        .finally(() => active && setLoading(false));
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [month]);

  const allAvailable = useMemo(() => dates.length > 0 && dates.every(item => item.available), [dates]);
  function patchWeekly(index: number, patch: Partial<WeeklyRule>) { setWeekly(value => value.map((rule, current) => current === index ? { ...rule, ...patch } : rule)); }
  function patchDate(date: string, patch: Partial<DateRule>) { setDates(value => value.map(rule => rule.date === date ? { ...rule, ...patch } : rule)); }
  function setAll(available: boolean) { setDates(value => value.map(rule => ({ ...rule, available }))); }
  function copyDay(source: DateRule) { setDates(value => value.map(rule => ({ ...rule, available: source.available, available_from: source.available_from, available_to: source.available_to }))); }

  async function saveWeekly() {
    setBusy(true); setMessage("");
    try {
      await readJson(await fetch("/api/availability", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "WEEKLY", rules: weekly.map(rule => ({ weekday: rule.weekday, available: rule.available, availableFrom: rule.available ? rule.available_from : null, availableTo: rule.available ? rule.available_to : null, note: rule.note || null })) }) }));
      setMessage("Weekly availability saved");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save availability"); }
    finally { setBusy(false); }
  }

  async function saveMonth() {
    setBusy(true); setMessage("");
    try {
      await readJson(await fetch("/api/availability", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "MONTH", month, rules: dates.map(rule => ({ date: rule.date, available: rule.available, availableFrom: rule.available ? rule.available_from : null, availableTo: rule.available ? rule.available_to : null })) }) }));
      setMessage(`${monthLabel(month)} availability saved`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save monthly availability"); }
    finally { setBusy(false); }
  }

  return <>
    <div className="availability-mode" role="tablist" aria-label="Availability type">
      <button type="button" role="tab" aria-selected={mode === "monthly"} className={mode === "monthly" ? "selected" : ""} onClick={() => setMode("monthly")}>By month</button>
      <button type="button" role="tab" aria-selected={mode === "weekly"} className={mode === "weekly" ? "selected" : ""} onClick={() => setMode("weekly")}>Recurring week</button>
    </div>

    {loading ? <div className="card skeleton-card" /> : mode === "weekly" ? <>
      <p className="availability-help">This recurring pattern is used as the starting point for months without date-specific changes.</p>
      <section className="availability-grid">{weekly.map((rule, index) => <article key={rule.weekday} className={`card card-compact ${!rule.available ? "unavailable" : ""}`}><div><strong>{days[rule.weekday]}</strong><label className="availability-switch"><input type="checkbox" checked={rule.available} onChange={event => patchWeekly(index, { available: event.target.checked })} /><span>{rule.available ? "Available" : "Unavailable"}</span></label></div>{rule.available && <div className="availability-times"><label>From<input type="time" value={rule.available_from || ""} onChange={event => patchWeekly(index, { available_from: event.target.value })} /></label><label>Until<input type="time" value={rule.available_to || ""} onChange={event => patchWeekly(index, { available_to: event.target.value })} /></label></div>}</article>)}</section>
      <button type="button" className="primary full" disabled={busy} onClick={saveWeekly}>{busy ? "Saving…" : <><Check size={18} />Save recurring week</>}</button>
    </> : <>
      <div className="month-picker"><button type="button" className="icon-button" aria-label="Previous month" onClick={() => setMonth(value => shiftMonth(value, -1))}><ChevronLeft /></button><label><span>Month</span><input type="month" value={month} onChange={event => setMonth(event.target.value)} /></label><button type="button" className="icon-button" aria-label="Next month" onClick={() => setMonth(value => shiftMonth(value, 1))}><ChevronRight /></button></div>
      <div className="availability-bulk"><button type="button" className="secondary compact" onClick={() => setAll(!allAvailable)}>{allAvailable ? "Mark all unavailable" : "Mark all available"}</button></div>
      <section className="monthly-availability-grid">{dates.map(rule => { const label = labelForDate(rule.date); return <article key={rule.date} className={`card card-compact ${!rule.available ? "unavailable" : ""}`}><div className="monthly-date"><span>{label.day}</span><strong>{label.number}</strong></div><div className="monthly-controls"><label className="availability-switch"><input type="checkbox" checked={rule.available} onChange={event => patchDate(rule.date, { available: event.target.checked })} /><span>{rule.available ? "Available" : "Unavailable"}</span></label>{rule.available && <div className="availability-times"><label>From<input type="time" value={rule.available_from || ""} onChange={event => patchDate(rule.date, { available_from: event.target.value })} /></label><label>Until<input type="time" value={rule.available_to || ""} onChange={event => patchDate(rule.date, { available_to: event.target.value })} /></label></div>}<button type="button" className="text-button" onClick={() => copyDay(rule)}>Copy to all dates</button></div></article> })}</section>
      <button type="button" className="primary full" disabled={busy || !dates.length} onClick={saveMonth}>{busy ? "Saving…" : <><Check size={18} />Save {monthLabel(month)}</>}</button>
    </>}
    {message && <p className="employee-form-message" role="status">{message}</p>}
  </>;
}
