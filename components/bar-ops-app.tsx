"use client";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Database,
  LayoutDashboard,
  NotebookPen,
  Package,
  Settings,
  ShoppingCart,
  Timer,
  Users,
} from "lucide-react";
import { initialProducts, initialShifts, team, type NavKey, type Product, type Shift } from "@/lib/data";
import type { Employee, Location, LogEntry, OpsTask, ShiftNote, StockAdjustment, TimeEntry } from "@/features/workspace/types";
import { parseEmployeeInvitationMutationResponse, parseInvitationRecords, parseManagerBootstrapResponse } from "@/features/workspace/bootstrap-contract";
import { canonicalShiftDate, dateFromSerial, dateSerial, isOvernight, mapDatabaseShift, shiftPositionFromDate, type DatabaseShiftRecord } from "@/features/workspace/schedule-utils";
import { RequestsWorkspace } from "@/components/requests-workspace";
import { DashboardWorkspace, ShiftExecutionWorkspace } from "@/features/dashboard/manager-overview";
import { EditShiftDialog, ShiftDialog } from "@/features/scheduling/ScheduleDialogs";
import { ScheduleWorkspace } from "@/features/scheduling/ScheduleWorkspace";
import { AttendanceWorkspace, TimesheetDialog } from "@/features/attendance/AttendanceWorkspace";
import { InventoryWorkspace, ProductDialog, StockCountDialog } from "@/features/inventory/InventoryWorkspace";
import { OrderDialog, OrdersWorkspace } from "@/features/orders/OrdersWorkspace";
import { DailyOperationsWorkspace } from "@/features/operations/DailyOperationsWorkspace";
import { EmployeeDialog, TeamWorkspace } from "@/features/employees/TeamWorkspace";
import { SettingsWorkspace } from "@/features/settings/SettingsWorkspace";
import { ControlCenterWorkspace } from "@/features/control/ControlCenterWorkspace";
import { WorkspaceSidebar, WorkspaceTopbar } from "@/components/shell/workspace-chrome";
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
      <WorkspaceSidebar
        items={availableNavItems.map((item) => ({ ...item, badge: item.id === "inventory" ? 5 : undefined }))}
        active={active}
        onNavigate={(id) => { setActive(id as NavKey); setMobileNav(false); }}
        open={mobileNav}
        onClose={() => setMobileNav(false)}
        userName={userName}
        userRole={userRole}
        devMode={devMode}
        settingsItem={hasCapability(userRole, "settings.read") ? { id: "settings", label: "Settings", icon: Settings } : undefined}
        locationLabel="Temple Bar"
        onSignOut={async () => {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
          window.location.assign("/login");
        }}
      />
      <main id="main-content" className="main-shell" tabIndex={-1}>
        <WorkspaceTopbar
          items={availableNavItems}
          onMenu={() => setMobileNav(true)}
          locations={locations}
          selectedLocationId={selectedLocationId}
          onLocationChange={setSelectedLocationId}
          onNavigate={(id) => setActive(id as NavKey)}
          notificationItems={[
            { id: "schedule", label: "Draft schedule", detail: "Review and publish upcoming shifts", icon: CalendarDays },
            { id: "attendance", label: "Timesheet review", detail: "Open time and attendance", icon: Clock3 },
            { id: "requests", label: "Employee requests", detail: "Review leave, open shifts and shift changes", icon: ClipboardList },
            { id: "inventory", label: "Stock attention", detail: "Review products below par", icon: Package },
          ]}
        />
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
            <TeamWorkspace
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
