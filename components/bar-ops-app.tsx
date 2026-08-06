"use client";
import { Dialog, DialogActions } from "./ui/interaction-ui";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Coffee, LayoutDashboard, Menu, Package, Plus,
  Search, Settings, ShoppingCart, Sparkles, Users, X, AlertTriangle, Truck, MoreHorizontal,
  Copy, Send, Boxes, Wine, UserRoundPlus, Timer, Play, Square, Activity, FileCheck2, FileDown, CheckCheck, RotateCcw, Ban, Pencil, ShieldAlert, History, DownloadCloud, LockKeyhole, UnlockKeyhole, Database, KeyRound, MapPin, FileArchive, ShieldCheck, ReceiptText, Trash2, ArrowLeftRight, TrendingUp, NotebookPen, Wrench, Save, Upload, Undo2, CheckCircle2, LogOut, Moon, Sun
} from "lucide-react";
import { days, initialProducts, initialShifts, orders, team, type NavKey, type Product, type Shift, type ShiftRole } from "@/lib/data";
import type { ClockSettings, Employee, Location, LogEntry, OpsTask, ScheduleAcknowledgementSummary, ShiftNote, StockAdjustment, TimeEntry } from "@/features/workspace/types";
import { BASE_MONDAY, canonicalShiftDate, conflictIds, dateFromSerial, dateFromShift, dateSerial, hoursBetween, isOvernight, mapDatabaseShift, shiftPositionFromDate, toIsoDate, type DatabaseShiftRecord } from "@/features/workspace/schedule-utils";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import { RequestsWorkspace } from "@/components/requests-workspace";
import shellStyles from "@/components/shell/ManagerShell.module.css";
import dashboardStyles from "@/features/dashboard/Dashboard.module.css";
import scheduleStyles from "@/features/scheduling/ScheduleWorkspace.module.css";
import teamStyles from "@/features/employees/TeamWorkspace.module.css";
import attendanceStyles from "@/features/attendance/AttendanceWorkspace.module.css";
import executionStyles from "@/features/execution/ShiftExecution.module.css";
import inventoryStyles from "@/features/inventory/InventoryWorkspace.module.css";
import orderStyles from "@/features/orders/OrdersWorkspace.module.css";
import operationsStyles from "@/features/operations/DailyOperations.module.css";
import settingsStyles from "@/features/settings/SettingsWorkspace.module.css";

const navItems: { id: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Today’s operations", icon: LayoutDashboard },
  { id: "execution", label: "Shift execution", icon: Activity },
  { id: "schedule", label: "Shift plan", icon: CalendarDays },
  { id: "attendance", label: "Time & attendance", icon: Timer },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "operations", label: "Daily operations", icon: NotebookPen },
  { id: "team", label: "Team", icon: Users },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "control", label: "Control centre", icon: Settings },
];

export function BarOpsApp({ userName, userRole, devMode }: { userName: string; userRole: string; devMode: boolean }) {
  const [active, setActive] = useState<NavKey>("dashboard");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("workspace") === "requests") setActive("requests"); }, []);
  const [locations, setLocations] = useState<Location[]>(devMode ? [{ id: "dev-temple", name: "Temple Bar" }] : []);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(devMode ? "dev-temple" : "");
  const [mobileNav, setMobileNav] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = window.localStorage.getItem("bar-ops-theme");
    const next = saved === "dark" || saved === "light" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("bar-ops-theme", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#000000" : "#fff4c4");
  }
  const [shifts, setShifts] = useState(initialShifts);
  const [products, setProducts] = useState(initialProducts);
  const [employees, setEmployees] = useState<Employee[]>(team.map((person) => ({ ...person, active: true })));
  const [dialog, setDialog] = useState<"shift" | "product" | "order" | "employee" | "stockCount" | null>(null);
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [opsTasks, setOpsTasks] = useState<OpsTask[]>([
    { id:"op1", title:"Check tills and floats", type:"Opening", owner:"Shift manager", due:"15:30", done:true },
    { id:"op2", title:"Restock ice and garnishes", type:"Opening", owner:"Bartender", due:"16:00", done:false },
    { id:"op3", title:"Clean beer lines", type:"Maintenance", owner:"Alex Morgan", due:"Friday", done:false },
    { id:"op4", title:"Lock doors and set alarm", type:"Closing", owner:"Shift manager", due:"03:15", done:false }
  ]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([{id:"log1",title:"Weekend handover",body:"House IPA is running low. Delivery expected tomorrow morning.",author:"Maya Chen",createdAt:"Today · 09:14"}]);
  const [dataReady, setDataReady] = useState(false);
  const hasBootstrappedRef = useRef(false);
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
  const [shiftNotes, setShiftNotes] = useState<ShiftNote[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState(devMode ? "Development data · saved locally" : "Connecting…");
  useEffect(() => {
    if (!devMode) return;
    try {
      const raw = localStorage.getItem("barops-dev-v0101") || localStorage.getItem("barops-dev-v091") || localStorage.getItem("barops-dev-v070");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.products) setProducts(saved.products);
        if (saved.shifts) setShifts(saved.shifts);
        if (saved.employees) setEmployees(saved.employees);
        if (saved.timeEntries) setTimeEntries(saved.timeEntries);
        if (saved.stockAdjustments) setStockAdjustments(saved.stockAdjustments);
        if (saved.opsTasks) setOpsTasks(saved.opsTasks);
        if (saved.logEntries) setLogEntries(saved.logEntries);
      }
    } catch { localStorage.removeItem("barops-dev-v0101"); localStorage.removeItem("barops-dev-v091"); localStorage.removeItem("barops-dev-v070"); }
    setDataReady(true);
  }, [devMode]);
  useEffect(() => {
    if (!devMode || !dataReady) return;
    localStorage.setItem("barops-dev-v0101", JSON.stringify({version:2,products,shifts,employees,timeEntries,stockAdjustments,opsTasks,logEntries}));
  }, [devMode,dataReady,products,shifts,employees,timeEntries,stockAdjustments,opsTasks,logEntries]);
  useEffect(() => {
    if (devMode) return;
    const controller = new AbortController();
    const requestedLocation = selectedLocationId ? `?locationId=${encodeURIComponent(selectedLocationId)}` : "";
    if (!hasBootstrappedRef.current) setDataReady(false);
    fetch(`/api/manager/bootstrap${requestedLocation}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Could not load workspace");
      const data = await response.json();
      const availableLocations: Location[] = data.locations || [];
      setLocations(availableLocations);
      const resolvedLocationId = data.selectedLocationId || availableLocations[0]?.id || "";
      if (resolvedLocationId && resolvedLocationId !== selectedLocationId) setSelectedLocationId(resolvedLocationId);
      setEmployees((data.employees || []).map((e: any) => ({ id:e.id, name:`${e.first_name} ${e.last_name}`, initials:`${e.first_name?.[0]||""}${e.last_name?.[0]||""}`, role:e.employment_title||"Employee", hours:Number(e.contracted_hours||0), status:e.active?"Active":"Inactive", active:e.active, email:e.email||"", phone:e.phone||"", payrollId:e.payroll_id||"", salaryCode:e.salary_code||"", costCentre:e.cost_centre||"", hourlyRate:Number(e.hourly_rate||0), locationId:(e.locations||[]).find((location:any)=>location.primary)?.id||(e.locations||[])[0]?.id||"", locations:e.locations||[], portalStatus:e.portal_status||"NONE" })));
      setShifts((data.shifts || []).map((shift: DatabaseShiftRecord) => mapDatabaseShift(shift)));
      setProducts((data.products || []).map((x:any)=>({id:x.id,name:x.name,category:x.category,supplier:x.supplier||"Unassigned",stock:Number(x.quantity||0),par:Number(x.par_level||0),unit:x.unit,price:Number(x.purchase_price||0)})));
      setTimeEntries((data.timesheets || []).map((x:any)=>({id:x.id,employee:x.employee_name,date:String(x.work_date).slice(0,10),clockIn:String(x.clocked_in_at).slice(11,16),clockOut:x.clocked_out_at?String(x.clocked_out_at).slice(11,16):undefined,breakMinutes:x.break_minutes,status:(x.status==="OPEN"?"Running":x.status[0]+x.status.slice(1).toLowerCase()) as TimeEntry["status"],scheduledHours:Number(x.scheduled_minutes||0)/60,note:x.manager_note,onBreak:Boolean(x.on_break),breakStartedAt:x.open_break_started_at?String(x.open_break_started_at):null})));
      setShiftNotes((data.shiftNotes || []).map((n:any)=>({id:n.id,shiftId:n.shift_id,note:n.note,category:n.category,createdAt:String(n.created_at),author:n.author_name,role:n.role,startsAt:String(n.starts_at)})));
      setDatabaseStatus(resolvedLocationId ? "PostgreSQL connected" : "No active location configured");
      hasBootstrappedRef.current = true;
      setDataReady(true);
      fetch("/api/employee-invitations",{cache:"no-store"}).then(r=>r.ok?r.json():[]).then((rows:any[])=>setEmployees(current=>current.map(item=>({...item,portalStatus:(rows.find(row=>row.employee_id===item.id)?.portal_status||item.portalStatus||"NONE")})))).catch(()=>{});
    }).catch((error) => { if (error?.name !== "AbortError") { setDatabaseStatus("Database connection error"); hasBootstrappedRef.current = true; setDataReady(true); } });
    return () => controller.abort();
  }, [devMode, selectedLocationId]);
  async function persist(path:string, options:RequestInit){ if(devMode) return null; const response=await fetch(path,{...options,headers:{"content-type":"application/json",...(options.headers||{})}}); if(!response.ok) throw new Error((await response.json().catch(()=>({}))).error||"Save failed"); return response.json(); }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function openShiftDialog(date?: string) {
    setSelectedShiftDate(date || null);
    setDialog("shift");
  }

  if (!dataReady) {
    return <div className="workspace-loading" role="status" aria-live="polite"><div className="workspace-loading-card"><Database size={26}/><strong>Loading workspace</strong><span>Synchronizing shifts, employees and operations with PostgreSQL…</span></div></div>;
  }

  return (
    <div className="app-frame">
      <Sidebar active={active} onChange={(value) => { setActive(value); setMobileNav(false); }} open={mobileNav} onClose={() => setMobileNav(false)} userName={userName} userRole={userRole} devMode={devMode} />
      <main className="main-shell">
        <Topbar active={active} onMenu={() => setMobileNav(true)} locations={locations} selectedLocationId={selectedLocationId} onLocationChange={setSelectedLocationId} onNavigate={setActive} theme={theme} onToggleTheme={toggleTheme} />
        <div className="page-wrap" data-workspace={active}>
          <div className="workspace-flow">
          {active === "dashboard" && <Dashboard shifts={shifts} products={products} employees={employees} timeEntries={timeEntries} tasks={opsTasks} shiftNotes={shiftNotes} devMode={devMode} onNavigate={setActive} />}
          {active === "execution" && <ShiftExecution shifts={shifts} entries={timeEntries} notes={shiftNotes} onNavigate={setActive} />}
          {active === "schedule" && <Schedule shifts={shifts} setShifts={setShifts} employees={employees} onNewShift={openShiftDialog} onEditShift={setEditingShift} notify={notify} currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
          {active === "attendance" && <Attendance employees={employees} shifts={shifts} entries={timeEntries} setEntries={setTimeEntries} notify={notify} onEdit={setEditingTimeEntry} devMode={devMode} persist={persist} />}
          {active === "inventory" && <Inventory products={products} setProducts={setProducts} onNewProduct={() => setDialog("product")} onEditProduct={setEditingProduct} onStockCount={() => setDialog("stockCount")} adjustments={stockAdjustments} setAdjustments={setStockAdjustments} notify={notify} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
          {active === "orders" && <Orders products={products} setProducts={setProducts} onNewOrder={() => setDialog("order")} notify={notify} />}
          {active === "operations" && <DailyOperations tasks={opsTasks} setTasks={setOpsTasks} logs={logEntries} setLogs={setLogEntries} notify={notify} devMode={devMode} locationId={selectedLocationId} />}
          {active === "team" && (
            <Team
              employees={employees}
              shifts={shifts}
              devMode={devMode}
              onAdd={() => setDialog("employee")}
              onEdit={setEditingEmployee}
              onInvite={async (employee) => {
                if (!employee.id) { notify("Save and reload the employee before inviting"); return; }
                try {
                  const response = await fetch("/api/employee-invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ employeeId: employee.id, action: employee.portalStatus === "INVITED" ? "resend" : "invite" }) });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "Could not create invitation");
                  setEmployees(current => current.map(item => item.id === employee.id ? { ...item, portalStatus: "INVITED" } : item));
                  let shared = false;
                  if (navigator.share) {
                    try { await navigator.share({ title: "Bar Ops employee invitation", text: `Activate your Bar Ops employee account: ${data.activationUrl}`, url: data.activationUrl }); shared = true; }
                    catch (error) { if (error instanceof DOMException && error.name !== "AbortError") throw error; }
                  }
                  if (!shared) {
                    try { await navigator.clipboard.writeText(data.activationUrl); notify("Activation link copied"); }
                    catch { window.prompt("Copy this activation link", data.activationUrl); notify("Invitation created — copy the displayed link"); }
                  } else notify("Invitation shared");
                } catch (error) { notify(error instanceof Error ? error.message : "Could not invite employee"); }
              }}
              onRevoke={async (employee) => {
                if (!employee.id || !confirm(`Revoke the pending invitation for ${employee.name}?`)) return;
                try {
                  const response = await fetch("/api/employee-invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ employeeId: employee.id, action: "revoke" }) });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "Could not revoke invitation");
                  setEmployees(current => current.map(item => item.id === employee.id ? { ...item, portalStatus: "NONE" } : item));
                  notify("Invitation revoked");
                } catch (error) { notify(error instanceof Error ? error.message : "Could not revoke invitation"); }
              }}
            />
          )}
          {active === "requests" && <RequestsWorkspace devMode={devMode} notify={notify} />}
          {active === "control" && <ControlCenter devMode={devMode} databaseStatus={databaseStatus} notify={notify} />}
          {active === "settings" && <SettingsWorkspace locations={locations} selectedLocationId={selectedLocationId} userRole={userRole} devMode={devMode} notify={notify} />}
          </div>
        </div>
      </main>
      {editingShift && <EditShiftDialog shift={editingShift} employees={employees} onClose={() => setEditingShift(null)} onSave={async (updated, scope) => {
        try {
          if (devMode) {
            setShifts((current) => current.map((item) => { if (scope === "occurrence") return item.id === updated.id ? updated : item; if (!updated.recurrenceGroupId || item.recurrenceGroupId !== updated.recurrenceGroupId) return item; if (scope === "future" && dateSerial(canonicalShiftDate(item)) < dateSerial(canonicalShiftDate(editingShift))) return item; const dayDelta = dateSerial(canonicalShiftDate(updated)) - dateSerial(canonicalShiftDate(editingShift)); const shiftedDate = dateFromSerial(dateSerial(canonicalShiftDate(item)) + dayDelta); const pos = shiftPositionFromDate(shiftedDate); return { ...item, employee: updated.employee, initials: updated.initials, role: updated.role, start: updated.start, end: updated.end, status: updated.status, isOpen: updated.isOpen, date: shiftedDate, day: pos.day, weekOffset: pos.weekOffset }; }));
          } else {
            const assigned=employees.find(e=>e.name===updated.employee);
            const rows = await persist("/api/shifts",{method:"PATCH",body:JSON.stringify({id:updated.id,scope,employeeId:assigned?.id,isOpen:updated.isOpen,role:updated.role,startsAt:`${canonicalShiftDate(updated)}T${updated.start}:00`,endsAt:`${dateFromSerial(dateSerial(canonicalShiftDate(updated))+(isOvernight(updated.start,updated.end)?1:0))}T${updated.end}:00`,status:updated.status.toUpperCase()})});
            const mapped = (rows || []).map(mapDatabaseShift);
            const changedIds = new Set(mapped.map((item: Shift) => item.id));
            setShifts(current => [...current.filter(item => !changedIds.has(item.id)), ...mapped].sort((a,b)=>canonicalShiftDate(a).localeCompare(canonicalShiftDate(b))));
          }
          setEditingShift(null); notify(scope === "occurrence" ? "Shift updated" : scope === "future" ? "This and future shifts updated" : "Entire shift series updated");
        } catch (error) { notify(error instanceof Error ? error.message : "Could not update shift"); }
      }} onDelete={async () => {
        try { if (!devMode) await persist(`/api/shifts?id=${editingShift.id}`,{method:"DELETE"}); setShifts((current) => current.filter((item) => item.id !== editingShift.id)); setEditingShift(null); notify("Shift removed"); }
        catch (error) { notify(error instanceof Error ? error.message : "Could not remove shift"); }
      }} />}
      {dialog === "shift" && <ShiftDialog employees={employees} currentWeekOffset={currentWeekOffset} initialDate={selectedShiftDate || undefined} locations={locations} selectedLocationId={selectedLocationId} onClose={() => setDialog(null)} onSave={async (newShifts) => {
        try {
          if (devMode) setShifts((current) => [...current, ...newShifts]);
          else {
            const savedGroups = await Promise.all(newShifts.map(async x => { const assigned=employees.find(e=>e.name===x.employee); return persist("/api/shifts",{method:"POST",body:JSON.stringify({locationId:x.locationId || selectedLocationId,employeeId:assigned?.id,isOpen:x.isOpen,role:x.role,startsAt:`${canonicalShiftDate(x)}T${x.start}:00`,endsAt:`${dateFromSerial(dateSerial(canonicalShiftDate(x))+(isOvernight(x.start,x.end)?1:0))}T${x.end}:00`,status:"DRAFT"})}); }));
            const saved = savedGroups.flatMap(result => (result?.shifts || []).map(mapDatabaseShift));
            setShifts(current => [...current, ...saved].sort((a,b)=>canonicalShiftDate(a).localeCompare(canonicalShiftDate(b))));
          }
          setDialog(null); setSelectedShiftDate(null); notify(newShifts.length > 1 ? `${newShifts.length} repeating shifts added` : "Shift added to the draft schedule");
        } catch (error) { notify(error instanceof Error ? error.message : "Could not add shift"); }
      }} />}
      {editingTimeEntry && <TimesheetDialog entry={editingTimeEntry} onClose={() => setEditingTimeEntry(null)} onSave={async (updated) => { try { if (!devMode) await persist("/api/timesheets", { method:"PATCH", body:JSON.stringify({ id:updated.id, status:"PENDING", clockIn:updated.clockIn, clockOut:updated.clockOut || null, breakMinutes:updated.breakMinutes, managerNote:updated.note }) }); setTimeEntries((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingTimeEntry(null); notify("Timesheet corrected and returned to pending review"); } catch(error) { notify(error instanceof Error ? error.message : "Could not correct timesheet"); } }} />}
      {editingEmployee && <EmployeeDialog employee={editingEmployee} locations={locations} onClose={() => setEditingEmployee(null)} onSave={async (updated) => { try { const saved=await persist("/api/employees",{method:"PATCH",body:JSON.stringify({...updated,id:editingEmployee.id})}); setEmployees((current) => current.map((item) => item.id === editingEmployee.id ? {...updated,...saved,id:editingEmployee.id} : item)); setEditingEmployee(null); notify("Employee updated"); } catch(error) { notify(error instanceof Error?error.message:"Could not update employee"); } }} />}
      {dialog === "employee" && <EmployeeDialog locations={locations} defaultLocationId={selectedLocationId} onClose={() => setDialog(null)} onSave={async (employee) => { try { const saved=await persist("/api/employees",{method:"POST",body:JSON.stringify({...employee,locationId:employee.locationId||selectedLocationId})}); setEmployees((current) => [...current, {...employee,id:saved?.id,portalStatus:"NONE"}]); setDialog(null); notify(devMode?"Employee added":"Employee added — you can now invite them to the portal"); } catch(e) { notify(e instanceof Error?e.message:"Could not add employee"); } }} />}
      {dialog === "product" && <ProductDialog onClose={() => setDialog(null)} onSave={async (product) => { try { const saved=await persist("/api/products",{method:"POST",body:JSON.stringify({...product,locationId:selectedLocationId})}); setProducts((current) => [...current, {...product,...saved}]); setDialog(null); notify("Product added to inventory"); } catch(error) { notify(error instanceof Error?error.message:"Could not add product"); } }} />}
      {editingProduct && <ProductDialog product={editingProduct} onClose={() => setEditingProduct(null)} onSave={async (product) => { try { const saved=await persist("/api/products",{method:"PATCH",body:JSON.stringify({...product,locationId:selectedLocationId})}); setProducts(current => current.map(p => p.id === product.id ? {...product,...saved} : p)); setEditingProduct(null); notify("Product updated"); } catch(error) { notify(error instanceof Error?error.message:"Could not update product"); } }} />}
      {dialog === "stockCount" && <StockCountDialog products={products} onClose={() => setDialog(null)} onSave={async (counts) => { try { if (!devMode) { for (const product of products) if (counts[product.id] !== undefined && counts[product.id] !== product.stock) await persist("/api/products", { method:"PATCH", body:JSON.stringify({...product, stock:counts[product.id], locationId:selectedLocationId}) }); } setProducts(current => current.map(p => ({...p,stock:counts[p.id] ?? p.stock}))); setDialog(null); notify("Stock count approved and inventory updated"); } catch(error) { notify(error instanceof Error ? error.message : "Could not save stock count"); } }} />}
      {dialog === "order" && <OrderDialog onClose={() => setDialog(null)} onSave={() => { setDialog(null); notify("Purchase order created"); }} />}
      {toast && <div className="toast"><span><Check size={16} /></span>{toast}</div>}
    </div>
  );
}


function Sidebar({ active, onChange, open, onClose, userName, userRole, devMode }: { active: NavKey; onChange: (id: NavKey) => void; open: boolean; onClose: () => void; userName: string; userRole: string; devMode: boolean }) {
  return <>
    {open && <button className="scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${shellStyles.sidebar} ${open ? "sidebar-open" : ""}`}>
      <div className={`brand ${shellStyles.brand}`}><div className={`brand-mark ${shellStyles.brandMark}`}><Wine size={22} /></div><div><strong>Bar Ops</strong><span>Temple Bar</span></div><button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={20} /></button></div>
      <nav className={`side-nav ${shellStyles.navigation}`}>
        <p>Workspace</p>
        {navItems.map((item) => <button type="button" key={item.id} className={active === item.id ? "active" : ""} aria-current={active === item.id ? "page" : undefined} onClick={() => onChange(item.id)}><item.icon size={19} /><span>{item.label}</span>{item.id === "inventory" && <em>5</em>}</button>)}
      </nav>
      <div className={`side-bottom ${shellStyles.bottom}`}>
        <button type="button" className={active === "settings" ? "active" : ""} aria-current={active === "settings" ? "page" : undefined} onClick={() => onChange("settings")}><Settings size={19} /><span>Settings</span></button>
        <button type="button" onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
          window.location.assign("/login");
        }}><LogOut size={19} /><span>Sign out</span></button>
        {devMode && <DevRoleSwitcher currentRole={userRole} />}<div className={`profile ${shellStyles.profile}`}><div className="avatar dark">{userName.split(" ").map(part => part[0]).join("").slice(0,2)}</div><div><strong>{userName}</strong><span>{userRole.replace("_", " ").toLowerCase()}</span></div><ChevronDown size={16} /></div>
      </div>
    </aside>
  </>
}

