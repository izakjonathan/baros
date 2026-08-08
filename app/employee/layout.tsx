import { requireCapability } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { db } from "@/lib/db/client";
import { EmployeeShell } from "./employee-shell";
import "./EmployeeWorkspace.css";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireCapability("employee.self_service");
  const locations = user.locationId
    ? await db()<Array<{ name: string }>>`select name from locations where id=${user.locationId} and organization_id=${user.organizationId} limit 1`
    : [];
  return <EmployeeShell name={user.name} role={user.role} devMode={isDevAuthEnabled()} locationName={locations[0]?.name || "Employee workspace"}>{children}</EmployeeShell>;
}
