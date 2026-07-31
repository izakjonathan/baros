"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareWarning,
  Pause,
  Play,
  Square,
} from "lucide-react";

const history = [
  { date: "27 Jul", scheduled: 8, worked: 7.68, status: "Approved" },
  { date: "24 Jul", scheduled: 8, worked: 8.15, status: "Approved" },
  { date: "22 Jul", scheduled: 7, worked: 6.75, status: "Approved" },
  { date: "20 Jul", scheduled: 8, worked: 8.0, status: "Pending" },
];

export default function HoursPage() {
  const [running, setRunning] = useState(false);
  const [requests, setRequests] = useState<string[]>([]);
  const [onBreak, setOnBreak] = useState(false);
  const [started, setStarted] = useState<string | null>(null);
  const [period, setPeriod] = useState("This week");

  const totals = useMemo(
    () => ({
      scheduled: history.reduce((total, item) => total + item.scheduled, 0),
      worked: history
        .filter((item) => item.status === "Approved")
        .reduce((total, item) => total + item.worked, 0),
    }),
    [],
  );

  function clockIn() {
    setRunning(true);
    setStarted(
      new Date().toLocaleTimeString("en-DK", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    );
  }

  function requestCorrection(date: string) {
    const reason = window.prompt(`What is wrong with the ${date} timesheet?`);
    if (reason?.trim()) {
      setRequests((current) => [`${date}: ${reason.trim()}`, ...current]);
    }
  }

  return (
    <div className="employee-page">
      <p className="eyebrow">Time &amp; attendance</p>
      <h1>My hours</h1>
      <p className="employee-lead">
        Clock in and out, then review your scheduled and approved worked hours.
      </p>

      <section className={`clock-card ${running ? "clock-running" : ""}`}>
        <div>
          <small>
            {running
              ? onBreak
                ? "Break in progress"
                : "Shift in progress"
              : "Ready to start"}
          </small>
          <strong>
            {running ? `Started ${started}` : "Today’s shift · 18:00–02:00"}
          </strong>
          <p>Temple Bar · Bartender</p>
        </div>

        {!running ? (
          <button onClick={clockIn}>
            <Play size={19} />
            Clock in
          </button>
        ) : (
          <div className="clock-actions">
            <button onClick={() => setOnBreak((value) => !value)}>
              <Pause size={18} />
              {onBreak ? "End break" : "Start break"}
            </button>
            <button
              className="clock-out"
              onClick={() => {
                setRunning(false);
                setOnBreak(false);
              }}
            >
              <Square size={18} />
              Clock out
            </button>
          </div>
        )}
      </section>

      <div className="hours-period">
        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option>This week</option>
          <option>Last week</option>
          <option>This month</option>
          <option>Custom period</option>
        </select>
      </div>

      <section className="employee-hour-cards">
        <article>
          <CalendarDays />
          <span>
            Scheduled
            <strong>{totals.scheduled.toFixed(1)}h</strong>
          </span>
        </article>
        <article>
          <Clock3 />
          <span>
            Approved worked
            <strong>{totals.worked.toFixed(1)}h</strong>
          </span>
        </article>
      </section>

      <h2>Timesheets</h2>
      <section className="hours-history">
        {history.map((item) => (
          <article key={item.date}>
            <div>
              <strong>{item.date}</strong>
              <span>{item.scheduled.toFixed(1)}h scheduled</span>
            </div>
            <div>
              <b>{item.worked.toFixed(2)}h</b>
              <span className={item.status === "Approved" ? "approved" : "pending"}>
                {item.status === "Approved" && <CheckCircle2 size={13} />} {item.status}
              </span>
              <button
                className="correction-request"
                onClick={() => requestCorrection(item.date)}
              >
                <MessageSquareWarning size={14} />
                Request correction
              </button>
            </div>
          </article>
        ))}
      </section>

      {requests.length > 0 && (
        <section className="employee-correction-list">
          <h2>Correction requests</h2>
          {requests.map((request, index) => (
            <article key={`${request}-${index}`}>
              <span>Pending manager review</span>
              <p>{request}</p>
            </article>
          ))}
        </section>
      )}

      <p className="hours-note">
        Worked hours become final after manager approval. Any manager edit should appear in
        the audit history.
      </p>
    </div>
  );
}
