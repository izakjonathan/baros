import type { AppRole } from "@/lib/auth/session";

export type Capability =
  | "manager.workspace"
  | "operations.read"
  | "operations.manage"
  | "schedule.read"
  | "schedule.edit"
  | "schedule.publish"
  | "schedule.templates.manage"
  | "attendance.read"
  | "attendance.manage"
  | "payroll.read"
  | "payroll.manage"
  | "payroll.export"
  | "requests.review"
  | "inventory.read"
  | "inventory.adjust"
  | "orders.manage"
  | "team.read"
  | "team.manage"
  | "accounts.invite"
  | "settings.read"
  | "settings.manage"
  | "security.manage"
  | "control.read"
  | "employee.self_service";

const ownerAdminCapabilities: readonly Capability[] = [
  "manager.workspace", "operations.read", "operations.manage", "schedule.read", "schedule.edit",
  "schedule.publish", "schedule.templates.manage", "attendance.read", "attendance.manage", "payroll.read",
  "payroll.manage", "payroll.export", "requests.review", "inventory.read", "inventory.adjust", "orders.manage",
  "team.read", "team.manage", "accounts.invite", "settings.read", "settings.manage", "security.manage",
  "control.read", "employee.self_service",
];

const ROLE_CAPABILITIES: Readonly<Record<AppRole, readonly Capability[]>> = {
  OWNER: ownerAdminCapabilities,
  ADMIN: ownerAdminCapabilities,
  MANAGER: ownerAdminCapabilities.filter((capability) => capability !== "security.manage"),
  SHIFT_MANAGER: [
    "manager.workspace", "operations.read", "operations.manage", "schedule.read", "schedule.edit",
    "schedule.publish", "attendance.read", "attendance.manage", "payroll.read", "requests.review",
    "inventory.read", "inventory.adjust", "orders.manage", "team.read", "settings.read", "control.read",
    "employee.self_service",
  ],
  EMPLOYEE: ["employee.self_service"],
};

export function hasCapability(role: AppRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function rolesWithCapability(capability: Capability): AppRole[] {
  return (Object.keys(ROLE_CAPABILITIES) as AppRole[]).filter((role) => hasCapability(role, capability));
}
