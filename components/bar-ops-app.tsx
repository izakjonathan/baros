"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Coffee, LayoutDashboard, Menu, Package, Plus,
  Search, Settings, ShoppingCart, Sparkles, Users, X, AlertTriangle, Truck, MoreHorizontal,
  Copy, Send, Boxes, Wine, UserRoundPlus, Timer, Play, Square, FileCheck2, FileDown, CheckCheck, RotateCcw, Ban, Pencil, ShieldAlert, History, DownloadCloud, LockKeyhole, UnlockKeyhole, Database, KeyRound, MapPin, FileArchive, ShieldCheck, ReceiptText, Trash2, ArrowLeftRight, TrendingUp
} from "lucide-react";
import { days, initialProducts, initialShifts, orders, team, type NavKey, type Product, type Shift, type ShiftRole } from "@/lib/data";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";

const navItems: { id: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Shift plan", icon: CalendarDays },
  { id: "attendance", label: "Time & attendance", icon: Timer },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "team", label: "Team", icon: Users },
  { id: "control", label: "Control centre", icon: Settings },
];

type Employee = { id?: string; name: string; initials: string; role: string; hours: number; status: string; active: boolean; email?: string; phone?: string; payrollId?: string; salaryCode?: string; costCentre?: string };
type TimeEntry = { id: string; employee: string; date: string; clockIn: string; clockOut?: string; breakMinutes: number; status: "Running" | "Pending" | "Approved" | "Rejected"; scheduledHours: number; note?: string; edited?: boolean };
const BASE_MONDAY = new Date(2026, 6, 27, 12);
function toIsoDate(date: Date) { const y = date.getFullYear(); const m = String(date.getMonth()+1).padStart(2,"0"); const d = String(date.getDate()).padStart(2,"0"); return `${y}-${m}-${d}`; }
function dateSerial(value: string) { const [year, month, day] = value.split("-").map(Number); return Date.UTC(year, month - 1, day) / 86400000; }
const BASE_DATE_SERIAL = dateSerial("2026-07-27");
function dateFromSerial(serial: number) { const date = new Date(serial * 86400000); return date.toISOString().slice(0, 10); }
function shiftInterval(shift: Shift) { const startDay = dateSerial(canonicalShiftDate(shift)); const [sh, sm] = shift.start.split(":").map(Number); const [eh, em] = shift.end.split(":").map(Number); const start = startDay * 1440 + sh * 60 + sm; let end = startDay * 1440 + eh * 60 + em; if (end <= start) end += 1440; return { start, end }; }
function shiftsOverlap(a: Shift, b: Shift) { const x = shiftInterval(a); const y = shiftInterval(b); return x.start < y.end && y.start < x.end; }
function conflictIds(shifts: Shift[]) { const ids = new Set<string>(); const assigned = shifts.filter((s) => !s.isOpen); for (let i=0;i<assigned.length;i++) for (let j=i+1;j<assigned.length;j++) if (assigned[i].employee === assigned[j].employee && shiftsOverlap(assigned[i], assigned[j])) { ids.add(assigned[i].id); ids.add(assigned[j].id); } return ids; }
function shiftPositionFromDate(value: string) { const diffDays = dateSerial(value) - BASE_DATE_SERIAL; return { day: ((diffDays % 7) + 7) % 7, weekOffset: Math.floor(diffDays / 7) }; }
function dateFromShift(weekOffset = 0, day = 0) { const date = new Date(BASE_MONDAY); date.setDate(BASE_MONDAY.getDate() + weekOffset * 7 + day); return toIsoDate(date); }
function canonicalShiftDate(shift: Shift) { return shift.date ?? dateFromShift(shift.weekOffset ?? 0, shift.day); }
function isOvernight(start: string, end: string) { return end <= start; }

