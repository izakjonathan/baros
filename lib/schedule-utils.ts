import type { Shift } from "@/lib/data";

const todayAtNoon = new Date();
todayAtNoon.setHours(12, 0, 0, 0);
export const BASE_MONDAY = new Date(todayAtNoon);
BASE_MONDAY.setDate(todayAtNoon.getDate() - ((todayAtNoon.getDay() + 6) % 7));

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateSerial(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

const BASE_DATE_SERIAL = dateSerial(toIsoDate(BASE_MONDAY));

export function dateFromSerial(serial: number) {
  return new Date(serial * 86400000).toISOString().slice(0, 10);
}

export function shiftPositionFromDate(value: string) {
  const diffDays = dateSerial(value) - BASE_DATE_SERIAL;
  return { day: ((diffDays % 7) + 7) % 7, weekOffset: Math.floor(diffDays / 7) };
}

export function dateFromShift(weekOffset = 0, day = 0) {
  const date = new Date(BASE_MONDAY);
  date.setDate(BASE_MONDAY.getDate() + weekOffset * 7 + day);
  return toIsoDate(date);
}

export function canonicalShiftDate(shift: Shift) {
  return shift.date ?? dateFromShift(shift.weekOffset ?? 0, shift.day);
}

export function isOvernight(start: string, end: string) { return end <= start; }

function shiftInterval(shift: Shift) {
  const startDay = dateSerial(canonicalShiftDate(shift));
  const [sh, sm] = shift.start.split(":").map(Number);
  const [eh, em] = shift.end.split(":").map(Number);
  const start = startDay * 1440 + sh * 60 + sm;
  let end = startDay * 1440 + eh * 60 + em;
  if (end <= start) end += 1440;
  return { start, end };
}

function shiftsOverlap(a: Shift, b: Shift) {
  const x = shiftInterval(a);
  const y = shiftInterval(b);
  return x.start < y.end && y.start < x.end;
}

export function conflictIds(shifts: Shift[]) {
  const ids = new Set<string>();
  const assigned = shifts.filter((shift) => !shift.isOpen);
  for (let i = 0; i < assigned.length; i += 1) {
    for (let j = i + 1; j < assigned.length; j += 1) {
      if (assigned[i].employee === assigned[j].employee && shiftsOverlap(assigned[i], assigned[j])) {
        ids.add(assigned[i].id);
        ids.add(assigned[j].id);
      }
    }
  }
  return ids;
}

export function hoursBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 1440;
  return mins / 60;
}

export function workedHours(entry: { clockIn: string; clockOut?: string; breakMinutes: number }) {
  return entry.clockOut ? Math.max(0, hoursBetween(entry.clockIn, entry.clockOut) - entry.breakMinutes / 60) : 0;
}

export function mapDatabaseShift(x: any): Shift {
  const startDate = new Date(String(x.starts_at));
  const endDate = new Date(String(x.ends_at));
  const timezone = x.location_timezone || "Europe/Copenhagen";
  const parts = (date: Date) => Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(date).map((part) => [part.type, part.value]));
  const startParts = parts(startDate);
  const endParts = parts(endDate);
  const date = `${startParts.year}-${startParts.month}-${startParts.day}`;
  const pos = shiftPositionFromDate(date);
  const employeeName = x.is_open ? "Available shift" : x.employee_name || "Unassigned";
  return {
    id: x.id,
    date,
    day: pos.day,
    weekOffset: pos.weekOffset,
    employee: employeeName,
    employeeId: x.employee_id || undefined,
    initials: x.is_open ? "+" : employeeName.split(" ").map((word: string) => word[0]).join(""),
    start: `${startParts.hour}:${startParts.minute}`,
    end: `${endParts.hour}:${endParts.minute}`,
    role: x.role,
    status: x.status === "DRAFT" ? "Draft" : "Published",
    isOpen: x.is_open,
    recurrenceGroupId: x.recurrence_group_id,
    locationId: x.location_id
  };
}
