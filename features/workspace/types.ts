export type Location = { id: string; name: string; timezone?: string };

export type Employee = {
  id?: string;
  name: string;
  initials: string;
  role: string;
  hours: number;
  status: string;
  active: boolean;
  email?: string;
  phone?: string;
  payrollId?: string;
  salaryCode?: string;
  costCentre?: string;
  hourlyRate?: number;
  locationId?: string;
  locations?: Array<{ id: string; name: string; primary?: boolean }>;
  portalStatus?: "NONE" | "INVITED" | "ACTIVE" | "EXPIRED";
};

export type StockAdjustment = {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  reason: string;
  createdAt: string;
};

export type OpsTask = {
  id: string;
  title: string;
  type: "Opening" | "Closing" | "Task" | "Maintenance";
  owner: string;
  due: string;
  done: boolean;
  note?: string;
};

export type LogEntry = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
};

export type TimeEntry = {
  id: string;
  employee: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  status: "Running" | "Pending" | "Approved" | "Rejected";
  scheduledHours: number;
  note?: string;
  edited?: boolean;
  onBreak?: boolean;
  breakStartedAt?: string | null;
};

export type ShiftNote = {
  id: string;
  shiftId: string;
  note: string;
  category: string;
  createdAt: string;
  author: string;
  role: string;
  startsAt: string;
};

export type ScheduleAcknowledgementSummary = {
  publication: { id: string; version: number; publishedAt: string } | null;
  employees: Array<{
    id: string;
    name: string;
    acknowledgedAt: string | null;
    changeTypes?: string[];
  }>;
};

export type ClockSettings = {
  allowMobileClock: boolean;
  allowKioskClock: boolean;
  allowUnscheduledClock: boolean;
  requireLocationCheck: boolean;
  earlyClockInMinutes: number;
  lateClockOutMinutes: number;
  roundingMinutes: number;
  autoApproveWithinMinutes: number | "";
};
