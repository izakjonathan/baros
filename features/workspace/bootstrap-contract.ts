import type { DatabaseShiftRecord } from "./schedule-utils";
import type { Location } from "./types";

type EmployeeLocationRecord = { id: string; name: string; primary?: boolean };
type EmployeeBootstrapRecord = {
  id: string;
  first_name: string;
  last_name: string;
  employment_title?: string | null;
  contracted_hours?: number | string | null;
  active: boolean;
  email?: string | null;
  phone?: string | null;
  payroll_id?: string | null;
  salary_code?: string | null;
  cost_centre?: string | null;
  hourly_rate?: number | string | null;
  locations?: EmployeeLocationRecord[];
  portal_status?: "NONE" | "INVITED" | "ACTIVE" | "EXPIRED";
};
type ProductBootstrapRecord = {
  id: string;
  name: string;
  category: string;
  supplier?: string | null;
  quantity?: number | string | null;
  par_level?: number | string | null;
  unit: string;
  purchase_price?: number | string | null;
};
type TimesheetBootstrapRecord = {
  id: string;
  employee_name: string;
  work_date: string | Date;
  clocked_in_at: string | Date;
  clocked_out_at?: string | Date | null;
  break_minutes: number;
  status: "OPEN" | "PENDING" | "APPROVED" | "REJECTED";
  scheduled_minutes?: number | string | null;
  manager_note?: string | null;
  on_break?: boolean;
  open_break_started_at?: string | Date | null;
};
type ShiftNoteBootstrapRecord = {
  id: string;
  shift_id: string;
  note: string;
  category: string;
  created_at: string | Date;
  author_name: string;
  role: string;
  starts_at: string | Date;
};
type InvitationBootstrapRecord = {
  employee_id: string;
  portal_status: "NONE" | "INVITED" | "ACTIVE" | "EXPIRED";
};


type EmployeeInvitationMutationResponse = {
  ok?: boolean;
  error?: string;
  activationUrl?: string;
  status?: string;
};

type ManagerBootstrapResponse = {
  locations: Location[];
  selectedLocationId: string | null;
  employees: EmployeeBootstrapRecord[];
  shifts: DatabaseShiftRecord[];
  products: ProductBootstrapRecord[];
  orders: unknown[];
  timesheets: TimesheetBootstrapRecord[];
  alerts: unknown[];
  exports: unknown[];
  templates: unknown[];
  forecasts: unknown[];
  shiftNotes: ShiftNoteBootstrapRecord[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function parseManagerBootstrapResponse(value: unknown): ManagerBootstrapResponse {
  if (!isRecord(value)) throw new Error("Workspace response is not an object");
  const arrayKeys = ["locations", "employees", "shifts", "products", "orders", "timesheets", "alerts", "exports", "templates", "forecasts", "shiftNotes"] as const;
  for (const key of arrayKeys) {
    if (!isArray(value[key])) throw new Error(`Workspace response is missing ${key}`);
  }
  if (value.selectedLocationId !== null && typeof value.selectedLocationId !== "string") {
    throw new Error("Workspace response has an invalid selected location");
  }
  return value as ManagerBootstrapResponse;
}

export function parseInvitationRecords(value: unknown): InvitationBootstrapRecord[] {
  if (!Array.isArray(value)) throw new Error("Invitation response is not an array");
  return value.filter((item): item is InvitationBootstrapRecord =>
    isRecord(item) && typeof item.employee_id === "string" && typeof item.portal_status === "string"
  );
}

export function parseEmployeeInvitationMutationResponse(value: unknown): EmployeeInvitationMutationResponse {
  if (!isRecord(value)) throw new Error("Invitation mutation response is not an object");
  if (value.error !== undefined && typeof value.error !== "string") throw new Error("Invitation mutation response has an invalid error");
  if (value.activationUrl !== undefined && typeof value.activationUrl !== "string") throw new Error("Invitation mutation response has an invalid activation URL");
  if (value.status !== undefined && typeof value.status !== "string") throw new Error("Invitation mutation response has an invalid status");
  if (value.ok !== undefined && typeof value.ok !== "boolean") throw new Error("Invitation mutation response has an invalid ok flag");
  return value as EmployeeInvitationMutationResponse;
}