export function BarOpsApp({ userName, userRole, devMode }: { userName: string; userRole: string; devMode: boolean }) {
  const [active, setActive] = useState<NavKey>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [shifts, setShifts] = useState(initialShifts);
  const [products, setProducts] = useState(initialProducts);
  const [employees, setEmployees] = useState<Employee[]>(team.map((person) => ({ ...person, active: true })));
  const [dialog, setDialog] = useState<"shift" | "product" | "order" | "employee" | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  const [toast, setToast] = useState("");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    { id: "t1", employee: "Alex Morgan", date: "2026-07-27", clockIn: "15:57", clockOut: "00:08", breakMinutes: 30, status: "Approved", scheduledHours: 8 },
    { id: "t2", employee: "Maya Chen", date: "2026-07-27", clockIn: "18:04", clockOut: "02:02", breakMinutes: 20, status: "Approved", scheduledHours: 8 },
    { id: "t3", employee: "Jonas Berg", date: "2026-07-28", clockIn: "16:51", clockOut: "01:14", breakMinutes: 30, status: "Pending", scheduledHours: 8 },
    { id: "t4", employee: "Sofia Lund", date: "2026-07-31", clockIn: "18:58", breakMinutes: 0, status: "Running", scheduledHours: 7 },
  ]);
  const [databaseStatus, setDatabaseStatus] = useState(devMode ? "Development data" : "Connecting…");
  useEffect(() => {
    if (devMode) return;
    fetch("/api/manager/bootstrap", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Could not load workspace");
      const data = await response.json();
      setEmployees((data.employees || []).map((e: any) => ({ id:e.id, name:`${e.first_name} ${e.last_name}`, initials:`${e.first_name?.[0]||""}${e.last_name?.[0]||""}`, role:e.employment_title||"Employee", hours:Number(e.contracted_hours||0), status:e.active?"Active":"Inactive", active:e.active, email:e.email||"", phone:e.phone||"", payrollId:e.payroll_id||"", salaryCode:e.salary_code||"", costCentre:e.cost_centre||"" })));
      setShifts((data.shifts || []).map((x:any) => { const d=new Date(x.starts_at); const end=new Date(x.ends_at); const date=x.starts_at.slice(0,10); const pos=shiftPositionFromDate(date); return {id:x.id,date,day:pos.day,weekOffset:pos.weekOffset,employee:x.is_open?"Available shift":x.employee_name||"Unassigned",initials:x.is_open?"+":(x.employee_name||"").split(" ").map((w:string)=>w[0]).join(""),start:d.toISOString().slice(11,16),end:end.toISOString().slice(11,16),role:x.role,status:x.status==="DRAFT"?"Draft":"Published",isOpen:x.is_open,recurrenceGroupId:x.recurrence_group_id}; }));
      setProducts((data.products || []).map((x:any)=>({id:x.id,name:x.name,category:x.category,supplier:x.supplier||"Unassigned",stock:Number(x.quantity||0),par:Number(x.par_level||0),unit:x.unit,price:Number(x.purchase_price||0)})));
      setTimeEntries((data.timesheets || []).map((x:any)=>({id:x.id,employee:x.employee_name,date:String(x.work_date).slice(0,10),clockIn:String(x.clocked_in_at).slice(11,16),clockOut:x.clocked_out_at?String(x.clocked_out_at).slice(11,16):undefined,breakMinutes:x.break_minutes,status:(x.status==="OPEN"?"Running":x.status[0]+x.status.slice(1).toLowerCase()) as TimeEntry["status"],scheduledHours:Number(x.scheduled_minutes||0)/60,note:x.manager_note})));
      setDatabaseStatus("PostgreSQL connected");
    }).catch(() => setDatabaseStatus("Database connection error"));
  }, [devMode]);
  async function persist(path:string, options:RequestInit){ if(devMode) return null; const response=await fetch(path,{...options,headers:{"content-type":"application/json",...(options.headers||{})}}); if(!response.ok) throw new Error((await response.json().catch(()=>({}))).error||"Save failed"); return response.json(); }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  return (
    <div className="app-frame">
      <Sidebar active={active} onChange={(value) => { setActive(value); setMobileNav(false); }} open={mobileNav} onClose={() => setMobileNav(false)} userName={userName} userRole={userRole} devMode={devMode} />
      <main className="main-shell">
        <Topbar onMenu={() => setMobileNav(true)} />
        <div className="page-wrap">
          {active === "dashboard" && <Dashboard shifts={shifts} products={products} onNavigate={setActive} onNewShift={() => setDialog("shift")} />}
          {active === "schedule" && <Schedule shifts={shifts} setShifts={setShifts} employees={employees} onNewShift={() => setDialog("shift")} onEditShift={setEditingShift} notify={notify} currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} />}
          {active === "attendance" && <Attendance employees={employees} shifts={shifts} entries={timeEntries} setEntries={setTimeEntries} notify={notify} onEdit={setEditingTimeEntry} />}
          {active === "inventory" && <Inventory products={products} setProducts={setProducts} onNewProduct={() => setDialog("product")} notify={notify} />}
          {active === "orders" && <Orders onNewOrder={() => setDialog("order")} notify={notify} />}
          {active === "team" && <Team employees={employees} onAdd={() => setDialog("employee")} onEdit={setEditingEmployee} />}
          {active === "control" && <ControlCenter devMode={devMode} databaseStatus={databaseStatus} notify={notify} />}
        </div>
      </main>
      {editingShift && <EditShiftDialog shift={editingShift} employees={employees} onClose={() => setEditingShift(null)} onSave={(updated, scope) => { const assigned=employees.find(e=>e.name===updated.employee); persist("/api/shifts",{method:"PATCH",body:JSON.stringify({id:updated.id,scope,employeeId:assigned?.id,isOpen:updated.isOpen,role:updated.role,startsAt:`${canonicalShiftDate(updated)}T${updated.start}:00`,endsAt:`${dateFromSerial(dateSerial(canonicalShiftDate(updated))+(isOvernight(updated.start,updated.end)?1:0))}T${updated.end}:00`,status:updated.status.toUpperCase()})}).catch(e=>notify(e.message)); setShifts((current) => current.map((item) => { if (scope === "occurrence") return item.id === updated.id ? updated : item; if (!updated.recurrenceGroupId || item.recurrenceGroupId !== updated.recurrenceGroupId) return item; if (scope === "future" && dateSerial(canonicalShiftDate(item)) < dateSerial(canonicalShiftDate(editingShift))) return item; const originalDate = canonicalShiftDate(editingShift); const targetDate = canonicalShiftDate(updated); const dayDelta = dateSerial(targetDate) - dateSerial(originalDate); const shiftedDate = dateFromSerial(dateSerial(canonicalShiftDate(item)) + dayDelta); const pos = shiftPositionFromDate(shiftedDate); return { ...item, employee: updated.employee, initials: updated.initials, role: updated.role, start: updated.start, end: updated.end, status: updated.status, isOpen: updated.isOpen, date: shiftedDate, day: pos.day, weekOffset: pos.weekOffset }; })); setEditingShift(null); notify(scope === "occurrence" ? "Shift updated" : scope === "future" ? "This and future shifts updated" : "Entire shift series updated"); }} onDelete={() => { persist(`/api/shifts?id=${editingShift.id}`,{method:"DELETE"}).catch(e=>notify(e.message)); setShifts((current) => current.filter((item) => item.id !== editingShift.id)); setEditingShift(null); notify("Shift removed"); }} />}
      {dialog === "shift" && <ShiftDialog employees={employees} currentWeekOffset={currentWeekOffset} onClose={() => setDialog(null)} onSave={(newShifts) => { setShifts((current) => [...current, ...newShifts]); if(!devMode){for(const x of newShifts){const assigned=employees.find(e=>e.name===x.employee);persist("/api/shifts",{method:"POST",body:JSON.stringify({employeeId:assigned?.id,isOpen:x.isOpen,role:x.role,startsAt:`${canonicalShiftDate(x)}T${x.start}:00`,endsAt:`${dateFromSerial(dateSerial(canonicalShiftDate(x))+(isOvernight(x.start,x.end)?1:0))}T${x.end}:00`,status:"DRAFT"})}).catch(e=>notify(e.message));}} setDialog(null); notify(newShifts.length > 1 ? `${newShifts.length} repeating shifts added` : "Shift added to the draft schedule"); }} />}
      {editingTimeEntry && <TimesheetDialog entry={editingTimeEntry} onClose={() => setEditingTimeEntry(null)} onSave={(updated) => { setTimeEntries((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingTimeEntry(null); notify("Timesheet corrected and returned to pending review"); }} />}
      {editingEmployee && <EmployeeDialog employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={(updated) => { setEmployees((current) => current.map((item) => item.name === editingEmployee.name ? updated : item)); persist("/api/employees",{method:"PATCH",body:JSON.stringify({...updated,id:editingEmployee.id})}).catch(e=>notify(e.message)); setEditingEmployee(null); notify("Employee updated"); }} />}
      {dialog === "employee" && <EmployeeDialog onClose={() => setDialog(null)} onSave={(employee) => { setEmployees((current) => [...current, employee]); persist("/api/employees",{method:"POST",body:JSON.stringify(employee)}).catch(e=>notify(e.message)); setDialog(null); notify("Employee added"); }} />}
      {dialog === "product" && <ProductDialog onClose={() => setDialog(null)} onSave={(product) => { setProducts((current) => [...current, product]); persist("/api/products",{method:"POST",body:JSON.stringify(product)}).catch(e=>notify(e.message)); setDialog(null); notify("Product added to inventory"); }} />}
      {dialog === "order" && <OrderDialog onClose={() => setDialog(null)} onSave={() => { setDialog(null); notify("Purchase order created"); }} />}
      {toast && <div className="toast"><span><Check size={16} /></span>{toast}</div>}
    </div>
  );
}

