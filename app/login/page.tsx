import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "EMPLOYEE" ? "/employee" : "/");
  return <LoginForm devMode={isDevAuthEnabled()} />;
}
