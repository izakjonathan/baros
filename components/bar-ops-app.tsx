"use client";
import { Dialog, DialogActions } from "./ui/interaction-ui";
import { WorkspaceHeader } from "./ui/workspace-ui";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Coffee, LayoutDashboard, Menu, Package, Plus,
  Search, Settings, ShoppingCart, Sparkles, Users, X, AlertTriangle, Truck, MoreHorizontal,
  Copy, Send, Boxes, Wine, UserRoundPlus, Timer, Play, Square, Activity, FileCheck2, FileDown, CheckCheck, RotateCcw, Ban, Pencil, ShieldAlert, History, DownloadCloud, LockKeyhole, UnlockKeyhole, Database, KeyRound, MapPin, FileArchive, ShieldCheck, ReceiptText, Trash2, ArrowLeftRight, TrendingUp, NotebookPen, Wrench, Save, Upload, Undo2, CheckCircle2, LogOut
} from "lucide-react";
import { days, initialProducts, initialShifts, orders, team, type NavKey, type Product, type Shift, type ShiftRole } from "@/lib/data";
import type { ClockSettings, Employee, Location, LogEntry, OpsTask, ScheduleAcknowledgementSummary, ShiftNote, StockAdjustment, TimeEntry } from "@/features/workspace/types";
import { parseEmployeeInvitationMutationResponse, parseInvitationRecords, parseManagerBootstrapResponse } from "@/features/workspace/bootstrap-contract";
import { BASE_MONDAY, canonicalShiftDate, conflictIds, dateFromSerial, dateFromShift, dateSerial, hoursBetween, isOvernight, mapDatabaseShift, shiftPositionFromDate, toIsoDate, type DatabaseShiftRecord } from "@/features/workspace/schedule-utils";
import { RequestsWorkspace } from "@/components/requests-workspace";
import { DashboardWorkspace, ShiftExecutionWorkspace } from "@/features/dashboard/manager-overview";
import { ScheduleWorkspace } from "@/features/scheduling/ScheduleWorkspace";
import { AttendanceWorkspace } from "@/features/attendance/AttendanceWorkspace";
import { InventoryWorkspace } from "@/features/inventory/InventoryWorkspace";
import { OrdersWorkspace } from "@/features/orders/OrdersWorkspace";
import { DailyOperationsWorkspace } from "@/features/operations/DailyOperationsWorkspace";
import { TeamWorkspace } from "@/features/employees/TeamWorkspace";
import { SettingsWorkspace } from "@/features/settings/SettingsWorkspace";
import { ControlCenterWorkspace } from "@/features/control/ControlCenterWorkspace";
import { WorkspaceSidebar, WorkspaceTopbar } from "@/components/shell/workspace-chrome";
import scheduleStyles from "@/features/scheduling/ScheduleWorkspace.module.css";
import { parseOperationChecklistRecords } from "@/features/operations/types";
import { attendanceStyles, dashboardStyles, executionStyles, inventoryStyles, operationsStyles, orderStyles, overviewStyles, settingsStyles, surfaceStyles, teamStyles } from "@/lib/ui-classes";
import { hasCapability, type Capability } from "@/lib/auth/capabilities";
import type { AppRole } from "@/lib/auth/session";

type ManagerNavItem = { id: NavKey; label: string; icon: typeof LayoutDashboard; capability: Capability };

const navItems: ManagerNavItem[] = [
  { id: "dashboard", label: "Today’s operations", icon: LayoutDashboard, capability: "operations.read" },
  { id: "execution", label: "Shift execution", icon: Activity, capability: "operations.manage" },
  { id: "schedule", label: "Shift plan", icon: CalendarDays, capability: "schedule.read" },
  { id: "attendance", label: "Time & attendance", icon: Timer, capability: "attendance.read" },
  { id: "inventory", label: "Inventory", icon: Package, capability: "inventory.read" },
  { id: "orders", label: "Orders", icon: ShoppingCart, capability: "orders.manage" },
  { id: "operations", label: "Daily operations", icon: NotebookPen, capability: "operations.manage" },
  { id: "team", label: "Team", icon: Users, capability: "team.read" },
  { id: "requests", label: "Requests", icon: ClipboardList, capability: "requests.review" },
  { id: "control", label: "Control centre", icon: Settings, capability: "control.read" },
];