function Topbar({ active, onMenu, locations, selectedLocationId, onLocationChange, onNavigate, theme, onToggleTheme }: { active: NavKey; onMenu: () => void; locations: Location[]; selectedLocationId: string; onLocationChange: (id: string) => void; onNavigate: (id: NavKey) => void; theme: "light" | "dark"; onToggleTheme: () => void }) {
  const selected = locations.find(location => location.id === selectedLocationId);
  const [searchOpen,setSearchOpen]=useState(false);
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [query,setQuery]=useState("");
  const matches=navItems.filter(item=>item.label.toLowerCase().includes(query.toLowerCase()));
  const go=(id:NavKey)=>{onNavigate(id);setSearchOpen(false);setQuery("");};
  return <header className={`topbar ${shellStyles.topbar}`}>
    <button className={`menu-button ${shellStyles.topbarButton} ${shellStyles.menuButton}`} onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
    <label className={`location-switch ${shellStyles.location}`} aria-label="Current location"><span className="status-dot" />{locations.length > 1 ? <><select value={selectedLocationId} onChange={event => onLocationChange(event.target.value)}>{locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select><ChevronDown size={15} /></> : <span>{selected?.name || "No active location"}</span>}</label>
    <div className={`top-actions ${shellStyles.actions}`}>
      <button className={`icon-button ${shellStyles.topbarButton}`} onClick={()=>{setSearchOpen(v=>!v);setNotificationsOpen(false)}} aria-label="Search workspace"><Search size={19} /></button>
      <button className={`icon-button ${shellStyles.topbarButton} ${shellStyles.themeButton}`} onClick={onToggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "dark"}>{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <button className={`icon-button notification ${shellStyles.topbarButton}`} onClick={()=>{setNotificationsOpen(v=>!v);setSearchOpen(false)}} aria-label="Open notifications"><Bell size={19} /><i /></button>
      {searchOpen&&<div className="top-popover search-popover"><label><Search size={16}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search workspace"/></label><div>{matches.map(item=><button key={item.id} onClick={()=>go(item.id)}><item.icon size={17}/><span>{item.label}</span><ArrowRight size={14}/></button>)}</div></div>}
      {notificationsOpen&&<div className="top-popover notifications-popover"><strong>Notifications</strong><button onClick={()=>go("schedule")}><CalendarDays size={17}/><span><b>Draft schedule</b><small>Review and publish upcoming shifts</small></span></button><button onClick={()=>go("attendance")}><Clock3 size={17}/><span><b>Timesheet review</b><small>Open time and attendance</small></span></button><button onClick={()=>go("requests")}><ClipboardList size={17}/><span><b>Employee requests</b><small>Review leave, open shifts and shift changes</small></span></button><button onClick={()=>go("inventory")}><Package size={17}/><span><b>Stock attention</b><small>Review products below par</small></span></button></div>}
    </div>
  </header>
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <header className="page-header"><div className="page-header-copy">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{subtitle&&<p className="page-subtitle">{subtitle}</p>}</div>{action&&<div className="page-actions">{action}</div>}</header>
}

function Dashboard({ shifts, products, employees, timeEntries, tasks, shiftNotes, devMode, onNavigate }: { shifts: Shift[]; products: Product[]; employees: Employee[]; timeEntries: TimeEntry[]; tasks: OpsTask[]; shiftNotes:ShiftNote[]; devMode: boolean; onNavigate: (id: NavKey) => void }) {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const today = toIsoDate(new Date());
  const todaysShifts = shifts.filter((shift) => canonicalShiftDate(shift) === today);
  const assignedToday = todaysShifts.filter((shift) => !shift.isOpen);
  const openToday = todaysShifts.filter((shift) => shift.isOpen);
  const runningEntries = timeEntries.filter((entry) => entry.status === "Running");
  const lowStock = products.filter((product) => product.stock < product.par);
  const incompleteTasks = tasks.filter((task) => !task.done);
  const conflicts = conflictIds(todaysShifts);
  const availabilityConflicts = todaysShifts.filter((shift) => shift.availabilityConflict).length;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const late = assignedToday.filter((shift) => {
    const [hours, minutes] = shift.start.split(":").map(Number);
    const hasClockedIn = runningEntries.some((entry) => entry.employee === shift.employee && entry.date === today);
    return hours * 60 + minutes + 10 < nowMinutes && !hasClockedIn;
  });
  const upcoming = assignedToday.filter((shift) => {
    const [hours, minutes] = shift.start.split(":").map(Number);
    return hours * 60 + minutes >= nowMinutes;
  }).sort((a,b) => a.start.localeCompare(b.start));

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (!devMode) {
        try {
          const response = await fetch("/api/requests", { cache: "no-store" });
          const data = await response.json().catch(() => ({}));
          if (response.ok && !cancelled) {
            const groups = [data.requests, data.claims, data.transfers];
            setPendingRequests(groups.reduce((sum, group) => sum + (Array.isArray(group) ? group.length : 0), 0));
          }
        } catch {}
      }
      if (!cancelled) setLastUpdated(new Date());
    }
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [devMode]);

  const timeline = [...todaysShifts].sort((a,b) => a.start.localeCompare(b.start));
  const liveBoard = assignedToday.map((shift) => {
    const running = runningEntries.find((entry) => entry.employee === shift.employee && entry.date === today);
    const [startHours, startMinutes] = shift.start.split(":").map(Number);
    const [endHours, endMinutes] = shift.end.split(":").map(Number);
    const startTotal = startHours * 60 + startMinutes;
    let endTotal = endHours * 60 + endMinutes;
    if (endTotal <= startTotal) endTotal += 1440;
    let comparableNow = nowMinutes;
    if (endTotal > 1440 && nowMinutes < startTotal) comparableNow += 1440;
    if (running?.onBreak) return { shift, status: "On break", tone: "break", detail: `Since ${running.clockIn}` };
    if (running && comparableNow > endTotal + 60) return { shift, status: "Missing clock-out", tone: "danger", detail: `Shift ended ${shift.end}` };
    if (running) return { shift, status: "Clocked in", tone: "live", detail: `Since ${running.clockIn}` };
    if (comparableNow > startTotal + 10 && comparableNow <= endTotal) return { shift, status: "Late", tone: "warning", detail: `Expected ${shift.start}` };
    if (comparableNow < startTotal) {
      const minutesUntil = startTotal - comparableNow;
      return { shift, status: "Expected", tone: "expected", detail: minutesUntil < 60 ? `In ${minutesUntil} min` : `At ${shift.start}` };
    }
    return { shift, status: "Shift ended", tone: "muted", detail: `${shift.start}–${shift.end}` };
  }).sort((a,b) => {
    const priority: Record<string, number> = { danger: 0, warning: 1, break: 2, live: 3, expected: 4, muted: 5 };
    return priority[a.tone] - priority[b.tone] || a.shift.start.localeCompare(b.shift.start);
  });
  const attentionTotal = openToday.length + late.length + lowStock.length + pendingRequests + conflicts.size + availabilityConflicts;
  const completedToday = assignedToday.filter((shift) => { const [eh,em]=shift.end.split(":").map(Number); const [sh,sm]=shift.start.split(":").map(Number); let end=eh*60+em; const start=sh*60+sm; if(end<=start) end+=1440; let current=nowMinutes; if(end>1440&&current<start) current+=1440; return current>end; });
  const workedMinutesToday = timeEntries.filter((entry) => entry.date === today).reduce((total, entry) => {
    if (!entry.clockOut) return total;
    const [ih,im]=entry.clockIn.split(":").map(Number); const [oh,om]=entry.clockOut.split(":").map(Number);
    let minutes=(oh*60+om)-(ih*60+im); if(minutes<0) minutes+=1440;
    return total + Math.max(0, minutes-entry.breakMinutes);
  }, 0);
  const completedTasks = tasks.filter((task) => task.done).length;
  const operationalExceptions = late.length + openToday.length + conflicts.size + availabilityConflicts + incompleteTasks.length;
  return <div className={`${dashboardStyles.dashboard} page-flow`}>
    <PageHeader eyebrow={new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})} title="Today’s operations" subtitle={`Live overview for the current location · updated ${lastUpdated.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`} />
    <section className={`metric-grid daily-metrics ${dashboardStyles.metrics}`}>
      <Metric icon={Users} label="Clocked in" value={`${runningEntries.length}`} detail={`${assignedToday.length} assigned today`} trend={runningEntries.length ? "Live now" : "No active clocks"} />
      <Metric icon={Clock3} label="Expected next" value={upcoming[0]?.start || "—"} detail={upcoming[0]?.employee || "No more arrivals"} trend={`${upcoming.length} upcoming`} />
      <Metric icon={ClipboardList} label="Pending requests" value={`${pendingRequests}`} detail="Leave, claims and transfers" trend={pendingRequests ? "Review queue" : "All clear"} warning={pendingRequests > 0} />
      <Metric icon={AlertTriangle} label="Needs attention" value={`${attentionTotal}`} detail={`${late.length} late · ${openToday.length} open · ${lowStock.length} low stock`} trend={attentionTotal ? "Review now" : "All clear"} warning={attentionTotal > 0} />
    </section>
    <section className={`panel live-shift-board ${dashboardStyles.heroPanel}`}><PanelTitle title="Live shift board" subtitle={`${runningEntries.length} clocked in · ${late.length} late · ${upcoming.length} expected`} action={<button type="button" className="text-button" onClick={() => onNavigate("attendance")}>Open attendance <ArrowRight size={15} /></button>} />
      <div className="live-board-list">
        {liveBoard.length === 0 && <div className="daily-empty">No employees are assigned today.</div>}
        {liveBoard.map(({ shift, status, tone, detail }) => <button type="button" className="live-board-row" key={shift.id} onClick={() => onNavigate("attendance")}>
          <div className="avatar">{shift.initials}</div><div className="live-board-person"><strong>{shift.employee}</strong><small>{shift.role} · {shift.start}–{shift.end}</small></div><div className={`live-board-status ${tone}`}><span>{status}</span><small>{detail}</small></div><ChevronRight size={18}/>
        </button>)}
      </div>
    </section>
    <div className={`dashboard-grid daily-dashboard-grid ${dashboardStyles.contentGrid}`}>
      <section className={`panel today-panel ${dashboardStyles.panel}`}><PanelTitle title="Today’s timeline" subtitle={`${assignedToday.length} assigned · ${openToday.length} open`} action={<button className="text-button" onClick={() => onNavigate("schedule")}>Open shift plan <ArrowRight size={15} /></button>} />
        <div className="timeline">
          {timeline.length === 0 && <div className="daily-empty">No shifts scheduled today.</div>}
          {timeline.map((shift) => <button type="button" className="timeline-row timeline-action" key={shift.id} onClick={() => onNavigate("schedule")}><time>{shift.start}</time><div className={`avatar ${shift.isOpen ? "sand" : ""}`}>{shift.isOpen ? "+" : shift.initials}</div><div className="grow"><strong>{shift.employee}</strong><span>{shift.role}{shift.availabilityConflict ? " · availability conflict" : ""}</span></div><span className="shift-time">{shift.start}–{shift.end}</span><ChevronRight size={18}/></button>)}
        </div>
      </section>
      <section className={`panel attention-panel ${dashboardStyles.panel} ${dashboardStyles.attention}`}><PanelTitle title="Attention needed" subtitle="Prioritised operational actions" />
        <button className="attention-item" onClick={() => onNavigate("attendance")}><span className="attention-icon amber"><Timer size={19} /></span><div><strong>{late.length} employees late</strong><small>{runningEntries.length} currently clocked in</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("requests")}><span className="attention-icon violet"><ClipboardList size={19} /></span><div><strong>{pendingRequests} pending requests</strong><small>Leave, open shifts and transfers</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("schedule")}><span className="attention-icon violet"><CalendarDays size={19} /></span><div><strong>{openToday.length + conflicts.size + availabilityConflicts} schedule issues</strong><small>{openToday.length} open shifts · {conflicts.size + availabilityConflicts} conflicts</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("inventory")}><span className="attention-icon amber"><Boxes size={19} /></span><div><strong>{lowStock.length} products below par</strong><small>Review stock and suggested orders</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("operations")}><span className="attention-icon blue"><CheckCircle2 size={19} /></span><div><strong>{incompleteTasks.length} operations tasks open</strong><small>Opening, closing and maintenance</small></div><ChevronRight size={18} /></button>
      </section>
    </div>
    <section className={`panel operational-summary ${dashboardStyles.summary}`}><PanelTitle title="Operational summary" subtitle="Current progress and outstanding work for today" />
      <div className="operational-summary-grid">
        <div><span>Completed shifts</span><strong>{completedToday.length}</strong><small>{assignedToday.length} assigned today</small></div>
        <div><span>Worked hours</span><strong>{(workedMinutesToday/60).toFixed(1)}</strong><small>Recorded after breaks</small></div>
        <div><span>Tasks completed</span><strong>{completedTasks}/{tasks.length}</strong><small>{incompleteTasks.length} still open</small></div>
        <div><span>Open exceptions</span><strong>{operationalExceptions}</strong><small>Staffing, schedule and operations</small></div>
      </div>
    </section>
    {shiftNotes.length>0&&<section className={`panel shift-notes-panel ${dashboardStyles.panel}`}><PanelTitle title="Latest shift notes" subtitle="Incidents, equipment, stock and handover notes from the team" action={<button type="button" className="text-button" onClick={()=>onNavigate("schedule")}>Open schedule <ArrowRight size={15}/></button>}/><div className="shift-notes-list">{shiftNotes.slice(0,6).map(note=><article key={note.id}><span className={`note-category note-${note.category.toLowerCase()}`}>{note.category}</span><div><strong>{note.author} · {note.role}</strong><p>{note.note}</p><small>{new Date(note.createdAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div></article>)}</div></section>}
    <section className={`panel quick-panel ${dashboardStyles.quickPanel}`}><PanelTitle title="Quick actions" subtitle="Jump directly into today’s work" /><div className="quick-grid">
      <Quick icon={Plus} label="Create shift" detail="Add or assign today’s coverage" onClick={() => onNavigate("schedule")} />
      <Quick icon={ClipboardList} label="Review requests" detail="Approve employee requests" onClick={() => onNavigate("requests")} />
      <Quick icon={Timer} label="Time & attendance" detail="Review clocks and exceptions" onClick={() => onNavigate("attendance")} />
      <Quick icon={Boxes} label="Start stock count" detail="Update inventory levels" onClick={() => onNavigate("inventory")} />
      <Quick icon={Truck} label="Receive delivery" detail="Open purchase orders" onClick={() => onNavigate("orders")} />
      <Quick icon={NotebookPen} label="Daily operations" detail="Complete opening and closing tasks" onClick={() => onNavigate("operations")} />
    </div></section>
  </div>
}

function ShiftExecution({ shifts, entries, notes, onNavigate }: { shifts: Shift[]; entries: TimeEntry[]; notes: ShiftNote[]; onNavigate: (id: NavKey) => void }) {
  const today = toIsoDate(new Date());
  const todayShifts = shifts.filter((shift) => canonicalShiftDate(shift) === today && !shift.isOpen).sort((a,b)=>a.start.localeCompare(b.start));
  const activeEntries = entries.filter((entry) => entry.date === today && entry.status === "Running");
  return <div className={`${executionStyles.workspace} page-flow`}>
    <div className={executionStyles.header}><PageHeader eyebrow="Live operations" title="Shift execution" subtitle="Run the current shift from one operational view" action={<button type="button" className="primary action-button" onClick={()=>onNavigate("attendance")}><Timer size={16}/>Open attendance</button>} /></div>
    <section className={`metric-grid execution-metrics ${executionStyles.metrics}`}>
      <Metric icon={Users} label="Assigned today" value={`${todayShifts.length}`} detail="Published employee shifts" trend="Current location" />
      <Metric icon={Play} label="Clocked in" value={`${activeEntries.length}`} detail={`${activeEntries.filter(entry=>entry.onBreak).length} currently on break`} trend="Live attendance" />
      <Metric icon={NotebookPen} label="Shift notes" value={`${notes.length}`} detail="Latest operational notes" trend="Handover context" />
      <Metric icon={AlertTriangle} label="Exceptions" value={`${todayShifts.filter(shift=>shift.availabilityConflict).length}`} detail="Availability conflicts today" trend="Review before service" warning={todayShifts.some(shift=>shift.availabilityConflict)} />
    </section>
    <section className={`panel execution-board ${executionStyles.board}`}><PanelTitle title="Current shift board" subtitle="Attendance, breaks and shift context" />
      <div className="execution-list">{todayShifts.length===0&&<div className="daily-empty">No assigned shifts today.</div>}{todayShifts.map(shift=>{const entry=activeEntries.find(item=>item.employee===shift.employee); const shiftNotes=notes.filter(note=>note.shiftId===shift.id); return <article key={shift.id}><div className="avatar">{shift.initials}</div><div><strong>{shift.employee}</strong><small>{shift.role} · {shift.start}–{shift.end}</small></div><span className={`execution-state ${entry?.onBreak?"break":entry?"live":"expected"}`}>{entry?.onBreak?"On break":entry?"Clocked in":"Expected"}</span><small>{shiftNotes.length} notes</small><button type="button" className="text-button" onClick={()=>onNavigate(entry?"attendance":"schedule")}>{entry?"Manage":"Open shift"}<ArrowRight size={14}/></button></article>})}</div>
    </section>
    <section className={`panel ${executionStyles.actionsPanel}`}><PanelTitle title="Execution actions" subtitle="Existing operational tools"/><div className="quick-grid execution-actions"><Quick icon={Coffee} label="Manage breaks" detail="Start or end an employee break" onClick={()=>onNavigate("attendance")}/><Quick icon={NotebookPen} label="Review notes" detail="See incidents and handover notes" onClick={()=>onNavigate("dashboard")}/><Quick icon={CalendarDays} label="Adjust coverage" detail="Reassign or open a shift" onClick={()=>onNavigate("schedule")}/><Quick icon={CheckCircle2} label="Operations tasks" detail="Opening, closing and maintenance" onClick={()=>onNavigate("operations")}/></div></section>
  </div>
}

function Metric({ icon: Icon, label, value, detail, trend, warning }: { icon: typeof Users; label: string; value: string; detail: string; trend: string; warning?: boolean }) {
  return <div className="metric-card"><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small><div className={`metric-trend ${warning ? "warn" : ""}`}>{warning ? <AlertTriangle size={13} /> : <span aria-hidden="true" className="metric-status-dot" />}{trend}</div></div>
}
function PanelTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) { return <div className="panel-title"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div> }
function Quick({ icon: Icon, label, detail, onClick }: { icon: typeof CalendarDays; label: string; detail: string; onClick: () => void }) { return <button className="quick-action" onClick={onClick}><span><Icon size={19} /></span><div><strong>{label}</strong><small>{detail}</small></div><ArrowRight size={17} /></button> }

