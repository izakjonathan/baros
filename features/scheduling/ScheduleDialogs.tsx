"use client";

import { useState } from "react";
import { AlertTriangle, CalendarDays, Users } from "lucide-react";
import { Dialog, DialogActions } from "@/components/ui/interaction-ui";
import type { Shift, ShiftRole } from "@/lib/data";
import type { Employee, Location } from "@/features/workspace/types";
import {
  canonicalShiftDate,
  dateFromShift,
  isOvernight,
  shiftPositionFromDate,
  toIsoDate,
} from "@/features/workspace/schedule-utils";
import scheduleStyles from "./ScheduleWorkspace.module.css";

export function ShiftDialog({
  onClose,
  onSave,
  currentWeekOffset,
  initialDate,
  employees,
  locations,
  selectedLocationId,
}: {
  onClose: () => void;
  onSave: (shifts: Shift[]) => void;
  currentWeekOffset: number;
  initialDate?: string;
  employees: Employee[];
  locations: Location[];
  selectedLocationId: string;
}) {
  const [assignment, setAssignment] = useState<"employee" | "open">("employee");
  const [locationId, setLocationId] = useState(selectedLocationId);
  const activeEmployees = employees.filter((person) => person.active);
  const [employee, setEmployee] = useState(activeEmployees[0]?.name ?? "");
  const [shiftDate, setShiftDate] = useState(initialDate || dateFromShift(currentWeekOffset, 0));
  const [role, setRole] = useState<ShiftRole>("Bartender");
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("01:00");
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly");
  const [count, setCount] = useState(4);
  const [weekdays, setWeekdays] = useState<number[]>([shiftPositionFromDate(initialDate || dateFromShift(currentWeekOffset, 0)).day]);
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function save() {
    if (!locationId) {
      alert("No active location is configured. Add or activate a location before creating shifts.");
      return;
    }
    const safeCount = Math.max(1, Math.min(count || 1, frequency === "daily" ? 31 : 52));
    let occurrences: { day: number; weekOffset: number }[];
    const startPosition = shiftPositionFromDate(shiftDate);
    if (!repeat) occurrences = [startPosition];
    else if (frequency === "daily") {
      occurrences = Array.from({ length: safeCount }, (_, index) => {
        const date = new Date(`${shiftDate}T12:00:00`);
        date.setDate(date.getDate() + index);
        return shiftPositionFromDate(toIsoDate(date));
      });
    } else {
      const selected = weekdays.length ? weekdays : [startPosition.day];
      const weekStart = new Date(`${shiftDate}T12:00:00`);
      weekStart.setDate(weekStart.getDate() - startPosition.day);
      occurrences = Array.from({ length: safeCount }, (_, week) => selected.map((selectedDay) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + week * 7 + selectedDay);
        return shiftPositionFromDate(toIsoDate(date));
      })).flat().filter((occurrence) => occurrence.weekOffset > startPosition.weekOffset || occurrence.day >= startPosition.day);
    }
    const uniqueOccurrences = Array.from(new Map(occurrences.map((occurrence) => [`${occurrence.weekOffset}-${occurrence.day}`, occurrence])).values());
    const label = repeat
      ? frequency === "daily"
        ? `Daily · ${uniqueOccurrences.length} times`
        : `Weekly · ${(weekdays.length ? weekdays : [shiftPositionFromDate(shiftDate).day]).map((day) => weekdayNames[day]).join(", ")}`
      : undefined;
    const name = assignment === "open" ? "Available shift" : employee;
    const recurrenceGroupId = repeat ? crypto.randomUUID() : undefined;
    const initials = assignment === "open" ? "+" : employee.split(" ").map((word) => word[0]).join("");
    onSave(uniqueOccurrences.map((occurrence) => ({
      id: crypto.randomUUID(),
      date: dateFromShift(occurrence.weekOffset, occurrence.day),
      day: occurrence.day,
      weekOffset: occurrence.weekOffset,
      employee: name,
      initials,
      start,
      end,
      role,
      status: "Draft",
      isOpen: assignment === "open",
      recurrenceLabel: label,
      recurrenceGroupId,
      locationId,
    })));
  }

  return <Dialog title="Add shift" description="Create one shift or a repeating series." className={scheduleStyles.shiftEditorDialog} onClose={onClose}>
    <div className={scheduleStyles.shiftEditorBody}>
      {locations.length > 1 && <label className="location-field">Location<select value={locationId} onChange={(event) => setLocationId(event.target.value)}>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>}
      <div className={scheduleStyles.assignmentToggle}><button type="button" aria-pressed={assignment === "employee"} className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" aria-pressed={assignment === "open"} className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
      <div className={scheduleStyles.shiftDialogFields}>
        {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(event) => setEmployee(event.target.value)}>{activeEmployees.map((person) => <option key={person.name}>{person.name}</option>)}</select></label>}
        {assignment === "open" && <div className={scheduleStyles.openShiftNote}><Users size={18}/><div><strong>Employees can request this shift</strong><span>A manager approves the employee who receives it.</span></div></div>}
        <label className={scheduleStyles.shiftDateField}>Shift date<input type="date" value={shiftDate} onChange={(event) => { setShiftDate(event.target.value); setWeekdays([shiftPositionFromDate(event.target.value).day]); }}/></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
        <label className={scheduleStyles.shiftTimeField}>Starts<input type="time" value={start} onChange={(event) => setStart(event.target.value)}/></label>
        <label className={scheduleStyles.shiftTimeField}>Ends<input type="time" value={end} onChange={(event) => setEnd(event.target.value)}/><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
      </div>
      <label className={scheduleStyles.repeatSwitch}><input type="checkbox" checked={repeat} onChange={(event) => setRepeat(event.target.checked)}/><span><strong>Repeat shift</strong><small>Create a daily or weekly series</small></span></label>
      {repeat && <div className={scheduleStyles.repeatPanel}>
        <div className={scheduleStyles.frequencyToggle}><button type="button" aria-pressed={frequency === "daily"} className={frequency === "daily" ? "selected" : ""} onClick={() => setFrequency("daily")}>Daily</button><button type="button" aria-pressed={frequency === "weekly"} className={frequency === "weekly" ? "selected" : ""} onClick={() => setFrequency("weekly")}>Weekly</button></div>
        {frequency === "weekly" && <div className={scheduleStyles.weekdayPicker}>{weekdayNames.map((name, index) => <button type="button" key={name} aria-pressed={weekdays.includes(index)} className={weekdays.includes(index) ? "selected" : ""} onClick={() => setWeekdays((current) => current.includes(index) ? current.filter((day) => day !== index) : [...current, index].sort())}>{name}</button>)}</div>}
        <label className={scheduleStyles.repeatCount}>Repeat for <input type="number" min="1" max={frequency === "daily" ? 31 : 52} value={count} onChange={(event) => setCount(Number(event.target.value))}/><span>{frequency === "daily" ? "days" : "weeks"}</span></label>
      </div>}
    </div>
    <DialogActions onClose={onClose} onConfirm={save} confirmLabel={repeat ? "Add repeating shifts" : "Add shift"}/>
  </Dialog>;
}

