import { BarOpsApp } from "@/components/bar-ops-app";
import { requireUser } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";

export default async function Home() {
  const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
  return <BarOpsApp userName={user.name} userRole={user.role} devMode={isDevAuthEnabled()} />;
}
