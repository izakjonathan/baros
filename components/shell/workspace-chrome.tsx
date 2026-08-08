"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import type { AppRole } from "@/lib/auth/session";
import styles from "./ManagerShell.module.css";

export type WorkspaceChromeItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
};

export type WorkspaceLocation = { id: string; name: string };

export function WorkspaceSidebar({
  items,
  active,
  onNavigate,
  open,
  onClose,
  userName,
  userRole,
  devMode,
  settingsItem,
  onSignOut,
  locationLabel,
}: {
  items: WorkspaceChromeItem[];
  active: string;
  onNavigate: (id: string) => void;
  open: boolean;
  onClose: () => void;
  userName: string;
  userRole: AppRole;
  devMode: boolean;
  settingsItem?: WorkspaceChromeItem;
  onSignOut: () => void | Promise<void>;
  locationLabel?: string;
}) {
  return <>
    {open && <button className="scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${styles.sidebar} ${open ? "sidebar-open" : ""}`}>
      <div className={`brand ${styles.brand}`}>
        <div className={`brand-mark ${styles.brandMark}`}><Wine size={22} /></div>
        <div><strong>Bar Ops</strong><span>{locationLabel || "Workspace"}</span></div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={20} /></button>
      </div>
      <nav className={`side-nav ${styles.navigation}`} aria-label="Workspace navigation">
        <p>Workspace</p>
        {items.map((item) => <button type="button" key={item.id} className={active === item.id ? "active" : ""} aria-current={active === item.id ? "page" : undefined} onClick={() => onNavigate(item.id)}><item.icon size={19} /><span>{item.label}</span>{item.badge !== undefined && <em>{item.badge}</em>}</button>)}
      </nav>
      <div className={`side-bottom ${styles.bottom}`}>
        {settingsItem && <button type="button" className={active === settingsItem.id ? "active" : ""} aria-current={active === settingsItem.id ? "page" : undefined} onClick={() => onNavigate(settingsItem.id)}><settingsItem.icon size={19} /><span>{settingsItem.label}</span></button>}
        <button type="button" onClick={() => void onSignOut()}><LogOut size={19} /><span>Sign out</span></button>
        {devMode && <DevRoleSwitcher currentRole={userRole} />}
        <div className={`profile ${styles.profile}`}><div className="avatar dark">{userName.split(" ").map(part => part[0]).join("").slice(0,2)}</div><div><strong>{userName}</strong><span>{userRole.replace("_", " ").toLowerCase()}</span></div><ChevronDown size={16} /></div>
      </div>
    </aside>
  </>;
}

export function WorkspaceTopbar({
  items,
  onMenu,
  locations,
  selectedLocationId,
  onLocationChange,
  staticLocationLabel,
  onNavigate,
  theme,
  onToggleTheme,
  notificationItems = [],
}: {
  items: WorkspaceChromeItem[];
  onMenu: () => void;
  locations?: WorkspaceLocation[];
  selectedLocationId?: string;
  onLocationChange?: (id: string) => void;
  staticLocationLabel?: string;
  onNavigate: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  notificationItems?: Array<{ id: string; label: string; detail: string; icon: LucideIcon }>;
}) {
  const selected = locations?.find(location => location.id === selectedLocationId);
  const [searchOpen,setSearchOpen]=useState(false);
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [query,setQuery]=useState("");
  const matches=items.filter(item=>item.label.toLowerCase().includes(query.toLowerCase()));
  const go=(id:string)=>{onNavigate(id);setSearchOpen(false);setNotificationsOpen(false);setQuery("");};
  const label = selected?.name || staticLocationLabel || "No active location";
  return <header className={`topbar ${styles.topbar}`}>
    <button className={`menu-button ${styles.topbarButton} ${styles.menuButton}`} onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
    <div className={`location-switch ${styles.location}`} aria-label="Current location"><span className="status-dot" />{locations && locations.length > 1 && selectedLocationId && onLocationChange ? <><select aria-label="Current location" value={selectedLocationId} onChange={event => onLocationChange(event.target.value)}>{locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select><ChevronDown size={15} /></> : <span>{label}</span>}</div>
    <div className={`top-actions ${styles.actions}`}>
      <button className={`icon-button ${styles.topbarButton}`} onClick={()=>{setSearchOpen(v=>!v);setNotificationsOpen(false)}} aria-label="Search workspace" aria-expanded={searchOpen} aria-controls="workspace-search-popover"><Search size={19} /></button>
      <button className={`icon-button ${styles.topbarButton} ${styles.themeButton}`} onClick={onToggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "dark"}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <button className={`icon-button notification ${styles.topbarButton}`} onClick={()=>{setNotificationsOpen(v=>!v);setSearchOpen(false)}} aria-label="Open notifications" aria-expanded={notificationsOpen} aria-controls="workspace-notifications-popover"><Bell size={19} /><i /></button>
      {searchOpen&&<div id="workspace-search-popover" className="top-popover search-popover" role="dialog" aria-label="Search workspace"><label><Search size={16}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search workspace"/></label><div>{matches.map(item=><button key={item.id} onClick={()=>go(item.id)}><item.icon size={17}/><span>{item.label}</span><ArrowRight size={14}/></button>)}</div></div>}
      {notificationsOpen&&<div id="workspace-notifications-popover" className="top-popover notifications-popover" role="dialog" aria-label="Notifications"><strong>Notifications</strong>{notificationItems.length ? notificationItems.map(item=><button key={item.id} onClick={()=>go(item.id)}><item.icon size={17}/><span><b>{item.label}</b><small>{item.detail}</small></span></button>) : <div className="top-popover-empty">No new notifications</div>}</div>}
    </div>
  </header>;
}