export function BarOpsApp({ userName, userRole, devMode }: { userName: string; userRole: AppRole; devMode: boolean }) {
  const availableNavItems = navItems.filter((item) => hasCapability(userRole, item.capability));
  const canManageTeam = hasCapability(userRole, "team.manage");
  const canManagePayroll = hasCapability(userRole, "payroll.manage");
  const canExportPayroll = hasCapability(userRole, "payroll.export");
  const [active, setActive] = useState<NavKey>("dashboard");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("workspace") === "requests") setActive("requests"); }, []);
  const [locations, setLocations] = useState<Location[]>(devMode ? [{ id: "dev-temple", name: "Temple Bar" }] : []);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(devMode ? "dev-temple" : "");
  const [mobileNav, setMobileNav] = useState(false);
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
      const data = parseManagerBootstrapResponse(await response.json());
      const availableLocations: Location[] = data.locations || [];
      setLocations(availableLocations);
      const resolvedLocationId = data.selectedLocationId || availableLocations[0]?.id || "";
      if (resolvedLocationId && resolvedLocationId !== selectedLocationId) setSelectedLocationId(resolvedLocationId);
      setEmployees(data.employees.map((e) => ({ id:e.id, name:`${e.first_name} ${e.last_name}`, initials:`${e.first_name?.[0]||""}${e.last_name?.[0]||""}`, role:e.employment_title||"Employee", hours:Number(e.contracted_hours||0), status:e.active?"Active":"Inactive", active:e.active, email:e.email||"", phone:e.phone||"", payrollId:e.payroll_id||"", salaryCode:e.salary_code||"", costCentre:e.cost_centre||"", hourlyRate:Number(e.hourly_rate||0), locationId:(e.locations||[]).find((location)=>location.primary)?.id||(e.locations||[])[0]?.id||"", locations:e.locations||[], portalStatus:e.portal_status||"NONE" })));
      setShifts(data.shifts.map((shift: DatabaseShiftRecord) => mapDatabaseShift(shift)));
      setProducts(data.products.map((x)=>({id:x.id,name:x.name,category:x.category,supplier:x.supplier||"Unassigned",stock:Number(x.quantity||0),par:Number(x.par_level||0),unit:x.unit,price:Number(x.purchase_price||0)})));
      setTimeEntries(data.timesheets.map((x)=>({id:x.id,employee:x.employee_name,date:String(x.work_date).slice(0,10),clockIn:String(x.clocked_in_at).slice(11,16),clockOut:x.clocked_out_at?String(x.clocked_out_at).slice(11,16):undefined,breakMinutes:x.break_minutes,status:(x.status==="OPEN"?"Running":x.status[0]+x.status.slice(1).toLowerCase()) as TimeEntry["status"],scheduledHours:Number(x.scheduled_minutes||0)/60,note:x.manager_note ?? undefined,onBreak:Boolean(x.on_break),breakStartedAt:x.open_break_started_at?String(x.open_break_started_at):null})));
      setShiftNotes(data.shiftNotes.map((n)=>({id:n.id,shiftId:n.shift_id,note:n.note,category:n.category,createdAt:String(n.created_at),author:n.author_name,role:n.role,startsAt:String(n.starts_at)})));
      setDatabaseStatus(resolvedLocationId ? "PostgreSQL connected" : "No active location configured");
      hasBootstrappedRef.current = true;
      setDataReady(true);
      fetch("/api/employee-invitations",{cache:"no-store"}).then(async r=>r.ok?parseInvitationRecords(await r.json()):[]).then((rows)=>setEmployees(current=>current.map(item=>({...item,portalStatus:(rows.find(row=>row.employee_id===item.id)?.portal_status||item.portalStatus||"NONE")})))).catch(()=>{});
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
    return <div className="workspace-loading" role="status" aria-live="polite"><div className="card card-compact shared-state-card workspace-loading-card"><Database size={26}/><strong>Loading workspace</strong><span>Synchronizing shifts, employees and operations with PostgreSQL…</span></div></div>;
  }

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar items={availableNavItems} active={active} onChange={(value) => { setActive(value); setMobileNav(false); }} open={mobileNav} onClose={() => setMobileNav(false)} userName={userName} userRole={userRole} devMode={devMode} />
      <main id="main-content" className="main-shell" tabIndex={-1}>
        <Topbar items={availableNavItems} active={active} onMenu={() => setMobileNav(true)} locations={locations} selectedLocationId={selectedLocationId} onLocationChange={setSelectedLocationId} onNavigate={setActive} />
        <div className="page-wrap" data-workspace={active}>
          <div className="workspace-flow">
          {active === "dashboard" && <DashboardWorkspace shifts={shifts} products={products} employees={employees} timeEntries={timeEntries} tasks={opsTasks} shiftNotes={shiftNotes} devMode={devMode} onNavigate={setActive} />}
          {active === "execution" && <ShiftExecutionWorkspace shifts={shifts} entries={timeEntries} notes={shiftNotes} onNavigate={setActive} />}
          {active === "schedule" && <ScheduleWorkspace shifts={shifts} setShifts={setShifts} employees={employees} onNewShift={openShiftDialog} onEditShift={setEditingShift} notify={notify} currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
          {active === "attendance" && <AttendanceWorkspace employees={employees} shifts={shifts} entries={timeEntries} setEntries={setTimeEntries} notify={notify} onEdit={setEditingTimeEntry} devMode={devMode} persist={persist} canManagePayroll={canManagePayroll} canExportPayroll={canExportPayroll} />}
          {active === "inventory" && <InventoryWorkspace products={products} setProducts={setProducts} onNewProduct={() => setDialog("product")} onEditProduct={setEditingProduct} onStockCount={() => setDialog("stockCount")} adjustments={stockAdjustments} setAdjustments={setStockAdjustments} notify={notify} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
          {active === "orders" && <OrdersWorkspace products={products} setProducts={setProducts} onNewOrder={() => setDialog("order")} notify={notify} />}
          {active === "operations" && <DailyOperationsWorkspace tasks={opsTasks} setTasks={setOpsTasks} logs={logEntries} setLogs={setLogEntries} notify={notify} devMode={devMode} locationId={selectedLocationId} />}
          {active === "team" && (
            <Team
              employees={employees}
              shifts={shifts}
              devMode={devMode}
              canManage={canManageTeam}
              onAdd={() => setDialog("employee")}
              onEdit={setEditingEmployee}
              onInvite={async (employee) => {
                if (!employee.id) { notify("Save and reload the employee before inviting"); return; }
                try {
                  const response = await fetch("/api/employee-invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ employeeId: employee.id, action: employee.portalStatus === "INVITED" ? "resend" : "invite" }) });
                  const data = parseEmployeeInvitationMutationResponse(await response.json());
                  if (!response.ok) throw new Error(data.error || "Could not create invitation");
                  if (!data.activationUrl) throw new Error("Invitation response did not include an activation link");
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
                  const data = parseEmployeeInvitationMutationResponse(await response.json());
                  if (!response.ok) throw new Error(data.error || "Could not revoke invitation");
                  setEmployees(current => current.map(item => item.id === employee.id ? { ...item, portalStatus: "NONE" } : item));
                  notify("Invitation revoked");
                } catch (error) { notify(error instanceof Error ? error.message : "Could not revoke invitation"); }
              }}
            />
          )}
          {active === "requests" && <RequestsWorkspace devMode={devMode} notify={notify} />}
          {active === "control" && <ControlCenterWorkspace devMode={devMode} databaseStatus={databaseStatus} notify={notify} />}
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
      {canManageTeam && editingEmployee && <EmployeeDialog employee={editingEmployee} locations={locations} onClose={() => setEditingEmployee(null)} onSave={async (updated) => { try { const saved=await persist("/api/employees",{method:"PATCH",body:JSON.stringify({...updated,id:editingEmployee.id})}); setEmployees((current) => current.map((item) => item.id === editingEmployee.id ? {...updated,...saved,id:editingEmployee.id} : item)); setEditingEmployee(null); notify("Employee updated"); } catch(error) { notify(error instanceof Error?error.message:"Could not update employee"); } }} />}
      {canManageTeam && dialog === "employee" && <EmployeeDialog locations={locations} defaultLocationId={selectedLocationId} onClose={() => setDialog(null)} onSave={async (employee) => { try { const saved=await persist("/api/employees",{method:"POST",body:JSON.stringify({...employee,locationId:employee.locationId||selectedLocationId})}); setEmployees((current) => [...current, {...employee,id:saved?.id,portalStatus:"NONE"}]); setDialog(null); notify(devMode?"Employee added":"Employee added — you can now invite them to the portal"); } catch(e) { notify(e instanceof Error?e.message:"Could not add employee"); } }} />}
      {dialog === "product" && <ProductDialog onClose={() => setDialog(null)} onSave={async (product) => { try { const saved=await persist("/api/products",{method:"POST",body:JSON.stringify({...product,locationId:selectedLocationId})}); setProducts((current) => [...current, {...product,...saved}]); setDialog(null); notify("Product added to inventory"); } catch(error) { notify(error instanceof Error?error.message:"Could not add product"); } }} />}
      {editingProduct && <ProductDialog product={editingProduct} onClose={() => setEditingProduct(null)} onSave={async (product) => { try { const saved=await persist("/api/products",{method:"PATCH",body:JSON.stringify({...product,locationId:selectedLocationId})}); setProducts(current => current.map(p => p.id === product.id ? {...product,...saved} : p)); setEditingProduct(null); notify("Product updated"); } catch(error) { notify(error instanceof Error?error.message:"Could not update product"); } }} />}
      {dialog === "stockCount" && <StockCountDialog products={products} onClose={() => setDialog(null)} onSave={async (counts) => { try { if (!devMode) { for (const product of products) if (counts[product.id] !== undefined && counts[product.id] !== product.stock) await persist("/api/products", { method:"PATCH", body:JSON.stringify({...product, stock:counts[product.id], locationId:selectedLocationId}) }); } setProducts(current => current.map(p => ({...p,stock:counts[p.id] ?? p.stock}))); setDialog(null); notify("Stock count approved and inventory updated"); } catch(error) { notify(error instanceof Error ? error.message : "Could not save stock count"); } }} />}
      {dialog === "order" && <OrderDialog onClose={() => setDialog(null)} onSave={() => { setDialog(null); notify("Purchase order created"); }} />}
      {toast && <div className="toast" role="status" aria-live="polite" aria-atomic="true"><span aria-hidden="true"><Check size={16} /></span>{toast}</div>}
    </div>
  );
}


function Sidebar({ items, active, onChange, open, onClose, userName, userRole, devMode }: { items: ManagerNavItem[]; active: NavKey; onChange: (id: NavKey) => void; open: boolean; onClose: () => void; userName: string; userRole: AppRole; devMode: boolean }) {
  return <WorkspaceSidebar
    items={items.map(item => ({ ...item, badge: item.id === "inventory" ? 5 : undefined }))}
    active={active}
    onNavigate={(id) => onChange(id as NavKey)}
    open={open}
    onClose={onClose}
    userName={userName}
    userRole={userRole}
    devMode={devMode}
    settingsItem={hasCapability(userRole, "settings.read") ? { id: "settings", label: "Settings", icon: Settings } : undefined}
    locationLabel="Temple Bar"
    onSignOut={async () => {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
      window.location.assign("/login");
    }}
  />;
}

function Topbar({ items, active: _active, onMenu, locations, selectedLocationId, onLocationChange, onNavigate }: { items: ManagerNavItem[]; active: NavKey; onMenu: () => void; locations: Location[]; selectedLocationId: string; onLocationChange: (id: string) => void; onNavigate: (id: NavKey) => void }) {
  return <WorkspaceTopbar
    items={items}
    onMenu={onMenu}
    locations={locations}
    selectedLocationId={selectedLocationId}
    onLocationChange={onLocationChange}
    onNavigate={(id) => onNavigate(id as NavKey)}
    notificationItems={[
      { id: "schedule", label: "Draft schedule", detail: "Review and publish upcoming shifts", icon: CalendarDays },
      { id: "attendance", label: "Timesheet review", detail: "Open time and attendance", icon: Clock3 },
      { id: "requests", label: "Employee requests", detail: "Review leave, open shifts and shift changes", icon: ClipboardList },
      { id: "inventory", label: "Stock attention", detail: "Review products below par", icon: Package },
    ]}
  />;
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <WorkspaceHeader eyebrow={eyebrow} title={title} description={subtitle} actions={action}/>;
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
  return <Modal title="Add shift" subtitle="Create one shift or a repeating series." className={scheduleStyles.shiftEditorDialog} onClose={onClose}>
    <div className={scheduleStyles.shiftEditorBody}>
      {locations.length > 1 && <label className="location-field">Location<select value={locationId} onChange={event=>setLocationId(event.target.value)}>{locations.map(location=><option key={location.id} value={location.id}>{location.name}</option>)}</select></label>}
      <div className={scheduleStyles.assignmentToggle}><button type="button" aria-pressed={assignment === "employee"} className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" aria-pressed={assignment === "open"} className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
      <div className={`${scheduleStyles.shiftDialogFields}`}>
        {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{activeEmployees.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>}
        {assignment === "open" && <div className={scheduleStyles.openShiftNote}><Users size={18}/><div><strong>Employees can request this shift</strong><span>A manager approves the employee who receives it.</span></div></div>}
        <label className={scheduleStyles.shiftDateField}>Shift date<input type="date" value={shiftDate} onChange={(e) => { setShiftDate(e.target.value); setWeekdays([shiftPositionFromDate(e.target.value).day]); }} /></label>
        <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
        <label className={scheduleStyles.shiftTimeField}>Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label className={scheduleStyles.shiftTimeField}>Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
      </div>
      <label className={scheduleStyles.repeatSwitch}><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)}/><span><strong>Repeat shift</strong><small>Create a daily or weekly series</small></span></label>
      {repeat && <div className={scheduleStyles.repeatPanel}><div className={scheduleStyles.frequencyToggle}><button type="button" aria-pressed={frequency === "daily"} className={frequency === "daily" ? "selected" : ""} onClick={() => setFrequency("daily")}>Daily</button><button type="button" aria-pressed={frequency === "weekly"} className={frequency === "weekly" ? "selected" : ""} onClick={() => setFrequency("weekly")}>Weekly</button></div>
        {frequency === "weekly" && <div className={scheduleStyles.weekdayPicker}>{weekdayNames.map((name, index) => <button type="button" key={name} aria-pressed={weekdays.includes(index)} className={weekdays.includes(index) ? "selected" : ""} onClick={() => setWeekdays((current) => current.includes(index) ? current.filter((d) => d !== index) : [...current, index].sort())}>{name}</button>)}</div>}
        <label className={scheduleStyles.repeatCount}>Repeat for <input type="number" min="1" max={frequency === "daily" ? 31 : 52} value={count} onChange={(e) => setCount(Number(e.target.value))}/><span>{frequency === "daily" ? "days" : "weeks"}</span></label>
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
  return <Modal title="Edit shift" subtitle="Update this shift occurrence, its assignment or availability." className={scheduleStyles.shiftEditorDialog} onClose={onClose}>
    <div className={scheduleStyles.shiftEditorBody}>
      {conflictLabel ? <div className={scheduleStyles.openShiftNote}><AlertTriangle size={18}/><div><strong>Availability conflict</strong><span>{conflictLabel} Reassign the shift, adjust the time, or make it available.</span></div></div> : null}
      <div className={scheduleStyles.assignmentToggle}><button type="button" aria-pressed={assignment === "employee"} className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" aria-pressed={assignment === "open"} className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>{shift.availabilityConflict ? "Make available" : "Available shift"}</button></div>
      <div className={`${scheduleStyles.shiftDialogFields}`}>
        {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{activeEmployees.map((person) => <option key={person.name}>{person.name}</option>)}</select></label>}
        {assignment === "open" && <div className={scheduleStyles.openShiftNote}><Users size={18}/><div><strong>Employees can request this shift</strong><span>The current employee is removed. A manager approves the employee who receives it.</span></div></div>}
        <label className={scheduleStyles.shiftDateField}>Shift date<input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} /></label>
        <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
        <label className={scheduleStyles.shiftTimeField}>Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label className={scheduleStyles.shiftTimeField}>Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /><small className="field-help">{isOvernight(start, end) ? "Ends the following day" : "Ends the same day"}</small></label>
        <label className="full-field">Schedule status<select value={status} onChange={(e) => setStatus(e.target.value as "Draft" | "Published")}><option>Draft</option><option>Published</option></select></label>
      </div>
      {shift.recurrenceGroupId && <div className={scheduleStyles.seriesEditNote}><CalendarDays size={17}/><div><strong>Apply changes to</strong><span>Choose whether this edit affects one occurrence or the wider repeating series.</span><select value={scope} onChange={(e)=>setScope(e.target.value as "occurrence"|"future"|"series")}><option value="occurrence">This shift only</option><option value="future">This and future shifts</option><option value="series">Entire series</option></select></div></div>}
    </div>
    <div className={scheduleStyles.editShiftActions}><button type="button" className="danger-button" onClick={onDelete}>Delete shift</button><div><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={save}>Save changes</button></div></div>
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
  return <Modal title={employee ? "Edit employee" : "Add employee"} onClose={onClose}><div className="form-grid"><label className="full-field">Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" /></label><label>Role<select value={role} onChange={(e) => setRole(e.target.value)}><option>General manager</option><option>Bar manager</option><option>Shift manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label><label>Status<select value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="full-field">Primary location<select value={locationId} onChange={(e) => setLocationId(e.target.value)}><option value="">No location assigned</option>{locations.map((location)=><option key={location.id} value={location.id}>{location.name}</option>)}</select>{!locations.length&&<small className="muted-note">Add an active location before enabling employee clock-in.</small>}</label><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label><label>Phone<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+45 ..." /></label><label>Hourly pay (DKK)<input type="number" min="0" step="0.01" inputMode="decimal" value={hourlyRate} onChange={e=>setHourlyRate(Number(e.target.value))} /></label><label>Payroll ID<input value={payrollId} onChange={e=>setPayrollId(e.target.value)} /></label><label>Salary code<input value={salaryCode} onChange={e=>setSalaryCode(e.target.value)} /></label><label className="full-field">Cost centre<input value={costCentre} onChange={e=>setCostCentre(e.target.value)} /></label></div><ModalActions onClose={onClose} onSave={save} label={employee ? "Save employee" : "Add employee"} /></Modal>
}

