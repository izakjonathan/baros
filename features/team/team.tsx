"use client";

import { UserRoundPlus } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { IconButton, StatusPill } from "@/components/ui-primitives";
import type { Shift } from "@/lib/data";
import type { Employee } from "@/lib/workspace-types";
import { canonicalShiftDate, dateSerial, hoursBetween, toIsoDate } from "@/lib/schedule-utils";

export function Team({ employees, shifts, devMode, onAdd, onEdit, onInvite, onRevoke }: { employees: Employee[]; shifts: Shift[]; devMode: boolean; onAdd: () => void; onEdit: (employee: Employee) => void; onInvite: (employee: Employee) => void; onRevoke: (employee: Employee) => void }) {
  const today = dateSerial(toIsoDate(new Date()));
  const windowEnd = today + 28;
  const scheduledHours = (person: Employee) => shifts.filter((shift) => {
    const shiftDay = dateSerial(canonicalShiftDate(shift));
    const matchesEmployee = person.id ? shift.employeeId === person.id || (!shift.employeeId && shift.employee === person.name) : shift.employee === person.name;
    return matchesEmployee && !shift.isOpen && shift.status === "Published" && shiftDay >= today && shiftDay < windowEnd;
  }).reduce((total, shift) => total + hoursBetween(shift.start, shift.end), 0);

  return <><PageHeader title="Team" action={<IconButton className="team-add-button" onClick={onAdd} label="Add employee"><UserRoundPlus size={19} /></IconButton>} />
    <section className="team-grid">{employees.map((person) => {
      const upcomingHours = scheduledHours(person);
      return <article className={`team-card ${!person.active ? "employee-inactive" : ""}`} key={person.id || person.name}>
        <div className="team-card-head"><div className="team-identity"><div className="avatar large">{person.initials}</div><div><h2>{person.name}</h2><p>{person.role}</p></div></div><StatusPill className="team-status" tone={person.active ? "positive" : "neutral"}>{person.active ? "Active" : "Inactive"}</StatusPill></div>
        <div className="team-stats"><span>Scheduled next 4 weeks <b>{upcomingHours.toFixed(upcomingHours % 1 ? 1 : 0)}h</b></span><span>{person.email || person.status}</span></div>
        <div className="portal-access"><span className={`status ${person.portalStatus === "ACTIVE" ? "status-submitted" : person.portalStatus === "INVITED" ? "status-pending" : "status-draft"}`}>{person.portalStatus === "ACTIVE" ? "Portal active" : person.portalStatus === "INVITED" ? "Invitation pending" : person.portalStatus === "EXPIRED" ? "Invitation expired" : "No portal access"}</span></div>
        <div className={`team-actions ${person.portalStatus === "INVITED" ? "three-actions" : "two-actions"}`}><button className="secondary" onClick={() => onEdit(person)}>Edit</button><button className="secondary" disabled={devMode || !person.email || person.portalStatus === "ACTIVE"} onClick={() => onInvite(person)}>{person.portalStatus === "INVITED" ? "Resend" : "Invite"}</button>{person.portalStatus === "INVITED" && <button className="secondary danger-outline" disabled={devMode} onClick={() => onRevoke(person)}>Revoke</button>}</div>
        {devMode && <small className="muted-note">Connect PostgreSQL to create real employee logins.</small>}
      </article>;
    })}</section>
  </>;
}
