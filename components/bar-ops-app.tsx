"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Coffee, LayoutDashboard, Menu, Package, Plus,
  Search, Settings, ShoppingCart, Sparkles, Users, X, AlertTriangle, Truck, MoreHorizontal,
  Copy, Send, Boxes, Wine, UserRoundPlus, Timer, Play, Square, FileCheck2, FileDown, CheckCheck, RotateCcw, Ban, Pencil, ShieldAlert, History, DownloadCloud, LockKeyhole, UnlockKeyhole, Database, KeyRound, MapPin, FileArchive, ShieldCheck, ReceiptText, Trash2, ArrowLeftRight, TrendingUp, NotebookPen, Wrench, Save, Upload, Undo2, CheckCircle2
} from "lucide-react";
import { days, initialProducts, initialShifts, orders, team, type NavKey, type Product, type Shift, type ShiftRole } from "@/lib/data";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import { ActionButton, ActionGroup, DialogFooter, FilterBar, InputField, KpiCard, PanelTitle, SegmentedControl, SelectField } from "@/components/ui-primitives";
import { FloatingNavigation, Topbar, PageHeader } from "@/components/app-shell";
import { Dashboard } from "@/features/overview/dashboard";
import { Team } from "@/features/team/team";
import type { Employee, Location, LogEntry, OpsTask, StockAdjustment, TimeEntry } from "@/lib/workspace-types";
import { BASE_MONDAY, canonicalShiftDate, conflictIds, dateFromSerial, dateFromShift, dateSerial, hoursBetween, isOvernight, mapDatabaseShift, shiftPositionFromDate, toIsoDate, workedHours } from "@/lib/schedule-utils";

