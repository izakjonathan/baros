import { BarOpsApp } from "@/components/bar-ops-app";
import { requireCapability } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";

export default async function Home() {
  const user = await requireCapability("manager.workspace");
  return <BarOpsApp userName={user.name} userRole={user.role} devMode={isDevAuthEnabled()} />;
}
