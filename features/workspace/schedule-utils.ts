import type { Shift } from "@/lib/data";

export type DatabaseShiftRecord = {
  id: string;
  starts_at: string | Date;
  ends_at: string | Date;
  location_timezone?: string | null;
  is_open?: boolean | null;
  employee_name?: string | null;
  employee_id?: string | null;
  role: Shift["role"];
  status?: string | null;
  recurrence_group_id?: string | null;
  location_id?: string | null;
  employee_availability_conflict?: Shift["availabilityConflict"] | null;
};

const todayAtNoon = new Date();
todayAtNoon.setHours(12, 0, 0, 0);

export const BASE_MONDAY = new Date(todayAtNoon);
BASE_MONDAY.setDate(todayAtNoon.getDate() - ((todayAtNoon.getDay() + 6) % 7));

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateSerial(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

const BASE_DATE_SERIAL = dateSerial(toIsoDate(BASE_MONDAY));

export function dateFromSerial(serial: number) {
  return new Date(serial * 86400000).toISOString().slice(0, 10);
}

function shiftInterval(shift: Shift) {
  const startDay = dateSerial(canonicalShiftDate(shift));
  const [startHour, startMinute] = shift.start.split(":").map(Number);
  const [endHour, endMinute] = shift.end.split(":").map(Number);
  const start = startDay * 1440 + startHour * 60 + startMinute;
  let end = startDay * 1440 + endHour * 60 + endMinute;
  if (end <= start) end += 1440;
  return { start, end };
}

export function shiftsOverlap(a: Shift, b: Shift) {
  const first = shiftInterval(a);
  const second = shiftInterval(b);
  return first.start < second.end && second.start < first.end;
}

export function conflictIds(shifts: Shift[]) {
  const ids = new Set<string>();
  const assigned = shifts.filter((shift) => !shift.isOpen);
  for (let first = 0; first < assigned.length; first += 1) {
    for (let second = first + 1; second < assigned.length; second += 1) {
      if (assigned[first].employee === assigned[second].employee && shiftsOverlap(assigned[first], assigned[second])) {
        ids.add(assigned[first].id);
        ids.add(assigned[second].id);
      }
    }
  }
  return ids;
}

export function shiftPositionFromDate(value: string) {
  const difference = dateSerial(value) - BASE_DATE_SERIAL;
  return { day: ((difference % 7) + 7) % 7, weekOffset: Math.floor(difference / 7) };
}

export function dateFromShift(weekOffset = 0, day = 0) {
  const date = new Date(BASE_MONDAY);
  date.setDate(BASE_MONDAY.getDate() + weekOffset * 7 + day);
  return toIsoDate(date);
}

export function canonicalShiftDate(shift: Shift) {
  return shift.date ?? dateFromShift(shift.weekOffset ?? 0, shift.day);
}

export function isOvernight(start: string, end: string) {
  return end <= start;
}

export function mapDatabaseShift(record: DatabaseShiftRecord): Shift {
  const startDate = new Date(String(record.starts_at));
  const endDate = new Date(String(record.ends_at));
  const timezone = record.location_timezone || "Europe/Copenhagen";
  const parts = (date: Date) => Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).map((part) => [part.type, part.value]),
  );
  const startParts = parts(startDate);
  const endParts = parts(endDate);
  const date = `${startParts.year}-${startParts.month}-${startParts.day}`;
  const position = shiftPositionFromDate(date);
  const employeeName = record.is_open ? "Available shift" : record.employee_name || "Unassigned";

  return {
    id: record.id,
    date,
    day: position.day,
    weekOffset: position.weekOffset,
    employee: employeeName,
    employeeId: record.employee_id || undefined,
    initials: record.is_open ? "+" : employeeName.split(" ").map((word) => word[0]).join(""),
    start: `${startParts.hour}:${startParts.minute}`,
    end: `${endParts.hour}:${endParts.minute}`,
    role: record.role,
    status: record.status === "DRAFT" ? "Draft" : "Published",
    isOpen: Boolean(record.is_open),
    recurrenceGroupId: record.recurrence_group_id || undefined,
    locationId: record.location_id || undefined,
    availabilityConflict: record.employee_availability_conflict || undefined,
  };
}

export function hoursBetween(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 1440;
  return minutes / 60;
}