export function BarOpsApp({ userName, userRole, devMode }: { userName: string; userRole: string; devMode: boolean }) {
  const [active, setActive] = useState<NavKey>("dashboard");
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
      setEmployees((data.employees || []).map((e: any) => ({ id:e.id, name:`${e.first_name} ${e.last_name}`, initials:`${e.first_name?.[0]||""}${e.last_name?.[0]||""}`, role:e.employment_title||"Employee", hours:Number(e.contracted_hours||0), status:e.active?"Active":"Inactive", active:e.active, email:e.email||"", phone:e.phone||"", payrollId:e.payroll_id||"", salaryCode:e.salary_code||"", costCentre:e.cost_centre||"", hourlyRate:Number(e.hourly_rate||0), portalStatus:e.portal_status||"NONE" })));
      setShifts((data.shifts || []).map(mapDatabaseShift));
      setProducts((data.products || []).map((x:any)=>({id:x.id,name:x.name,category:x.category,supplier:x.supplier||"Unassigned",stock:Number(x.quantity||0),par:Number(x.par_level||0),unit:x.unit,price:Number(x.purchase_price||0)})));
      setTimeEntries((data.timesheets || []).map((x:any)=>({id:x.id,employee:x.employee_name,date:String(x.work_date).slice(0,10),clockIn:String(x.clocked_in_at).slice(11,16),clockOut:x.clocked_out_at?String(x.clocked_out_at).slice(11,16):undefined,breakMinutes:x.break_minutes,status:(x.status==="OPEN"?"Running":x.status[0]+x.status.slice(1).toLowerCase()) as TimeEntry["status"],scheduledHours:Number(x.scheduled_minutes||0)/60,note:x.manager_note})));
      setOpsTasks((data.operationalTasks || []).map((x:any)=>({id:x.id,title:x.title,type:x.task_type,owner:x.owner_label,due:x.due_label,done:Boolean(x.done),note:x.note||undefined})));
      setLogEntries((data.managerLogs || []).map((x:any)=>({id:x.id,title:x.title,body:x.body,author:x.author,createdAt:new Date(x.created_at).toLocaleString("en-GB")})));
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
      <FloatingNavigation active={active} onChange={setActive} open={mobileNav} onToggle={() => setMobileNav((value) => !value)} userName={userName} userRole={userRole} devMode={devMode} />
      <main className="main-shell">
        <Topbar locations={locations} selectedLocationId={selectedLocationId} onLocationChange={setSelectedLocationId} onNavigate={setActive} />
        <div className="page-wrap">
          {active === "dashboard" && <Dashboard shifts={shifts} products={products} onNavigate={setActive} />}
          {active === "schedule" && <Schedule shifts={shifts} setShifts={setShifts} employees={employees} onNewShift={openShiftDialog} onEditShift={setEditingShift} notify={notify} currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
          {active === "attendance" && <Attendance employees={employees} shifts={shifts} entries={timeEntries} setEntries={setTimeEntries} notify={notify} onEdit={setEditingTimeEntry} />}
          {active === "inventory" && <Inventory products={products} setProducts={setProducts} onNewProduct={() => setDialog("product")} onEditProduct={setEditingProduct} onStockCount={() => setDialog("stockCount")} adjustments={stockAdjustments} setAdjustments={setStockAdjustments} notify={notify} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
          {active === "orders" && <Orders products={products} setProducts={setProducts} onNewOrder={() => setDialog("order")} notify={notify} />}
          {active === "operations" && <DailyOperations tasks={opsTasks} setTasks={setOpsTasks} logs={logEntries} setLogs={setLogEntries} notify={notify} devMode={devMode} selectedLocationId={selectedLocationId} persist={persist} />}
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
          {active === "control" && <ControlCenter devMode={devMode} databaseStatus={databaseStatus} notify={notify} />}
          {active === "settings" && <SettingsWorkspace locations={locations} selectedLocationId={selectedLocationId} userRole={userRole} devMode={devMode} notify={notify} />}
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
      {editingEmployee && <EmployeeDialog employee={editingEmployee} onClose={() => setEditingEmployee(null)} onSave={async (updated) => { try { const saved=await persist("/api/employees",{method:"PATCH",body:JSON.stringify({...updated,id:editingEmployee.id})}); setEmployees((current) => current.map((item) => item.id === editingEmployee.id ? {...updated,...saved,id:editingEmployee.id} : item)); setEditingEmployee(null); notify("Employee updated"); } catch(error) { notify(error instanceof Error?error.message:"Could not update employee"); } }} />}
      {dialog === "employee" && <EmployeeDialog onClose={() => setDialog(null)} onSave={async (employee) => { try { const saved=await persist("/api/employees",{method:"POST",body:JSON.stringify({...employee,locationId:selectedLocationId})}); setEmployees((current) => [...current, {...employee,id:saved?.id,portalStatus:"NONE"}]); setDialog(null); notify(devMode?"Employee added":"Employee added — you can now invite them to the portal"); } catch(e) { notify(e instanceof Error?e.message:"Could not add employee"); } }} />}
      {dialog === "product" && <ProductDialog onClose={() => setDialog(null)} onSave={async (product) => { try { const saved=await persist("/api/products",{method:"POST",body:JSON.stringify({...product,locationId:selectedLocationId})}); setProducts((current) => [...current, {...product,...saved}]); setDialog(null); notify("Product added to inventory"); } catch(error) { notify(error instanceof Error?error.message:"Could not add product"); } }} />}
      {editingProduct && <ProductDialog product={editingProduct} onClose={() => setEditingProduct(null)} onSave={async (product) => { try { const saved=await persist("/api/products",{method:"PATCH",body:JSON.stringify({...product,locationId:selectedLocationId})}); setProducts(current => current.map(p => p.id === product.id ? {...product,...saved} : p)); setEditingProduct(null); notify("Product updated"); } catch(error) { notify(error instanceof Error?error.message:"Could not update product"); } }} />}
      {dialog === "stockCount" && <StockCountDialog products={products} onClose={() => setDialog(null)} onSave={async (counts) => { try { if (!devMode) { for (const product of products) if (counts[product.id] !== undefined && counts[product.id] !== product.stock) await persist("/api/products", { method:"PATCH", body:JSON.stringify({...product, stock:counts[product.id], locationId:selectedLocationId}) }); } setProducts(current => current.map(p => ({...p,stock:counts[p.id] ?? p.stock}))); setDialog(null); notify("Stock count approved and inventory updated"); } catch(error) { notify(error instanceof Error ? error.message : "Could not save stock count"); } }} />}
      {dialog === "order" && <OrderDialog onClose={() => setDialog(null)} onSave={() => { setDialog(null); notify("Purchase order created"); }} />}
      {toast && <div className="toast"><span><Check size={16} /></span>{toast}</div>}
    </div>
  );
}

function Schedule({ shifts, setShifts, employees, onNewShift, onEditShift, notify, currentWeekOffset, setCurrentWeekOffset, devMode, selectedLocationId, persist }: { shifts: Shift[]; setShifts: React.Dispatch<React.SetStateAction<Shift[]>>; employees: Employee[]; onNewShift: (date?: string) => void; onEditShift: (shift: Shift) => void; notify: (s: string) => void; currentWeekOffset: number; setCurrentWeekOffset: React.Dispatch<React.SetStateAction<number>>; devMode: boolean; selectedLocationId: string; persist: (path:string, options:RequestInit) => Promise<any> }) {
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month" | "custom">("week");
  const [customFrom,setCustomFrom]=useState(toIsoDate(BASE_MONDAY));
  const customDefaultEnd=new Date(BASE_MONDAY); customDefaultEnd.setDate(customDefaultEnd.getDate()+13);
  const [customTo,setCustomTo]=useState(toIsoDate(customDefaultEnd));
  const [monthOffset, setMonthOffset] = useState(0);
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
  const rangeLabel = viewMode === "month" ? periodStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : `${periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  const weekLabel = currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : rangeLabel;
  function movePeriod(direction: number) { if (viewMode === "week") setCurrentWeekOffset((week) => week + direction); else if(viewMode === "month") setMonthOffset((month) => month + direction); else { const days=Math.max(1,dateSerial(customTo)-dateSerial(customFrom)+1); setCustomFrom(dateFromSerial(dateSerial(customFrom)+direction*days)); setCustomTo(dateFromSerial(dateSerial(customTo)+direction*days)); } }
  async function publish() {
    if (!drafts) { notify("This period is already published"); return; }
    if (conflicts.size) { notify(`Resolve ${conflicts.size} conflicting shift${conflicts.size === 1 ? "" : "s"} before publishing`); return; }
    if (!devMode && !selectedLocationId) { notify("Select a location before publishing"); return; }
    setPublishing(true);
    try {
      if (!devMode) {
        const exclusiveEnd = dateFromSerial(dateSerial(endIso!)+1);
        await persist("/api/schedule-publish", { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ locationId: selectedLocationId, weekStart: startIso, weekEnd: exclusiveEnd }) });
      }
      setShifts((current) => current.map((shift) => { const date=canonicalShiftDate(shift); return date>=startIso!&&date<=endIso!&&shift.status==="Draft"?{...shift,status:"Published"}:shift; }));
      notify(`${drafts} shift${drafts === 1 ? "" : "s"} published`);
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
  return <>
    <div className="schedule-head">
      <div><p className="eyebrow">{rangeLabel}</p><h1>Shift plan</h1></div>
      <div className="schedule-head-actions"><label className="schedule-view-select"><span className="sr-only">Schedule view</span><select value={viewMode} onChange={(event) => setViewMode(event.target.value as "week" | "month" | "custom")}><option value="week">Week</option><option value="month">Month</option><option value="custom">Period</option></select><ChevronDown size={15} aria-hidden="true" /></label><button className="secondary compact-action" onClick={copyPreviousWeek} disabled={viewMode !== "week"}><Copy size={15} /><span>Copy previous week</span></button><button className="primary compact-action" onClick={() => onNewShift(displayDays[0]?.iso)}><Plus size={16} /><span>Add shift</span></button></div>
    </div>
    <section className={`schedule-toolbar compact-schedule-toolbar ${viewMode === "custom" ? "has-custom-range" : ""}`}>
      <div className="period-controls"><button onClick={() => movePeriod(-1)} aria-label={`Previous ${viewMode}`}><ChevronLeft size={17}/></button><strong>{viewMode === "week" ? weekLabel : rangeLabel}</strong><button onClick={() => movePeriod(1)} aria-label={`Next ${viewMode}`}><ChevronRight size={17}/></button></div>
      {viewMode==="custom"&&<div className="custom-range"><label><span>From</span><input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/></label><label><span>To</span><input type="date" value={customTo} min={customFrom} onChange={e=>setCustomTo(e.target.value)}/></label></div>}
      <div className="schedule-toolbar-right"><span className="schedule-counts"><b>{visibleShifts.length}</b> shifts · <b>{drafts}</b> drafts{conflicts.size ? <> · <b className="conflict-count">{conflicts.size}</b> conflicts</> : null}</span><button className="publish-button compact-publish" onClick={publish} disabled={!drafts || publishing}><Send size={15}/><span>{publishing ? "Publishing…" : drafts ? `Publish (${drafts})` : "Published"}</span></button></div>
    </section>
    <section className={`calendar-panel schedule-calendar ${viewMode === "month" ? "month-view" : "week-view"}`}><div className="calendar-grid">
      {displayDays.map((day) => {
        const isToday = day.iso === toIsoDate(new Date());
        const dayShifts = visibleShifts.filter((shift) => canonicalShiftDate(shift) === day.iso);
        return <div className={`day-column ${isToday ? "today" : ""}`} key={day.iso} onDragOver={(e)=>e.preventDefault()} onDrop={async (e)=>{e.preventDefault();const id=e.dataTransfer.getData("text/shift-id");const original=shifts.find(x=>x.id===id);if(!original||canonicalShiftDate(original)===day.iso)return;const moved={...original,date:day.iso,day:day.pos.day,weekOffset:day.pos.weekOffset,status:"Draft" as const};try{if(!devMode){const rows=await persist("/api/shifts",{method:"PATCH",body:JSON.stringify({id:original.id,scope:"occurrence",employeeId:original.employeeId,isOpen:original.isOpen,role:original.role,startsAt:`${day.iso}T${original.start}:00`,endsAt:`${dateFromSerial(dateSerial(day.iso)+(isOvernight(original.start,original.end)?1:0))}T${original.end}:00`,status:"DRAFT"})});const mapped=(rows||[]).map(mapDatabaseShift);setShifts(cur=>[...cur.filter(x=>x.id!==id),...mapped]);}else setShifts(cur=>cur.map(x=>x.id===id?moved:x));notify("Shift moved and returned to draft");}catch(error){notify(error instanceof Error?error.message:"Could not move shift");}}}>
          <div className="day-header"><span>{day.short}</span><strong>{day.date}</strong></div>
          <div className="day-body">{dayShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} conflict={conflicts.has(shift.id)} onOpen={() => onEditShift(shift)} onDragStart={(e)=>e.dataTransfer.setData("text/shift-id",shift.id)} />)}<button className="add-slot" onClick={() => onNewShift(day.iso)}><Plus size={15}/> Add shift</button></div>
        </div>;
      })}
    </div></section>
    <div className="legend compact-legend"><span><i className="manager"/> Manager</span><span><i className="bartender"/> Bartender</span><span><i className="floor"/> Floor</span><span><i className="draft"/> Draft</span></div>
  </>
}
function ShiftCard({ shift, conflict, onOpen, onDragStart }: { shift: Shift; conflict?: boolean; onOpen: () => void; onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void }) { const overnight = isOvernight(shift.start, shift.end); return <button type="button" draggable onDragStart={onDragStart} className={`shift-card shift-card-button role-${shift.role.toLowerCase()} ${shift.status === "Draft" ? "is-draft" : ""} ${conflict ? "has-conflict" : ""}`} onClick={onOpen} aria-label={`Open ${shift.isOpen ? "available" : shift.employee} shift ${shift.start} to ${shift.end}${overnight ? " next day" : ""}`}><div className="shift-card-top"><span>{shift.start}–{shift.end}{overnight ? " +1" : ""}</span><ChevronRight size={14} /></div><strong>{shift.isOpen ? "Available shift" : shift.employee}</strong><small>{shift.role}{overnight ? " · Overnight" : ""}{shift.recurrenceLabel ? ` · ${shift.recurrenceLabel}` : ""}</small>{shift.isOpen && <em>Open</em>}{shift.status === "Draft" && <em>Draft</em>}{conflict && <em className="conflict-badge">Conflict</em>}</button> }

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
  <PageHeader title="Timesheets" action={<ActionGroup className="header-actions"><ActionButton variant="secondary" className={periodLocked ? "locked-period" : ""} onClick={()=>{setPeriodLocked(v=>!v);notify(periodLocked?"Payroll period unlocked":"Payroll period locked for export")}}>{periodLocked?<><LockKeyhole size={17}/> Period locked</>:<><UnlockKeyhole size={17}/> Lock period</>}</ActionButton><ActionButton variant="secondary" onClick={approveAllVisible} disabled={periodLocked||!visible.some(e=>e.status==="Pending")}><CheckCheck size={18}/>Approve visible</ActionButton><ActionButton variant="primary" onClick={exportApproved} disabled={!approved.length||!periodLocked}><FileDown size={18}/>Export approved</ActionButton></ActionGroup>}/>
  <FilterBar className="attendance-filters"><InputField label="From" type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/><InputField label="To" type="date" value={toDate} min={fromDate} onChange={e=>setToDate(e.target.value)}/><SelectField label="Employee" value={employeeFilter} onChange={e=>setEmployeeFilter(e.target.value)}><option>All employees</option>{employees.map(e=><option key={e.name}>{e.name}</option>)}</SelectField><SelectField label="Status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Needs review</option><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Running</option></SelectField></FilterBar>
  <section className="metric-grid attendance-metrics"><KpiCard icon={<CalendarDays size={20}/>} label="Scheduled" value={`${scheduled.toFixed(1)}h`} detail="Assigned shifts in period" footer={<><Sparkles size={13}/>{fromDate}–{toDate}</>}/><KpiCard icon={<Clock3 size={20}/>} label="Approved worked" value={`${worked.toFixed(1)}h`} detail="Included in export" footer={<><Sparkles size={13}/>Payroll ready</>}/><KpiCard icon={<FileCheck2 size={20}/>} label="Awaiting approval" value={String(pending)} detail="Excluded from export" footer={<><Sparkles size={13}/>{pending?"Action needed":"Clear"}</>}/><KpiCard icon={<ShieldAlert size={20}/>} label="Exceptions" value={String(exceptions.length)} detail="Variance, no break, or edited" footer={<><AlertTriangle size={13}/>{exceptions.length?"Review":"Clear"}</>} warning={!!exceptions.length}/></section>
  <section className="panel table-panel"><PanelTitle title="Timesheets" subtitle="Approval is reversible. Corrections return a record to pending and remain visibly marked."/><div className="data-table attendance-table"><div className="table-row table-head"><span>Employee</span><span>Date</span><span>Clocked</span><span>Break</span><span>Variance</span><span>Status & actions</span></div>{visible.map(e=>{const actual=e.clockOut?workedHours(e):0;const variance=actual-e.scheduledHours;const exception=e.status!=="Running"&&(Math.abs(variance)>=.5||e.breakMinutes===0||e.edited);return <div className={`table-row ${exception?"exception-row":""}`} key={e.id}><span><b>{e.employee}</b>{e.edited&&<small>Manager corrected</small>}</span><span>{e.date}</span><span>{e.clockIn}–{e.clockOut||"Now"}<small>{e.clockOut?actual.toFixed(2)+"h":"Running"}</small></span><span>{e.breakMinutes} min</span><span className={Math.abs(variance)>=.5?"variance-alert":""}>{e.clockOut?`${variance>=0?"+":""}${variance.toFixed(2)}h`:"—"}</span><span className="timesheet-actions"><i className={`status status-${e.status.toLowerCase()}`}>{e.status}</i>{e.status==="Pending"&&<><button title="Edit" onClick={()=>onEdit(e)}><Pencil size={14}/></button><button title="Reject" onClick={()=>rejectTimesheet(e.id)}><Ban size={14}/></button><button className="approve-mini" onClick={()=>approveTimesheet(e.id)}>Approve</button></>}{e.status==="Approved"&&<button title="Reopen" onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={14}/></button>}{e.status==="Rejected"&&<button title="Return to review" onClick={()=>reopenTimesheet(e.id)}><RotateCcw size={14}/></button>}</span></div>})}{!visible.length&&<div className="attendance-empty">No timesheets match these filters.</div>}</div></section>
  <section className="hours-by-employee"><PanelTitle title="Payroll export preview" subtitle="One row per employee; only approved hours in the selected period are counted."/><div className="team-grid">{employees.map(emp=>{const scheduledEmp=visibleShifts.filter(s=>s.employee===emp.name).reduce((n,s)=>n+hoursBetween(s.start,s.end),0);const approvedEntries=approved.filter(e=>e.employee===emp.name);const workedEmp=approvedEntries.reduce((n,e)=>n+workedHours(e),0);return <article className="team-card" key={emp.name}><div className="avatar large">{emp.initials}</div><h2>{emp.name}</h2><p>{emp.role}</p><div className="hours-compare"><span>Scheduled<b>{scheduledEmp.toFixed(1)}h</b></span><span>Approved export<b>{workedEmp.toFixed(2)}h</b></span></div><small className="export-count">{approvedEntries.length} approved timesheet{approvedEntries.length===1?"":"s"}</small></article>})}</div></section>
  <section className="panel export-history"><PanelTitle title="Export history" subtitle="Development-mode audit trail for payroll files generated in this session." action={<History size={18}/>}/>{exportHistory.length?<div>{exportHistory.map(x=><article key={x.id}><DownloadCloud size={17}/><span><b>{x.period}</b><small>{x.created}</small></span><span>{x.employees} employees</span><strong>{x.hours.toFixed(2)}h</strong></article>)}</div>:<p>No payroll exports generated in this session.</p>}</section></>;
}

function Inventory({ products, setProducts, onNewProduct, onEditProduct, onStockCount, adjustments, setAdjustments, notify, devMode, selectedLocationId, persist }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; onNewProduct: () => void; onEditProduct: (product:Product)=>void; onStockCount:()=>void; adjustments:StockAdjustment[]; setAdjustments:React.Dispatch<React.SetStateAction<StockAdjustment[]>>; notify: (s: string) => void; devMode:boolean; selectedLocationId:string; persist:(path:string,options:RequestInit)=>Promise<any> }) {
  const [query, setQuery] = useState(""); const [onlyLow, setOnlyLow] = useState(false); const [category,setCategory]=useState("All categories");
  const filtered = products.filter((p) => p.active !== false && p.name.toLowerCase().includes(query.toLowerCase()) && (category==="All categories"||p.category===category) && (!onlyLow || p.stock < p.par));
  const value = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const categories=["All categories",...Array.from(new Set(products.map(p=>p.category)))];
  async function adjust(product:Product,delta:number){ const reason=window.prompt(`Reason for ${delta>0?"adding":"removing"} ${Math.abs(delta)} ${product.unit}:`,delta>0?"Delivery / manual correction":"Waste / manual correction"); if(!reason)return; const nextStock=Math.max(0,product.stock+delta); try { if(!devMode) await persist("/api/products",{method:"PATCH",body:JSON.stringify({id:product.id,quantity:nextStock,locationId:selectedLocationId})}); setProducts(cur=>cur.map(p=>p.id===product.id?{...p,stock:nextStock}:p)); setAdjustments(cur=>[{id:crypto.randomUUID(),productId:product.id,productName:product.name,delta:nextStock-product.stock,reason,createdAt:new Date().toLocaleString("en-GB")},...cur].slice(0,30)); notify("Stock adjustment saved"); } catch(error) { notify(error instanceof Error?error.message:"Could not save stock adjustment"); } }
  return <>
    <PageHeader title="Inventory" subtitle="Edit products, set par levels, count stock and review every manual adjustment." action={<div className="header-actions"><button className="secondary" onClick={onStockCount}><ClipboardList size={17} /> Stock count</button><button className="primary" onClick={onNewProduct}><Plus size={18} /> Add product</button></div>} />
    <section className="inventory-stats"><div><span>Total stock value</span><strong>{money(value)}</strong></div><div><span>Active products</span><strong>{products.filter(p=>p.active!==false).length}</strong></div><div><span>Below par</span><strong>{products.filter((p) => p.active!==false&&p.stock < p.par).length}</strong></div><div><span>Suppliers</span><strong>{new Set(products.map(p=>p.supplier)).size}</strong></div></section>
    <section className="panel table-panel"><div className="table-toolbar inventory-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory" /></div><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select><button className={`filter-button ${onlyLow ? "selected" : ""}`} onClick={() => setOnlyLow(!onlyLow)}><AlertTriangle size={16} /> Below par</button></div>
      <div className="data-table inventory-table"><div className="table-row table-head"><span>Product</span><span>Supplier</span><span>In stock</span><span>Par / reorder</span><span>Suggested order</span><span>Actions</span></div>{filtered.map((product) => { const suggested = Math.max(0, product.par - product.stock); return <div className="table-row" key={product.id}><span className="product-cell"><i><Coffee size={17} /></i><b>{product.name}<small>{product.category} · {product.sku||"No SKU"}</small></b></span><span>{product.supplier}<small>{money(product.price)} / {product.unit}</small></span><span><div className="stock-edit"><button aria-label={`Remove one ${product.name}`} onClick={() => adjust(product,-1)}>−</button><b className={product.stock < product.par ? "low" : ""}>{product.stock}</b><button aria-label={`Add one ${product.name}`} onClick={() => adjust(product,1)}>+</button></div><small>{product.unit}</small></span><span><b>{product.par}</b><small>Reorder at {product.reorderLevel??Math.max(0,product.par-2)}</small></span><span>{suggested > 0 ? <strong className="order-suggestion">+{suggested} {product.unit}</strong> : <span className="ok"><Check size={14} /> OK</span>}</span><span className="row-actions"><button className="secondary compact" onClick={()=>onEditProduct(product)}><Pencil size={15}/> Edit</button></span></div>})}{!filtered.length&&<div className="attendance-empty">No products match these filters.</div>}</div>
    </section>
    <section className="panel adjustment-history"><PanelTitle title="Stock adjustment history" subtitle="Manual changes are recorded with a reason and can be reviewed before a stock count." action={<History size={18}/>}/>{adjustments.length?<div>{adjustments.slice(0,8).map(a=><article key={a.id}><span className={a.delta>0?"positive-delta":"negative-delta"}>{a.delta>0?"+":""}{a.delta}</span><span><b>{a.productName}</b><small>{a.reason}</small></span><time>{a.createdAt}</time></article>)}</div>:<p>No manual stock adjustments yet.</p>}</section>
  </>
}

function Orders({ products, setProducts, onNewOrder, notify }: { products:Product[]; setProducts:React.Dispatch<React.SetStateAction<Product[]>>; onNewOrder: () => void; notify: (s: string) => void }) {
  const [received,setReceived]=useState<string[]>([]);
  const [query,setQuery]=useState("");
  const [statusFilter,setStatusFilter]=useState("ALL");
  const suggestions=products.filter(p=>p.active!==false&&p.stock<p.par).map(p=>({...p,qty:p.par-p.stock}));
  const visibleOrders=orders.filter(order=>{ const status=received.includes(order.id)?"Delivered":order.status; const matchesQuery=!query.trim()||`${order.id} ${order.supplier}`.toLowerCase().includes(query.trim().toLowerCase()); return matchesQuery&&(statusFilter==="ALL"||status.toUpperCase()===statusFilter); });
  function receive(orderId:string){ if(received.includes(orderId))return; setReceived(cur=>[...cur,orderId]); if(orderId==="PO-1048") setProducts(cur=>cur.map(p=>p.supplier==="Nordic Drinks"?{...p,stock:p.stock+Math.max(0,p.par-p.stock)}:p)); notify(`${orderId} received and stock updated`); }
  return <><PageHeader title="Purchase orders" subtitle="Generate suggested orders, receive deliveries and resolve invoice discrepancies." action={<button className="primary" onClick={onNewOrder}><Plus size={18} /> New order</button>} />
    {suggestions.length>0&&<section className="panel suggested-order"><div><span className="attention-icon blue"><Sparkles size={20}/></span><div><p>Suggested replenishment</p><strong>{suggestions.length} products are below par</strong><small>{suggestions.reduce((n,p)=>n+p.qty,0)} total units suggested</small></div></div><button className="secondary" onClick={()=>notify("Suggested order grouped by supplier and saved as draft")}>Create suggested order</button></section>}
    <section className="order-highlight"><div><span className="attention-icon blue"><Truck size={20} /></span><div><p>Next delivery</p><strong>Nordic Drinks · Tomorrow, 08:00–11:00</strong></div></div><button className="secondary" onClick={() => receive("PO-1048")}>{received.includes("PO-1048")?<><Check size={16}/>Received</>:"Receive delivery"}</button></section>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search orders" aria-label="Search orders" /></div><label className="filter-select"><span className="sr-only">Filter order status</span><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="CONFIRMED">Confirmed</option><option value="DELIVERED">Delivered</option></select><ChevronDown size={15}/></label></div><div className="data-table orders-table"><div className="table-row table-head"><span>Order</span><span>Supplier</span><span>Items</span><span>Delivery</span><span>Amount</span><span>Status</span></div>{visibleOrders.length?visibleOrders.map((order) => <div className="table-row order-row" key={order.id}><span><b>{order.id}</b></span><span>{order.supplier}</span><span>{order.items}</span><span>{order.delivery}</span><span><b>{money(order.amount)}</b></span><span><i className={`status status-${received.includes(order.id)?"delivered":order.status.toLowerCase()}`}>{received.includes(order.id)?"Received":order.status}</i>{order.status!=="Delivered"&&!received.includes(order.id)&&<button className="icon-button" onClick={()=>receive(order.id)} title="Receive order"><CheckCircle2 size={16}/></button>}</span></div>):<div className="table-empty">No orders match the current filters.</div>}</div></section>
  </>
}

function DailyOperations({tasks,setTasks,logs,setLogs,notify,devMode,selectedLocationId,persist}:{tasks:OpsTask[];setTasks:React.Dispatch<React.SetStateAction<OpsTask[]>>;logs:LogEntry[];setLogs:React.Dispatch<React.SetStateAction<LogEntry[]>>;notify:(s:string)=>void;devMode:boolean;selectedLocationId:string;persist:(path:string,options:RequestInit)=>Promise<any>}){
 const [title,setTitle]=useState(""); const [type,setType]=useState<OpsTask["type"]>("Task"); const [logText,setLogText]=useState(""); const [saving,setSaving]=useState(false);
 const complete=tasks.filter(t=>t.done).length;
 async function addTask(){if(!title.trim()||saving)return;setSaving(true);try{const result=await persist("/api/daily-operations",{method:"POST",body:JSON.stringify({action:"CREATE_TASK",locationId:selectedLocationId,title:title.trim(),taskType:type})});const row=result?.record;const task:OpsTask=row?{id:row.id,title:row.title,type:row.task_type,owner:row.owner_label,due:row.due_label,done:Boolean(row.done),note:row.note||undefined}:{id:crypto.randomUUID(),title:title.trim(),type,owner:"Unassigned",due:"Today",done:false};setTasks(cur=>[...cur,task]);setTitle("");notify("Operational task added");}catch(error){notify(error instanceof Error?error.message:"Could not add operational task");}finally{setSaving(false)}}
 async function addLog(){if(!logText.trim()||saving)return;setSaving(true);try{const result=await persist("/api/daily-operations",{method:"POST",body:JSON.stringify({action:"CREATE_LOG",locationId:selectedLocationId,body:logText.trim()})});const row=result?.record;const entry:LogEntry=row?{id:row.id,title:row.title,body:row.body,author:row.author||"Current manager",createdAt:new Date(row.created_at).toLocaleString("en-GB")}:{id:crypto.randomUUID(),title:"Shift handover",body:logText.trim(),author:"Current manager",createdAt:new Date().toLocaleString("en-GB")};setLogs(cur=>[entry,...cur]);setLogText("");notify("Handover note saved");}catch(error){notify(error instanceof Error?error.message:"Could not save handover");}finally{setSaving(false)}}
 async function toggleTask(task:OpsTask){try{await persist("/api/daily-operations",{method:"PATCH",body:JSON.stringify({id:task.id,done:!task.done})});setTasks(cur=>cur.map(x=>x.id===task.id?{...x,done:!x.done}:x));}catch(error){notify(error instanceof Error?error.message:"Could not update task")}}
 async function removeTask(task:OpsTask){try{await persist("/api/daily-operations",{method:"DELETE",body:JSON.stringify({id:task.id})});setTasks(cur=>cur.filter(x=>x.id!==task.id));notify("Operational task removed");}catch(error){notify(error instanceof Error?error.message:"Could not remove task")}}
 return <><PageHeader title="Daily operations" subtitle="Opening, closing, handovers and maintenance in one live manager workspace." action={<span className="connection-pill dev">{complete}/{tasks.length} complete</span>}/>
 <section className="operations-summary"><div><ClipboardList/><span>Opening & closing<strong>{tasks.filter(t=>t.type==="Opening"||t.type==="Closing").length} checks</strong></span></div><div><Wrench/><span>Maintenance<strong>{tasks.filter(t=>t.type==="Maintenance"&&!t.done).length} open</strong></span></div><div><NotebookPen/><span>Logbook<strong>{logs.length} entries</strong></span></div></section>
 <div className="operations-layout"><section className="panel ops-checklist"><PanelTitle title="Today’s checklist" subtitle="Tap a task to mark it complete."/><div className="task-list">{tasks.map(t=><article key={t.id} className={t.done?"task-done":""}><button className="task-check" aria-label={t.done?`Mark ${t.title} incomplete`:`Mark ${t.title} complete`} onClick={()=>toggleTask(t)}>{t.done?<Check size={16}/>:null}</button><span><b>{t.title}</b><small>{t.type} · {t.owner} · {t.due}</small></span><button className="icon-button" aria-label={`Delete ${t.title}`} onClick={()=>removeTask(t)}><Trash2 size={15}/></button></article>)}</div><div className="inline-create"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add an operational task"/><select value={type} onChange={e=>setType(e.target.value as OpsTask["type"])}><option>Task</option><option>Opening</option><option>Closing</option><option>Maintenance</option></select><button className="primary" disabled={saving||!title.trim()} onClick={addTask}><Plus size={16}/>Add</button></div></section>
 <section className="panel logbook"><PanelTitle title="Manager logbook" subtitle="Permanent shift handovers and important operational context."/><div className="log-compose"><textarea value={logText} onChange={e=>setLogText(e.target.value)} placeholder="What does the next manager need to know?"/><button className="primary" disabled={saving||!logText.trim()} onClick={addLog}><Send size={16}/>Save handover</button></div><div className="log-list">{logs.map(l=><article key={l.id}><div><b>{l.title}</b><small>{l.author} · {l.createdAt}</small></div><p>{l.body}</p></article>)}</div></section></div></>
}

type ClockSettings = {
  allowMobileClock: boolean;
  allowKioskClock: boolean;
  allowUnscheduledClock: boolean;
  requireLocationCheck: boolean;
  earlyClockInMinutes: number;
  lateClockOutMinutes: number;
  roundingMinutes: number;
  autoApproveWithinMinutes: number | "";
};
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
  return <>
    <PageHeader eyebrow="Workspace configuration" title="Settings" />
    <div className="settings-layout">
      <nav className="settings-nav" aria-label="Settings sections">
        <button className={section==="general"?"active":""} onClick={()=>setSection("general")}>Organization</button>
        <button className={section==="time"?"active":""} onClick={()=>setSection("time")}>Time clock</button>
        <button className={section==="security"?"active":""} onClick={()=>setSection("security")}>Security</button>
      </nav>
      <section className="panel settings-panel">
        {section==="general" && <><PanelTitle title="Organization & location" subtitle="The active workspace context used by scheduling, inventory and attendance."/><div className="settings-summary"><div><span>Current location</span><strong>{location?.name || "No active location"}</strong></div><div><span>Available locations</span><strong>{locations.length}</strong></div><div><span>Your role</span><strong>{userRole.replaceAll("_"," ")}</strong></div></div><p className="settings-help">Location creation and organization identity editing are staged for a later administration release. Switch location from the top bar.</p></>}
        {section==="time" && <><PanelTitle title="Time clock" subtitle="Control mobile and kiosk attendance for the selected location."/>{loading?<div className="settings-loading">Loading settings…</div>:<div className="settings-form">
          <label className="toggle-row"><span><strong>Mobile clock-in</strong><small>Allow linked employees to clock in from their portal.</small></span><input type="checkbox" checked={clock.allowMobileClock} onChange={e=>setClock({...clock,allowMobileClock:e.target.checked})}/></label>
          <label className="toggle-row"><span><strong>Kiosk clock-in</strong><small>Allow PIN-based clocking from a shared device.</small></span><input type="checkbox" checked={clock.allowKioskClock} onChange={e=>setClock({...clock,allowKioskClock:e.target.checked})}/></label>
          <label className="toggle-row"><span><strong>Unscheduled clock-in</strong><small>Permit clock-in when no nearby published shift exists.</small></span><input type="checkbox" checked={clock.allowUnscheduledClock} onChange={e=>setClock({...clock,allowUnscheduledClock:e.target.checked})}/></label>
          <label className="toggle-row"><span><strong>Require location check</strong><small>Require location verification when geofencing is configured.</small></span><input type="checkbox" checked={clock.requireLocationCheck} onChange={e=>setClock({...clock,requireLocationCheck:e.target.checked})}/></label>
          <div className="settings-field-grid"><label>Early clock-in window<input type="number" min="0" max="240" value={clock.earlyClockInMinutes} onChange={e=>setClock({...clock,earlyClockInMinutes:Number(e.target.value)})}/><small>Minutes before the shift</small></label><label>Missed clock-out threshold<input type="number" min="0" max="720" value={clock.lateClockOutMinutes} onChange={e=>setClock({...clock,lateClockOutMinutes:Number(e.target.value)})}/><small>Minutes after scheduled end</small></label><label>Rounding<select value={clock.roundingMinutes} onChange={e=>setClock({...clock,roundingMinutes:Number(e.target.value)})}><option value="0">No rounding</option><option value="5">5 minutes</option><option value="6">6 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label><label>Auto-approval tolerance<input type="number" min="0" max="240" value={clock.autoApproveWithinMinutes} onChange={e=>setClock({...clock,autoApproveWithinMinutes:e.target.value===""?"":Number(e.target.value)})}/><small>Leave blank for manager approval</small></label></div>
          <div className="settings-actions"><button className="primary" disabled={!canManage||saving} onClick={saveClock}><Save size={17}/>{saving?"Saving…":"Save settings"}</button><a className="secondary settings-link" href="/employee/hours"><Clock3 size={17}/>Open my time clock</a>{!canManage&&<small>Owner, Admin or Manager permission is required to change settings.</small>}</div>
        </div>}</>}
        {section==="security" && <><PanelTitle title="Security & data" subtitle="Current production safeguards and administration status."/><div className="settings-summary"><div><span>Authentication</span><strong>Database sessions</strong></div><div><span>Audit trail</span><strong>Enabled</strong></div><div><span>GDPR requests</span><strong>Foundation ready</strong></div></div><p className="settings-help">MFA enrollment, password-reset delivery, session revocation and managed backups remain in the production roadmap.</p></>}
      </section>
    </div>
  </>;
}

function ControlCenter({devMode,databaseStatus,notify}:{devMode:boolean;databaseStatus:string;notify:(s:string)=>void}) {
 const groups=[
  {title:"Database & payroll",icon:Database,items:["All manager modules use tenant-scoped PostgreSQL APIs","Permanent payroll export ledger with SHA-256 hashes","Open, locked, exported and closed payroll periods","Payroll IDs, salary codes and cost centres"]},
  {title:"Attendance controls",icon:KeyRound,items:["Kiosk PIN verification and lockout","Venue geofence radius validation","Late, missed clock-out and geofence alerts","Employee timesheet correction requests"]},
  {title:"Scheduling",icon:CalendarDays,items:["Drag shifts between dates","Occurrence, future and whole-series editing","Reusable schedule templates","Availability, leave and overlap conflict checks","Labour revenue forecasts","Publish notifications and acknowledgements"]},
  {title:"Stock operations",icon:ReceiptText,items:["Delivery receiving and partial/disputed receipts","Invoice number, total and discrepancy matching","Waste logs with stock ledger entries","Draft, in-transit and received location transfers"]},
  {title:"Security & compliance",icon:ShieldCheck,items:["MFA factor foundation and recovery records","Password-reset tokens and rate limiting","Managed backup/restore runbook and health events","GDPR export, deletion and rectification requests"]}
 ];
 return <><PageHeader title="Control centre" subtitle="Production controls plus development-data tools for realistic testing before database setup." action={<span className={`connection-pill ${devMode?"dev":"live"}`}>{databaseStatus}</span>}/>{devMode&&<section className="panel dev-data-tools"><PanelTitle title="Development data" subtitle="Your workspace is saved in this browser. Export a backup or reset to the original demo data."/><div><button className="secondary" onClick={()=>{const raw=localStorage.getItem("barops-dev-v0101") || localStorage.getItem("barops-dev-v091") || localStorage.getItem("barops-dev-v070")||"{}";const blob=new Blob([raw],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="bar-ops-development-data.json";a.click();URL.revokeObjectURL(url);notify("Development data exported")}}><DownloadCloud size={17}/>Export JSON</button><label className="secondary file-import"><Upload size={17}/>Import JSON<input type="file" accept="application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{JSON.parse(await file.text());localStorage.setItem("barops-dev-v0101",await file.text());location.reload()}catch{notify("That file is not valid Bar Ops JSON")}}}/></label><button className="secondary danger-outline" onClick={()=>{if(confirm("Reset all development data to the original demo workspace?")){localStorage.removeItem("barops-dev-v0101"); localStorage.removeItem("barops-dev-v091"); localStorage.removeItem("barops-dev-v070");location.reload()}}}><RotateCcw size={17}/>Reset demo data</button></div></section>}<div className="control-grid">{groups.map(g=>{const Icon=g.icon;return <section className="panel control-card" key={g.title}><div className="control-icon"><Icon size={20}/></div><h2>{g.title}</h2>{g.items.map(i=><p key={i}><Check size={15}/>{i}</p>)}</section>})}</div><section className="panel control-actions"><PanelTitle title="Production status" subtitle="Only workflows connected to a complete manager interface are presented as operational. Backend foundations remain documented in Implementation status."/><p className="settings-note">Use Timesheets for payroll and clock review, Inventory for product and stock controls, and Settings for location time-clock configuration.</p></section></>;
}

function ShiftCoreFields({ assignment, setAssignment, activeEmployees, employee, setEmployee, shiftDate, setShiftDate, role, setRole, start, setStart, end, setEnd, status, setStatus, onDateChange, openMessage }: {
  assignment: "employee" | "open";
  setAssignment: (value: "employee" | "open") => void;
  activeEmployees: Employee[];
  employee: string;
  setEmployee: (value: string) => void;
  shiftDate: string;
  setShiftDate: (value: string) => void;
  role: ShiftRole;
  setRole: (value: ShiftRole) => void;
  start: string;
  setStart: (value: string) => void;
  end: string;
  setEnd: (value: string) => void;
  status?: "Draft" | "Published";
  setStatus?: (value: "Draft" | "Published") => void;
  onDateChange?: (value: string) => void;
  openMessage: string;
}) {
  return <>
    <SegmentedControl className="assignment-toggle" ariaLabel="Shift assignment" value={assignment} onChange={setAssignment} options={[{value:"employee",label:"Assign employee"},{value:"open",label:"Available shift"}]} />
    <div className="form-grid shift-dialog-fields">
      {assignment === "employee" && <SelectField label="Employee" className="full-field" value={employee} onChange={(event) => setEmployee(event.target.value)}>{activeEmployees.map(person => <option key={person.name}>{person.name}</option>)}</SelectField>}
      {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>{openMessage}</span></div></div>}
      <InputField label="Shift date" className="full-field shift-date-field" type="date" value={shiftDate} onChange={(event) => { setShiftDate(event.target.value); onDateChange?.(event.target.value); }} />
      <SelectField label="Role" value={role} onChange={(event) => setRole(event.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></SelectField>
      <InputField label="Starts" className="shift-time-field" type="time" value={start} onChange={(event) => setStart(event.target.value)} />
      <InputField label="Ends" className="shift-time-field" type="time" value={end} onChange={(event) => setEnd(event.target.value)} helper={isOvernight(start, end) ? "Ends the following day" : "Ends the same day"} />
      {status && setStatus && <SelectField label="Schedule status" className="full-field" value={status} onChange={(event) => setStatus(event.target.value as "Draft" | "Published")}><option>Draft</option><option>Published</option></SelectField>}
    </div>
  </>;
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
  return <Modal title="Add shift" subtitle="Create one shift or a repeating series." onClose={onClose}>
    {locations.length > 1 && <label className="location-field">Location<select value={locationId} onChange={event=>setLocationId(event.target.value)}>{locations.map(location=><option key={location.id} value={location.id}>{location.name}</option>)}</select></label>}
    <ShiftCoreFields assignment={assignment} setAssignment={setAssignment} activeEmployees={activeEmployees} employee={employee} setEmployee={setEmployee} shiftDate={shiftDate} setShiftDate={setShiftDate} role={role} setRole={setRole} start={start} setStart={setStart} end={end} setEnd={setEnd} onDateChange={(value)=>setWeekdays([shiftPositionFromDate(value).day])} openMessage="A manager approves the employee who receives it." />
    <label className="repeat-switch"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)}/><span><strong>Repeat shift</strong><small>Create a daily or weekly series</small></span></label>
    {repeat && <div className="repeat-panel"><SegmentedControl className="frequency-toggle" ariaLabel="Repeat frequency" value={frequency} onChange={setFrequency} options={[{value:"daily",label:"Daily"},{value:"weekly",label:"Weekly"}]} />
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
    <ShiftCoreFields assignment={assignment} setAssignment={setAssignment} activeEmployees={activeEmployees} employee={employee} setEmployee={setEmployee} shiftDate={shiftDate} setShiftDate={setShiftDate} role={role} setRole={setRole} start={start} setStart={setStart} end={end} setEnd={setEnd} status={status} setStatus={setStatus} openMessage="The current employee is removed. A manager approves the employee who receives it." />
    {shift.recurrenceGroupId && <div className="series-edit-note"><CalendarDays size={17}/><div><strong>Apply changes to</strong><span>Choose whether this edit affects one occurrence or the wider repeating series.</span><select value={scope} onChange={(e)=>setScope(e.target.value as "occurrence"|"future"|"series")}><option value="occurrence">This shift only</option><option value="future">This and future shifts</option><option value="series">Entire series</option></select></div></div>}
    <DialogFooter onCancel={onClose} onConfirm={save} confirmLabel="Save changes" dangerAction={<ActionButton variant="danger" type="button" onClick={onDelete}>Delete shift</ActionButton>} />
  </Modal>
}

function TimesheetDialog({ entry, onClose, onSave }: { entry: TimeEntry; onClose:()=>void; onSave:(entry:TimeEntry)=>void }) {
  const [clockIn,setClockIn]=useState(entry.clockIn); const [clockOut,setClockOut]=useState(entry.clockOut||""); const [breakMinutes,setBreakMinutes]=useState(entry.breakMinutes); const [note,setNote]=useState(entry.note||"");
  return <Modal title="Correct timesheet" subtitle="All manager corrections return the record to pending review. Add a reason for the audit trail." onClose={onClose}><div className="form-grid"><label>Clock in<input type="time" value={clockIn} onChange={e=>setClockIn(e.target.value)}/></label><label>Clock out<input type="time" value={clockOut} onChange={e=>setClockOut(e.target.value)}/></label><label>Break minutes<input type="number" min="0" step="5" value={breakMinutes} onChange={e=>setBreakMinutes(Number(e.target.value))}/></label><label className="full-field">Correction reason<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Required, e.g. employee forgot to clock out"/></label></div><ModalActions onClose={onClose} onSave={()=>{if(!note.trim()){alert("Add a correction reason");return;}onSave({...entry,clockIn,clockOut:clockOut||undefined,breakMinutes,status:"Pending",note:note.trim(),edited:true})}} label="Save correction"/></Modal>
}

function EmployeeDialog({ employee, onClose, onSave }: { employee?: Employee; onClose: () => void; onSave: (employee: Employee) => void | Promise<void> }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "Bartender");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [active, setActive] = useState(employee?.active ?? true); const [hourlyRate,setHourlyRate]=useState(employee?.hourlyRate??0); const [payrollId,setPayrollId]=useState(employee?.payrollId??""); const [salaryCode,setSalaryCode]=useState(employee?.salaryCode??""); const [costCentre,setCostCentre]=useState(employee?.costCentre??"");
  function save() { const cleanName = name.trim() || "New employee"; onSave({ name: cleanName, initials: cleanName.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase(), role, email, phone, active, hours: employee?.hours ?? 0, status: active ? "No shifts scheduled" : "Inactive", hourlyRate, payrollId, salaryCode, costCentre }); }
  return <Modal title={employee ? "Edit employee" : "Add employee"} onClose={onClose}><div className="form-grid employee-dialog"><label className="full-field">Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" /></label><label>Role<select value={role} onChange={(e) => setRole(e.target.value)}><option>General manager</option><option>Bar manager</option><option>Shift manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label><label>Status<select value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label><label>Phone<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+45 ..." /></label><label>Hourly pay (DKK)<input type="number" min="0" step="0.01" inputMode="decimal" value={hourlyRate} onChange={e=>setHourlyRate(Number(e.target.value))} /></label><label>Payroll ID<input value={payrollId} onChange={e=>setPayrollId(e.target.value)} /></label><label>Salary code<input value={salaryCode} onChange={e=>setSalaryCode(e.target.value)} /></label><label className="full-field">Cost centre<input value={costCentre} onChange={e=>setCostCentre(e.target.value)} /></label></div><ModalActions onClose={onClose} onSave={save} label={employee ? "Save employee" : "Add employee"} /></Modal>
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
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
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

  return <div className="modal-layer" role="presentation"><button className="modal-scrim" onClick={onClose} aria-label="Close dialog" /><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div>
}
function ModalActions({ onClose, onSave, label }: { onClose: () => void; onSave: () => void; label: string }) { return <DialogFooter onCancel={onClose} onConfirm={onSave} confirmLabel={label} /> }
function money(value: number) { return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(value); }
