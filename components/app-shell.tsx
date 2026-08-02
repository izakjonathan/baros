"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Bell, CalendarDays, ChevronDown, Clock3, LayoutDashboard, Menu, Package, Search, Settings, ShoppingCart, Timer, Users, X, NotebookPen } from "lucide-react";
import { IconButton } from "@/components/ui-primitives";
import type { NavKey } from "@/lib/data";
import type { Location } from "@/lib/workspace-types";

export const navItems: { id: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Shift plan", icon: CalendarDays },
  { id: "attendance", label: "Timesheets", icon: Timer },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "operations", label: "Daily operations", icon: NotebookPen },
  { id: "team", label: "Team", icon: Users },
  { id: "control", label: "Control centre", icon: Settings },
];

export function FloatingNavigation({ active, onChange, open, onToggle }: { active: NavKey; onChange: (id: NavKey) => void; open: boolean; onToggle: () => void; userName?: string; userRole?: string; devMode?: boolean }) {
  const items = [...navItems, { id: "settings" as NavKey, label: "Settings", icon: Settings }];
  return <div className={`floating-navigation ${open ? "is-open" : ""}`}>
    <div className="floating-navigation-shell">
      <button type="button" className="floating-navigation-toggle" onClick={onToggle} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className="floating-navigation-strip" aria-label="Workspace navigation" aria-hidden={!open}>
        {items.map((item) => <button key={item.id} type="button" className={active === item.id ? "active" : ""} onClick={() => onChange(item.id)} tabIndex={open ? 0 : -1}>
          <span>{item.label}</span>{item.id === "inventory" && <em>5</em>}
        </button>)}
      </nav>
    </div>
  </div>;
}

export function Topbar({ locations, selectedLocationId, onLocationChange, onNavigate }: { locations: Location[]; selectedLocationId: string; onLocationChange: (id: string) => void; onNavigate: (id: NavKey) => void }) {
  const selected = locations.find((location) => location.id === selectedLocationId);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  const go = (id: NavKey) => { onNavigate(id); setSearchOpen(false); setNotificationsOpen(false); setQuery(""); };
  return <header className="topbar">
    <label className="location-switch" aria-label="Current location"><span className="status-dot" />{locations.length > 1 ? <><select value={selectedLocationId} onChange={(event) => onLocationChange(event.target.value)}>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select><ChevronDown size={15} /></> : <span>{selected?.name || "No active location"}</span>}</label>
    <div className="top-actions">
      <IconButton onClick={() => { setSearchOpen((value) => !value); setNotificationsOpen(false); }} label="Search workspace"><Search size={19} /></IconButton>
      <IconButton className="notification" onClick={() => { setNotificationsOpen((value) => !value); setSearchOpen(false); }} label="Open notifications"><Bell size={19} /><i /></IconButton>
      {searchOpen && <div className="top-popover search-popover"><label><Search size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workspace" /></label><div>{matches.map((item) => <button key={item.id} onClick={() => go(item.id)}><item.icon size={17} /><span>{item.label}</span><ArrowRight size={14} /></button>)}</div></div>}
      {notificationsOpen && <div className="top-popover notifications-popover"><strong>Notifications</strong><button onClick={() => go("schedule")}><CalendarDays size={17} /><span><b>Draft schedule</b><small>Review and publish upcoming shifts</small></span></button><button onClick={() => go("attendance")}><Clock3 size={17} /><span><b>Timesheet review</b><small>Open timesheets</small></span></button><button onClick={() => go("inventory")}><Package size={17} /><span><b>Stock attention</b><small>Review products below par</small></span></button></div>}
    </div>
  </header>;
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}