function ProductDialog({ product, onClose, onSave }: { product?:Product; onClose: () => void; onSave: (product: Product) => void }) {
 const [name,setName]=useState(product?.name??""); const [supplier,setSupplier]=useState(product?.supplier??"Nordic Drinks"); const [category,setCategory]=useState(product?.category??"Draught beer"); const [stock,setStock]=useState(product?.stock??0); const [par,setPar]=useState(product?.par??6); const [reorderLevel,setReorderLevel]=useState(product?.reorderLevel??4); const [unit,setUnit]=useState(product?.unit??"units"); const [price,setPrice]=useState(product?.price??0); const [sellingPrice,setSellingPrice]=useState(product?.sellingPrice??0); const [sku,setSku]=useState(product?.sku??""); const [packSize,setPackSize]=useState(product?.packSize??1); const [notes,setNotes]=useState(product?.notes??""); const [active,setActive]=useState(product?.active!==false);
 function save(){if(!name.trim()){alert("Add a product name");return;}onSave({id:product?.id??crypto.randomUUID(),name:name.trim(),supplier,category,stock:Math.max(0,stock),par:Math.max(0,par),reorderLevel:Math.max(0,reorderLevel),unit,price:Math.max(0,price),sellingPrice:Math.max(0,sellingPrice),sku:sku.trim(),packSize:Math.max(1,packSize),notes:notes.trim(),active});}
 return <Modal title={product?"Edit product":"Add product"} subtitle="Maintain purchasing, pricing and location stock settings." onClose={onClose}><div className="form-grid"><label className="full-field">Product name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Lager 30L"/></label><label>Supplier<select value={supplier} onChange={e=>setSupplier(e.target.value)}><option>Nordic Drinks</option><option>Vin & Co.</option><option>Bar Supply DK</option><option>City Produce</option></select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Draught beer</option><option>Wine</option><option>Spirits</option><option>Soft drinks</option><option>Fresh</option><option>Consumables</option></select></label><label>Supplier SKU<input value={sku} onChange={e=>setSku(e.target.value)} placeholder="Optional"/></label><label>Unit<select value={unit} onChange={e=>setUnit(e.target.value)}><option>units</option><option>kegs</option><option>bottles</option><option>cases</option><option>pieces</option><option>kg</option><option>litres</option></select></label><label>Pack size<input type="number" min="1" value={packSize} onChange={e=>setPackSize(Number(e.target.value))}/></label><label>Current stock<input type="number" min="0" value={stock} onChange={e=>setStock(Number(e.target.value))}/></label><label>Par level<input type="number" min="0" value={par} onChange={e=>setPar(Number(e.target.value))}/></label><label>Reorder level<input type="number" min="0" value={reorderLevel} onChange={e=>setReorderLevel(Number(e.target.value))}/></label><label>Purchase price (DKK)<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(Number(e.target.value))}/></label><label>Selling price (DKK)<input type="number" min="0" step="0.01" value={sellingPrice} onChange={e=>setSellingPrice(Number(e.target.value))}/></label><label>Status<select value={active?"active":"inactive"} onChange={e=>setActive(e.target.value==="active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="full-field">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Storage, ordering or handling notes"/></label></div><ModalActions onClose={onClose} onSave={save} label={product?"Save product":"Add product"}/></Modal>
}
function StockCountDialog({products,onClose,onSave}:{products:Product[];onClose:()=>void;onSave:(counts:Record<string,number>)=>void}){
 const [counts,setCounts]=useState<Record<string,number>>(()=>Object.fromEntries(products.filter(p=>p.active!==false).map(p=>[p.id,p.stock]))); const [showExpected,setShowExpected]=useState(false); const variances=products.filter(p=>p.active!==false).map(p=>({p,variance:(counts[p.id]??0)-p.stock}));
 return <Modal title="Stock count" subtitle="Enter actual quantities, review variance, then approve the count." onClose={onClose}><div className="count-toolbar"><label><input type="checkbox" checked={showExpected} onChange={e=>setShowExpected(e.target.checked)}/> Show expected stock</label><strong>{variances.filter(x=>x.variance!==0).length} variances</strong></div><div className="stock-count-list">{variances.map(({p,variance})=><label key={p.id}><span><b>{p.name}</b><small>{p.category} · {p.unit}{showExpected?` · expected ${p.stock}`:""}</small></span><input type="number" min="0" value={counts[p.id]??0} onChange={e=>setCounts(cur=>({...cur,[p.id]:Number(e.target.value)}))}/><i className={variance===0?"count-ok":variance>0?"count-over":"count-short"}>{variance===0?"Match":`${variance>0?"+":""}${variance}`}</i></label>)}</div><ModalActions onClose={onClose} onSave={()=>onSave(counts)} label="Approve stock count"/></Modal>
}
function OrderDialog({ onClose, onSave }: { onClose: () => void; onSave: () => void }) { return <Modal title="Create purchase order" subtitle="Choose a supplier to begin an order." onClose={onClose}><div className="supplier-options">{["Nordic Drinks", "Vin & Co.", "Bar Supply DK", "City Produce"].map((supplier, i) => <label key={supplier}><input type="radio" name="supplier" defaultChecked={i === 0} /><span className={`${overviewStyles.attentionIcon} ${overviewStyles.blue}`}><Truck size={18} /></span><b>{supplier}</b><ChevronRight size={17} /></label>)}</div><ModalActions onClose={onClose} onSave={onSave} label="Continue" /></Modal> }
function Modal({ title, subtitle, onClose, children, className = "" }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; className?: string }) {
  return <Dialog title={title} description={subtitle} className={className} onClose={onClose}>{children}</Dialog>;
}
function ModalActions({ onClose, onSave, label }: { onClose: () => void; onSave: () => void; label: string }) { return <DialogActions onClose={onClose} onConfirm={onSave} confirmLabel={label}/> }
function money(value: number) { return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(value); }