function Sidebar({ active, onChange, open, onClose, userName, userRole, devMode }: { active: NavKey; onChange: (id: NavKey) => void; open: boolean; onClose: () => void; userName: string; userRole: string; devMode: boolean }) {
  return <>
    {open && <button className="scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Wine size={22} /></div><div><strong>Bar Ops</strong><span>Temple Bar</span></div><button className="sidebar-close" onClick={onClose}><X size={20} /></button></div>
      <nav className="side-nav">
        <p>Workspace</p>
        {navItems.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onChange(item.id)}><item.icon size={19} /><span>{item.label}</span>{item.id === "inventory" && <em>5</em>}</button>)}
      </nav>
      <div className="side-bottom">
        <button><Settings size={19} /><span>Settings</span></button>
        {devMode && <DevRoleSwitcher currentRole={userRole} />}<div className="profile"><div className="avatar dark">{userName.split(" ").map(part => part[0]).join("").slice(0,2)}</div><div><strong>{userName}</strong><span>{userRole.replace("_", " ").toLowerCase()}</span></div><ChevronDown size={16} /></div>
      </div>
    </aside>
  </>
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return <header className="topbar"><button className="menu-button" onClick={onMenu}><Menu size={21} /></button><div className="location-switch"><span className="status-dot" />Temple Bar<ChevronDown size={15} /></div><div className="top-actions"><button className="icon-button"><Search size={19} /></button><button className="icon-button notification"><Bell size={19} /><i /></button><button className="help-button">Help</button></div></header>
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p>{subtitle}</p></div>{action}</div>
}

function Dashboard({ shifts, products, onNavigate, onNewShift }: { shifts: Shift[]; products: Product[]; onNavigate: (id: NavKey) => void; onNewShift: () => void }) {
  const lowStock = products.filter((product) => product.stock < product.par);
  const draftCount = shifts.filter((shift) => shift.status === "Draft").length;
  return <>
    <PageHeader eyebrow="Friday, 31 July" title="Good evening, Izak" subtitle="Here’s what needs your attention across the bar." action={<button className="primary" onClick={onNewShift}><Plus size={18} /> Add shift</button>} />
    <section className="metric-grid">
      <Metric icon={Users} label="On shift today" value="3 people" detail="Next shift starts at 17:00" trend="Fully covered" />
      <Metric icon={Clock3} label="Scheduled this week" value="139 hours" detail="Across 14 shifts" trend="8% vs last week" />
      <Metric icon={CircleDollarSign} label="Estimated labour" value="22,480 kr." detail="16.2% of forecast sales" trend="On target" />
      <Metric icon={AlertTriangle} label="Needs attention" value={`${lowStock.length + draftCount} items`} detail={`${lowStock.length} low stock · ${draftCount} draft shifts`} trend="Review now" warning />
    </section>
    <div className="dashboard-grid">
      <section className="panel today-panel"><PanelTitle title="Today at the bar" subtitle="Friday, 31 July" action={<button className="text-button" onClick={() => onNavigate("schedule")}>View shift plan <ArrowRight size={15} /></button>} />
        <div className="timeline">
          {[{ time: "15:00", title: "Maya Chen", role: "Manager", initials: "MC", end: "00:00" }, { time: "17:00", title: "Jonas Berg", role: "Bartender", initials: "JB", end: "03:00" }, { time: "19:00", title: "Sofia Lund", role: "Floor · confirmation pending", initials: "SL", end: "02:00", pending: true }].map((item) => <div className="timeline-row" key={item.title}><time>{item.time}</time><div className={`avatar ${item.pending ? "sand" : ""}`}>{item.initials}</div><div className="grow"><strong>{item.title}</strong><span>{item.role}</span></div><span className="shift-time">{item.time}–{item.end}</span><button className="more"><MoreHorizontal size={19} /></button></div>)}
        </div>
      </section>
      <section className="panel attention-panel"><PanelTitle title="Attention needed" subtitle="Prioritised for you" />
        <button className="attention-item" onClick={() => onNavigate("inventory")}><span className="attention-icon amber"><Boxes size={19} /></span><div><strong>{lowStock.length} products below par</strong><small>Pilsner, house red and more</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("schedule")}><span className="attention-icon violet"><CalendarDays size={19} /></span><div><strong>{draftCount} unpublished shifts</strong><small>Complete and publish this week</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("orders")}><span className="attention-icon blue"><Truck size={19} /></span><div><strong>Delivery tomorrow</strong><small>Nordic Drinks · 4 items</small></div><ChevronRight size={18} /></button>
      </section>
    </div>
    <section className="panel quick-panel"><PanelTitle title="Quick actions" subtitle="Common management tasks" /><div className="quick-grid">
      <Quick icon={CalendarDays} label="Create shift" detail="Add someone to the plan" onClick={onNewShift} />
      <Quick icon={ClipboardList} label="Start stock count" detail="Update inventory levels" onClick={() => onNavigate("inventory")} />
      <Quick icon={ShoppingCart} label="Create order" detail="Build a purchase order" onClick={() => onNavigate("orders")} />
      <Quick icon={UserRoundPlus} label="Invite employee" detail="Add someone to the team" onClick={() => onNavigate("team")} />
    </div></section>
  </>
}

function Metric({ icon: Icon, label, value, detail, trend, warning }: { icon: typeof Users; label: string; value: string; detail: string; trend: string; warning?: boolean }) {
  return <div className="metric-card"><div className={`metric-icon ${warning ? "warning" : ""}`}><Icon size={20} /></div><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small><div className={`metric-trend ${warning ? "warn" : ""}`}>{warning ? <AlertTriangle size={13} /> : <Sparkles size={13} />}{trend}</div></div>
}
function PanelTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) { return <div className="panel-title"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div> }
function Quick({ icon: Icon, label, detail, onClick }: { icon: typeof CalendarDays; label: string; detail: string; onClick: () => void }) { return <button className="quick-action" onClick={onClick}><span><Icon size={19} /></span><div><strong>{label}</strong><small>{detail}</small></div><ArrowRight size={17} /></button> }

