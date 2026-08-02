import { requireUser } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { db } from "@/lib/db/client";
import { EmployeeShell } from "./employee-shell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const locations = user.locationId ? await db()<Array<{ name: string }>>`select name from locations where id=${user.locationId} and organization_id=${user.organizationId} limit 1` : [];
  return <EmployeeShell name={user.name} role={user.role} locationName={locations[0]?.name || "Bar Ops"} devMode={isDevAuthEnabled()}>{children}</EmployeeShell>;
}
