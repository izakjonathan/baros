import { redirect } from "next/navigation"; import { getSessionUser } from "@/lib/auth/session"; import { LoginForm } from "./login-form";
export default async function LoginPage(){const u=await getSessionUser();if(u)redirect(u.role==='EMPLOYEE'?'/employee':'/');return <LoginForm/>}