function Schedule({ shifts, setShifts, employees, onNewShift, onEditShift, notify, currentWeekOffset, setCurrentWeekOffset }: { shifts: Shift[]; setShifts: React.Dispatch<React.SetStateAction<Shift[]>>; employees: Employee[]; onNewShift: () => void; onEditShift: (shift: Shift) => void; notify: (s: string) => void; currentWeekOffset: number; setCurrentWeekOffset: React.Dispatch<React.SetStateAction<number>> }) {
  const visibleShifts = shifts.filter((shift) => (shift.weekOffset ?? 0) === currentWeekOffset);
  const drafts = visibleShifts.filter((shift) => shift.status === "Draft").length;
  const conflicts = conflictIds(visibleShifts);
  const monday = new Date(BASE_MONDAY); monday.setDate(BASE_MONDAY.getDate() + currentWeekOffset * 7);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const weekDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return { short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], date: String(date.getDate()).padStart(2, "0") }; });
  const rangeLabel = `${monday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  const weekLabel = currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : rangeLabel;
  function publish() {
    if (!drafts) { notify("This week is already published"); return; }
    if (conflicts.size) { notify(`Resolve ${conflicts.size} conflicting shift${conflicts.size === 1 ? "" : "s"} before publishing`); return; }
    setShifts((current) => current.map((shift) => (shift.weekOffset ?? 0) === currentWeekOffset ? { ...shift, status: "Published" } : shift));
    notify(`${drafts} shift${drafts === 1 ? "" : "s"} published`);
  }
  function copyPreviousWeek() {
    const source = shifts.filter((shift) => (shift.weekOffset ?? 0) === currentWeekOffset - 1);
    if (!source.length) { notify("The previous week has no shifts to copy"); return; }
    if (visibleShifts.length && !window.confirm("This week already contains shifts. Add copies from the previous week as additional drafts?")) return;
    const copies = source.map((shift) => { const sourceDate = new Date(`${canonicalShiftDate(shift)}T12:00:00`); sourceDate.setDate(sourceDate.getDate() + 7); const date = toIsoDate(sourceDate); const position = shiftPositionFromDate(date); return { ...shift, id: crypto.randomUUID(), date, day: position.day, weekOffset: position.weekOffset, status: "Draft" as const, recurrenceLabel: undefined }; });
    setShifts((current) => [...current, ...copies]);
    notify(`${copies.length} shifts copied as drafts`);
  }
  return <>
    <PageHeader eyebrow={rangeLabel} title="Shift plan" subtitle="Build, review and publish the weekly schedule." action={<div className="header-actions"><button className="secondary" onClick={copyPreviousWeek}><Copy size={17} /> Copy previous week</button><button className="primary" onClick={onNewShift}><Plus size={18} /> Add shift</button></div>} />
    <section className="schedule-toolbar"><div className="week-switch"><button onClick={() => setCurrentWeekOffset((week) => week - 1)} aria-label="Previous week"><ChevronLeft size={18} /></button><strong>{weekLabel}</strong><button onClick={() => setCurrentWeekOffset((week) => week + 1)} aria-label="Next week"><ChevronRight size={18} /></button></div><div className="schedule-summary"><span><b>{visibleShifts.length}</b> shifts · <b>{drafts}</b> drafts{conflicts.size ? <> · <b className="conflict-count">{conflicts.size}</b> conflicts</> : null}</span><button className="publish-button" onClick={publish} disabled={!drafts}><Send size={16} /> {drafts ? `Publish week (${drafts})` : "Week published"}</button></div></section>
    <section className="calendar-panel"><div className="calendar-grid">
      {weekDays.map((day, index) => <div className={`day-column ${currentWeekOffset === 0 && index === 4 ? "today" : ""}`} key={day.short} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault();const id=e.dataTransfer.getData("text/shift-id");const targetDate=dateFromShift(currentWeekOffset,index);setShifts(cur=>cur.map(x=>x.id===id?{...x,date:targetDate,day:index,weekOffset:currentWeekOffset,status:"Draft"}:x));notify("Shift moved and returned to draft");}}><div className="day-header"><span>{day.short}</span><strong>{day.date}</strong></div><div className="day-body">{visibleShifts.filter((shift) => shift.day === index).map((shift) => <ShiftCard key={shift.id} shift={shift} conflict={conflicts.has(shift.id)} onOpen={() => onEditShift(shift)} onDragStart={(e)=>e.dataTransfer.setData("text/shift-id",shift.id)} />)}<button className="add-slot" onClick={onNewShift}><Plus size={16} /> Add shift</button></div></div>)}
    </div></section>
    <div className="legend"><span><i className="manager" /> Manager</span><span><i className="bartender" /> Bartender</span><span><i className="floor" /> Floor</span><span><i className="draft" /> Draft</span></div>
  </>
}
function ShiftCard({ shift, conflict, onOpen, onDragStart }: { shift: Shift; conflict?: boolean; onOpen: () => void; onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void }) { const overnight = isOvernight(shift.start, shift.end); return <button type="button" draggable onDragStart={onDragStart} className={`shift-card shift-card-button role-${shift.role.toLowerCase()} ${shift.status === "Draft" ? "is-draft" : ""} ${conflict ? "has-conflict" : ""}`} onClick={onOpen} aria-label={`Open ${shift.isOpen ? "available" : shift.employee} shift ${shift.start} to ${shift.end}${overnight ? " next day" : ""}`}><div className="shift-card-top"><span>{shift.start}–{shift.end}{overnight ? " +1" : ""}</span><ChevronRight size={14} /></div><strong>{shift.isOpen ? "Available shift" : shift.employee}</strong><small>{shift.role}{overnight ? " · Overnight" : ""}{shift.recurrenceLabel ? ` · ${shift.recurrenceLabel}` : ""}</small>{shift.isOpen && <em>Open</em>}{shift.status === "Draft" && <em>Draft</em>}{conflict && <em className="conflict-badge">Conflict</em>}</button> }

function hoursBetween(start: string, end: string) { const [sh,sm]=start.split(":").map(Number); const [eh,em]=end.split(":").map(Number); let mins=(eh*60+em)-(sh*60+sm); if(mins<=0) mins+=1440; return mins/60; }
function workedHours(entry: TimeEntry) { return entry.clockOut ? Math.max(0, hoursBetween(entry.clockIn, entry.clockOut) - entry.breakMinutes/60) : 0; }
function Attendance({ employees, shifts, entries, setEntries, notify, onEdit }: { employees: Employee[]; shifts: Shift[]; entries: TimeEntry[]; setEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>; notify:(s:string)=>void; onEdit:(entry:TimeEntry)=>void }) {
  const [fromDate, setFromDate] = useState("2026-07-27");
  const [toDate, setToDate] = useState("2026-08-02");
  const [employeeFilter,setEmployeeFilter]=useState("All employees");
  const [statusFilter,setStatusFilter]=useState("Needs review");
  const [periodLocked,setPeriodLocked]=useState(false);
  const [exportHistory,setExportHistory]=useState<{id:string;period:string;employees:number;hours:number;created:string}[]>([]);
  const withinPeriod = (date: string) => date >= fromDate && date <= toDate;
  const baseVisible=entries.filter(e=>withinPeriod(e.date) && (employeeFilter==="All employees"||e.employee===employeeFilter));
  const visible=baseVisible.filter(e=>statusFilter==="All"||(statusFilter==="Needs review"?e.status==="Pending":e.status===statusFilter));
  const visibleShifts=shifts.filter(s=>withinPeriod(canonicalShiftDate(s)) && (employeeFilter==="All employees"||s.employee===employeeFilter));
  const scheduled=visibleShifts.filter(s=>!s.isOpen).reduce((n,s)=>n+hoursBetween(s.start,s.end),0);
  const worked=baseVisible.filter(e=>e.status==="Approved").reduce((n,e)=>n+workedHours(e),0);
  const pending=baseVisible.filter(e=>e.status==="Pending").length;
  const approved=baseVisible.filter(e=>e.status==="Approved");
  const exceptions=baseVisible.filter(e=>e.status!=="Running" && (Math.abs(workedHours(e)-e.scheduledHours)>=0.5 || e.breakMinutes===0 || e.edited));

  function approveTimesheet(id: string) { if(periodLocked){notify("Unlock this payroll period before changing approvals");return;} setEntries(cur=>cur.map(x=>x.id===id?{...x,status:"Approved"}:x)); notify("Timesheet approved and included in payroll exports"); }
  function rejectTimesheet(id:string){if(periodLocked){notify("Unlock this payroll period before editing timesheets");return;}const reason=window.prompt("Reason for rejection or correction request:");if(!reason)return;setEntries(cur=>cur.map(x=>x.id===id?{...x,status:"Rejected",note:reason}:x));notify("Timesheet rejected and excluded from export");}
  function reopenTimesheet(id:string){if(periodLocked){notify("Unlock this payroll period before reopening timesheets");return;}setEntries(cur=>cur.map(x=>x.id===id?{...x,status:"Pending"}:x));notify("Timesheet reopened for review");}
  function approveAllVisible() { if(periodLocked){notify("Unlock this payroll period before approving timesheets");return;} const ids=new Set(visible.filter(e=>e.status==="Pending").map(e=>e.id)); if(!ids.size){notify("No pending timesheets in this view");return;} setEntries(cur=>cur.map(x=>ids.has(x.id)?{...x,status:"Approved"}:x)); notify(`${ids.size} timesheet${ids.size===1?"":"s"} approved`); }
  function csvCell(value: string | number) { const text=String(value ?? ""); return /[",\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text; }
  function exportApproved() {
    if (!periodLocked) { notify("Lock the payroll period before exporting approved hours"); return; }
    const rows=employees.map(emp=>{ const records=approved.filter(entry=>entry.employee===emp.name); return {emp,records,total:records.reduce((sum,entry)=>sum+workedHours(entry),0)}; }).filter(row=>row.records.length>0);
    if(!rows.length){notify("There are no approved timesheets to export for this period");return;}
    const header=["Employee","Email","Phone","Role","Period start","Period end","Approved timesheets","Approved hours"];
    const lines=[header,...rows.map(({emp,records,total})=>[emp.name,emp.email||"",emp.phone||"",emp.role,fromDate,toDate,records.length,total.toFixed(2)])].map(row=>row.map(csvCell).join(","));
    const blob=new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=`approved-hours-${fromDate}-to-${toDate}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    const total=rows.reduce((sum,row)=>sum+row.total,0);setExportHistory(cur=>[{id:crypto.randomUUID(),period:`${fromDate}–${toDate}`,employees:rows.length,hours:total,created:new Date().toLocaleString("en-GB")},...cur]); notify(`${rows.length} employee summaries exported`);
  }
  return <>
  <PageHeader title="Time & attendance" subtitle="Resolve exceptions, approve accurate time, lock the payroll period, and export a traceable payroll file." action={<div className="header-actions"><button className={periodLocked ? "secondary locked-period" : "secondary"} onClick={()=>{setPeriodLocked(v=>!v);notify(periodLocked?"Payroll period unlocked":"Payroll period locked for export")}}>{periodLocked?<><LockKeyhole size={17}/> Period locked</>:<><UnlockKeyhole size={17}/> Lock period</>}</button><button className="secondary" onClick={approveAllVisible} disabled={periodLocked||!visible.some(e=>e.status==="Pending")}><CheckCheck size={18}/>Approve visible</button><button className="primary" onClick={exportApproved} disabled={!approved.length||!periodLocked}><FileDown size={18}/>Export approved</button></div>}/>
  <section className="attendance-workflow"><span><b>1</b> Resolve exceptions</span><span><b>2</b> Approve time</span><span><b>3</b> Lock period</span><span><b>4</b> Export payroll</span></section>
  <div className="attendance-filters"><label>From<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>To<input type="date" value={toDate} min={fromDate} onChange={e=>setToDate(e.target.value)}/></label><label>Employee<select value={employeeFilter} onChange={e=>setEmployeeFilter(e.target.value)}><option>All employees</option>{employees.map(e=><option key={e.name}>{e.name}</option>)}</select></label><label>Status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Needs review</option><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Running</option></select></label></div>
  <section className="metric-grid attendance-metrics"><Metric icon={CalendarDays} label="Scheduled" value={`${scheduled.toFixed(1)}h`} detail="Assigned shifts in period" trend={`${fromDate}–${toDate}`}/><Metric icon={Clock3} label="Approved worked" value={`${worked.toFixed(1)}h`} detail="Included in export" trend="Payroll ready"/><Metric icon={FileCheck2} label="Awaiting approval" value={String(pending)} detail="Excluded from export" trend={pending?"Action needed":"Clear"}/><Metric icon={ShieldAlert} label="Exceptions" value={String(exceptions.length)} detail="Variance, no break, or edited" trend={exceptions.length?"Review":"Clear"} warning={!!exceptions.length}/></section>
  <section className="panel table-panel"><PanelTitle title="Timesheets" subtitle="Approval is reversible. Corrections return a record to pending and remain visibly marked."/><div className="data-table attendance-table"><div className="table-row table-head"><span>Employee</span><span>Date</span><span>Clocked</span><span>Break</span><span>Variance</span><span>Status & actions</span></div>{visible.map(e=>{const actual=e.clockOut?workedHours(e):0;const variance=actual-e.scheduledHours;const exception=e.status!=="Running"&&(Math.abs(variance)>=.5||e.breakMinutes===0||e.edited);return <div className={`table-row ${exception?"exception-row":""}`} key={e.id}><span><b>{e.employee}</b>{e.edited&&<small>Manager corrected</small>}</span><span>{e.date}</span><span>{e.clockIn}–{e.clockOut||"Now"}<small>{e.clockOut?actual.toFixed(2)+"h":"Running"}</small></span><span>{e.breakMinutes} min</span><span className={Math.abs(variance)>=.5?"variance-alert":""}>{e.clockOut?`${variance>=0?"+":""}${variance.toFixed(2)}h`:"—"}</span><span className="timesheet-actions"><i className={`status status-${e.status.toLowerCase()}`}>{e.status}</i>{e.status==="Pending"&&<><button title="Edit" onClick={()=>onEdit(e)}><Pencil size={14}/></button><button title="Reject" onClick={()=>rejectTimesheet(e.id)}><Ban size={14}/></button><button className="approve-mini" onClick={()=>approveTimesheet(e.id)}>Approve</button></>}{e.status==="Approved"&&<button title="Reopen" onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={14}/></button>}{e.status==="Rejected"&&<button title="Return to review" onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={14}/></button>}</span></div>})}{!visible.length&&<div className="attendance-empty">No timesheets match these filters.</div>}</div></section>
  <section className="hours-by-employee"><PanelTitle title="Payroll export preview" subtitle="One row per employee; only approved hours in the selected period are counted."/><div className="team-grid">{employees.map(emp=>{const scheduledEmp=visibleShifts.filter(s=>s.employee===emp.name).reduce((n,s)=>n+hoursBetween(s.start,s.end),0);const approvedEntries=approved.filter(e=>e.employee===emp.name);const workedEmp=approvedEntries.reduce((n,e)=>n+workedHours(e),0);return <article className="team-card" key={emp.name}><div className="avatar large">{emp.initials}</div><h2>{emp.name}</h2><p>{emp.role}</p><div className="hours-compare"><span>Scheduled<b>{scheduledEmp.toFixed(1)}h</b></span><span>Approved export<b>{workedEmp.toFixed(2)}h</b></span></div><small className="export-count">{approvedEntries.length} approved timesheet{approvedEntries.length===1?"":"s"}</small></article>})}</div></section>
  <section className="panel export-history"><PanelTitle title="Export history" subtitle="Development-mode audit trail for payroll files generated in this session." action={<History size={18}/>}/>{exportHistory.length?<div>{exportHistory.map(x=><article key={x.id}><DownloadCloud size={17}/><span><b>{x.period}</b><small>{x.created}</small></span><span>{x.employees} employees</span><strong>{x.hours.toFixed(2)}h</strong></article>)}</div>:<p>No payroll exports generated in this session.</p>}</section></>;
}

