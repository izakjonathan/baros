"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCheck, ChevronLeft, ChevronRight, Copy, Plus, Send, X } from "lucide-react";
import type { Shift } from "@/lib/data";
import type { Persist, ScheduleAcknowledgementSummary } from "@/features/workspace/types";
import { BASE_MONDAY, canonicalShiftDate, conflictIds, dateFromSerial, dateSerial, isOvernight, mapDatabaseShift, shiftPositionFromDate, toIsoDate, type DatabaseShiftRecord } from "@/features/workspace/schedule-utils";
import scheduleStyles from "./ScheduleWorkspace.module.css";

export function ScheduleWorkspace({ shifts, setShifts, onNewShift, onEditShift, notify, currentWeekOffset, setCurrentWeekOffset, devMode, selectedLocationId, persist }: { shifts: Shift[]; setShifts: React.Dispatch<React.SetStateAction<Shift[]>>; onNewShift: (date?: string) => void; onEditShift: (shift: Shift) => void; notify: (s: string) => void; currentWeekOffset: number; setCurrentWeekOffset: React.Dispatch<React.SetStateAction<number>>; devMode: boolean; selectedLocationId: string; persist: Persist }) {
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month" | "custom">("week");
  const [customFrom,setCustomFrom]=useState(toIsoDate(BASE_MONDAY));
  const customDefaultEnd=new Date(BASE_MONDAY); customDefaultEnd.setDate(customDefaultEnd.getDate()+13);
  const [customTo,setCustomTo]=useState(toIsoDate(customDefaultEnd));
  const [monthOffset, setMonthOffset] = useState(0);
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [acknowledgements, setAcknowledgements] = useState<ScheduleAcknowledgementSummary>({ publication: null, employees: [] });
  const [acknowledgementsOpen, setAcknowledgementsOpen] = useState(false);
  const [remindingAcknowledgements, setRemindingAcknowledgements] = useState(false);
  const [acknowledgementMessage, setAcknowledgementMessage] = useState("");
  const weekMonday = new Date(BASE_MONDAY); weekMonday.setDate(BASE_MONDAY.getDate() + currentWeekOffset * 7);
  const monthAnchor = new Date(BASE_MONDAY.getFullYear(), BASE_MONDAY.getMonth() + monthOffset, 1, 12);
  const periodStart = viewMode === "week" ? weekMonday : viewMode === "month" ? new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1, 12) : new Date(`${customFrom}T12:00:00`);
  const periodEnd = viewMode === "week" ? new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + 6, 12) : viewMode === "month" ? new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0, 12) : new Date(`${customTo < customFrom ? customFrom : customTo}T12:00:00`);
  const displayDays = Array.from({ length: Math.round((dateSerial(toIsoDate(periodEnd)) - dateSerial(toIsoDate(periodStart)))) + 1 }, (_, index) => {
    const date = new Date(periodStart); date.setDate(periodStart.getDate() + index);
    const iso = toIsoDate(date);
    const pos = shiftPositionFromDate(iso);
    return { iso, short: date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(), date: String(date.getDate()).padStart(2, "0"), pos };
  });
  const startIso = displayDays[0]?.iso;
  const endIso = displayDays.at(-1)?.iso;
  const visibleShifts = shifts.filter((shift) => { const date = canonicalShiftDate(shift); return !!startIso && !!endIso && date >= startIso && date <= endIso; });
  const drafts = visibleShifts.filter((shift) => shift.status === "Draft").length;
  const conflicts = conflictIds(visibleShifts);
  const availabilityConflicts = new Set(visibleShifts.filter((shift) => shift.availabilityConflict).map((shift) => shift.id));
  const conflictShiftIds = new Set([...conflicts, ...availabilityConflicts]);
  const displayedShifts = showConflictsOnly ? visibleShifts.filter((shift) => conflictShiftIds.has(shift.id)) : visibleShifts;
  const rangeLabel = viewMode === "month" ? periodStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : `${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  const compactRangeLabel = viewMode === "month" ? periodStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : `${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  const weekLabel = currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : rangeLabel;
  const compactPeriodLabel = viewMode === "week" ? (currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : compactRangeLabel) : compactRangeLabel;
  const acknowledgedCount = acknowledgements.employees.filter((employee) => employee.acknowledgedAt).length;
  const loadAcknowledgements = useCallback(async () => {
    if (devMode || viewMode !== "week" || !selectedLocationId || !startIso) { setAcknowledgements({ publication: null, employees: [] }); return; }
    try {
      const response = await fetch(`/api/schedule-acknowledgements?locationId=${encodeURIComponent(selectedLocationId)}&weekStart=${encodeURIComponent(startIso)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Could not load acknowledgements");
      setAcknowledgements({ publication: data.publication || null, employees: Array.isArray(data.employees) ? data.employees : [] });
    } catch { setAcknowledgements({ publication: null, employees: [] }); }
  }, [devMode, selectedLocationId, startIso, viewMode]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadAcknowledgements(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAcknowledgements]);
  useEffect(() => {
    const scroller = calendarScrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: 0, behavior: "instant" });
  }, [viewMode, startIso]);
  async function remindOutstandingAcknowledgements() {
    if (remindingAcknowledgements || !acknowledgements.publication) return;
    setRemindingAcknowledgements(true);
    setAcknowledgementMessage("");
    try {
      const response = await fetch("/api/schedule-acknowledgements", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "REMIND_OUTSTANDING", publicationId: acknowledgements.publication.id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Could not send reminders");
      const sent = Number(data?.sent || 0);
      setAcknowledgementMessage(sent ? `Reminder${sent === 1 ? "" : "s"} sent to ${sent} employee${sent === 1 ? "" : "s"}.` : "No new reminders were sent. Employees may already have been reminded recently.");
    } catch (error) {
      setAcknowledgementMessage(error instanceof Error ? error.message : "Could not send reminders");
    } finally {
      setRemindingAcknowledgements(false);
    }
  }
  function movePeriod(direction: number) { if (viewMode === "week") setCurrentWeekOffset((week) => week + direction); else if(viewMode === "month") setMonthOffset((month) => month + direction); else { const days=Math.max(1,dateSerial(customTo)-dateSerial(customFrom)+1); setCustomFrom(dateFromSerial(dateSerial(customFrom)+direction*days)); setCustomTo(dateFromSerial(dateSerial(customTo)+direction*days)); } }
  async function publish() {
    if (!drafts) { notify("This period is already published"); return; }
    if (conflicts.size) { notify(`Resolve ${conflicts.size} conflicting shift${conflicts.size === 1 ? "" : "s"} before publishing`); return; }
    if (availabilityConflicts.size) { notify(`Resolve ${availabilityConflicts.size} employee availability conflict${availabilityConflicts.size === 1 ? "" : "s"} before publishing`); return; }
    if (!startIso || !endIso) { notify("This schedule period is unavailable"); return; }
    if (!devMode && !selectedLocationId) { notify("Select a location before publishing"); return; }
    setPublishing(true);
    try {
      if (!devMode) {
        const exclusiveEnd = dateFromSerial(dateSerial(endIso)+1);
        await persist("/api/schedule-publish", { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ locationId: selectedLocationId, weekStart: startIso, weekEnd: exclusiveEnd }) });
      }
      setShifts((current) => current.map((shift) => { const date=canonicalShiftDate(shift); return date>=startIso&&date<=endIso&&shift.status==="Draft"?{...shift,status:"Published"}:shift; }));
      notify(`${drafts} shift${drafts === 1 ? "" : "s"} published`);
      await loadAcknowledgements();
    } catch (error) { notify(error instanceof Error ? error.message : "Could not publish schedule"); }
    finally { setPublishing(false); }
  }
  async function copyPreviousWeek() {
    if (viewMode !== "week") { notify("Switch to Week view to copy the previous week"); return; }
    const source = shifts.filter((shift) => (shift.weekOffset ?? 0) === currentWeekOffset - 1);
    if (!source.length) { notify("The previous week has no shifts to copy"); return; }
    if (visibleShifts.length && !window.confirm("This week already contains shifts. Add copies from the previous week as additional drafts?")) return;
    const copies = source.map((shift) => { const sourceDate = new Date(`${canonicalShiftDate(shift)}T12:00:00`); sourceDate.setDate(sourceDate.getDate() + 7); const date = toIsoDate(sourceDate); const position = shiftPositionFromDate(date); return { ...shift, id: crypto.randomUUID(), date, day: position.day, weekOffset: position.weekOffset, status: "Draft" as const, recurrenceLabel: undefined }; });
    try {
      if (devMode) setShifts((current) => [...current, ...copies]);
      else {
        const saved: Shift[] = [];
        for (const shift of copies) {
          const result = await persist<{ shifts?: DatabaseShiftRecord[] }>("/api/shifts", { method:"POST", body:JSON.stringify({ locationId:selectedLocationId, employeeId:shift.employeeId, isOpen:shift.isOpen, role:shift.role, startsAt:`${canonicalShiftDate(shift)}T${shift.start}:00`, endsAt:`${dateFromSerial(dateSerial(canonicalShiftDate(shift))+(isOvernight(shift.start,shift.end)?1:0))}T${shift.end}:00`, status:"DRAFT" }) });
          saved.push(...(result?.shifts || []).map(mapDatabaseShift));
        }
        setShifts((current) => [...current, ...saved]);
      }
      notify(`${copies.length} shifts copied as drafts`);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not copy previous week"); }
  }
  return <div className={`${scheduleStyles.workspace} page-flow`}>
    <div className={scheduleStyles.header}>
      <div className={scheduleStyles.headerCopy}><p className="eyebrow">{rangeLabel}</p><h1>Shift plan</h1></div>
      <div className={scheduleStyles.headerActions}><button className="secondary compact-action" onClick={copyPreviousWeek} disabled={viewMode !== "week"}><Copy size={15} /><span>Copy previous week</span></button><button className={`${scheduleStyles.topAddShift} primary compact-action`} onClick={() => onNewShift(displayDays[0]?.iso)}><Plus size={16} /><span>Add shift</span></button></div>
    </div>
    <section className={`${scheduleStyles.toolbar} ${viewMode === "custom" ? scheduleStyles.customMode : ""}`}>
      <div className={scheduleStyles.periodControls}><button onClick={() => movePeriod(-1)} aria-label={`Previous ${viewMode}`}><ChevronLeft size={17}/></button><strong>{compactPeriodLabel}</strong><button onClick={() => movePeriod(1)} aria-label={`Next ${viewMode}`}><ChevronRight size={17}/></button></div>
      <label className={scheduleStyles.viewSelect}><span className={scheduleStyles.viewLabel} aria-hidden="true">{viewMode === "custom" ? "Period" : viewMode === "month" ? "Month" : "Week"}</span><select aria-label="Schedule view" value={viewMode} onChange={(event) => setViewMode(event.target.value as "week" | "month" | "custom")}><option value="week">Week</option><option value="month">Month</option><option value="custom">Period</option></select></label>
      {viewMode==="custom"&&<div className={scheduleStyles.customRange}><label><span>From</span><input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/></label><label><span>To</span><input type="date" value={customTo} min={customFrom} onChange={e=>setCustomTo(e.target.value)}/></label></div>}
      <div className={scheduleStyles.summary}><span className={scheduleStyles.summaryText}><b>{visibleShifts.length}</b> shifts · <b>{drafts}</b> drafts{conflicts.size ? <> · <b className={scheduleStyles.conflictCount}>{conflicts.size}</b> overlaps</> : null}{availabilityConflicts.size ? <> · <b className={scheduleStyles.conflictCount}>{availabilityConflicts.size}</b> availability</> : null}</span>{conflictShiftIds.size ? <button type="button" className="secondary compact-action" aria-pressed={showConflictsOnly} onClick={() => setShowConflictsOnly((value) => !value)}><AlertTriangle size={15}/><span>{showConflictsOnly ? "Show all" : `Review conflicts (${conflictShiftIds.size})`}</span></button> : null}<button type="button" className="publish-button compact-publish" onClick={publish} disabled={!drafts || publishing}><Send size={15}/><span>{publishing ? "Publishing…" : drafts ? `Publish (${drafts})` : "Published"}</span></button></div>
    </section>
    <section className={`${scheduleStyles.calendarPanel} ${viewMode === "month" ? scheduleStyles.monthView : scheduleStyles.weekView}`}><div ref={calendarScrollRef} className={scheduleStyles.calendarScroll}><div className={scheduleStyles.calendarGrid}>
      {displayDays.map((day) => {
        const isToday = day.iso === toIsoDate(new Date());
        const dayShifts = displayedShifts.filter((shift) => canonicalShiftDate(shift) === day.iso);
        return <div className={`${scheduleStyles.dayColumn} ${isToday ? scheduleStyles.today : ""}`} key={day.iso} onDragOver={(e)=>e.preventDefault()} onDrop={async (e)=>{e.preventDefault();const id=e.dataTransfer.getData("text/shift-id");const original=shifts.find(x=>x.id===id);if(!original||canonicalShiftDate(original)===day.iso)return;const moved={...original,date:day.iso,day:day.pos.day,weekOffset:day.pos.weekOffset,status:"Draft" as const};try{if(!devMode){const rows=await persist<DatabaseShiftRecord[]>("/api/shifts",{method:"PATCH",body:JSON.stringify({id:original.id,scope:"occurrence",employeeId:original.employeeId,isOpen:original.isOpen,role:original.role,startsAt:`${day.iso}T${original.start}:00`,endsAt:`${dateFromSerial(dateSerial(day.iso)+(isOvernight(original.start,original.end)?1:0))}T${original.end}:00`,status:"DRAFT"})});const mapped=(rows||[]).map(mapDatabaseShift);setShifts(cur=>[...cur.filter(x=>x.id!==id),...mapped]);}else setShifts(cur=>cur.map(x=>x.id===id?moved:x));notify("Shift moved and returned to draft");}catch(error){notify(error instanceof Error?error.message:"Could not move shift");}}}>
          <div className={scheduleStyles.dayHeader}><span>{day.short}</span><strong>{day.date}</strong></div>
          <div className={scheduleStyles.dayBody}>{dayShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} conflict={conflicts.has(shift.id) || availabilityConflicts.has(shift.id)} onOpen={() => onEditShift(shift)} onDragStart={(e)=>e.dataTransfer.setData("text/shift-id",shift.id)} />)}<button className={scheduleStyles.addShift} onClick={() => onNewShift(day.iso)} aria-label={`Add shift on ${day.short} ${day.date}`} title="Add shift"><Plus size={15}/><span className="sr-only">Add shift</span></button></div>
        </div>;
      })}
    </div></div></section>
    {showConflictsOnly && !displayedShifts.length ? <div className="empty-state"><AlertTriangle size={20}/><strong>No conflicts in this period</strong><span>Show all shifts to continue editing the schedule.</span></div> : null}
    {acknowledgementsOpen&&<div className="modal-layer"><button type="button" className="modal-scrim" onClick={()=>setAcknowledgementsOpen(false)} aria-label="Close acknowledgement status"/><section className={`modal ${scheduleStyles.ackModal}`} role="dialog" aria-modal="true" aria-labelledby="acknowledgement-title"><div className="modal-head"><div><h2 id="acknowledgement-title">Schedule acknowledgements</h2><p>Version {acknowledgements.publication?.version} · {weekLabel}</p></div><button type="button" className="icon-button" onClick={()=>setAcknowledgementsOpen(false)} aria-label="Close"><X size={18}/></button></div><div className={scheduleStyles.ackList}>{acknowledgements.employees.map(employee=><div key={employee.id}><span className={`${scheduleStyles.ackDot} ${employee.acknowledgedAt?scheduleStyles.ackComplete:""}`}/><div><strong>{employee.name}</strong><small>{employee.acknowledgedAt?`Acknowledged ${new Date(employee.acknowledgedAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`:"Awaiting acknowledgement"}{employee.changeTypes?.length?` · ${employee.changeTypes.map((type)=>type.replaceAll("_"," ").toLowerCase()).join(", ")}`:""}</small></div></div>)}{!acknowledgements.employees.length&&<div className="empty-state"><CheckCheck size={20}/><strong>No assigned employees</strong><span>This publication has no employee acknowledgements to collect.</span></div>}</div>{acknowledgementMessage?<p className="form-message" role="status">{acknowledgementMessage}</p>:null}<div className="modal-actions"><button type="button" className="secondary" onClick={()=>void loadAcknowledgements()}>Refresh</button><button type="button" className="secondary" disabled={remindingAcknowledgements || acknowledgedCount===acknowledgements.employees.length} onClick={()=>void remindOutstandingAcknowledgements()}>{remindingAcknowledgements?"Sending…":"Remind outstanding"}</button><button type="button" className="primary" onClick={()=>setAcknowledgementsOpen(false)}>Done</button></div></section></div>}
  </div>
}
function firstName(name: string) { return name.trim().split(/\s+/)[0] || name; }
function ShiftCard({ shift, conflict, onOpen, onDragStart }: { shift: Shift; conflict?: boolean; onOpen: () => void; onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void }) {
  const overnight = isOvernight(shift.start, shift.end);
  const displayName = shift.isOpen ? "Available shift" : firstName(shift.employee);
  return <button type="button" draggable onDragStart={onDragStart} className={scheduleStyles.shiftCard} data-role={shift.role} data-draft={shift.status === "Draft"} data-conflict={Boolean(conflict)} onClick={onOpen} aria-label={`Open ${shift.isOpen ? "available" : shift.employee} shift ${shift.start} to ${shift.end}${overnight ? " next day" : ""}`}>
    <div className={scheduleStyles.shiftCardTop}><span>{shift.start}–{shift.end}{overnight ? " +1" : ""}</span><ChevronRight size={14} /></div>
    <strong>{displayName}</strong>
    <small><span>{shift.role}</span>{overnight ? <span className={scheduleStyles.overnightLabel}> · Overnight</span> : null}</small>
    {shift.isOpen && <em>Open</em>}{shift.availabilityConflict && <em className={scheduleStyles.conflictBadge}>{shift.availabilityConflict === "APPROVED_TIME_OFF" ? "Time off" : "Unavailable"}</em>}{conflict && !shift.availabilityConflict && <em className={scheduleStyles.conflictBadge}>Conflict</em>}
  </button>;
}
