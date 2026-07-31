import { BarOpsApp } from "@/components/bar-ops-app"; import { requireUser } from "@/lib/auth/session";
export default async function Home(){await requireUser(["OWNER","ADMIN","MANAGER","SHIFT_MANAGER"]);return <BarOpsApp/>}