function Inventory({ products, setProducts, onNewProduct, notify }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; onNewProduct: () => void; notify: (s: string) => void }) {
  const [query, setQuery] = useState(""); const [onlyLow, setOnlyLow] = useState(false);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) && (!onlyLow || p.stock < p.par));
  const value = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  return <>
    <PageHeader title="Inventory" subtitle="Track stock, par levels and purchasing needs." action={<div className="header-actions"><button className="secondary" onClick={() => notify("Stock count started — edit quantities in the table")}><ClipboardList size={17} /> Stock count</button><button className="primary" onClick={onNewProduct}><Plus size={18} /> Add product</button></div>} />
    <section className="inventory-stats"><div><span>Total stock value</span><strong>{money(value)}</strong></div><div><span>Products</span><strong>{products.length}</strong></div><div><span>Below par</span><strong>{products.filter((p) => p.stock < p.par).length}</strong></div><div><span>Suppliers</span><strong>4</strong></div></section>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory" /></div><button className={`filter-button ${onlyLow ? "selected" : ""}`} onClick={() => setOnlyLow(!onlyLow)}><AlertTriangle size={16} /> Below par</button></div>
      <div className="data-table"><div className="table-row table-head"><span>Product</span><span>Supplier</span><span>In stock</span><span>Par</span><span>Order</span><span>Value</span></div>{filtered.map((product) => { const suggested = Math.max(0, product.par - product.stock); return <div className="table-row" key={product.id}><span className="product-cell"><i><Coffee size={17} /></i><b>{product.name}<small>{product.category}</small></b></span><span>{product.supplier}</span><span><div className="stock-edit"><button onClick={() => setProducts((current) => current.map((p) => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p))}>−</button><b className={product.stock < product.par ? "low" : ""}>{product.stock}</b><button onClick={() => setProducts((current) => current.map((p) => p.id === product.id ? { ...p, stock: p.stock + 1 } : p))}>+</button></div><small>{product.unit}</small></span><span>{product.par} <small>{product.unit}</small></span><span>{suggested > 0 ? <strong className="order-suggestion">+{suggested}</strong> : <span className="ok"><Check size={14} /> OK</span>}</span><span>{money(product.stock * product.price)}</span></div>})}</div>
    </section>
  </>
}

