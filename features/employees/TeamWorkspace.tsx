"use client";
import { WorkspaceHeader } from "@/components/ui/workspace-ui";
import { useState } from "react";
import { ClockSettings, Search, UserRoundPlus } from "lucide-react";
import type { Shift } from "@/lib/data";
import type { Employee } from "@/features/workspace/types";
import { canonicalShiftDate, hoursBetween } from "@/features/workspace/schedule-utils";
import { surfaceStyles, teamStyles } from "@/lib/ui-classes";
export function TeamWorkspace({ employees, shifts, devMode, canManage, onAdd, onEdit, onInvite, onRevoke }: { employees: Employee[]; shifts: Shift[]; devMode:boolean; canManage:boolean; onAdd: () => void; onEdit: (employee: Employee) => void; onInvite:(employee:Employee)=>void; onRevoke:(employee:Employee)=>void }) {
  const [query,setQuery]=useState("");
  const [status,setStatus]=useState<"ALL"|"ACTIVE"|"INACTIVE">("ALL");
  const normalizedQuery=query.trim().toLowerCase();
  const visibleEmployees=employees.filter(person=>(!normalizedQuery||`${person.name} ${person.role} ${person.email||""}`.toLowerCase().includes(normalizedQuery))&&(status==="ALL"||(status==="ACTIVE"?person.active:!person.active)));
  const today = new Date();
  today.setHours(0,0,0,0);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate()+28);
  const scheduledHours = (person: Employee) => shifts.filter((shift) => {
    const shiftDay = new Date(`${canonicalShiftDate(shift)}T00:00:00`);
    const matchesEmployee = person.id ? shift.employeeId === person.id || (!shift.employeeId && shift.employee === person.name) : shift.employee === person.name;
    return matchesEmployee && !shift.isOpen && shift.status === "Published" && shiftDay >= today && shiftDay < windowEnd;
  }).reduce((total,shift)=>total+hoursBetween(shift.start,shift.end),0);
  const activeCount=employees.filter(person=>person.active).length;
  const portalCount=employees.filter(person=>person.portalStatus==="ACTIVE").length;
  return <div className={`${surfaceStyles.workspace} page-flow`}>
    <WorkspaceHeader eyebrow="People operations" title="Team" description="People, access and upcoming hours." actions={canManage ? <button className={`team-add-button ${surfaceStyles.control} ${surfaceStyles.solid} ${teamStyles.addButton}`} onClick={onAdd}><UserRoundPlus size={17}/>Add employee</button> : <span className="connection-pill">Read only</span>}/>
    <section className={`${surfaceStyles.metrics} ${teamStyles.summary}`} aria-label="Team summary">
      <article className="card card-compact"><span>Total team</span><strong>{employees.length}</strong></article>
      <article className="card card-compact"><span>Active</span><strong>{activeCount}</strong></article>
      <article className="card card-compact"><span>Portal active</span><strong>{portalCount}</strong></article>
    </section>
    <div className={teamStyles.toolbar}>
      <div className={teamStyles.search}><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search team" aria-label="Search team"/></div>
      <select value={status} onChange={e=>setStatus(e.target.value as "ALL"|"ACTIVE"|"INACTIVE")} aria-label="Filter team status"><option value="ALL">All employees</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      {(query||status!=="ALL")&&<button type="button" className={`secondary compact ${surfaceStyles.control} ${teamStyles.clearButton}`} onClick={()=>{setQuery("");setStatus("ALL")}}>Clear</button>}
      <span className={teamStyles.resultCount} role="status" aria-live="polite">{visibleEmployees.length} employee{visibleEmployees.length===1?"":"s"}</span>
    </div>
    <section className={teamStyles.grid}>
      {visibleEmployees.map((person) => {
        const upcomingHours = scheduledHours(person);
        const portalLabel=person.portalStatus==="ACTIVE"?"Portal active":person.portalStatus==="INVITED"?"Invitation pending":person.portalStatus==="EXPIRED"?"Invitation expired":"No portal access";
        return <article className={`${teamStyles.card} ${!person.active ? teamStyles.inactive : ""}`} key={person.id||person.name}>
          <header className={`${surfaceStyles.cardHeader} ${teamStyles.cardHeader}`}>
            <div className={teamStyles.identity}>
              <div className={teamStyles.avatar} aria-hidden="true">{person.initials}</div>
              <div><p className={teamStyles.role}>{person.role}</p><h2>{person.name}</h2></div>
            </div>
            <span className={person.active?teamStyles.activeStatus:teamStyles.inactiveStatus}>{person.active?"Active":"Inactive"}</span>
          </header>
          <div className={teamStyles.details}>
            <div><span>Next 4 weeks</span><strong>{upcomingHours.toFixed(upcomingHours % 1 ? 1 : 0)}h</strong></div>
            <div><span>Contact</span><strong>{person.email||person.status}</strong></div>
          </div>
          <div className={teamStyles.portalRow}><span className={teamStyles.indicator} data-state={person.portalStatus}/><span>{portalLabel}</span></div>
          {canManage && <footer className={teamStyles.actions}>
            <button className={`${surfaceStyles.control} ${surfaceStyles.outline} ${teamStyles.outlineButton}`} onClick={() => onEdit(person)}>Edit</button>
            <button className={`${surfaceStyles.control} ${surfaceStyles.solid} ${teamStyles.filledButton}`} disabled={devMode||!person.email||person.portalStatus==="ACTIVE"} onClick={()=>onInvite(person)}>{person.portalStatus==="INVITED"?"Resend":"Invite"}</button>
            {person.portalStatus==="INVITED"&&<button className={`${surfaceStyles.control} ${surfaceStyles.outline} ${teamStyles.outlineButton}`} disabled={devMode} onClick={()=>onRevoke(person)}>Revoke</button>}
          </footer>}
          {devMode&&<small className={teamStyles.note}>Connect PostgreSQL to create real employee logins.</small>}
        </article>
      })}
      {!visibleEmployees.length&&<div className={`${surfaceStyles.empty} ${teamStyles.empty}`}>No employees match the current search and filters.</div>}
    </section>
  </div>
}

