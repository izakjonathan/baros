"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarDays, Clock3, Ellipsis, Home, LogOut, SlidersHorizontal, Umbrella, UserRound, Wine } from "lucide-react";
import { useState } from "react";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";

const primary = [
  ["/employee", "Home", Home],
  ["/employee/shifts", "Schedule", CalendarDays],
  ["/employee/hours", "Clock", Clock3],
  ["/employee/requests", "Requests", Umbrella],
] as const;

export function EmployeeShell({name,role,devMode,children}:{name:string;role:string;devMode:boolean;children:React.ReactNode}){
  const path=usePathname(),router=useRouter();
  const [moreOpen,setMoreOpen]=useState(false);
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh()}
  const activeMore=path.startsWith('/employee/availability')||path.startsWith('/employee/notifications');
  return <div className="employee-app">
    <header className="employee-header">
      <Link href="/employee" className="employee-brand"><span><Wine size={19}/></span>Bar Ops</Link>
      <div>{devMode&&<DevRoleSwitcher currentRole={role}/>}<span className="employee-user-name">{name}</span></div>
    </header>
    <main>{children}</main>
    <nav className="employee-nav" aria-label="Employee navigation">
      {primary.map(([href,label,Icon])=><Link aria-current={path===href?'page':undefined} className={path===href?'active':''} href={href} key={href}><Icon size={20}/><span>{label}</span></Link>)}
      <button aria-expanded={moreOpen} className={activeMore||moreOpen?'active':''} onClick={()=>setMoreOpen(v=>!v)}><Ellipsis size={20}/><span>More</span></button>
    </nav>
    {moreOpen&&<><button className="employee-more-scrim" aria-label="Close menu" onClick={()=>setMoreOpen(false)}/><section className="employee-more-sheet" role="dialog" aria-modal="true" aria-label="More employee options">
      <div className="employee-more-handle"/>
      <Link href="/employee/availability" onClick={()=>setMoreOpen(false)}><SlidersHorizontal/>Availability</Link>
      <Link href="/employee/notifications" onClick={()=>setMoreOpen(false)}><Bell/>Notifications</Link>
      <button onClick={logout}><LogOut/>Sign out</button>
    </section></>}
  </div>
}