function Orders({ onNewOrder, notify }: { onNewOrder: () => void; notify: (s: string) => void }) {
  return <><PageHeader title="Purchase orders" subtitle="Create, submit and track supplier orders." action={<button className="primary" onClick={onNewOrder}><Plus size={18} /> New order</button>} />
    <section className="order-highlight"><div><span className="attention-icon blue"><Truck size={20} /></span><div><p>Next delivery</p><strong>Nordic Drinks · Tomorrow, 08:00–11:00</strong></div></div><button className="secondary" onClick={() => notify("Delivery details opened")}>View delivery</button></section>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search orders" /></div><button className="filter-button">All statuses <ChevronDown size={15} /></button></div><div className="data-table orders-table"><div className="table-row table-head"><span>Order</span><span>Supplier</span><span>Items</span><span>Delivery</span><span>Amount</span><span>Status</span></div>{orders.map((order) => <button className="table-row order-row" key={order.id} onClick={() => notify(`${order.id} selected`)}><span><b>{order.id}</b></span><span>{order.supplier}</span><span>{order.items}</span><span>{order.delivery}</span><span><b>{money(order.amount)}</b></span><span><i className={`status status-${order.status.toLowerCase()}`}>{order.status}</i><ChevronRight size={16} /></span></button>)}</div></section>
  </>
}

function Team({ employees, onAdd, onEdit }: { employees: Employee[]; onAdd: () => void; onEdit: (employee: Employee) => void }) { return <><PageHeader title="Team" subtitle="Add employees and maintain roles, contact details and active status." action={<button className="primary" onClick={onAdd}><UserRoundPlus size={18} /> Add employee</button>} />
  <section className="team-grid">{employees.map((person) => <article className={`team-card ${!person.active ? "employee-inactive" : ""}`} key={person.name}><div className="team-card-head"><div className="avatar large">{person.initials}</div><span className={`status ${person.active ? "status-submitted" : "status-draft"}`}>{person.active ? "Active" : "Inactive"}</span></div><h2>{person.name}</h2><p>{person.role}</p><div className="team-stats"><span>Scheduled <b>{person.hours}h</b></span><span>{person.email || person.status}</span></div><button className="secondary full" onClick={() => onEdit(person)}>Edit employee</button></article>)}</section></> }

