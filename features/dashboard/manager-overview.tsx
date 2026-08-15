"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Boxes, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Clock3, Coffee, NotebookPen, Play, Plus, Timer, Truck, Users } from "lucide-react";
import type { Product, Shift, NavKey } from "@/lib/data";
import type { Employee, OpsTask, ShiftNote, TimeEntry } from "@/features/workspace/types";
import { canonicalShiftDate, conflictIds, hoursBetween, toIsoDate } from "@/features/workspace/schedule-utils";
import { dashboardStyles, executionStyles, overviewStyles } from "@/lib/ui-classes";
import { PanelTitle, WorkspaceHeader } from "@/components/ui/workspace-ui";


export function DashboardWorkspace({ shifts, products, employees, timeEntries, tasks, shiftNotes, devMode, onNavigate }: { shifts: Shift[]; products: Product[]; employees: Employee[]; timeEntries: TimeEntry[]; tasks: OpsTask[]; shiftNotes:ShiftNote[]; devMode: boolean; onNavigate: (id: NavKey) => void }) {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const today = toIsoDate(new Date());
  const todaysShifts = shifts.filter((shift) => canonicalShiftDate(shift) === today);
  const assignedToday = todaysShifts.filter((shift) => !shift.isOpen);
  const openToday = todaysShifts.filter((shift) => shift.isOpen);
  const runningEntries = timeEntries.filter((entry) => entry.status === "Running");
  const lowStock = products.filter((product) => product.stock < product.par);
  const incompleteTasks = tasks.filter((task) => !task.done);
  const conflicts = conflictIds(todaysShifts);
  const availabilityConflicts = todaysShifts.filter((shift) => shift.availabilityConflict).length;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const late = assignedToday.filter((shift) => {
    const [hours, minutes] = shift.start.split(":").map(Number);
    const hasClockedIn = runningEntries.some((entry) => entry.employee === shift.employee && entry.date === today);
    return hours * 60 + minutes + 10 < nowMinutes && !hasClockedIn;
  });
  const upcoming = assignedToday.filter((shift) => {
    const [hours, minutes] = shift.start.split(":").map(Number);
    return hours * 60 + minutes >= nowMinutes;
  }).sort((a,b) => a.start.localeCompare(b.start));

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (!devMode) {
        try {
          const response = await fetch("/api/requests", { cache: "no-store" });
          const data = await response.json().catch(() => ({}));
          if (response.ok && !cancelled) {
            const groups = [data.requests, data.claims, data.transfers];
            setPendingRequests(groups.reduce((sum, group) => sum + (Array.isArray(group) ? group.length : 0), 0));
          }
        } catch {}
      }
      if (!cancelled) setLastUpdated(new Date());
    }
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [devMode]);

  const timeline = [...todaysShifts].sort((a,b) => a.start.localeCompare(b.start));
  const liveBoard = assignedToday.map((shift) => {
    const running = runningEntries.find((entry) => entry.employee === shift.employee && entry.date === today);
    const [startHours, startMinutes] = shift.start.split(":").map(Number);
    const [endHours, endMinutes] = shift.end.split(":").map(Number);
    const startTotal = startHours * 60 + startMinutes;
    let endTotal = endHours * 60 + endMinutes;
    if (endTotal <= startTotal) endTotal += 1440;
    let comparableNow = nowMinutes;
    if (endTotal > 1440 && nowMinutes < startTotal) comparableNow += 1440;
    if (running?.onBreak) return { shift, status: "On break", tone: "break", detail: `Since ${running.clockIn}` };
    if (running && comparableNow > endTotal + 60) return { shift, status: "Missing clock-out", tone: "danger", detail: `Shift ended ${shift.end}` };
    if (running) return { shift, status: "Clocked in", tone: "live", detail: `Since ${running.clockIn}` };
    if (comparableNow > startTotal + 10 && comparableNow <= endTotal) return { shift, status: "Late", tone: "warning", detail: `Expected ${shift.start}` };
    if (comparableNow < startTotal) {
      const minutesUntil = startTotal - comparableNow;
      return { shift, status: "Expected", tone: "expected", detail: minutesUntil < 60 ? `In ${minutesUntil} min` : `At ${shift.start}` };
    }
    return { shift, status: "Shift ended", tone: "muted", detail: `${shift.start}–${shift.end}` };
  }).sort((a,b) => {
    const priority: Record<string, number> = { danger: 0, warning: 1, break: 2, live: 3, expected: 4, muted: 5 };
    return priority[a.tone] - priority[b.tone] || a.shift.start.localeCompare(b.shift.start);
  });
  const attentionTotal = openToday.length + late.length + lowStock.length + pendingRequests + conflicts.size + availabilityConflicts;
  const completedToday = assignedToday.filter((shift) => { const [eh,em]=shift.end.split(":").map(Number); const [sh,sm]=shift.start.split(":").map(Number); let end=eh*60+em; const start=sh*60+sm; if(end<=start) end+=1440; let current=nowMinutes; if(end>1440&&current<start) current+=1440; return current>end; });
  const workedMinutesToday = timeEntries.filter((entry) => entry.date === today).reduce((total, entry) => {
    if (!entry.clockOut) return total;
    const [ih,im]=entry.clockIn.split(":").map(Number); const [oh,om]=entry.clockOut.split(":").map(Number);
    let minutes=(oh*60+om)-(ih*60+im); if(minutes<0) minutes+=1440;
    return total + Math.max(0, minutes-entry.breakMinutes);
  }, 0);
  const completedTasks = tasks.filter((task) => task.done).length;
  const operationalExceptions = late.length + openToday.length + conflicts.size + availabilityConflicts + incompleteTasks.length;
  return <div className={`${dashboardStyles.dashboard} page-flow`}>
    <WorkspaceHeader eyebrow={new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})} title="Today’s operations" description={`Live overview for the current location · updated ${lastUpdated.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`} />
    <section className={`${dashboardStyles.metrics}`}>
      <Metric icon={Users} label="Clocked in" value={`${runningEntries.length}`} detail={`${assignedToday.length} assigned today`} trend={runningEntries.length ? "Live now" : "No active clocks"} />
      <Metric icon={Clock3} label="Expected next" value={upcoming[0]?.start || "—"} detail={upcoming[0]?.employee || "No more arrivals"} trend={`${upcoming.length} upcoming`} />
      <Metric icon={ClipboardList} label="Pending requests" value={`${pendingRequests}`} detail="Leave, claims and transfers" trend={pendingRequests ? "Review queue" : "All clear"} warning={pendingRequests > 0} />
      <Metric icon={AlertTriangle} label="Needs attention" value={`${attentionTotal}`} detail={`${late.length} late · ${openToday.length} open · ${lowStock.length} low stock`} trend={attentionTotal ? "Review now" : "All clear"} warning={attentionTotal > 0} />
    </section>
    <section className={`card card-flush ${dashboardStyles.heroPanel}`}><PanelTitle title="Live shift board" description={`${runningEntries.length} clocked in · ${late.length} late · ${upcoming.length} expected`} actions={<button type="button" className="text-button" onClick={() => onNavigate("attendance")}>Open attendance <ArrowRight size={15} /></button>} />
      <div className={dashboardStyles.liveList}>
        {liveBoard.length === 0 && <div className={dashboardStyles.empty}>No employees are assigned today.</div>}
        {liveBoard.map(({ shift, status, tone, detail }) => <button type="button" className={dashboardStyles.liveRow} key={shift.id} onClick={() => onNavigate("attendance")}>
          <div className="avatar">{shift.initials}</div><div className={dashboardStyles.livePerson}><strong>{shift.employee}</strong><small>{shift.role} · {shift.start}–{shift.end}</small></div><div className={dashboardStyles.liveStatus} data-tone={tone}><span>{status}</span><small>{detail}</small></div><ChevronRight size={18}/>
        </button>)}
      </div>
    </section>
    <div className={`${dashboardStyles.contentGrid}`}>
      <section className={`card card-flush today-panel ${dashboardStyles.panel}`}><PanelTitle title="Today’s timeline" description={`${assignedToday.length} assigned · ${openToday.length} open`} actions={<button className="text-button" onClick={() => onNavigate("schedule")}>Open shift plan <ArrowRight size={15} /></button>} />
        <div className="timeline">
          {timeline.length === 0 && <div className={dashboardStyles.empty}>No shifts scheduled today.</div>}
          {timeline.map((shift) => <button type="button" className={`timeline-row ${dashboardStyles.timelineAction}`} key={shift.id} onClick={() => onNavigate("schedule")}><time>{shift.start}</time><div className={`avatar ${shift.isOpen ? "sand" : ""}`}>{shift.isOpen ? "+" : shift.initials}</div><div className="grow"><strong>{shift.employee}</strong><span>{shift.role}{shift.availabilityConflict ? " · availability conflict" : ""}</span></div><span className="shift-time">{shift.start}–{shift.end}</span><ChevronRight size={18}/></button>)}
        </div>
      </section>
      <section className={`card card-flush attention-panel ${dashboardStyles.panel} ${dashboardStyles.attention}`}><PanelTitle title="Attention needed" description="Prioritised operational actions" />
        <button className={overviewStyles.attentionItem} onClick={() => onNavigate("attendance")}><span className={`${overviewStyles.attentionIcon} ${overviewStyles.amber}`}><Timer size={19} /></span><div><strong>{late.length} employees late</strong><small>{runningEntries.length} currently clocked in</small></div><ChevronRight size={18} /></button>
        <button className={overviewStyles.attentionItem} onClick={() => onNavigate("requests")}><span className={`${overviewStyles.attentionIcon} ${overviewStyles.violet}`}><ClipboardList size={19} /></span><div><strong>{pendingRequests} pending requests</strong><small>Leave, open shifts and transfers</small></div><ChevronRight size={18} /></button>
        <button className={overviewStyles.attentionItem} onClick={() => onNavigate("schedule")}><span className={`${overviewStyles.attentionIcon} ${overviewStyles.violet}`}><CalendarDays size={19} /></span><div><strong>{openToday.length + conflicts.size + availabilityConflicts} schedule issues</strong><small>{openToday.length} open shifts · {conflicts.size + availabilityConflicts} conflicts</small></div><ChevronRight size={18} /></button>
        <button className={overviewStyles.attentionItem} onClick={() => onNavigate("inventory")}><span className={`${overviewStyles.attentionIcon} ${overviewStyles.amber}`}><Boxes size={19} /></span><div><strong>{lowStock.length} products below par</strong><small>Review stock and suggested orders</small></div><ChevronRight size={18} /></button>
        <button className={overviewStyles.attentionItem} onClick={() => onNavigate("operations")}><span className={`${overviewStyles.attentionIcon} ${overviewStyles.blue}`}><CheckCircle2 size={19} /></span><div><strong>{incompleteTasks.length} operations tasks open</strong><small>Opening, closing and maintenance</small></div><ChevronRight size={18} /></button>
      </section>
    </div>
    <section className={`card card-flush ${dashboardStyles.summary}`}><PanelTitle title="Operational summary" description="Current progress and outstanding work for today" />
      <div className={dashboardStyles.summaryGrid}>
        <div><span>Completed shifts</span><strong>{completedToday.length}</strong><small>{assignedToday.length} assigned today</small></div>
        <div><span>Worked hours</span><strong>{(workedMinutesToday/60).toFixed(1)}</strong><small>Recorded after breaks</small></div>
        <div><span>Tasks completed</span><strong>{completedTasks}/{tasks.length}</strong><small>{incompleteTasks.length} still open</small></div>
        <div><span>Open exceptions</span><strong>{operationalExceptions}</strong><small>Staffing, schedule and operations</small></div>
      </div>
    </section>
    {shiftNotes.length>0&&<section className={`card card-flush shift-notes-panel ${dashboardStyles.panel}`}><PanelTitle title="Latest shift notes" description="Incidents, equipment, stock and handover notes from the team" actions={<button type="button" className="text-button" onClick={()=>onNavigate("schedule")}>Open schedule <ArrowRight size={15}/></button>}/><div className={dashboardStyles.notesList}>{shiftNotes.slice(0,6).map(note=><article key={note.id}><span className={dashboardStyles.noteCategory}>{note.category}</span><div><strong>{note.author} · {note.role}</strong><p>{note.note}</p><small>{new Date(note.createdAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div></article>)}</div></section>}
    <section className={`card card-flush quick-panel ${dashboardStyles.quickPanel}`}><PanelTitle title="Quick actions" description="Jump directly into today’s work" /><div className={overviewStyles.quickGrid}>
      <Quick icon={Plus} label="Create shift" detail="Add or assign today’s coverage" onClick={() => onNavigate("schedule")} />
      <Quick icon={ClipboardList} label="Review requests" detail="Approve employee requests" onClick={() => onNavigate("requests")} />
      <Quick icon={Timer} label="Time & attendance" detail="Review clocks and exceptions" onClick={() => onNavigate("attendance")} />
      <Quick icon={Boxes} label="Start stock count" detail="Update inventory levels" onClick={() => onNavigate("inventory")} />
      <Quick icon={Truck} label="Receive delivery" detail="Open purchase orders" onClick={() => onNavigate("orders")} />
      <Quick icon={NotebookPen} label="Daily operations" detail="Complete opening and closing tasks" onClick={() => onNavigate("operations")} />
    </div></section>
  </div>
}

export function ShiftExecutionWorkspace({ shifts, entries, notes, onNavigate }: { shifts: Shift[]; entries: TimeEntry[]; notes: ShiftNote[]; onNavigate: (id: NavKey) => void }) {
  const today = toIsoDate(new Date());
  const todayShifts = shifts.filter((shift) => canonicalShiftDate(shift) === today && !shift.isOpen).sort((a,b)=>a.start.localeCompare(b.start));
  const activeEntries = entries.filter((entry) => entry.date === today && entry.status === "Running");
  return <div className={`${executionStyles.workspace} page-flow`}>
    <WorkspaceHeader eyebrow="Live operations" title="Shift execution" description="Run the current shift from one operational view" actions={<button type="button" className="primary" onClick={()=>onNavigate("attendance")}><Timer size={16}/>Open attendance</button>} />
    <section className={`${executionStyles.metrics}`}>
      <Metric icon={Users} label="Assigned today" value={`${todayShifts.length}`} detail="Published employee shifts" trend="Current location" />
      <Metric icon={Play} label="Clocked in" value={`${activeEntries.length}`} detail={`${activeEntries.filter(entry=>entry.onBreak).length} currently on break`} trend="Live attendance" />
      <Metric icon={NotebookPen} label="Shift notes" value={`${notes.length}`} detail="Latest operational notes" trend="Handover context" />
      <Metric icon={AlertTriangle} label="Exceptions" value={`${todayShifts.filter(shift=>shift.availabilityConflict).length}`} detail="Availability conflicts today" trend="Review before service" warning={todayShifts.some(shift=>shift.availabilityConflict)} />
    </section>
    <section className={`card card-flush ${executionStyles.board}`}><PanelTitle title="Current shift board" description="Attendance, breaks and shift context" />
      <div className={executionStyles.list}>{todayShifts.length===0&&<div className={dashboardStyles.empty}>No assigned shifts today.</div>}{todayShifts.map(shift=>{const entry=activeEntries.find(item=>item.employee===shift.employee); const shiftNotes=notes.filter(note=>note.shiftId===shift.id); return <article key={shift.id}><div className="avatar">{shift.initials}</div><div><strong>{shift.employee}</strong><small>{shift.role} · {shift.start}–{shift.end}</small></div><span className={executionStyles.state} data-state={entry?.onBreak?"break":entry?"live":"expected"}>{entry?.onBreak?"On break":entry?"Clocked in":"Expected"}</span><small>{shiftNotes.length} notes</small><button type="button" className="text-button" onClick={()=>onNavigate(entry?"attendance":"schedule")}>{entry?"Manage":"Open shift"}<ArrowRight size={14}/></button></article>})}</div>
    </section>
    <section className={`card card-flush ${executionStyles.actionsPanel}`}><PanelTitle title="Execution actions" description="Existing operational tools"/><div className={executionStyles.actionGrid}><Quick icon={Coffee} label="Manage breaks" detail="Start or end an employee break" onClick={()=>onNavigate("attendance")}/><Quick icon={NotebookPen} label="Review notes" detail="See incidents and handover notes" onClick={()=>onNavigate("dashboard")}/><Quick icon={CalendarDays} label="Adjust coverage" detail="Reassign or open a shift" onClick={()=>onNavigate("schedule")}/><Quick icon={CheckCircle2} label="Operations tasks" detail="Opening, closing and maintenance" onClick={()=>onNavigate("operations")}/></div></section>
  </div>
}

function Metric({ icon: Icon, label, value, detail, trend, warning }: { icon: typeof Users; label: string; value: string; detail: string; trend: string; warning?: boolean }) {
  return <div className={overviewStyles.metric}><span className={overviewStyles.metricLabel}>{label}</span><strong>{value}</strong><small>{detail}</small><div className={`${overviewStyles.metricTrend} ${warning ? overviewStyles.warning : ""}`}>{warning ? <AlertTriangle size={13} /> : <span aria-hidden="true" className={overviewStyles.statusDot} />}{trend}</div></div>
}
function Quick({ icon: Icon, label, detail, onClick }: { icon: typeof CalendarDays; label: string; detail: string; onClick: () => void }) { return <button className={overviewStyles.quickAction} onClick={onClick}><span className={overviewStyles.quickIcon}><Icon size={19} /></span><div><strong>{label}</strong><small>{detail}</small></div><ArrowRight size={17} /></button> }

