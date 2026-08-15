"use client";
import { useState } from "react";
import { Ban, CheckCheck, DownloadCloud, FileDown, History, LockKeyhole, Pencil, RotateCcw, UnlockKeyhole } from "lucide-react";
import type { Shift } from "@/lib/data";
import type { Employee, TimeEntry } from "@/features/workspace/types";
import { attendanceStyles, surfaceStyles } from "@/lib/ui-classes";
import { canonicalShiftDate, hoursBetween } from "@/features/workspace/schedule-utils";


function workedHours(entry: TimeEntry) { return entry.clockOut ? Math.max(0, hoursBetween(entry.clockIn, entry.clockOut) - entry.breakMinutes/60) : 0; }
function formatAttendanceDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);
}

export function AttendanceWorkspace({ employees, shifts, entries, setEntries, notify, onEdit, devMode, persist, canManagePayroll, canExportPayroll }: { employees: Employee[]; shifts: Shift[]; entries: TimeEntry[]; setEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>; notify:(s:string)=>void; onEdit:(entry:TimeEntry)=>void; devMode:boolean; persist:(path:string,options:RequestInit)=>Promise<any>; canManagePayroll:boolean; canExportPayroll:boolean }) {
  const [fromDate, setFromDate] = useState("2026-07-27");
  const [toDate, setToDate] = useState("2026-08-02");
  const [employeeFilter,setEmployeeFilter]=useState("All employees");
  const [statusFilter,setStatusFilter]=useState("Needs review");
  const [periodLocked,setPeriodLocked]=useState(false);
  const [exportHistory,setExportHistory]=useState<{id:string;period:string;employees:number;hours:number;created:string}[]>([]);
  const withinPeriod = (date: string) => date >= fromDate && date <= toDate;
  const baseVisible=entries.filter(e=>withinPeriod(e.date) && (employeeFilter==="All employees"||e.employee===employeeFilter));
  const visible=baseVisible.filter(e=>statusFilter==="All"||(statusFilter==="Needs review"?e.status==="Pending":e.status===statusFilter));
  const visibleShifts=shifts.filter(s=>withinPeriod(canonicalShiftDate(s)) && (employeeFilter==="All employees"||s.employee===employeeFilter));
  const scheduled=visibleShifts.filter(s=>!s.isOpen).reduce((n,s)=>n+hoursBetween(s.start,s.end),0);
  const worked=baseVisible.filter(e=>e.status==="Approved").reduce((n,e)=>n+workedHours(e),0);
  const pending=baseVisible.filter(e=>e.status==="Pending").length;
  const approved=baseVisible.filter(e=>e.status==="Approved");
  const exceptions=baseVisible.filter(e=>e.status!=="Running" && (Math.abs(workedHours(e)-e.scheduledHours)>=0.5 || e.breakMinutes===0 || e.edited));

  async function toggleBreak(entry: TimeEntry) {
    try {
      if (!devMode) await persist("/api/time-clock/manage", { method:"POST", body:JSON.stringify({ timesheetId:entry.id, action:entry.onBreak?"BREAK_END":"BREAK_START" }) });
      setEntries(current => current.map(item => item.id === entry.id ? { ...item, onBreak: !entry.onBreak, breakStartedAt: entry.onBreak ? null : new Date().toISOString() } : item));
      notify(entry.onBreak ? `${entry.employee} break ended` : `${entry.employee} break started`);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not update break"); }
  }

  function approveTimesheet(id: string) { if(periodLocked){notify("Unlock this payroll period before changing approvals");return;} setEntries(cur=>cur.map(x=>x.id===id?{...x,status:"Approved"}:x)); notify("Timesheet approved and included in payroll exports"); }
  function rejectTimesheet(id:string){if(periodLocked){notify("Unlock this payroll period before editing timesheets");return;}const reason=window.prompt("Reason for rejection or correction request:");if(!reason)return;setEntries(cur=>cur.map(x=>x.id===id?{...x,status:"Rejected",note:reason}:x));notify("Timesheet rejected and excluded from export");}
  function reopenTimesheet(id:string){if(periodLocked){notify("Unlock this payroll period before reopening timesheets");return;}setEntries(cur=>cur.map(x=>x.id===id?{...x,status:"Pending"}:x));notify("Timesheet reopened for review");}
  function approveAllVisible() { if(periodLocked){notify("Unlock this payroll period before approving timesheets");return;} const ids=new Set(visible.filter(e=>e.status==="Pending").map(e=>e.id)); if(!ids.size){notify("No pending timesheets in this view");return;} setEntries(cur=>cur.map(x=>ids.has(x.id)?{...x,status:"Approved"}:x)); notify(`${ids.size} timesheet${ids.size===1?"":"s"} approved`); }
  function csvCell(value: string | number) { const text=String(value ?? ""); return /[",\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text; }
  function exportApproved() {
    if (!periodLocked) { notify("Lock the payroll period before exporting approved hours"); return; }
    const rows=employees.map(emp=>{ const records=approved.filter(entry=>entry.employee===emp.name); return {emp,records,total:records.reduce((sum,entry)=>sum+workedHours(entry),0)}; }).filter(row=>row.records.length>0);
    if(!rows.length){notify("There are no approved timesheets to export for this period");return;}
    const header=["Employee","Email","Phone","Role","Period start","Period end","Approved timesheets","Approved hours"];
    const lines=[header,...rows.map(({emp,records,total})=>[emp.name,emp.email||"",emp.phone||"",emp.role,fromDate,toDate,records.length,total.toFixed(2)])].map(row=>row.map(csvCell).join(","));
    const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=`approved-hours-${fromDate}-to-${toDate}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    const total=rows.reduce((sum,row)=>sum+row.total,0);setExportHistory(cur=>[{id:crypto.randomUUID(),period:`${fromDate}–${toDate}`,employees:rows.length,hours:total,created:new Date().toLocaleString("en-GB")},...cur]); notify(`${rows.length} employee summaries exported`);
  }
  const payrollRows=employees.map(emp=>{const scheduledEmp=visibleShifts.filter(s=>s.employee===emp.name).reduce((n,s)=>n+hoursBetween(s.start,s.end),0);const approvedEntries=approved.filter(e=>e.employee===emp.name);const workedEmp=approvedEntries.reduce((n,e)=>n+workedHours(e),0);return {emp,scheduledEmp,approvedEntries,workedEmp};}).filter(row=>row.scheduledEmp>0||row.approvedEntries.length>0);
  return <div className={attendanceStyles.workspace}>
    <header className={attendanceStyles.hero}>
      <div><p>Payroll review</p><h1>Time & attendance</h1><span>Review hours and prepare payroll.</span></div>
      <div className={attendanceStyles.actions}>
        {canManagePayroll && <button className={`${surfaceStyles.control} ${periodLocked ? attendanceStyles.locked : attendanceStyles.outline}`} onClick={()=>{setPeriodLocked(v=>!v);notify(periodLocked?"Payroll period unlocked":"Payroll period locked for export")}}>{periodLocked?<><LockKeyhole size={17}/>Locked</>:<><UnlockKeyhole size={17}/>Lock period</>}</button>}
        <button className={`${surfaceStyles.control} ${attendanceStyles.approveAll}`} onClick={approveAllVisible} disabled={periodLocked||!visible.some(e=>e.status==="Pending")}><CheckCheck size={17}/>Approve visible</button>
        {canExportPayroll && <button className={`${surfaceStyles.control} ${attendanceStyles.export}`} onClick={exportApproved} disabled={!approved.length||!periodLocked}><FileDown size={17}/>Export</button>}
      </div>
    </header>

    <section className={attendanceStyles.filters} aria-label="Timesheet filters">
      <div className={attendanceStyles.periodFields}>
        <label>From<span className={attendanceStyles.dateControl}><span aria-hidden="true">{formatAttendanceDate(fromDate)}</span><input aria-label="Payroll period from date" type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></span></label>
        <label>To<span className={attendanceStyles.dateControl}><span aria-hidden="true">{formatAttendanceDate(toDate)}</span><input aria-label="Payroll period to date" type="date" value={toDate} min={fromDate} onChange={e=>setToDate(e.target.value)}/></span></label>
      </div>
      <div className={attendanceStyles.filterFields}><label>Employee<select value={employeeFilter} onChange={e=>setEmployeeFilter(e.target.value)}><option>All employees</option>{employees.map(e=><option key={e.name}>{e.name}</option>)}</select></label><label>Status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Needs review</option><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Running</option></select></label></div>
      <div className={attendanceStyles.filterFooter}><span role="status" aria-live="polite">{visible.length} timesheet{visible.length===1?"":"s"}</span><button type="button" onClick={()=>{setEmployeeFilter("All employees");setStatusFilter("Needs review")}} className={`${surfaceStyles.control} ${surfaceStyles.solid}`} disabled={employeeFilter==="All employees"&&statusFilter==="Needs review"}>Reset</button></div>
    </section>

    <section className={attendanceStyles.records}>
      <div className={`${surfaceStyles.sectionHeader} ${attendanceStyles.sectionHeader}`}><div><h2>Timesheets</h2><p>Review each record and act on exceptions.</p></div><span>{periodLocked?"Period locked":"Open period"}</span></div>
      <div className={attendanceStyles.recordList}>{visible.map(e=>{const actual=e.clockOut?workedHours(e):0;const variance=actual-e.scheduledHours;const exception=e.status!=="Running"&&(Math.abs(variance)>=.5||e.breakMinutes===0||e.edited);return <article className={`${attendanceStyles.record} ${exception?attendanceStyles.recordException:""}`} key={e.id}>
        <header><div><strong>{e.employee}</strong><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span></div><i className={`${attendanceStyles.status} ${attendanceStyles[`status${e.status}`]}`}>{e.status}</i></header>
        <div className={attendanceStyles.timeLine}><b>{e.clockIn}–{e.clockOut||"Now"}</b><span>{e.clockOut?`${actual.toFixed(2)}h worked`:"Clocked in"}</span></div>
        <div className={attendanceStyles.recordStats}><span>Scheduled<b>{e.scheduledHours.toFixed(1)}h</b></span><span>Break<b>{e.breakMinutes}m</b></span><span>Variance<b className={Math.abs(variance)>=.5?attendanceStyles.alertText:""}>{e.clockOut?`${variance>=0?"+":""}${variance.toFixed(2)}h`:"—"}</b></span></div>
        {e.edited&&<small className={attendanceStyles.edited}>Manager corrected</small>}
        <div className={attendanceStyles.recordActions}>{e.status==="Running"&&<button type="button" className={`${surfaceStyles.control} ${surfaceStyles.outline}`} onClick={()=>void toggleBreak(e)}>{e.onBreak?"End break":"Start break"}</button>}{e.status==="Pending"&&<><button className={`${surfaceStyles.control} ${surfaceStyles.outline}`} aria-label={`Edit ${e.employee} timesheet`} onClick={()=>onEdit(e)}><Pencil size={16}/></button><button className={`${surfaceStyles.control} ${surfaceStyles.outline}`} aria-label={`Reject ${e.employee} timesheet`} onClick={()=>rejectTimesheet(e.id)}><Ban size={16}/></button><button className={`${surfaceStyles.control} ${surfaceStyles.solid} ${attendanceStyles.primaryAction}`} onClick={()=>approveTimesheet(e.id)}>Approve</button></>}{e.status==="Approved"&&<button className={`${surfaceStyles.control} ${surfaceStyles.outline}`} onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={15}/>Reopen</button>}{e.status==="Rejected"&&<button className={`${surfaceStyles.control} ${surfaceStyles.outline}`} onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={15}/>Return to review</button>}</div>
      </article>})}{!visible.length&&<div className={`${surfaceStyles.empty} ${attendanceStyles.empty}`}><strong>No timesheets found</strong><span>Change the filters or date range to widen the results.</span></div>}</div>
    </section>

    <section className={`${surfaceStyles.metrics} ${attendanceStyles.summary}`} aria-label="Payroll summary">
      <article className="card card-compact"><span>Scheduled</span><strong>{scheduled.toFixed(1)}h</strong></article>
      <article className="card card-compact"><span>Approved</span><strong>{worked.toFixed(1)}h</strong></article>
      <article className={`card card-compact ${pending?attendanceStyles.needsAction:""}`}><span>Awaiting</span><strong>{pending}</strong></article>
      <article className={`card card-compact ${exceptions.length?attendanceStyles.exceptions:""}`} aria-label="Exceptions: Variance, no break, or edited"><span>Exceptions</span><strong>{exceptions.length}</strong></article>
    </section>

    <section className={attendanceStyles.preview}>
      <div className={`${surfaceStyles.sectionHeader} ${attendanceStyles.sectionHeader}`}><div><h2>Payroll preview</h2><p>Approved hours for the selected period.</p></div></div>
      <div className={attendanceStyles.previewList}>{payrollRows.length?payrollRows.map(({emp,scheduledEmp,approvedEntries,workedEmp})=><article key={emp.name}><div><span className={attendanceStyles.avatar}>{emp.initials}</span><p><strong>{emp.name}</strong><small>{emp.role}</small></p></div><dl><div><dt>Scheduled</dt><dd>{scheduledEmp.toFixed(1)}h</dd></div><div><dt>Approved</dt><dd>{workedEmp.toFixed(2)}h</dd></div></dl><small>{approvedEntries.length} approved record{approvedEntries.length===1?"":"s"}</small></article>):<div className={`${surfaceStyles.empty} ${attendanceStyles.empty}`}><strong>No payroll rows yet</strong><span>Approved timesheets appear here.</span></div>}</div>
    </section>

    <section className={attendanceStyles.history}>
      <div className={`${surfaceStyles.sectionHeader} ${attendanceStyles.sectionHeader}`}><div><h2>Export history</h2><p>Files generated in this session.</p></div><History size={18}/></div>
      {exportHistory.length?<div>{exportHistory.map(x=><article key={x.id}><DownloadCloud size={17}/><span><b>{x.period}</b><small>{x.created}</small></span><span>{x.employees} employees</span><strong>{x.hours.toFixed(2)}h</strong></article>)}</div>:<p>No payroll exports generated in this session.</p>}
    </section>
  </div>
}