function ControlCenter({devMode,databaseStatus,notify}:{devMode:boolean;databaseStatus:string;notify:(s:string)=>void}) {
 const groups=[
  {title:"Database & payroll",icon:Database,items:["All manager modules use tenant-scoped PostgreSQL APIs","Permanent payroll export ledger with SHA-256 hashes","Open, locked, exported and closed payroll periods","Payroll IDs, salary codes and cost centres"]},
  {title:"Attendance controls",icon:KeyRound,items:["Kiosk PIN verification and lockout","Venue geofence radius validation","Late, missed clock-out and geofence alerts","Employee timesheet correction requests"]},
  {title:"Scheduling",icon:CalendarDays,items:["Drag shifts between dates","Occurrence, future and whole-series editing","Reusable schedule templates","Availability, leave and overlap conflict checks","Labour revenue forecasts","Publish notifications and acknowledgements"]},
  {title:"Stock operations",icon:ReceiptText,items:["Delivery receiving and partial/disputed receipts","Invoice number, total and discrepancy matching","Waste logs with stock ledger entries","Draft, in-transit and received location transfers"]},
  {title:"Security & compliance",icon:ShieldCheck,items:["MFA factor foundation and recovery records","Password-reset tokens and rate limiting","Managed backup/restore runbook and health events","GDPR export, deletion and rectification requests"]}
 ];
 return <><PageHeader title="Control centre" subtitle="Production controls, compliance and operational workflows introduced in v0.6.0." action={<span className={`connection-pill ${devMode?"dev":"live"}`}>{databaseStatus}</span>}/><div className="control-grid">{groups.map(g=>{const Icon=g.icon;return <section className="panel control-card" key={g.title}><div className="control-icon"><Icon size={20}/></div><h2>{g.title}</h2>{g.items.map(i=><p key={i}><Check size={15}/>{i}</p>)}</section>})}</div><section className="panel control-actions"><PanelTitle title="Operational actions" subtitle="These actions use persistent APIs when PostgreSQL is connected."/><div className="quick-grid"><button className="quick-action" onClick={()=>notify("Create and lock a payroll period in Time & attendance")}><LockKeyhole/><div><strong>Payroll periods</strong><small>Lock, export and close</small></div></button><button className="quick-action" onClick={()=>notify("Kiosk endpoint ready at /api/kiosk")}><KeyRound/><div><strong>Kiosk mode</strong><small>PIN and geofence verified</small></div></button><button className="quick-action" onClick={()=>notify("Receiving, waste and transfers use /api/operations")}><ArrowLeftRight/><div><strong>Stock operations</strong><small>Receive, waste, transfer</small></div></button><button className="quick-action" onClick={()=>notify("Security controls use /api/security")}><ShieldCheck/><div><strong>Security</strong><small>MFA, reset, GDPR, sessions</small></div></button></div></section></>
}

function ShiftDialog({ onClose, onSave, currentWeekOffset, employees }: { onClose: () => void; onSave: (shifts: Shift[]) => void; currentWeekOffset: number; employees: Employee[] }) {
  const [assignment, setAssignment] = useState<"employee" | "open">("employee");
  const activeEmployees = employees.filter((person) => person.active);
  const [employee, setEmployee] = useState(activeEmployees[0]?.name ?? ""); const [shiftDate, setShiftDate] = useState(dateFromShift(currentWeekOffset, 4)); const [role, setRole] = useState<ShiftRole>("Bartender"); const [start, setStart] = useState("17:00"); const [end, setEnd] = useState("01:00");
  const [repeat, setRepeat] = useState(false); const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly"); const [count, setCount] = useState(4); const [weekdays, setWeekdays] = useState<number[]>([4]);
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function save() {
    const safeCount = Math.max(1, Math.min(count || 1, frequency === "daily" ? 31 : 52));
    let occurrences: { day: number; weekOffset: number }[];
    const startPosition = shiftPositionFromDate(shiftDate);
    if (!repeat) occurrences = [startPosition];
    else if (frequency === "daily") occurrences = Array.from({ length: safeCount }, (_, index) => { const date = new Date(`${shiftDate}T12:00:00`); date.setDate(date.getDate() + index); return shiftPositionFromDate(toIsoDate(date)); });
    else {
      const selected = weekdays.length ? weekdays : [startPosition.day];
      const weekStart = new Date(`${shiftDate}T12:00:00`); weekStart.setDate(weekStart.getDate() - startPosition.day);
      occurrences = Array.from({ length: safeCount }, (_, week) => selected.map((selectedDay) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + week * 7 + selectedDay); return shiftPositionFromDate(toIsoDate(date)); })).flat().filter((occurrence) => occurrence.weekOffset > startPosition.weekOffset || occurrence.day >= startPosition.day);
    }
    const uniqueOccurrences = Array.from(new Map(occurrences.map((occurrence) => [`${occurrence.weekOffset}-${occurrence.day}`, occurrence])).values());
    const label = repeat ? (frequency === "daily" ? `Daily · ${uniqueOccurrences.length} times` : `Weekly · ${(weekdays.length ? weekdays : [shiftPositionFromDate(shiftDate).day]).map((d) => weekdayNames[d]).join(", ")}`) : undefined;
    const name = assignment === "open" ? "Available shift" : employee;
    const recurrenceGroupId = repeat ? crypto.randomUUID() : undefined;
    const initials = assignment === "open" ? "+" : employee.split(" ").map((word) => word[0]).join("");
    onSave(uniqueOccurrences.map((occurrence, index) => ({ id: crypto.randomUUID(), date: dateFromShift(occurrence.weekOffset, occurrence.day), day: occurrence.day, weekOffset: occurrence.weekOffset, employee: name, initials, start, end, role, status: "Draft", isOpen: assignment === "open", recurrenceLabel: label, recurrenceGroupId })));
  }
  return <Modal title="Add shift" subtitle="Create one shift or a repeating series." onClose={onClose}>
    <div className="assignment-toggle"><button className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
    <div className="form-grid">
      {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{activeEmployees.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>}
      {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>A manager approves the employee who receives it.</span></div></div>}
      <label>Shift date<input type="date" value={shiftDate} onChange={(e) => { setShiftDate(e.target.value); setWeekdays([shiftPositionFromDate(e.target.value).day]); }} /></label>
      <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
      <label>Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
    </div>
    <label className="repeat-switch"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)}/><span><strong>Repeat shift</strong><small>Create a daily or weekly series</small></span></label>
    {repeat && <div className="repeat-panel"><div className="frequency-toggle"><button className={frequency === "daily" ? "selected" : ""} onClick={() => setFrequency("daily")}>Daily</button><button className={frequency === "weekly" ? "selected" : ""} onClick={() => setFrequency("weekly")}>Weekly</button></div>
      {frequency === "weekly" && <div className="weekday-picker">{weekdayNames.map((name, index) => <button key={name} className={weekdays.includes(index) ? "selected" : ""} onClick={() => setWeekdays((current) => current.includes(index) ? current.filter((d) => d !== index) : [...current, index].sort())}>{name}</button>)}</div>}
      <label className="repeat-count">Repeat for <input type="number" min="1" max={frequency === "daily" ? 31 : 52} value={count} onChange={(e) => setCount(Number(e.target.value))}/><span>{frequency === "daily" ? "days" : "weeks"}</span></label>
    </div>}
    <ModalActions onClose={onClose} onSave={save} label={repeat ? "Add repeating shifts" : "Add shift"} />
  </Modal>
}
function EditShiftDialog({ shift, employees, onClose, onSave, onDelete }: { shift: Shift; employees: Employee[]; onClose: () => void; onSave: (shift: Shift, scope: "occurrence" | "future" | "series") => void; onDelete: () => void }) {
  const [assignment, setAssignment] = useState<"employee" | "open">(shift.isOpen ? "open" : "employee");
  const activeEmployees = employees.filter((person) => person.active);
  const [employee, setEmployee] = useState(shift.isOpen ? activeEmployees[0]?.name ?? "" : shift.employee);
  const [shiftDate, setShiftDate] = useState(canonicalShiftDate(shift));
  const [role, setRole] = useState<ShiftRole>(shift.role);
  const [start, setStart] = useState(shift.start);
  const [end, setEnd] = useState(shift.end);
  const [status, setStatus] = useState<"Draft" | "Published">(shift.status);
  const [scope, setScope] = useState<"occurrence" | "future" | "series">("occurrence");
  function save() {
    const selectedEmployee = assignment === "open" ? "Available shift" : employee;
    const position = shiftPositionFromDate(shiftDate);
    onSave({ ...shift, date: shiftDate, day: position.day, weekOffset: position.weekOffset, employee: selectedEmployee, initials: assignment === "open" ? "+" : employee.split(" ").map((word) => word[0]).join(""), role, start, end, status, isOpen: assignment === "open" }, scope);
  }
  return <Modal title="Edit shift" subtitle="Update this shift occurrence, its assignment or availability." onClose={onClose}>
    <div className="assignment-toggle"><button type="button" className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
    <div className="form-grid">
      {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{activeEmployees.map((person) => <option key={person.name}>{person.name}</option>)}</select></label>}
      {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>The current employee is removed. A manager approves the employee who receives it.</span></div></div>}
      <label>Shift date<input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} /></label>
      <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
      <label>Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
      <label className="full-field">Schedule status<select value={status} onChange={(e) => setStatus(e.target.value as "Draft" | "Published")}><option>Draft</option><option>Published</option></select></label>
    </div>
    {shift.recurrenceGroupId && <div className="series-edit-note"><CalendarDays size={17}/><div><strong>Apply changes to</strong><span>Choose whether this edit affects one occurrence or the wider repeating series.</span><select value={scope} onChange={(e)=>setScope(e.target.value as "occurrence"|"future"|"series")}><option value="occurrence">This shift only</option><option value="future">This and future shifts</option><option value="series">Entire series</option></select></div></div>}
    <div className="edit-shift-actions"><button type="button" className="danger-button" onClick={onDelete}>Delete shift</button><div><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={save}>Save changes</button></div></div>
  </Modal>
}