export function EditShiftDialog({ shift, employees, onClose, onSave, onDelete }: {
  shift: Shift;
  employees: Employee[];
  onClose: () => void;
  onSave: (shift: Shift, scope: "occurrence" | "future" | "series") => void;
  onDelete: () => void;
}) {
  const [assignment, setAssignment] = useState<"employee" | "open">(shift.isOpen ? "open" : "employee");
  const activeEmployees = employees.filter((person) => person.active);
  const [employee, setEmployee] = useState(shift.isOpen ? activeEmployees[0]?.name ?? "" : shift.employee);
  const [shiftDate, setShiftDate] = useState(canonicalShiftDate(shift));
  const [role, setRole] = useState<ShiftRole>(shift.role);
  const [start, setStart] = useState(shift.start);
  const [end, setEnd] = useState(shift.end);
  const [status, setStatus] = useState<"Draft" | "Published">(shift.status);
  const [scope, setScope] = useState<"occurrence" | "future" | "series">("occurrence");

  function save() {
    const selectedEmployee = assignment === "open" ? "Available shift" : employee;
    const position = shiftPositionFromDate(shiftDate);
    onSave({
      ...shift,
      date: shiftDate,
      day: position.day,
      weekOffset: position.weekOffset,
      employee: selectedEmployee,
      initials: assignment === "open" ? "+" : employee.split(" ").map((word) => word[0]).join(""),
      role,
      start,
      end,
      status,
      isOpen: assignment === "open",
    }, scope);
  }

  const conflictLabel = shift.availabilityConflict === "APPROVED_TIME_OFF"
    ? "This employee has approved time off during the shift."
    : shift.availabilityConflict === "OUTSIDE_AVAILABILITY"
      ? "This shift is outside the employee’s saved availability."
      : null;

  return <Dialog title="Edit shift" description="Update this shift occurrence, its assignment or availability." className={scheduleStyles.shiftEditorDialog} onClose={onClose}>
    <div className={scheduleStyles.shiftEditorBody}>
      {conflictLabel ? <div className={scheduleStyles.openShiftNote}><AlertTriangle size={18}/><div><strong>Availability conflict</strong><span>{conflictLabel} Reassign the shift, adjust the time, or make it available.</span></div></div> : null}
      <div className={scheduleStyles.assignmentToggle}><button type="button" aria-pressed={assignment === "employee"} className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" aria-pressed={assignment === "open"} className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>{shift.availabilityConflict ? "Make available" : "Available shift"}</button></div>
      <div className={scheduleStyles.shiftDialogFields}>
        {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(event) => setEmployee(event.target.value)}>{activeEmployees.map((person) => <option key={person.name}>{person.name}</option>)}</select></label>}
        {assignment === "open" && <div className={scheduleStyles.openShiftNote}><Users size={18}/><div><strong>Employees can request this shift</strong><span>The current employee is removed. A manager approves the employee who receives it.</span></div></div>}
        <label className={scheduleStyles.shiftDateField}>Shift date<input type="date" value={shiftDate} onChange={(event) => setShiftDate(event.target.value)}/></label>
        <label>Role<select value={role} onChange={(event) => setRole(event.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
        <label className={scheduleStyles.shiftTimeField}>Starts<input type="time" value={start} onChange={(event) => setStart(event.target.value)}/></label>
        <label className={scheduleStyles.shiftTimeField}>Ends<input type="time" value={end} onChange={(event) => setEnd(event.target.value)}/><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
        <label className="full-field">Schedule status<select value={status} onChange={(event) => setStatus(event.target.value as "Draft" | "Published")}><option>Draft</option><option>Published</option></select></label>
      </div>
      {shift.recurrenceGroupId && <div className={scheduleStyles.seriesEditNote}><CalendarDays size={17}/><div><strong>Apply changes to</strong><span>Choose whether this edit affects one occurrence or the wider repeating series.</span><select value={scope} onChange={(event) => setScope(event.target.value as "occurrence" | "future" | "series")}><option value="occurrence">This shift only</option><option value="future">This and future shifts</option><option value="series">Entire series</option></select></div></div>}
    </div>
    <div className={scheduleStyles.editShiftActions}><button type="button" className="danger-button" onClick={onDelete}>Delete shift</button><div><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={save}>Save changes</button></div></div>
  </Dialog>;
}
