import { requireUser } from "@/lib/auth/session"; import { EmployeeShell } from "./employee-shell";
export default async function Layout({children}:{children:React.ReactNode}){const u=await requireUser();return <EmployeeShell name={u.name}>{children}</EmployeeShell>}
