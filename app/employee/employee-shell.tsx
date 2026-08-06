"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarDays, Clock3, Ellipsis, Home, LogOut, SlidersHorizontal, Umbrella, UserRound, Wine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import styles from "./EmployeeShell.module.css";

const primary = [
  ["/employee", "Home", Home],
  ["/employee/shifts", "Schedule", CalendarDays],
  ["/employee/hours", "Clock", Clock3],
  ["/employee/requests", "Requests", Umbrella],
] as const;

export function EmployeeShell({name,role,devMode,children}:{name:string;role:string;devMode:boolean;children:React.ReactNode}){
  const path=usePathname(),router=useRouter();
  const [moreOpen,setMoreOpen]=useState(false);
  const moreButtonRef=useRef<HTMLButtonElement>(null);
  const sheetRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!moreOpen)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const first=sheetRef.current?.querySelector<HTMLElement>('a,button');
    first?.focus();
    function onKeyDown(event:KeyboardEvent){
      if(event.key==='Escape'){event.preventDefault();setMoreOpen(false);return;}
      if(event.key!=='Tab'||!sheetRef.current)return;
      const items=Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a,button:not([disabled]),[tabindex]:not([tabindex="-1"])'));
      if(!items.length)return;
      const firstItem=items[0],lastItem=items[items.length-1];
      if(event.shiftKey&&document.activeElement===firstItem){event.preventDefault();lastItem.focus();}
      else if(!event.shiftKey&&document.activeElement===lastItem){event.preventDefault();firstItem.focus();}
    }
    document.addEventListener('keydown',onKeyDown);
    return()=>{document.removeEventListener('keydown',onKeyDown);(previous||moreButtonRef.current)?.focus();};
  },[moreOpen]);
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh()}
  const activeMore=path.startsWith('/employee/availability')||path.startsWith('/employee/notifications');
  return <div className="employee-app">
    <header className={`employee-header ${styles.header}`}>
      <Link href="/employee" className={`employee-brand ${styles.brand}`}><span className={styles.brandMark}><Wine size={19}/></span>Bar Ops</Link>
      <div>{devMode&&<DevRoleSwitcher currentRole={role}/>}<span className="employee-user-name">{name}</span></div>
    </header>
    <main>{children}</main>
    <nav className={`employee-nav ${styles.navigation}`} aria-label="Employee navigation">
      {primary.map(([href,label,Icon])=><Link aria-current={path===href?'page':undefined} className={path===href?`active ${styles.active}`:''} href={href} key={href}><Icon size={20}/><span>{label}</span></Link>)}
      <button ref={moreButtonRef} aria-expanded={moreOpen} aria-controls="employee-more-sheet" className={activeMore||moreOpen?`active ${styles.active}`:''} onClick={()=>setMoreOpen(v=>!v)}><Ellipsis size={20}/><span>More</span></button>
    </nav>
    {moreOpen&&<><button className="employee-more-scrim" aria-label="Close menu" onClick={()=>setMoreOpen(false)}/><section ref={sheetRef} id="employee-more-sheet" className={`employee-more-sheet ${styles.sheet}`} role="dialog" aria-modal="true" aria-label="More employee options">
      <div className="employee-more-handle"/>
      <Link href="/employee/availability" onClick={()=>setMoreOpen(false)}><SlidersHorizontal/>Availability</Link>
      <Link href="/employee/notifications" onClick={()=>setMoreOpen(false)}><Bell/>Notifications</Link>
      <button onClick={logout}><LogOut/>Sign out</button>
    </section></>}
  </div>
}
