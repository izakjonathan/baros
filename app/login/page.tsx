import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isDevAuthEnabled } from "@/lib/auth/dev-auth";
import { LoginForm } from "./login-form";
import { getLoginUiTheme } from "@/lib/ui-theme";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/operation");
  const theme = await getLoginUiTheme();
  return <LoginForm devMode={isDevAuthEnabled()} theme={theme} />;
}
