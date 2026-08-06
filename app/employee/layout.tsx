import { requireCapability } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { EmployeeShell } from "./employee-shell";
import "./EmployeeWorkspace.css";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireCapability("employee.self_service");
  return <EmployeeShell name={user.name} role={user.role} devMode={isDevAuthEnabled()}>{children}</EmployeeShell>;
}
