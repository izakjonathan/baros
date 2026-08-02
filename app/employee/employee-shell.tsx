"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarDays, Clock3, Ellipsis, Home, LogOut, Search, SlidersHorizontal, Umbrella } from "lucide-react";
import { useState } from "react";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import { IconButton } from "@/components/ui-primitives";

const primary = [
  ["/employee", "Home", Home],
  ["/employee/shifts", "Schedule", CalendarDays],
  ["/employee/hours", "Clock", Clock3],
  ["/employee/requests", "Requests", Umbrella],
] as const;

export function EmployeeShell({name,role,locationName,devMode,children}:{name:string;role:string;locationName:string;devMode:boolean;children:React.ReactNode}){
  const path=usePathname(),router=useRouter();
  const [moreOpen,setMoreOpen]=useState(false);
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh()}
  const activeMore=path.startsWith('/employee/availability')||path.startsWith('/employee/notifications');
  return <div className="employee-app">
    <header className="employee-header">
      <div className="employee-header-leading">{devMode&&<DevRoleSwitcher currentRole={role}/>}</div>
      <Link href="/employee" className="employee-location"><span className="status-dot"/><strong>{locationName}</strong></Link>
      <div className="employee-header-actions">
        <IconButton label="Search employee portal" onClick={()=>router.push('/employee/shifts')}><Search size={20}/></IconButton>
        <Link href="/employee/notifications" className="icon-button notification" aria-label="Open notifications"><Bell size={20}/><i/></Link>
      </div>
    </header>
    <main>{children}</main>
    <nav className="employee-nav" aria-label="Employee navigation">
      {primary.map(([href,label,Icon])=><Link aria-current={path===href?'page':undefined} className={path===href?'active':''} href={href} key={href}><Icon size={20}/><span>{label}</span></Link>)}
      <button aria-expanded={moreOpen} className={activeMore||moreOpen?'active':''} onClick={()=>setMoreOpen(v=>!v)}><Ellipsis size={20}/><span>More</span></button>
    </nav>
    {moreOpen&&<><button className="employee-more-scrim" aria-label="Close menu" onClick={()=>setMoreOpen(false)}/><section className="employee-more-sheet" role="dialog" aria-modal="true" aria-label="More employee options">
      <div className="employee-more-handle"/>
      <div className="employee-more-user"><strong>{name}</strong><span>{role.toLowerCase()}</span></div>
      <Link href="/employee/availability" onClick={()=>setMoreOpen(false)}><SlidersHorizontal/>Availability</Link>
      <Link href="/employee/notifications" onClick={()=>setMoreOpen(false)}><Bell/>Notifications</Link>
      <button onClick={logout}><LogOut/>Sign out</button>
    </section></>}
  </div>
}