function TimesheetDialog({ entry, onClose, onSave }: { entry: TimeEntry; onClose:()=>void; onSave:(entry:TimeEntry)=>void }) {
  const [clockIn,setClockIn]=useState(entry.clockIn); const [clockOut,setClockOut]=useState(entry.clockOut||""); const [breakMinutes,setBreakMinutes]=useState(entry.breakMinutes); const [note,setNote]=useState(entry.note||"");
  return <Modal title="Correct timesheet" subtitle="All manager corrections return the record to pending review. Add a reason for the audit trail." onClose={onClose}><div className="form-grid"><label>Clock in<input type="time" value={clockIn} onChange={e=>setClockIn(e.target.value)}/></label><label>Clock out<input type="time" value={clockOut} onChange={e=>setClockOut(e.target.value)}/></label><label>Break minutes<input type="number" min="0" step="5" value={breakMinutes} onChange={e=>setBreakMinutes(Number(e.target.value))}/></label><label className="full-field">Correction reason<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Required, e.g. employee forgot to clock out"/></label></div><ModalActions onClose={onClose} onSave={()=>{if(!note.trim()){alert("Add a correction reason");return;}onSave({...entry,clockIn,clockOut:clockOut||undefined,breakMinutes,status:"Pending",note:note.trim(),edited:true})}} label="Save correction"/></Modal>
}

function EmployeeDialog({ employee, onClose, onSave }: { employee?: Employee; onClose: () => void; onSave: (employee: Employee) => void }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "Bartender");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [active, setActive] = useState(employee?.active ?? true); const [payrollId,setPayrollId]=useState(employee?.payrollId??""); const [salaryCode,setSalaryCode]=useState(employee?.salaryCode??""); const [costCentre,setCostCentre]=useState(employee?.costCentre??"");
  function save() { const cleanName = name.trim() || "New employee"; onSave({ name: cleanName, initials: cleanName.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase(), role, email, phone, active, hours: employee?.hours ?? 0, status: active ? "No shifts scheduled" : "Inactive", payrollId, salaryCode, costCentre }); }
  return <Modal title={employee ? "Edit employee" : "Add employee"} subtitle="Maintain the employee profile used throughout scheduling." onClose={onClose}><div className="form-grid"><label className="full-field">Full name<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" /></label><label>Role<select value={role} onChange={(e) => setRole(e.target.value)}><option>General manager</option><option>Bar manager</option><option>Shift manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label><label>Status<select value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label><label>Phone<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+45 ..." /></label><label>Payroll ID<input value={payrollId} onChange={e=>setPayrollId(e.target.value)} /></label><label>Salary code<input value={salaryCode} onChange={e=>setSalaryCode(e.target.value)} /></label><label className="full-field">Cost centre<input value={costCentre} onChange={e=>setCostCentre(e.target.value)} /></label></div><ModalActions onClose={onClose} onSave={save} label={employee ? "Save employee" : "Add employee"} /></Modal>
}

function ProductDialog({ onClose, onSave }: { onClose: () => void; onSave: (product: Product) => void }) { const [name, setName] = useState(""); const [supplier, setSupplier] = useState("Nordic Drinks"); return <Modal title="Add product" subtitle="Create a new inventory item." onClose={onClose}><div className="form-grid"><label className="full-field">Product name<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lager 30L" /></label><label>Supplier<select value={supplier} onChange={(e) => setSupplier(e.target.value)}><option>Nordic Drinks</option><option>Vin & Co.</option><option>Bar Supply DK</option><option>City Produce</option></select></label><label>Category<select><option>Draught beer</option><option>Wine</option><option>Spirits</option><option>Soft drinks</option></select></label><label>Current stock<input type="number" defaultValue="0" /></label><label>Par level<input type="number" defaultValue="6" /></label></div><ModalActions onClose={onClose} onSave={() => onSave({ id: crypto.randomUUID(), name: name || "New product", category: "Draught beer", supplier, stock: 0, par: 6, unit: "units", price: 0 })} label="Add product" /></Modal> }
function OrderDialog({ onClose, onSave }: { onClose: () => void; onSave: () => void }) { return <Modal title="Create purchase order" subtitle="Choose a supplier to begin an order." onClose={onClose}><div className="supplier-options">{["Nordic Drinks", "Vin & Co.", "Bar Supply DK", "City Produce"].map((supplier, i) => <label key={supplier}><input type="radio" name="supplier" defaultChecked={i === 0} /><span className="attention-icon blue"><Truck size={18} /></span><b>{supplier}</b><ChevronRight size={17} /></label>)}</div><ModalActions onClose={onClose} onSave={onSave} label="Continue" /></Modal> }
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => { body.style.overflow = previous.overflow; body.style.position = previous.position; body.style.top = previous.top; body.style.width = previous.width; window.scrollTo(0, scrollY); };
  }, []);

  return <div className="modal-layer" role="presentation"><button className="modal-scrim" onClick={onClose} aria-label="Close dialog" /><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div>
}
function ModalActions({ onClose, onSave, label }: { onClose: () => void; onSave: () => void; label: string }) { return <div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" onClick={onSave}>{label}</button></div> }
function money(value: number) { return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(value); }
