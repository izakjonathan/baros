import { requireUser } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { EmployeeShell } from "./employee-shell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <EmployeeShell name={user.name} role={user.role} devMode={isDevAuthEnabled()}>{children}</EmployeeShell>;
}