function Schedule({ shifts, setShifts, employees, onNewShift, onEditShift, notify, currentWeekOffset, setCurrentWeekOffset, devMode, selectedLocationId, persist }: { shifts: Shift[]; setShifts: React.Dispatch<React.SetStateAction<Shift[]>>; employees: Employee[]; onNewShift: (date?: string) => void; onEditShift: (shift: Shift) => void; notify: (s: string) => void; currentWeekOffset: number; setCurrentWeekOffset: React.Dispatch<React.SetStateAction<number>>; devMode: boolean; selectedLocationId: string; persist: (path:string, options:RequestInit) => Promise<any> }) {
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month" | "custom">("week");
  const [customFrom,setCustomFrom]=useState(toIsoDate(BASE_MONDAY));
  const customDefaultEnd=new Date(BASE_MONDAY); customDefaultEnd.setDate(customDefaultEnd.getDate()+13);
  const [customTo,setCustomTo]=useState(toIsoDate(customDefaultEnd));
  const [monthOffset, setMonthOffset] = useState(0);
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [acknowledgements, setAcknowledgements] = useState<ScheduleAcknowledgementSummary>({ publication: null, employees: [] });
  const [acknowledgementsOpen, setAcknowledgementsOpen] = useState(false);
  const [remindingAcknowledgements, setRemindingAcknowledgements] = useState(false);
  const [acknowledgementMessage, setAcknowledgementMessage] = useState("");
  const weekMonday = new Date(BASE_MONDAY); weekMonday.setDate(BASE_MONDAY.getDate() + currentWeekOffset * 7);
  const monthAnchor = new Date(BASE_MONDAY.getFullYear(), BASE_MONDAY.getMonth() + monthOffset, 1, 12);
  const periodStart = viewMode === "week" ? weekMonday : viewMode === "month" ? new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1, 12) : new Date(`${customFrom}T12:00:00`);
  const periodEnd = viewMode === "week" ? new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + 6, 12) : viewMode === "month" ? new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0, 12) : new Date(`${customTo < customFrom ? customFrom : customTo}T12:00:00`);
  const displayDays = Array.from({ length: Math.round((dateSerial(toIsoDate(periodEnd)) - dateSerial(toIsoDate(periodStart)))) + 1 }, (_, index) => {
    const date = new Date(periodStart); date.setDate(periodStart.getDate() + index);
    const iso = toIsoDate(date);
    const pos = shiftPositionFromDate(iso);
    return { iso, short: date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(), date: String(date.getDate()).padStart(2, "0"), pos };
  });
  const startIso = displayDays[0]?.iso;
  const endIso = displayDays.at(-1)?.iso;
  const visibleShifts = shifts.filter((shift) => { const date = canonicalShiftDate(shift); return !!startIso && !!endIso && date >= startIso && date <= endIso; });
  const drafts = visibleShifts.filter((shift) => shift.status === "Draft").length;
  const conflicts = conflictIds(visibleShifts);
  const availabilityConflicts = new Set(visibleShifts.filter((shift) => shift.availabilityConflict).map((shift) => shift.id));
  const conflictShiftIds = new Set([...conflicts, ...availabilityConflicts]);
  const displayedShifts = showConflictsOnly ? visibleShifts.filter((shift) => conflictShiftIds.has(shift.id)) : visibleShifts;
  const rangeLabel = viewMode === "month" ? periodStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : `${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  const compactRangeLabel = viewMode === "month" ? periodStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : `${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  const weekLabel = currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : rangeLabel;
  const compactPeriodLabel = viewMode === "week" ? (currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : compactRangeLabel) : compactRangeLabel;
  const acknowledgedCount = acknowledgements.employees.filter((employee) => employee.acknowledgedAt).length;
  async function loadAcknowledgements() {
    if (devMode || viewMode !== "week" || !selectedLocationId || !startIso) { setAcknowledgements({ publication: null, employees: [] }); return; }
    try {
      const response = await fetch(`/api/schedule-acknowledgements?locationId=${encodeURIComponent(selectedLocationId)}&weekStart=${encodeURIComponent(startIso)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Could not load acknowledgements");
      setAcknowledgements({ publication: data.publication || null, employees: Array.isArray(data.employees) ? data.employees : [] });
    } catch { setAcknowledgements({ publication: null, employees: [] }); }
  }
  useEffect(() => { void loadAcknowledgements(); }, [viewMode, selectedLocationId, startIso, devMode]);
  useEffect(() => {
    const scroller = calendarScrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: 0, behavior: "instant" });
  }, [viewMode, startIso]);
  async function remindOutstandingAcknowledgements() {
    if (remindingAcknowledgements || !acknowledgements.publication) return;
    setRemindingAcknowledgements(true);
    setAcknowledgementMessage("");
    try {
      const response = await fetch("/api/schedule-acknowledgements", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "REMIND_OUTSTANDING", publicationId: acknowledgements.publication.id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Could not send reminders");
      const sent = Number(data?.sent || 0);
      setAcknowledgementMessage(sent ? `Reminder${sent === 1 ? "" : "s"} sent to ${sent} employee${sent === 1 ? "" : "s"}.` : "No new reminders were sent. Employees may already have been reminded recently.");
    } catch (error) {
      setAcknowledgementMessage(error instanceof Error ? error.message : "Could not send reminders");
    } finally {
      setRemindingAcknowledgements(false);
    }
  }
  function movePeriod(direction: number) { if (viewMode === "week") setCurrentWeekOffset((week) => week + direction); else if(viewMode === "month") setMonthOffset((month) => month + direction); else { const days=Math.max(1,dateSerial(customTo)-dateSerial(customFrom)+1); setCustomFrom(dateFromSerial(dateSerial(customFrom)+direction*days)); setCustomTo(dateFromSerial(dateSerial(customTo)+direction*days)); } }
  async function publish() {
    if (!drafts) { notify("This period is already published"); return; }
    if (conflicts.size) { notify(`Resolve ${conflicts.size} conflicting shift${conflicts.size === 1 ? "" : "s"} before publishing`); return; }
    if (availabilityConflicts.size) { notify(`Resolve ${availabilityConflicts.size} employee availability conflict${availabilityConflicts.size === 1 ? "" : "s"} before publishing`); return; }
    if (!devMode && !selectedLocationId) { notify("Select a location before publishing"); return; }
    setPublishing(true);
    try {
      if (!devMode) {
        const exclusiveEnd = dateFromSerial(dateSerial(endIso!)+1);
        await persist("/api/schedule-publish", { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ locationId: selectedLocationId, weekStart: startIso, weekEnd: exclusiveEnd }) });
      }
      setShifts((current) => current.map((shift) => { const date=canonicalShiftDate(shift); return date>=startIso!&&date<=endIso!&&shift.status==="Draft"?{...shift,status:"Published"}:shift; }));
      notify(`${drafts} shift${drafts === 1 ? "" : "s"} published`);
      await loadAcknowledgements();
    } catch (error) { notify(error instanceof Error ? error.message : "Could not publish schedule"); }
    finally { setPublishing(false); }
  }
  async function copyPreviousWeek() {
    if (viewMode !== "week") { notify("Switch to Week view to copy the previous week"); return; }
    const source = shifts.filter((shift) => (shift.weekOffset ?? 0) === currentWeekOffset - 1);
    if (!source.length) { notify("The previous week has no shifts to copy"); return; }
    if (visibleShifts.length && !window.confirm("This week already contains shifts. Add copies from the previous week as additional drafts?")) return;
    const copies = source.map((shift) => { const sourceDate = new Date(`${canonicalShiftDate(shift)}T12:00:00`); sourceDate.setDate(sourceDate.getDate() + 7); const date = toIsoDate(sourceDate); const position = shiftPositionFromDate(date); return { ...shift, id: crypto.randomUUID(), date, day: position.day, weekOffset: position.weekOffset, status: "Draft" as const, recurrenceLabel: undefined }; });
    try {
      if (devMode) setShifts((current) => [...current, ...copies]);
      else {
        const saved: Shift[] = [];
        for (const shift of copies) {
          const result = await persist("/api/shifts", { method:"POST", body:JSON.stringify({ locationId:selectedLocationId, employeeId:shift.employeeId, isOpen:shift.isOpen, role:shift.role, startsAt:`${canonicalShiftDate(shift)}T${shift.start}:00`, endsAt:`${dateFromSerial(dateSerial(canonicalShiftDate(shift))+(isOvernight(shift.start,shift.end)?1:0))}T${shift.end}:00`, status:"DRAFT" }) });
          saved.push(...(result?.shifts || []).map(mapDatabaseShift));
        }
        setShifts((current) => [...current, ...saved]);
      }
      notify(`${copies.length} shifts copied as drafts`);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not copy previous week"); }
  }
  return <div className={`${scheduleStyles.workspace} page-flow`}>
    <div className={`schedule-head ${scheduleStyles.header}`}>
      <div className={scheduleStyles.headerCopy}><p className="eyebrow">{rangeLabel}</p><h1>Shift plan</h1></div>
      <div className={`schedule-head-actions ${scheduleStyles.headerActions}`}><button className="secondary compact-action" onClick={copyPreviousWeek} disabled={viewMode !== "week"}><Copy size={15} /><span>Copy previous week</span></button><button className={`${scheduleStyles.topAddShift} primary compact-action`} onClick={() => onNewShift(displayDays[0]?.iso)}><Plus size={16} /><span>Add shift</span></button></div>
    </div>
    <section className={`schedule-toolbar compact-schedule-toolbar ${scheduleStyles.toolbar} ${viewMode === "custom" ? "has-custom-range" : ""}`}>
      <div className={`period-controls ${scheduleStyles.periodControls}`}><button onClick={() => movePeriod(-1)} aria-label={`Previous ${viewMode}`}><ChevronLeft size={17}/></button><strong>{compactPeriodLabel}</strong><button onClick={() => movePeriod(1)} aria-label={`Next ${viewMode}`}><ChevronRight size={17}/></button></div>
      <label className={`${scheduleStyles.viewSelect} schedule-view-select`}><span className="sr-only">Schedule view</span><select value={viewMode} onChange={(event) => setViewMode(event.target.value as "week" | "month" | "custom")}><option value="week">Week</option><option value="month">Month</option><option value="custom">Period</option></select></label>
      {viewMode==="custom"&&<div className="custom-range"><label><span>From</span><input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/></label><label><span>To</span><input type="date" value={customTo} min={customFrom} onChange={e=>setCustomTo(e.target.value)}/></label></div>}
      <div className={`schedule-toolbar-right ${scheduleStyles.summary}`}><span className={`schedule-counts ${scheduleStyles.summaryText}`}><b>{visibleShifts.length}</b> shifts · <b>{drafts}</b> drafts{conflicts.size ? <> · <b className="conflict-count">{conflicts.size}</b> overlaps</> : null}{availabilityConflicts.size ? <> · <b className="conflict-count">{availabilityConflicts.size}</b> availability</> : null}</span>{conflictShiftIds.size ? <button type="button" className="secondary compact-action" aria-pressed={showConflictsOnly} onClick={() => setShowConflictsOnly((value) => !value)}><AlertTriangle size={15}/><span>{showConflictsOnly ? "Show all" : `Review conflicts (${conflictShiftIds.size})`}</span></button> : null}<button type="button" className="publish-button compact-publish" onClick={publish} disabled={!drafts || publishing}><Send size={15}/><span>{publishing ? "Publishing…" : drafts ? `Publish (${drafts})` : "Published"}</span></button></div>
    </section>
    <section className={`calendar-panel schedule-calendar ${scheduleStyles.calendarPanel} ${viewMode === "month" ? "month-view" : "week-view"}`}><div ref={calendarScrollRef} className={scheduleStyles.calendarScroll}><div className={`calendar-grid ${scheduleStyles.calendarGrid}`}>
      {displayDays.map((day) => {
        const isToday = day.iso === toIsoDate(new Date());
        const dayShifts = displayedShifts.filter((shift) => canonicalShiftDate(shift) === day.iso);
        return <div className={`day-column ${scheduleStyles.dayColumn} ${isToday ? `today ${scheduleStyles.today}` : ""}`} key={day.iso} onDragOver={(e)=>e.preventDefault()} onDrop={async (e)=>{e.preventDefault();const id=e.dataTransfer.getData("text/shift-id");const original=shifts.find(x=>x.id===id);if(!original||canonicalShiftDate(original)===day.iso)return;const moved={...original,date:day.iso,day:day.pos.day,weekOffset:day.pos.weekOffset,status:"Draft" as const};try{if(!devMode){const rows=await persist("/api/shifts",{method:"PATCH",body:JSON.stringify({id:original.id,scope:"occurrence",employeeId:original.employeeId,isOpen:original.isOpen,role:original.role,startsAt:`${day.iso}T${original.start}:00`,endsAt:`${dateFromSerial(dateSerial(day.iso)+(isOvernight(original.start,original.end)?1:0))}T${original.end}:00`,status:"DRAFT"})});const mapped=(rows||[]).map(mapDatabaseShift);setShifts(cur=>[...cur.filter(x=>x.id!==id),...mapped]);}else setShifts(cur=>cur.map(x=>x.id===id?moved:x));notify("Shift moved and returned to draft");}catch(error){notify(error instanceof Error?error.message:"Could not move shift");}}}>
          <div className={`day-header ${scheduleStyles.dayHeader}`}><span>{day.short}</span><strong>{day.date}</strong></div>
          <div className={`day-body ${scheduleStyles.dayBody}`}>{dayShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} conflict={conflicts.has(shift.id) || availabilityConflicts.has(shift.id)} onOpen={() => onEditShift(shift)} onDragStart={(e)=>e.dataTransfer.setData("text/shift-id",shift.id)} />)}<button className={`add-slot ${scheduleStyles.addShift}`} onClick={() => onNewShift(day.iso)} aria-label={`Add shift on ${day.short} ${day.date}`} title="Add shift"><Plus size={15}/><span className="sr-only">Add shift</span></button></div>
        </div>;
      })}
    </div></div></section>
    {showConflictsOnly && !displayedShifts.length ? <div className="empty-state"><AlertTriangle size={20}/><strong>No conflicts in this period</strong><span>Show all shifts to continue editing the schedule.</span></div> : null}
    {acknowledgementsOpen&&<div className="modal-layer"><button type="button" className="modal-scrim" onClick={()=>setAcknowledgementsOpen(false)} aria-label="Close acknowledgement status"/><section className="modal acknowledgement-modal" role="dialog" aria-modal="true" aria-labelledby="acknowledgement-title"><div className="modal-head"><div><h2 id="acknowledgement-title">Schedule acknowledgements</h2><p>Version {acknowledgements.publication?.version} · {weekLabel}</p></div><button type="button" className="icon-button" onClick={()=>setAcknowledgementsOpen(false)} aria-label="Close"><X size={18}/></button></div><div className="acknowledgement-list">{acknowledgements.employees.map(employee=><div key={employee.id}><span className={`status-dot ${employee.acknowledgedAt?"is-complete":""}`}/><div><strong>{employee.name}</strong><small>{employee.acknowledgedAt?`Acknowledged ${new Date(employee.acknowledgedAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`:"Awaiting acknowledgement"}{employee.changeTypes?.length?` · ${employee.changeTypes.map((type)=>type.replaceAll("_"," ").toLowerCase()).join(", ")}`:""}</small></div></div>)}{!acknowledgements.employees.length&&<div className="empty-state"><CheckCheck size={20}/><strong>No assigned employees</strong><span>This publication has no employee acknowledgements to collect.</span></div>}</div>{acknowledgementMessage?<p className="form-message" role="status">{acknowledgementMessage}</p>:null}<div className="modal-actions"><button type="button" className="secondary" onClick={()=>void loadAcknowledgements()}>Refresh</button><button type="button" className="secondary" disabled={remindingAcknowledgements || acknowledgedCount===acknowledgements.employees.length} onClick={()=>void remindOutstandingAcknowledgements()}>{remindingAcknowledgements?"Sending…":"Remind outstanding"}</button><button type="button" className="primary" onClick={()=>setAcknowledgementsOpen(false)}>Done</button></div></section></div>}
  </div>
}
function firstName(name: string) { return name.trim().split(/\s+/)[0] || name; }
function ShiftCard({ shift, conflict, onOpen, onDragStart }: { shift: Shift; conflict?: boolean; onOpen: () => void; onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void }) {
  const overnight = isOvernight(shift.start, shift.end);
  const displayName = shift.isOpen ? "Available shift" : firstName(shift.employee);
  return <button type="button" draggable onDragStart={onDragStart} className={`shift-card shift-card-button ${scheduleStyles.shiftCard} role-${shift.role.toLowerCase()} ${shift.status === "Draft" ? "is-draft" : ""} ${conflict ? "has-conflict" : ""}`} data-role={shift.role} data-draft={shift.status === "Draft"} data-conflict={Boolean(conflict)} onClick={onOpen} aria-label={`Open ${shift.isOpen ? "available" : shift.employee} shift ${shift.start} to ${shift.end}${overnight ? " next day" : ""}`}>
    <div className="shift-card-top"><span>{shift.start}–{shift.end}{overnight ? " +1" : ""}</span><ChevronRight size={14} /></div>
    <strong>{displayName}</strong>
    <small><span>{shift.role}</span>{overnight ? <span className="shift-overnight-label"> · Overnight</span> : null}</small>
    {shift.isOpen && <em>Open</em>}{shift.status === "Draft" && <em>Draft</em>}{shift.availabilityConflict && <em className="conflict-badge">{shift.availabilityConflict === "APPROVED_TIME_OFF" ? "Time off" : "Unavailable"}</em>}{conflict && !shift.availabilityConflict && <em className="conflict-badge">Conflict</em>}
  </button>;
}

function workedHours(entry: TimeEntry) { return entry.clockOut ? Math.max(0, hoursBetween(entry.clockIn, entry.clockOut) - entry.breakMinutes/60) : 0; }
function Attendance({ employees, shifts, entries, setEntries, notify, onEdit, devMode, persist }: { employees: Employee[]; shifts: Shift[]; entries: TimeEntry[]; setEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>; notify:(s:string)=>void; onEdit:(entry:TimeEntry)=>void; devMode:boolean; persist:(path:string,options:RequestInit)=>Promise<any> }) {
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

  async function toggleBreak(entry: TimeEntry) {
    try {
      if (!devMode) await persist("/api/time-clock/manage", { method:"POST", body:JSON.stringify({ timesheetId:entry.id, action:entry.onBreak?"BREAK_END":"BREAK_START" }) });
      setEntries(current => current.map(item => item.id === entry.id ? { ...item, onBreak: !entry.onBreak, breakStartedAt: entry.onBreak ? null : new Date().toISOString() } : item));
      notify(entry.onBreak ? `${entry.employee} break ended` : `${entry.employee} break started`);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not update break"); }
  }

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
  const payrollRows=employees.map(emp=>{const scheduledEmp=visibleShifts.filter(s=>s.employee===emp.name).reduce((n,s)=>n+hoursBetween(s.start,s.end),0);const approvedEntries=approved.filter(e=>e.employee===emp.name);const workedEmp=approvedEntries.reduce((n,e)=>n+workedHours(e),0);return {emp,scheduledEmp,approvedEntries,workedEmp};}).filter(row=>row.scheduledEmp>0||row.approvedEntries.length>0);
  return <div className={attendanceStyles.workspace}>
    <header className={attendanceStyles.hero}>
      <div><p>Payroll review</p><h1>Time & attendance</h1><span>Review hours and prepare payroll.</span></div>
      <div className={attendanceStyles.actions}>
        <button className={periodLocked ? attendanceStyles.locked : attendanceStyles.outline} onClick={()=>{setPeriodLocked(v=>!v);notify(periodLocked?"Payroll period unlocked":"Payroll period locked for export")}}>{periodLocked?<><LockKeyhole size={17}/>Locked</>:<><UnlockKeyhole size={17}/>Lock period</>}</button>
        <button className={attendanceStyles.approveAll} onClick={approveAllVisible} disabled={periodLocked||!visible.some(e=>e.status==="Pending")}><CheckCheck size={17}/>Approve visible</button>
        <button className={attendanceStyles.export} onClick={exportApproved} disabled={!approved.length||!periodLocked}><FileDown size={17}/>Export</button>
      </div>
    </header>

    <section className={attendanceStyles.filters} aria-label="Timesheet filters">
      <div className={attendanceStyles.periodFields}><label>From<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>To<input type="date" value={toDate} min={fromDate} onChange={e=>setToDate(e.target.value)}/></label></div>
      <div className={attendanceStyles.filterFields}><label>Employee<select value={employeeFilter} onChange={e=>setEmployeeFilter(e.target.value)}><option>All employees</option>{employees.map(e=><option key={e.name}>{e.name}</option>)}</select></label><label>Status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Needs review</option><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Running</option></select></label></div>
      <div className={attendanceStyles.filterFooter}><span role="status" aria-live="polite">{visible.length} timesheet{visible.length===1?"":"s"}</span><button type="button" onClick={()=>{setEmployeeFilter("All employees");setStatusFilter("Needs review")}} disabled={employeeFilter==="All employees"&&statusFilter==="Needs review"}>Reset</button></div>
    </section>

    <section className={attendanceStyles.records}>
      <div className={attendanceStyles.sectionHeader}><div><h2>Timesheets</h2><p>Review each record and act on exceptions.</p></div><span>{periodLocked?"Period locked":"Open period"}</span></div>
      <div className={attendanceStyles.recordList}>{visible.map(e=>{const actual=e.clockOut?workedHours(e):0;const variance=actual-e.scheduledHours;const exception=e.status!=="Running"&&(Math.abs(variance)>=.5||e.breakMinutes===0||e.edited);return <article className={`${attendanceStyles.record} ${exception?attendanceStyles.recordException:""}`} key={e.id}>
        <header><div><strong>{e.employee}</strong><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span></div><i className={`${attendanceStyles.status} ${attendanceStyles[`status${e.status}`]}`}>{e.status}</i></header>
        <div className={attendanceStyles.timeLine}><b>{e.clockIn}–{e.clockOut||"Now"}</b><span>{e.clockOut?`${actual.toFixed(2)}h worked`:"Clocked in"}</span></div>
        <div className={attendanceStyles.recordStats}><span>Scheduled<b>{e.scheduledHours.toFixed(1)}h</b></span><span>Break<b>{e.breakMinutes}m</b></span><span>Variance<b className={Math.abs(variance)>=.5?attendanceStyles.alertText:""}>{e.clockOut?`${variance>=0?"+":""}${variance.toFixed(2)}h`:"—"}</b></span></div>
        {e.edited&&<small className={attendanceStyles.edited}>Manager corrected</small>}
        <div className={attendanceStyles.recordActions}>{e.status==="Running"&&<button type="button" onClick={()=>void toggleBreak(e)}>{e.onBreak?"End break":"Start break"}</button>}{e.status==="Pending"&&<><button aria-label={`Edit ${e.employee} timesheet`} onClick={()=>onEdit(e)}><Pencil size={16}/></button><button aria-label={`Reject ${e.employee} timesheet`} onClick={()=>rejectTimesheet(e.id)}><Ban size={16}/></button><button className={attendanceStyles.primaryAction} onClick={()=>approveTimesheet(e.id)}>Approve</button></>}{e.status==="Approved"&&<button onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={15}/>Reopen</button>}{e.status==="Rejected"&&<button onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={15}/>Return to review</button>}</div>
      </article>})}{!visible.length&&<div className={attendanceStyles.empty}><strong>No timesheets found</strong><span>Change the filters or date range to widen the results.</span></div>}</div>
    </section>

    <section className={attendanceStyles.summary} aria-label="Payroll summary">
      <article><span>Scheduled</span><strong>{scheduled.toFixed(1)}h</strong></article>
      <article><span>Approved</span><strong>{worked.toFixed(1)}h</strong></article>
      <article className={pending?attendanceStyles.needsAction:""}><span>Awaiting</span><strong>{pending}</strong></article>
      <article className={exceptions.length?attendanceStyles.exceptions:""} aria-label="Exceptions: Variance, no break, or edited"><span>Exceptions</span><strong>{exceptions.length}</strong></article>
    </section>

    <section className={attendanceStyles.preview}>
      <div className={attendanceStyles.sectionHeader}><div><h2>Payroll preview</h2><p>Approved hours for the selected period.</p></div></div>
      <div className={attendanceStyles.previewList}>{payrollRows.length?payrollRows.map(({emp,scheduledEmp,approvedEntries,workedEmp})=><article key={emp.name}><div><span className={attendanceStyles.avatar}>{emp.initials}</span><p><strong>{emp.name}</strong><small>{emp.role}</small></p></div><dl><div><dt>Scheduled</dt><dd>{scheduledEmp.toFixed(1)}h</dd></div><div><dt>Approved</dt><dd>{workedEmp.toFixed(2)}h</dd></div></dl><small>{approvedEntries.length} approved record{approvedEntries.length===1?"":"s"}</small></article>):<div className={attendanceStyles.empty}><strong>No payroll rows yet</strong><span>Approved timesheets appear here.</span></div>}</div>
    </section>

    <section className={attendanceStyles.history}>
      <div className={attendanceStyles.sectionHeader}><div><h2>Export history</h2><p>Files generated in this session.</p></div><History size={18}/></div>
      {exportHistory.length?<div>{exportHistory.map(x=><article key={x.id}><DownloadCloud size={17}/><span><b>{x.period}</b><small>{x.created}</small></span><span>{x.employees} employees</span><strong>{x.hours.toFixed(2)}h</strong></article>)}</div>:<p>No payroll exports generated in this session.</p>}
    </section>
  </div>
}

function Inventory({ products, setProducts, onNewProduct, onEditProduct, onStockCount, adjustments, setAdjustments, notify, devMode, selectedLocationId, persist }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; onNewProduct: () => void; onEditProduct: (product:Product)=>void; onStockCount:()=>void; adjustments:StockAdjustment[]; setAdjustments:React.Dispatch<React.SetStateAction<StockAdjustment[]>>; notify: (s: string) => void; devMode:boolean; selectedLocationId:string; persist:(path:string,options:RequestInit)=>Promise<any> }) {
  const [query, setQuery] = useState(""); const [onlyLow, setOnlyLow] = useState(false); const [category,setCategory]=useState("All categories");
  const filtered = products.filter((p) => p.active !== false && p.name.toLowerCase().includes(query.toLowerCase()) && (category==="All categories"||p.category===category) && (!onlyLow || p.stock < p.par));
  const value = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const categories=["All categories",...Array.from(new Set(products.map(p=>p.category)))];
  async function adjust(product:Product,delta:number){ const reason=window.prompt(`Reason for ${delta>0?"adding":"removing"} ${Math.abs(delta)} ${product.unit}:`,delta>0?"Delivery / manual correction":"Waste / manual correction"); if(!reason)return; const nextStock=Math.max(0,product.stock+delta); try { if(!devMode) await persist("/api/products",{method:"PATCH",body:JSON.stringify({id:product.id,quantity:nextStock,locationId:selectedLocationId})}); setProducts(cur=>cur.map(p=>p.id===product.id?{...p,stock:nextStock}:p)); setAdjustments(cur=>[{id:crypto.randomUUID(),productId:product.id,productName:product.name,delta:nextStock-product.stock,reason,createdAt:new Date().toLocaleString("en-GB")},...cur].slice(0,30)); notify("Stock adjustment saved"); } catch(error) { notify(error instanceof Error?error.message:"Could not save stock adjustment"); } }
  return <div className={`${inventoryStyles.workspace} page-flow`}>
    <PageHeader title="Inventory" subtitle="Stock, par levels and product controls." action={<div className={`header-actions ${inventoryStyles.headerActions}`}><button className="secondary" onClick={onStockCount}><ClipboardList size={17} /> Stock count</button><button className="primary" onClick={onNewProduct}><Plus size={18} /> Add product</button></div>} />
    <section className={inventoryStyles.summary}><div><span>Stock value</span><strong>{money(value)}</strong></div><div><span>Products</span><strong>{products.filter(p=>p.active!==false).length}</strong></div><div><span>Below par</span><strong>{products.filter((p) => p.active!==false&&p.stock < p.par).length}</strong></div><div><span>Suppliers</span><strong>{new Set(products.map(p=>p.supplier)).size}</strong></div></section>
    <section className={inventoryStyles.productsPanel}><div className={inventoryStyles.toolbar}><div className={`search-field ${inventoryStyles.search}`}><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory" aria-label="Search inventory" /></div><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter inventory category">{categories.map(c=><option key={c}>{c}</option>)}</select><button className={`${inventoryStyles.lowFilter} ${onlyLow ? inventoryStyles.selected : ""}`} aria-pressed={onlyLow} onClick={() => setOnlyLow(!onlyLow)}><AlertTriangle size={16} /> Below par</button>{(query||category!=="All categories"||onlyLow)&&<button type="button" className={inventoryStyles.clear} onClick={()=>{setQuery("");setCategory("All categories");setOnlyLow(false)}}>Clear</button>}<span className={inventoryStyles.resultCount} role="status" aria-live="polite">{filtered.length} product{filtered.length===1?"":"s"}</span></div>
      <div className={inventoryStyles.productList}>{filtered.map((product) => { const suggested = Math.max(0, product.par - product.stock); return <article className={inventoryStyles.productCard} key={product.id}><header><div><p>{product.category}</p><h2>{product.name}</h2><small>{product.supplier} · {product.sku||"No SKU"}</small></div><button className={inventoryStyles.editButton} onClick={()=>onEditProduct(product)} aria-label={`Edit ${product.name}`}><Pencil size={15}/></button></header><div className={inventoryStyles.stockRow}><div><span>In stock</span><div className={inventoryStyles.stockControl}><button aria-label={`Remove one ${product.name}`} onClick={() => adjust(product,-1)}>−</button><strong className={product.stock < product.par ? inventoryStyles.low : ""}>{product.stock}</strong><button aria-label={`Add one ${product.name}`} onClick={() => adjust(product,1)}>+</button></div><small>{product.unit}</small></div><div><span>Par</span><strong>{product.par}</strong><small>Reorder at {product.reorderLevel??Math.max(0,product.par-2)}</small></div><div><span>Suggested</span>{suggested > 0 ? <strong className={inventoryStyles.suggestion}>+{suggested}</strong> : <strong className={inventoryStyles.ok}><Check size={14} /> OK</strong>}<small>{money(product.price)} / {product.unit}</small></div></div></article>})}{!filtered.length&&<div className={inventoryStyles.empty}><strong>No products found</strong><span>Change the search or filters.</span></div>}</div>
    </section>
    <section className={inventoryStyles.history}><div className={inventoryStyles.sectionHeader}><div><h2>Adjustment history</h2><p>Recent manual stock changes.</p></div><History size={18}/></div>{adjustments.length?<div>{adjustments.slice(0,8).map(a=><article key={a.id}><span className={a.delta>0?inventoryStyles.positive:inventoryStyles.negative}>{a.delta>0?"+":""}{a.delta}</span><span><b>{a.productName}</b><small>{a.reason}</small></span><time>{a.createdAt}</time></article>)}</div>:<p>No manual stock adjustments yet.</p>}</section>
  </div>
}

function Orders({ products, setProducts, onNewOrder, notify }: { products:Product[]; setProducts:React.Dispatch<React.SetStateAction<Product[]>>; onNewOrder: () => void; notify: (s: string) => void }) {
  const [received,setReceived]=useState<string[]>([]);
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("ALL");
  const suggestions=products.filter(p=>p.active!==false&&p.stock<p.par).map(p=>({...p,qty:p.par-p.stock}));
  const visibleOrders=orders.filter(order=>{ const status=received.includes(order.id)?"Delivered":order.status; const matchesQuery=!query.trim()||`${order.id} ${order.supplier}`.toLowerCase().includes(query.trim().toLowerCase()); return matchesQuery&&(statusFilter==="ALL"||status.toUpperCase()===statusFilter); });
  function receive(orderId:string){ if(received.includes(orderId))return; setReceived(cur=>[...cur,orderId]); if(orderId==="PO-1048") setProducts(cur=>cur.map(p=>p.supplier==="Nordic Drinks"?{...p,stock:p.stock+Math.max(0,p.par-p.stock)}:p)); notify(`${orderId} received and stock updated`); }
  return <div className={`${orderStyles.workspace} page-flow`}><PageHeader title="Purchase orders" subtitle="Replenishment, deliveries and order status." action={<button className={orderStyles.addButton} onClick={onNewOrder}><Plus size={18} /> New order</button>} />
    {suggestions.length>0&&<section className={orderStyles.suggestion}><div><Sparkles size={19}/><div><p>Suggested replenishment</p><strong>{suggestions.length} products below par</strong><small>{suggestions.reduce((n,p)=>n+p.qty,0)} units suggested</small></div></div><button onClick={()=>notify("Suggested order grouped by supplier and saved as draft")}>Create draft</button></section>}
    <section className={orderStyles.delivery}><div><Truck size={20}/><div><p>Next delivery</p><strong>Nordic Drinks</strong><small>Tomorrow · 08:00–11:00</small></div></div><button onClick={() => receive("PO-1048")}>{received.includes("PO-1048")?<><Check size={16}/>Received</>:"Receive"}</button></section>
    <section className={orderStyles.ordersPanel}><div className={orderStyles.toolbar}><div className={`search-field ${orderStyles.search}`}><Search size={17} /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search orders" aria-label="Search orders" /></div><label className={orderStyles.filter}><span className="sr-only">Filter order status</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="CONFIRMED">Confirmed</option><option value="DELIVERED">Delivered</option></select><ChevronDown size={15}/></label>{(query||statusFilter!=="ALL")&&<button type="button" className={orderStyles.clear} onClick={()=>{setQuery("");setStatusFilter("ALL")}}>Clear</button>}<span className={orderStyles.resultCount} role="status" aria-live="polite">{visibleOrders.length} order{visibleOrders.length===1?"":"s"}</span></div><div className={orderStyles.orderList}>{visibleOrders.length?visibleOrders.map((order) => {const currentStatus=received.includes(order.id)?"Received":order.status;return <article className={orderStyles.orderCard} key={order.id}><header><div><p>{order.id}</p><h2>{order.supplier}</h2></div><span data-status={currentStatus.toLowerCase()}>{currentStatus}</span></header><dl><div><dt>Items</dt><dd>{order.items}</dd></div><div><dt>Delivery</dt><dd>{order.delivery}</dd></div><div><dt>Amount</dt><dd>{money(order.amount)}</dd></div></dl>{order.status!=="Delivered"&&!received.includes(order.id)&&<button className={orderStyles.receiveButton} onClick={()=>receive(order.id)}><CheckCircle2 size={16}/> Receive order</button>}</article>}):<div className={orderStyles.empty}><strong>No orders found</strong><span>Change the search or status filter.</span></div>}</div></section>
  </div>
}

function DailyOperations({tasks,setTasks,logs,setLogs,notify,devMode,locationId}:{tasks:OpsTask[];setTasks:React.Dispatch<React.SetStateAction<OpsTask[]>>;logs:LogEntry[];setLogs:React.Dispatch<React.SetStateAction<LogEntry[]>>;notify:(s:string)=>void;devMode:boolean;locationId:string}){
 const [title,setTitle]=useState(""); const [type,setType]=useState<OpsTask["type"]>("Task"); const [logText,setLogText]=useState(""); const [savingId,setSavingId]=useState<string|null>(null);const [serviceDate,setServiceDate]=useState(()=>new Date().toISOString().slice(0,10));
 const complete=tasks.filter(t=>t.done).length; const isToday=serviceDate===new Date().toISOString().slice(0,10);
 useEffect(()=>{if(devMode||!locationId)return;fetch(`/api/operation-checklists?locationId=${encodeURIComponent(locationId)}&date=${encodeURIComponent(serviceDate)}`,{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load checklist");return d}).then(d=>setTasks((d.items||[]).map((x:any)=>({id:x.id,title:x.title,type:x.task_type,owner:x.owner_label||"Unassigned",due:x.due_label||"Today",done:Boolean(x.completed_at)})))).catch(e=>notify(e.message));},[devMode,locationId,serviceDate]);
 async function addTask(){if(!title.trim())return; if(devMode){setTasks(cur=>[...cur,{id:crypto.randomUUID(),title:title.trim(),type,owner:"Unassigned",due:"Today",done:false}]);setTitle("");notify("Operational task added");return;} try{const r=await fetch("/api/operation-checklists",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locationId,title:title.trim(),taskType:type})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not add task");setTasks(cur=>[...cur,{id:d.id,title:d.title,type:d.task_type,owner:d.owner_label||"Unassigned",due:d.due_label||"Today",done:false}]);setTitle("");notify("Operational task added");}catch(e){notify(e instanceof Error?e.message:"Could not add task");}}
 async function addPreset(preset:"Opening"|"Closing"){const titles=preset==="Opening"?["Check tills and floats","Check fridges and ice","Prepare garnishes and bar stations","Confirm toilets and guest areas are ready"]:["Complete final stock check","Clean bar stations and equipment","Lock doors and secure cash","Set alarm and record handover notes"];for(const itemTitle of titles){if(devMode){setTasks(cur=>[...cur,{id:crypto.randomUUID(),title:itemTitle,type:preset,owner:"Shift manager",due:preset==="Opening"?"Before opening":"Before close",done:false}]);continue;}const r=await fetch("/api/operation-checklists",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locationId,title:itemTitle,taskType:preset})});const d=await r.json();if(!r.ok){notify(d.error||`Could not add ${preset.toLowerCase()} checklist`);return;}setTasks(cur=>[...cur,{id:d.id,title:d.title,type:d.task_type,owner:d.owner_label||"Unassigned",due:d.due_label||"Today",done:false}]);}notify(`${preset} checklist added`);}
 async function toggleTask(task:OpsTask){if(devMode){setTasks(cur=>cur.map(x=>x.id===task.id?{...x,done:!x.done}:x));return;}setSavingId(task.id);try{const r=await fetch("/api/operation-checklists",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:task.id,done:!task.done})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not update task");setTasks(cur=>cur.map(x=>x.id===task.id?{...x,done:Boolean(d.completed_at)}:x));}catch(e){notify(e instanceof Error?e.message:"Could not update task");}finally{setSavingId(null);}}
 async function removeTask(task:OpsTask){if(devMode){setTasks(cur=>cur.filter(x=>x.id!==task.id));return;}try{const r=await fetch(`/api/operation-checklists?id=${encodeURIComponent(task.id)}`,{method:"DELETE"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not remove task");setTasks(cur=>cur.filter(x=>x.id!==task.id));}catch(e){notify(e instanceof Error?e.message:"Could not remove task");}}
 async function editTaskMeta(task:OpsTask){const owner=window.prompt("Who owns this task?",task.owner);if(owner===null)return;const due=window.prompt("When is it due?",task.due);if(due===null)return;if(devMode){setTasks(cur=>cur.map(x=>x.id===task.id?{...x,owner:owner.trim()||"Unassigned",due:due.trim()||"Today"}:x));return;}try{const r=await fetch("/api/operation-checklists",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:task.id,ownerLabel:owner.trim()||"Unassigned",dueLabel:due.trim()||"Today"})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not update task");setTasks(cur=>cur.map(x=>x.id===task.id?{...x,owner:d.owner_label||"Unassigned",due:d.due_label||"Today"}:x));notify("Task responsibility updated");}catch(e){notify(e instanceof Error?e.message:"Could not update task");}}
 function addLog(){if(!logText.trim())return;setLogs(cur=>[{id:crypto.randomUUID(),title:"Shift handover",body:logText.trim(),author:"Current manager",createdAt:new Date().toLocaleString("en-GB")},...cur]);setLogText("");notify("Handover note saved");}
 return <div className={`${operationsStyles.workspace} page-flow`}>
 <div className={operationsStyles.header}><PageHeader title="Daily operations" subtitle="Opening, closing, handovers and maintenance in one live manager workspace." action={<div className={operationsStyles.headerActions}><input className={operationsStyles.dateInput} type="date" value={serviceDate} max={new Date().toISOString().slice(0,10)} onChange={e=>setServiceDate(e.target.value)} aria-label="Checklist date"/><span className={`connection-pill dev ${operationsStyles.progress}`}>{complete}/{tasks.length} complete</span></div>}/></div>
 <section className={operationsStyles.summary} aria-label="Daily operations summary"><article><ClipboardList/><span>Opening & closing<strong>{tasks.filter(t=>t.type==="Opening"||t.type==="Closing").length} checks</strong></span></article><article><Wrench/><span>Maintenance<strong>{tasks.filter(t=>t.type==="Maintenance"&&!t.done).length} open</strong></span></article><article><NotebookPen/><span>Logbook<strong>{logs.length} entries</strong></span></article></section>
 <div className={operationsStyles.layout}><section className={`panel ${operationsStyles.panel} ${operationsStyles.checklist}`}><PanelTitle title="Today’s checklist" subtitle="Completion is shared with every manager at this location."/>{isToday&&<div className={operationsStyles.presets}><button type="button" className="secondary" onClick={()=>addPreset("Opening")}><Plus size={15}/>Opening checklist</button><button type="button" className="secondary" onClick={()=>addPreset("Closing")}><Plus size={15}/>Closing checklist</button></div>}<div className={operationsStyles.taskList}>{tasks.map(t=><article key={t.id} className={`${operationsStyles.task} ${t.done?"task-done":""}`}><button type="button" className="task-check" disabled={!isToday||savingId===t.id} onClick={()=>toggleTask(t)}>{t.done?<Check size={16}/>:null}</button><span><b>{t.title}</b><small>{t.type} · {t.owner} · {t.due}</small></span>{isToday&&<span className={operationsStyles.rowActions}><button type="button" className="icon-button" onClick={()=>editTaskMeta(t)} aria-label={`Edit responsibility for ${t.title}`}><Pencil size={15}/></button><button type="button" className="icon-button" onClick={()=>removeTask(t)} aria-label={`Remove ${t.title}`}><Trash2 size={15}/></button></span>}</article>)}</div>{isToday&&<div className={operationsStyles.create}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add an operational task"/><select value={type} onChange={e=>setType(e.target.value as OpsTask["type"])}><option>Task</option><option>Opening</option><option>Closing</option><option>Maintenance</option></select><button type="button" className="primary" onClick={addTask}><Plus size={16}/>Add</button></div>}</section>
 <section className={`panel ${operationsStyles.panel} ${operationsStyles.logbook}`}><PanelTitle title="Manager logbook" subtitle="Permanent shift handovers and important operational context."/><div className={operationsStyles.compose}><textarea value={logText} onChange={e=>setLogText(e.target.value)} placeholder="What does the next manager need to know?"/><button type="button" className="primary" onClick={addLog}><Send size={16}/>Save handover</button></div><div className={operationsStyles.logList}>{logs.map(l=><article className={operationsStyles.logEntry} key={l.id}><div><b>{l.title}</b><small>{l.author} · {l.createdAt}</small></div><p>{l.body}</p></article>)}</div></section></div></div>
}

function Team({ employees, shifts, devMode, onAdd, onEdit, onInvite, onRevoke }: { employees: Employee[]; shifts: Shift[]; devMode:boolean; onAdd: () => void; onEdit: (employee: Employee) => void; onInvite:(employee:Employee)=>void; onRevoke:(employee:Employee)=>void }) {
  const [query,setQuery]=useState("");
  const [status,setStatus]=useState<"ALL"|"ACTIVE"|"INACTIVE">("ALL");
  const normalizedQuery=query.trim().toLowerCase();
  const visibleEmployees=employees.filter(person=>(!normalizedQuery||`${person.name} ${person.role} ${person.email||""}`.toLowerCase().includes(normalizedQuery))&&(status==="ALL"||(status==="ACTIVE"?person.active:!person.active)));
  const today = new Date();
  today.setHours(0,0,0,0);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate()+28);
  const scheduledHours = (person: Employee) => shifts.filter((shift) => {
    const shiftDay = new Date(`${canonicalShiftDate(shift)}T00:00:00`);
    const matchesEmployee = person.id ? shift.employeeId === person.id || (!shift.employeeId && shift.employee === person.name) : shift.employee === person.name;
    return matchesEmployee && !shift.isOpen && shift.status === "Published" && shiftDay >= today && shiftDay < windowEnd;
  }).reduce((total,shift)=>total+hoursBetween(shift.start,shift.end),0);
  const activeCount=employees.filter(person=>person.active).length;
  const portalCount=employees.filter(person=>person.portalStatus==="ACTIVE").length;
  return <div className={`${teamStyles.workspace} page-flow`}>
    <PageHeader eyebrow="People operations" title="Team" subtitle="People, access and upcoming hours." action={<button className={`team-add-button ${teamStyles.addButton}`} onClick={onAdd}><UserRoundPlus size={17}/>Add employee</button>}/>
    <section className={teamStyles.summary} aria-label="Team summary">
      <article><span>Total team</span><strong>{employees.length}</strong></article>
      <article><span>Active</span><strong>{activeCount}</strong></article>
      <article><span>Portal active</span><strong>{portalCount}</strong></article>
    </section>
    <div className={`table-toolbar team-toolbar ${teamStyles.toolbar}`}>
      <div className={`search-field ${teamStyles.search}`}><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search team" aria-label="Search team"/></div>
      <select value={status} onChange={e=>setStatus(e.target.value as "ALL"|"ACTIVE"|"INACTIVE")} aria-label="Filter team status"><option value="ALL">All employees</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      {(query||status!=="ALL")&&<button type="button" className={`secondary compact ${teamStyles.clearButton}`} onClick={()=>{setQuery("");setStatus("ALL")}}>Clear</button>}
      <span className={`result-count ${teamStyles.resultCount}`} role="status" aria-live="polite">{visibleEmployees.length} employee{visibleEmployees.length===1?"":"s"}</span>
    </div>
    <section className={`team-grid ${teamStyles.grid}`}>
      {visibleEmployees.map((person) => {
        const upcomingHours = scheduledHours(person);
        const portalLabel=person.portalStatus==="ACTIVE"?"Portal active":person.portalStatus==="INVITED"?"Invitation pending":person.portalStatus==="EXPIRED"?"Invitation expired":"No portal access";
        return <article className={`${teamStyles.card} ${!person.active ? teamStyles.inactive : ""}`} key={person.id||person.name}>
          <header className={teamStyles.cardHeader}>
            <div className={teamStyles.identity}>
              <div className={teamStyles.avatar} aria-hidden="true">{person.initials}</div>
              <div><p className={teamStyles.role}>{person.role}</p><h2>{person.name}</h2></div>
            </div>
            <span className={person.active?teamStyles.activeStatus:teamStyles.inactiveStatus}>{person.active?"Active":"Inactive"}</span>
          </header>
          <div className={teamStyles.details}>
            <div><span>Next 4 weeks</span><strong>{upcomingHours.toFixed(upcomingHours % 1 ? 1 : 0)}h</strong></div>
            <div><span>Contact</span><strong>{person.email||person.status}</strong></div>
          </div>
          <div className={teamStyles.portalRow}><span className={teamStyles.indicator} data-state={person.portalStatus}/><span>{portalLabel}</span></div>
          <footer className={teamStyles.actions}>
            <button className={teamStyles.outlineButton} onClick={() => onEdit(person)}>Edit</button>
            <button className={teamStyles.filledButton} disabled={devMode||!person.email||person.portalStatus==="ACTIVE"} onClick={()=>onInvite(person)}>{person.portalStatus==="INVITED"?"Resend":"Invite"}</button>
            {person.portalStatus==="INVITED"&&<button className={teamStyles.outlineButton} disabled={devMode} onClick={()=>onRevoke(person)}>Revoke</button>}
          </footer>
          {devMode&&<small className={teamStyles.note}>Connect PostgreSQL to create real employee logins.</small>}
        </article>
      })}
      {!visibleEmployees.length&&<div className={teamStyles.empty}>No employees match the current search and filters.</div>}
    </section>
  </div>
}


const defaultClockSettings: ClockSettings = { allowMobileClock:true, allowKioskClock:true, allowUnscheduledClock:false, requireLocationCheck:false, earlyClockInMinutes:15, lateClockOutMinutes:60, roundingMinutes:0, autoApproveWithinMinutes:"" };
function SettingsWorkspace({ locations, selectedLocationId, userRole, devMode, notify }: { locations: Location[]; selectedLocationId: string; userRole: string; devMode: boolean; notify: (message:string)=>void }) {
  const [section, setSection] = useState<"general"|"time"|"security">("time");
  const [clock, setClock] = useState<ClockSettings>(defaultClockSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const canManage = ["OWNER","ADMIN","MANAGER"].includes(userRole);
  const location = locations.find(item => item.id === selectedLocationId);
  useEffect(() => {
    if (devMode || !selectedLocationId || section !== "time") return;
    setLoading(true);
    fetch(`/api/settings/time-clock?locationId=${encodeURIComponent(selectedLocationId)}`, { cache:"no-store" })
      .then(async response => { const data=await response.json(); if(!response.ok) throw new Error(data.error||"Could not load settings"); return data; })
      .then(data => setClock({
        allowMobileClock:Boolean(data.allow_mobile_clock), allowKioskClock:Boolean(data.allow_kiosk_clock),
        allowUnscheduledClock:Boolean(data.allow_unscheduled_clock), requireLocationCheck:Boolean(data.require_location_check),
        earlyClockInMinutes:Number(data.early_clock_in_minutes||0), lateClockOutMinutes:Number(data.late_clock_out_minutes||0),
        roundingMinutes:Number(data.rounding_minutes||0), autoApproveWithinMinutes:data.auto_approve_within_minutes ?? ""
      }))
      .catch(error => notify(error.message || "Could not load settings"))
      .finally(() => setLoading(false));
  }, [devMode, selectedLocationId, section]);
  async function saveClock() {
    if (devMode) { notify("Development settings saved for this session"); return; }
    if (!selectedLocationId) { notify("Select a location first"); return; }
    setSaving(true);
    try {
      const response=await fetch("/api/settings/time-clock", { method:"PUT", headers:{"content-type":"application/json"}, body:JSON.stringify({ locationId:selectedLocationId, ...clock }) });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||"Could not save settings");
      notify("Time clock settings saved");
    } catch(error) { notify(error instanceof Error ? error.message : "Could not save settings"); }
    finally { setSaving(false); }
  }
  return <div className={`${settingsStyles.workspace} page-flow`}>
    <div className={settingsStyles.header}><PageHeader eyebrow="Workspace configuration" title="Settings" /></div>
    <div className={settingsStyles.layout}>
      <nav className={settingsStyles.nav} aria-label="Settings sections">
        <button className={section==="general"?"active":""} onClick={()=>setSection("general")}>Organization</button>
        <button className={section==="time"?"active":""} onClick={()=>setSection("time")}>Time clock</button>
        <button className={section==="security"?"active":""} onClick={()=>setSection("security")}>Security</button>
      </nav>
      <section className={`panel ${settingsStyles.panel}`}>
        {section==="general" && <><PanelTitle title="Organization & location" subtitle="The active workspace context used by scheduling, inventory and attendance."/><div className={settingsStyles.summary}><div><span>Current location</span><strong>{location?.name || "No active location"}</strong></div><div><span>Available locations</span><strong>{locations.length}</strong></div><div><span>Your role</span><strong>{userRole.replaceAll("_"," ")}</strong></div></div><p className={settingsStyles.help}>Location creation and organization identity editing are staged for a later administration release. Switch location from the top bar.</p></>}
        {section==="time" && <><PanelTitle title="Time clock" subtitle="Control mobile and kiosk attendance for the selected location."/>{loading?<div className={settingsStyles.loading}>Loading settings…</div>:<div className={settingsStyles.form}>
          <label className={settingsStyles.toggle}><span><strong>Mobile clock-in</strong><small>Allow linked employees to clock in from their portal.</small></span><input type="checkbox" checked={clock.allowMobileClock} onChange={e=>setClock({...clock,allowMobileClock:e.target.checked})}/></label>
          <label className={settingsStyles.toggle}><span><strong>Kiosk clock-in</strong><small>Allow PIN-based clocking from a shared device.</small></span><input type="checkbox" checked={clock.allowKioskClock} onChange={e=>setClock({...clock,allowKioskClock:e.target.checked})}/></label>
          <label className={settingsStyles.toggle}><span><strong>Unscheduled clock-in</strong><small>Permit clock-in when no nearby published shift exists.</small></span><input type="checkbox" checked={clock.allowUnscheduledClock} onChange={e=>setClock({...clock,allowUnscheduledClock:e.target.checked})}/></label>
          <label className={settingsStyles.toggle}><span><strong>Require location check</strong><small>Require location verification when geofencing is configured.</small></span><input type="checkbox" checked={clock.requireLocationCheck} onChange={e=>setClock({...clock,requireLocationCheck:e.target.checked})}/></label>
          <div className={settingsStyles.fields}><label>Early clock-in window<input type="number" min="0" max="240" value={clock.earlyClockInMinutes} onChange={e=>setClock({...clock,earlyClockInMinutes:Number(e.target.value)})}/><small>Minutes before the shift</small></label><label>Missed clock-out threshold<input type="number" min="0" max="720" value={clock.lateClockOutMinutes} onChange={e=>setClock({...clock,lateClockOutMinutes:Number(e.target.value)})}/><small>Minutes after scheduled end</small></label><label>Rounding<select value={clock.roundingMinutes} onChange={e=>setClock({...clock,roundingMinutes:Number(e.target.value)})}><option value="0">No rounding</option><option value="5">5 minutes</option><option value="6">6 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label><label>Auto-approval tolerance<input type="number" min="0" max="240" value={clock.autoApproveWithinMinutes} onChange={e=>setClock({...clock,autoApproveWithinMinutes:e.target.value===""?"":Number(e.target.value)})}/><small>Leave blank for manager approval</small></label></div>
          <div className={settingsStyles.actions}><button className="primary" disabled={!canManage||saving} onClick={saveClock}><Save size={17}/>{saving?"Saving…":"Save settings"}</button><a className="secondary settings-link" href="/employee/hours"><Clock3 size={17}/>Open my time clock</a>{!canManage&&<small>Owner, Admin or Manager permission is required to change settings.</small>}</div>
        </div>}</>}
        {section==="security" && <><PanelTitle title="Security & data" subtitle="Current production safeguards and administration status."/><div className={settingsStyles.summary}><div><span>Authentication</span><strong>Database sessions</strong></div><div><span>Audit trail</span><strong>Enabled</strong></div><div><span>GDPR requests</span><strong>Foundation ready</strong></div></div><p className={settingsStyles.help}>MFA enrollment, password-reset delivery, session revocation and managed backups remain in the production roadmap.</p></>}
      </section>
    </div>
  </div>;
}

function ControlCenter({devMode,databaseStatus,notify}:{devMode:boolean;databaseStatus:string;notify:(s:string)=>void}) {
 const groups=[
  {title:"Database & payroll",icon:Database,items:["All manager modules use tenant-scoped PostgreSQL APIs","Permanent payroll export ledger with SHA-256 hashes","Open, locked, exported and closed payroll periods","Payroll IDs, salary codes and cost centres"]},
  {title:"Attendance controls",icon:KeyRound,items:["Kiosk PIN verification and lockout","Venue geofence radius validation","Late, missed clock-out and geofence alerts","Employee timesheet correction requests"]},
  {title:"Scheduling",icon:CalendarDays,items:["Drag shifts between dates","Occurrence, future and whole-series editing","Reusable schedule templates","Availability, leave and overlap conflict checks","Labour revenue forecasts","Publish notifications and acknowledgements"]},
  {title:"Stock operations",icon:ReceiptText,items:["Delivery receiving and partial/disputed receipts","Invoice number, total and discrepancy matching","Waste logs with stock ledger entries","Draft, in-transit and received location transfers"]},
  {title:"Security & compliance",icon:ShieldCheck,items:["MFA factor foundation and recovery records","Password-reset tokens and rate limiting","Managed backup/restore runbook and health events","GDPR export, deletion and rectification requests"]}
 ];
 return <><PageHeader title="Control centre" subtitle="Production controls plus development-data tools for realistic testing before database setup." action={<span className={`connection-pill ${devMode?"dev":"live"}`}>{databaseStatus}</span>}/>{devMode&&<section className="panel dev-data-tools"><PanelTitle title="Development data" subtitle="Your workspace is saved in this browser. Export a backup or reset to the original demo data."/><div><button className="secondary" onClick={()=>{const raw=localStorage.getItem("barops-dev-v0101") || localStorage.getItem("barops-dev-v091") || localStorage.getItem("barops-dev-v070")||"{}";const blob=new Blob([raw],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="bar-ops-development-data.json";a.click();URL.revokeObjectURL(url);notify("Development data exported")}}><DownloadCloud size={17}/>Export JSON</button><label className="secondary file-import"><Upload size={17}/>Import JSON<input type="file" accept="application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{JSON.parse(await file.text());localStorage.setItem("barops-dev-v0101",await file.text());location.reload()}catch{notify("That file is not valid Bar Ops JSON")}}}/></label><button className="secondary danger-outline" onClick={()=>{if(confirm("Reset all development data to the original demo workspace?")){localStorage.removeItem("barops-dev-v0101"); localStorage.removeItem("barops-dev-v091"); localStorage.removeItem("barops-dev-v070");location.reload()}}}><RotateCcw size={17}/>Reset demo data</button></div></section>}<div className="control-grid">{groups.map(g=>{const Icon=g.icon;return <section className="panel control-card" key={g.title}><div className="control-icon"><Icon size={20}/></div><h2>{g.title}</h2>{g.items.map(i=><p key={i}><Check size={15}/>{i}</p>)}</section>})}</div><section className="panel control-actions"><PanelTitle title="Production status" subtitle="Only workflows connected to a complete manager interface are presented as operational. Backend foundations remain documented in Implementation status."/><p className="settings-note">Use Time & attendance for payroll and clock review, Inventory for product and stock controls, and Settings for location time-clock configuration.</p></section></>;
}

function ShiftDialog({ onClose, onSave, currentWeekOffset, initialDate, employees, locations, selectedLocationId }: { onClose: () => void; onSave: (shifts: Shift[]) => void; currentWeekOffset: number; initialDate?: string; employees: Employee[]; locations: Location[]; selectedLocationId: string }) {
  const [assignment, setAssignment] = useState<"employee" | "open">("employee");
  const [locationId, setLocationId] = useState(selectedLocationId);
  const activeEmployees = employees.filter((person) => person.active);
  const [employee, setEmployee] = useState(activeEmployees[0]?.name ?? ""); const [shiftDate, setShiftDate] = useState(initialDate || dateFromShift(currentWeekOffset, 0)); const [role, setRole] = useState<ShiftRole>("Bartender"); const [start, setStart] = useState("17:00"); const [end, setEnd] = useState("01:00");
  const [repeat, setRepeat] = useState(false); const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly"); const [count, setCount] = useState(4); const [weekdays, setWeekdays] = useState<number[]>([shiftPositionFromDate(initialDate || dateFromShift(currentWeekOffset, 0)).day]);
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function save() {
    if (!locationId) { alert("No active location is configured. Add or activate a location before creating shifts."); return; }
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
    onSave(uniqueOccurrences.map((occurrence, index) => ({ id: crypto.randomUUID(), date: dateFromShift(occurrence.weekOffset, occurrence.day), day: occurrence.day, weekOffset: occurrence.weekOffset, employee: name, initials, start, end, role, status: "Draft", isOpen: assignment === "open", recurrenceLabel: label, recurrenceGroupId, locationId })));
  }
  return <Modal title="Add shift" subtitle="Create one shift or a repeating series." className="shift-editor-dialog" onClose={onClose}>
    <div className="shift-editor-body">
      {locations.length > 1 && <label className="location-field">Location<select value={locationId} onChange={event=>setLocationId(event.target.value)}>{locations.map(location=><option key={location.id} value={location.id}>{location.name}</option>)}</select></label>}
      <div className="assignment-toggle"><button type="button" aria-pressed={assignment === "employee"} className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" aria-pressed={assignment === "open"} className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
      <div className="form-grid shift-dialog-fields">
        {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{activeEmployees.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>}
        {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>A manager approves the employee who receives it.</span></div></div>}
        <label className="full-field shift-date-field">Shift date<input type="date" value={shiftDate} onChange={(e) => { setShiftDate(e.target.value); setWeekdays([shiftPositionFromDate(e.target.value).day]); }} /></label>
        <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
        <label className="shift-time-field">Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label className="shift-time-field">Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
      </div>
      <label className="repeat-switch"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)}/><span><strong>Repeat shift</strong><small>Create a daily or weekly series</small></span></label>
      {repeat && <div className="repeat-panel"><div className="frequency-toggle"><button type="button" aria-pressed={frequency === "daily"} className={frequency === "daily" ? "selected" : ""} onClick={() => setFrequency("daily")}>Daily</button><button type="button" aria-pressed={frequency === "weekly"} className={frequency === "weekly" ? "selected" : ""} onClick={() => setFrequency("weekly")}>Weekly</button></div>
        {frequency === "weekly" && <div className="weekday-picker">{weekdayNames.map((name, index) => <button type="button" key={name} aria-pressed={weekdays.includes(index)} className={weekdays.includes(index) ? "selected" : ""} onClick={() => setWeekdays((current) => current.includes(index) ? current.filter((d) => d !== index) : [...current, index].sort())}>{name}</button>)}</div>}
        <label className="repeat-count">Repeat for <input type="number" min="1" max={frequency === "daily" ? 31 : 52} value={count} onChange={(e) => setCount(Number(e.target.value))}/><span>{frequency === "daily" ? "days" : "weeks"}</span></label>
      </div>}
    </div>
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
  const conflictLabel = shift.availabilityConflict === "APPROVED_TIME_OFF" ? "This employee has approved time off during the shift." : shift.availabilityConflict === "OUTSIDE_AVAILABILITY" ? "This shift is outside the employee’s saved availability." : null;
  return <Modal title="Edit shift" subtitle="Update this shift occurrence, its assignment or availability." className="shift-editor-dialog" onClose={onClose}>
    <div className="shift-editor-body">
      {conflictLabel ? <div className="open-shift-note full-field"><AlertTriangle size={18}/><div><strong>Availability conflict</strong><span>{conflictLabel} Reassign the shift, adjust the time, or make it available.</span></div></div> : null}
      <div className="assignment-toggle"><button type="button" aria-pressed={assignment === "employee"} className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" aria-pressed={assignment === "open"} className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>{shift.availabilityConflict ? "Make available" : "Available shift"}</button></div>
      <div className="form-grid shift-dialog-fields">
        {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{activeEmployees.map((person) => <option key={person.name}>{person.name}</option>)}</select></label>}
        {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>The current employee is removed. A manager approves the employee who receives it.</span></div></div>}
        <label className="full-field shift-date-field">Shift date<input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} /></label>
        <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
        <label className="shift-time-field">Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label className="shift-time-field">Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
        <label className="full-field">Schedule status<select value={status} onChange={(e) => setStatus(e.target.value as "Draft" | "Published")}><option>Draft</option><option>Published</option></select></label>
      </div>
      {shift.recurrenceGroupId && <div className="series-edit-note"><CalendarDays size={17}/><div><strong>Apply changes to</strong><span>Choose whether this edit affects one occurrence or the wider repeating series.</span><select value={scope} onChange={(e)=>setScope(e.target.value as "occurrence"|"future"|"series")}><option value="occurrence">This shift only</option><option value="future">This and future shifts</option><option value="series">Entire series</option></select></div></div>}
    </div>
    <div className="edit-shift-actions"><button type="button" className="danger-button" onClick={onDelete}>Delete shift</button><div><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={save}>Save changes</button></div></div>
  </Modal>
}

function TimesheetDialog({ entry, onClose, onSave }: { entry: TimeEntry; onClose:()=>void; onSave:(entry:TimeEntry)=>void }) {
  const [clockIn,setClockIn]=useState(entry.clockIn); const [clockOut,setClockOut]=useState(entry.clockOut||""); const [breakMinutes,setBreakMinutes]=useState(entry.breakMinutes); const [note,setNote]=useState(entry.note||"");
  return <Modal title="Correct timesheet" subtitle="All manager corrections return the record to pending review. Add a reason for the audit trail." onClose={onClose}><div className="form-grid"><label>Clock in<input type="time" value={clockIn} onChange={e=>setClockIn(e.target.value)}/></label><label>Clock out<input type="time" value={clockOut} onChange={e=>setClockOut(e.target.value)}/></label><label>Break minutes<input type="number" min="0" step="5" value={breakMinutes} onChange={e=>setBreakMinutes(Number(e.target.value))}/></label><label className="full-field">Correction reason<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Required, e.g. employee forgot to clock out"/></label></div><ModalActions onClose={onClose} onSave={()=>{if(!note.trim()){alert("Add a correction reason");return;}onSave({...entry,clockIn,clockOut:clockOut||undefined,breakMinutes,status:"Pending",note:note.trim(),edited:true})}} label="Save correction"/></Modal>
}

function EmployeeDialog({ employee, locations, defaultLocationId, onClose, onSave }: { employee?: Employee; locations: Location[]; defaultLocationId?: string; onClose: () => void; onSave: (employee: Employee) => void | Promise<void> }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "Bartender");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [locationId, setLocationId] = useState(employee?.locationId ?? defaultLocationId ?? locations[0]?.id ?? "");
  const [active, setActive] = useState(employee?.active ?? true); const [hourlyRate,setHourlyRate]=useState(employee?.hourlyRate??0); const [payrollId,setPayrollId]=useState(employee?.payrollId??""); const [salaryCode,setSalaryCode]=useState(employee?.salaryCode??""); const [costCentre,setCostCentre]=useState(employee?.costCentre??"");
  function save() { const cleanName = name.trim() || "New employee"; if (!locationId && employee?.portalStatus === "ACTIVE") { alert("Portal-enabled employees must have an assigned location."); return; } onSave({ name: cleanName, initials: cleanName.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase(), role, email, phone, locationId, active, hours: employee?.hours ?? 0, status: active ? "No shifts scheduled" : "Inactive", hourlyRate, payrollId, salaryCode, costCentre, portalStatus: employee?.portalStatus }); }
  return <Modal title={employee ? "Edit employee" : "Add employee"} className="employee-dialog" onClose={onClose}><div className="form-grid"><label className="full-field">Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" /></label><label>Role<select value={role} onChange={(e) => setRole(e.target.value)}><option>General manager</option><option>Bar manager</option><option>Shift manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label><label>Status<select value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="full-field">Primary location<select value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">No location assigned</option>{locations.map((location)=><option key={location.id} value={location.id}>{location.name}</option>)}</select>{!locations.length&&<small className="muted-note">Add an active location before enabling employee clock-in.</small>}</label><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label><label>Phone<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+45 ..." /></label><label>Hourly pay (DKK)<input type="number" min="0" step="0.01" inputMode="decimal" value={hourlyRate} onChange={e=>setHourlyRate(Number(e.target.value))} /></label><label>Payroll ID<input value={payrollId} onChange={e=>setPayrollId(e.target.value)} /></label><label>Salary code<input value={salaryCode} onChange={e=>setSalaryCode(e.target.value)} /></label><label className="full-field">Cost centre<input value={costCentre} onChange={e=>setCostCentre(e.target.value)} /></label></div><ModalActions onClose={onClose} onSave={save} label={employee ? "Save employee" : "Add employee"} /></Modal>
}

function ProductDialog({ product, onClose, onSave }: { product?:Product; onClose: () => void; onSave: (product: Product) => void }) {
 const [name,setName]=useState(product?.name??""); const [supplier,setSupplier]=useState(product?.supplier??"Nordic Drinks"); const [category,setCategory]=useState(product?.category??"Draught beer"); const [stock,setStock]=useState(product?.stock??0); const [par,setPar]=useState(product?.par??6); const [reorderLevel,setReorderLevel]=useState(product?.reorderLevel??4); const [unit,setUnit]=useState(product?.unit??"units"); const [price,setPrice]=useState(product?.price??0); const [sellingPrice,setSellingPrice]=useState(product?.sellingPrice??0); const [sku,setSku]=useState(product?.sku??""); const [packSize,setPackSize]=useState(product?.packSize??1); const [notes,setNotes]=useState(product?.notes??""); const [active,setActive]=useState(product?.active!==false);
 function save(){if(!name.trim()){alert("Add a product name");return;}onSave({id:product?.id??crypto.randomUUID(),name:name.trim(),supplier,category,stock:Math.max(0,stock),par:Math.max(0,par),reorderLevel:Math.max(0,reorderLevel),unit,price:Math.max(0,price),sellingPrice:Math.max(0,sellingPrice),sku:sku.trim(),packSize:Math.max(1,packSize),notes:notes.trim(),active});}
 return <Modal title={product?"Edit product":"Add product"} subtitle="Maintain purchasing, pricing and location stock settings." onClose={onClose}><div className="form-grid product-form"><label className="full-field">Product name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Lager 30L"/></label><label>Supplier<select value={supplier} onChange={e=>setSupplier(e.target.value)}><option>Nordic Drinks</option><option>Vin & Co.</option><option>Bar Supply DK</option><option>City Produce</option></select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Draught beer</option><option>Wine</option><option>Spirits</option><option>Soft drinks</option><option>Fresh</option><option>Consumables</option></select></label><label>Supplier SKU<input value={sku} onChange={e=>setSku(e.target.value)} placeholder="Optional"/></label><label>Unit<select value={unit} onChange={e=>setUnit(e.target.value)}><option>units</option><option>kegs</option><option>bottles</option><option>cases</option><option>pieces</option><option>kg</option><option>litres</option></select></label><label>Pack size<input type="number" min="1" value={packSize} onChange={e=>setPackSize(Number(e.target.value))}/></label><label>Current stock<input type="number" min="0" value={stock} onChange={e=>setStock(Number(e.target.value))}/></label><label>Par level<input type="number" min="0" value={par} onChange={e=>setPar(Number(e.target.value))}/></label><label>Reorder level<input type="number" min="0" value={reorderLevel} onChange={e=>setReorderLevel(Number(e.target.value))}/></label><label>Purchase price (DKK)<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(Number(e.target.value))}/></label><label>Selling price (DKK)<input type="number" min="0" step="0.01" value={sellingPrice} onChange={e=>setSellingPrice(Number(e.target.value))}/></label><label>Status<select value={active?"active":"inactive"} onChange={e=>setActive(e.target.value==="active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="full-field">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Storage, ordering or handling notes"/></label></div><ModalActions onClose={onClose} onSave={save} label={product?"Save product":"Add product"}/></Modal>
}
function StockCountDialog({products,onClose,onSave}:{products:Product[];onClose:()=>void;onSave:(counts:Record<string,number>)=>void}){
 const [counts,setCounts]=useState<Record<string,number>>(()=>Object.fromEntries(products.filter(p=>p.active!==false).map(p=>[p.id,p.stock]))); const [showExpected,setShowExpected]=useState(false); const variances=products.filter(p=>p.active!==false).map(p=>({p,variance:(counts[p.id]??0)-p.stock}));
 return <Modal title="Stock count" subtitle="Enter actual quantities, review variance, then approve the count." onClose={onClose}><div className="count-toolbar"><label><input type="checkbox" checked={showExpected} onChange={e=>setShowExpected(e.target.checked)}/> Show expected stock</label><strong>{variances.filter(x=>x.variance!==0).length} variances</strong></div><div className="stock-count-list">{variances.map(({p,variance})=><label key={p.id}><span><b>{p.name}</b><small>{p.category} · {p.unit}{showExpected?` · expected ${p.stock}`:""}</small></span><input type="number" min="0" value={counts[p.id]??0} onChange={e=>setCounts(cur=>({...cur,[p.id]:Number(e.target.value)}))}/><i className={variance===0?"count-ok":variance>0?"count-over":"count-short"}>{variance===0?"Match":`${variance>0?"+":""}${variance}`}</i></label>)}</div><ModalActions onClose={onClose} onSave={()=>onSave(counts)} label="Approve stock count"/></Modal>
}
function OrderDialog({ onClose, onSave }: { onClose: () => void; onSave: () => void }) { return <Modal title="Create purchase order" subtitle="Choose a supplier to begin an order." onClose={onClose}><div className="supplier-options">{["Nordic Drinks", "Vin & Co.", "Bar Supply DK", "City Produce"].map((supplier, i) => <label key={supplier}><input type="radio" name="supplier" defaultChecked={i === 0} /><span className="attention-icon blue"><Truck size={18} /></span><b>{supplier}</b><ChevronRight size={17} /></label>)}</div><ModalActions onClose={onClose} onSave={onSave} label="Continue" /></Modal> }
function Modal({ title, subtitle, onClose, children, className = "" }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; className?: string }) {
  return <Dialog title={title} description={subtitle} className={className} onClose={onClose}>{children}</Dialog>;
}
function ModalActions({ onClose, onSave, label }: { onClose: () => void; onSave: () => void; label: string }) { return <DialogActions onClose={onClose} onConfirm={onSave} confirmLabel={label}/> }
function money(value: number) { return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(value); }
