"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Clock3, Coffee, LayoutDashboard, Menu, Package, Plus,
  Search, Settings, ShoppingCart, Sparkles, Users, X, AlertTriangle, Truck, MoreHorizontal,
  Copy, Send, Boxes, Wine, UserRoundPlus
} from "lucide-react";
import { days, initialProducts, initialShifts, orders, team, type NavKey, type Product, type Shift, type ShiftRole } from "@/lib/data";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";

const navItems: { id: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Shift plan", icon: CalendarDays },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "team", label: "Team", icon: Users },
];

export function BarOpsApp({ userName, userRole, devMode }: { userName: string; userRole: string; devMode: boolean }) {
  const [active, setActive] = useState<NavKey>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [shifts, setShifts] = useState(initialShifts);
  const [products, setProducts] = useState(initialProducts);
  const [dialog, setDialog] = useState<"shift" | "product" | "order" | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [toast, setToast] = useState("");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

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
          {active === "schedule" && <Schedule shifts={shifts} setShifts={setShifts} onNewShift={() => setDialog("shift")} onEditShift={setEditingShift} notify={notify} currentWeekOffset={currentWeekOffset} setCurrentWeekOffset={setCurrentWeekOffset} />}
          {active === "inventory" && <Inventory products={products} setProducts={setProducts} onNewProduct={() => setDialog("product")} notify={notify} />}
          {active === "orders" && <Orders onNewOrder={() => setDialog("order")} notify={notify} />}
          {active === "team" && <Team notify={notify} />}
        </div>
      </main>
      {editingShift && <EditShiftDialog shift={editingShift} onClose={() => setEditingShift(null)} onSave={(updated) => { setShifts((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingShift(null); notify(updated.isOpen ? "Shift changed to available" : `Shift assigned to ${updated.employee}`); }} onDelete={() => { setShifts((current) => current.filter((item) => item.id !== editingShift.id)); setEditingShift(null); notify("Shift removed"); }} />}
      {dialog === "shift" && <ShiftDialog currentWeekOffset={currentWeekOffset} onClose={() => setDialog(null)} onSave={(newShifts) => { setShifts((current) => [...current, ...newShifts]); setDialog(null); notify(newShifts.length > 1 ? `${newShifts.length} repeating shifts added` : "Shift added to the draft schedule"); }} />}
      {dialog === "product" && <ProductDialog onClose={() => setDialog(null)} onSave={(product) => { setProducts((current) => [...current, product]); setDialog(null); notify("Product added to inventory"); }} />}
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

function Schedule({ shifts, setShifts, onNewShift, onEditShift, notify, currentWeekOffset, setCurrentWeekOffset }: { shifts: Shift[]; setShifts: React.Dispatch<React.SetStateAction<Shift[]>>; onNewShift: () => void; onEditShift: (shift: Shift) => void; notify: (s: string) => void; currentWeekOffset: number; setCurrentWeekOffset: React.Dispatch<React.SetStateAction<number>> }) {
  const visibleShifts = shifts.filter((shift) => (shift.weekOffset ?? 0) === currentWeekOffset);
  const drafts = visibleShifts.filter((shift) => shift.status === "Draft").length;
  const baseMonday = new Date(2026, 6, 27);
  const monday = new Date(baseMonday); monday.setDate(baseMonday.getDate() + currentWeekOffset * 7);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const weekDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return { short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], date: String(date.getDate()).padStart(2, "0") }; });
  const rangeLabel = `${monday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  const weekLabel = currentWeekOffset === 0 ? "This week" : currentWeekOffset === -1 ? "Last week" : currentWeekOffset === 1 ? "Next week" : rangeLabel;
  function publish() { setShifts((current) => current.map((shift) => (shift.weekOffset ?? 0) === currentWeekOffset ? { ...shift, status: "Published" } : shift)); notify("Weekly shift plan published"); }
  return <>
    <PageHeader eyebrow={rangeLabel} title="Shift plan" subtitle="Build, review and publish the weekly schedule." action={<div className="header-actions"><button className="secondary" onClick={() => notify("Previous week copied into the current draft")}><Copy size={17} /> Copy week</button><button className="primary" onClick={onNewShift}><Plus size={18} /> Add shift</button></div>} />
    <section className="schedule-toolbar"><div className="week-switch"><button onClick={() => setCurrentWeekOffset((week) => week - 1)} aria-label="Previous week"><ChevronLeft size={18} /></button><strong>{weekLabel}</strong><button onClick={() => setCurrentWeekOffset((week) => week + 1)} aria-label="Next week"><ChevronRight size={18} /></button></div><div className="schedule-summary"><span><b>{visibleShifts.length}</b> shifts</span>{drafts > 0 && <button className="publish-button" onClick={publish}><Send size={16} /> Publish {drafts} drafts</button>}</div></section>
    <section className="calendar-panel"><div className="calendar-grid">
      {weekDays.map((day, index) => <div className={`day-column ${currentWeekOffset === 0 && index === 4 ? "today" : ""}`} key={day.short}><div className="day-header"><span>{day.short}</span><strong>{day.date}</strong></div><div className="day-body">{visibleShifts.filter((shift) => shift.day === index).map((shift) => <ShiftCard key={shift.id} shift={shift} onOpen={() => onEditShift(shift)} />)}<button className="add-slot" onClick={onNewShift}><Plus size={16} /> Add shift</button></div></div>)}
    </div></section>
    <div className="legend"><span><i className="manager" /> Manager</span><span><i className="bartender" /> Bartender</span><span><i className="floor" /> Floor</span><span><i className="draft" /> Draft</span></div>
  </>
}
function ShiftCard({ shift, onOpen }: { shift: Shift; onOpen: () => void }) { return <button type="button" className={`shift-card shift-card-button role-${shift.role.toLowerCase()} ${shift.status === "Draft" ? "is-draft" : ""}`} onClick={onOpen} aria-label={`Open ${shift.isOpen ? "available" : shift.employee} shift ${shift.start} to ${shift.end}`}><div className="shift-card-top"><span>{shift.start}–{shift.end}</span><ChevronRight size={14} /></div><strong>{shift.isOpen ? "Available shift" : shift.employee}</strong><small>{shift.role}{shift.recurrenceLabel ? ` · ${shift.recurrenceLabel}` : ""}</small>{shift.isOpen && <em>Open</em>}{shift.status === "Draft" && <em>Draft</em>}</button> }

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

function Team({ notify }: { notify: (s: string) => void }) { return <><PageHeader title="Team" subtitle="Manage employees, roles and weekly hours." action={<button className="primary" onClick={() => notify("Employee invitation prepared")}><UserRoundPlus size={18} /> Invite employee</button>} />
  <section className="team-grid">{team.map((person) => <article className="team-card" key={person.name}><div className="team-card-head"><div className="avatar large">{person.initials}</div><button className="more"><MoreHorizontal size={19} /></button></div><h2>{person.name}</h2><p>{person.role}</p><div className="team-stats"><span>Scheduled <b>{person.hours}h</b></span><span className={person.status.includes("pending") ? "pending-text" : ""}>{person.status}</span></div><button className="secondary full" onClick={() => notify(`${person.name}'s profile opened`)}>View profile</button></article>)}</section></> }

function ShiftDialog({ onClose, onSave, currentWeekOffset }: { onClose: () => void; onSave: (shifts: Shift[]) => void; currentWeekOffset: number }) {
  const [assignment, setAssignment] = useState<"employee" | "open">("employee");
  const [employee, setEmployee] = useState("Alex Morgan"); const [day, setDay] = useState("4"); const [role, setRole] = useState<ShiftRole>("Bartender"); const [start, setStart] = useState("17:00"); const [end, setEnd] = useState("01:00");
  const [repeat, setRepeat] = useState(false); const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly"); const [count, setCount] = useState(4); const [weekdays, setWeekdays] = useState<number[]>([4]);
  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function save() {
    const safeCount = Math.max(1, Math.min(count || 1, frequency === "daily" ? 31 : 52));
    let occurrences: { day: number; weekOffset: number }[];
    if (!repeat) occurrences = [{ day: Number(day), weekOffset: currentWeekOffset }];
    else if (frequency === "daily") occurrences = Array.from({ length: safeCount }, (_, index) => { const absoluteDay = Number(day) + index; return { day: absoluteDay % 7, weekOffset: currentWeekOffset + Math.floor(absoluteDay / 7) }; });
    else {
      const selected = weekdays.length ? weekdays : [Number(day)];
      occurrences = Array.from({ length: safeCount }, (_, week) => selected.map((selectedDay) => ({ day: selectedDay, weekOffset: currentWeekOffset + week }))).flat();
    }
    const uniqueOccurrences = Array.from(new Map(occurrences.map((occurrence) => [`${occurrence.weekOffset}-${occurrence.day}`, occurrence])).values());
    const label = repeat ? (frequency === "daily" ? `Daily · ${uniqueOccurrences.length} times` : `Weekly · ${(weekdays.length ? weekdays : [Number(day)]).map((d) => weekdayNames[d]).join(", ")}`) : undefined;
    const name = assignment === "open" ? "Available shift" : employee;
    const initials = assignment === "open" ? "+" : employee.split(" ").map((word) => word[0]).join("");
    onSave(uniqueOccurrences.map((occurrence, index) => ({ id: crypto.randomUUID(), day: occurrence.day, weekOffset: occurrence.weekOffset, employee: name, initials, start, end, role, status: "Draft", isOpen: assignment === "open", recurrenceLabel: index === 0 ? label : undefined })));
  }
  return <Modal title="Add shift" subtitle="Create one shift or a repeating series." onClose={onClose}>
    <div className="assignment-toggle"><button className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
    <div className="form-grid">
      {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{team.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>}
      {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>A manager approves the employee who receives it.</span></div></div>}
      <label>First day<select value={day} onChange={(e) => { setDay(e.target.value); setWeekdays([Number(e.target.value)]); }}>{days.map((d, i) => <option value={i} key={d.short}>{d.short}</option>)}</select></label>
      <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
      <label>Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
    </div>
    <label className="repeat-switch"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)}/><span><strong>Repeat shift</strong><small>Create a daily or weekly series</small></span></label>
    {repeat && <div className="repeat-panel"><div className="frequency-toggle"><button className={frequency === "daily" ? "selected" : ""} onClick={() => setFrequency("daily")}>Daily</button><button className={frequency === "weekly" ? "selected" : ""} onClick={() => setFrequency("weekly")}>Weekly</button></div>
      {frequency === "weekly" && <div className="weekday-picker">{weekdayNames.map((name, index) => <button key={name} className={weekdays.includes(index) ? "selected" : ""} onClick={() => setWeekdays((current) => current.includes(index) ? current.filter((d) => d !== index) : [...current, index].sort())}>{name}</button>)}</div>}
      <label className="repeat-count">Repeat for <input type="number" min="1" max={frequency === "daily" ? 31 : 52} value={count} onChange={(e) => setCount(Number(e.target.value))}/><span>{frequency === "daily" ? "days" : "weeks"}</span></label>
    </div>}
    <ModalActions onClose={onClose} onSave={save} label={repeat ? "Add repeating shifts" : "Add shift"} />
  </Modal>
}
function EditShiftDialog({ shift, onClose, onSave, onDelete }: { shift: Shift; onClose: () => void; onSave: (shift: Shift) => void; onDelete: () => void }) {
  const [assignment, setAssignment] = useState<"employee" | "open">(shift.isOpen ? "open" : "employee");
  const [employee, setEmployee] = useState(shift.isOpen ? team[0].name : shift.employee);
  const [day, setDay] = useState(String(shift.day));
  const [role, setRole] = useState<ShiftRole>(shift.role);
  const [start, setStart] = useState(shift.start);
  const [end, setEnd] = useState(shift.end);
  const [status, setStatus] = useState<"Draft" | "Published">(shift.status);
  function save() {
    const selectedEmployee = assignment === "open" ? "Available shift" : employee;
    onSave({ ...shift, day: Number(day), employee: selectedEmployee, initials: assignment === "open" ? "+" : employee.split(" ").map((word) => word[0]).join(""), role, start, end, status, isOpen: assignment === "open" });
  }
  return <Modal title="Edit shift" subtitle="Update this shift occurrence, its assignment or availability." onClose={onClose}>
    <div className="assignment-toggle"><button type="button" className={assignment === "employee" ? "selected" : ""} onClick={() => setAssignment("employee")}>Assign employee</button><button type="button" className={assignment === "open" ? "selected" : ""} onClick={() => setAssignment("open")}>Available shift</button></div>
    <div className="form-grid">
      {assignment === "employee" && <label className="full-field">Employee<select value={employee} onChange={(e) => setEmployee(e.target.value)}>{team.map((person) => <option key={person.name}>{person.name}</option>)}</select></label>}
      {assignment === "open" && <div className="open-shift-note full-field"><Users size={18}/><div><strong>Employees can request this shift</strong><span>The current employee is removed. A manager approves the employee who receives it.</span></div></div>}
      <label>Day<select value={day} onChange={(e) => setDay(e.target.value)}>{days.map((item, index) => <option value={index} key={item.short}>{item.short}</option>)}</select></label>
      <label>Role<select value={role} onChange={(e) => setRole(e.target.value as ShiftRole)}><option>Manager</option><option>Bartender</option><option>Floor</option><option>Kitchen</option></select></label>
      <label>Starts<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Ends<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      <label className="full-field">Schedule status<select value={status} onChange={(e) => setStatus(e.target.value as "Draft" | "Published")}><option>Draft</option><option>Published</option></select></label>
    </div>
    {shift.recurrenceLabel && <div className="series-edit-note"><CalendarDays size={17}/><div><strong>Repeating shift</strong><span>This edit changes only this occurrence. Series-wide editing will be added separately.</span></div></div>}
    <div className="edit-shift-actions"><button type="button" className="danger-button" onClick={onDelete}>Delete shift</button><div><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={save}>Save changes</button></div></div>
  </Modal>
}

function ProductDialog({ onClose, onSave }: { onClose: () => void; onSave: (product: Product) => void }) { const [name, setName] = useState(""); const [supplier, setSupplier] = useState("Nordic Drinks"); return <Modal title="Add product" subtitle="Create a new inventory item." onClose={onClose}><div className="form-grid"><label className="full-field">Product name<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lager 30L" /></label><label>Supplier<select value={supplier} onChange={(e) => setSupplier(e.target.value)}><option>Nordic Drinks</option><option>Vin & Co.</option><option>Bar Supply DK</option><option>City Produce</option></select></label><label>Category<select><option>Draught beer</option><option>Wine</option><option>Spirits</option><option>Soft drinks</option></select></label><label>Current stock<input type="number" defaultValue="0" /></label><label>Par level<input type="number" defaultValue="6" /></label></div><ModalActions onClose={onClose} onSave={() => onSave({ id: crypto.randomUUID(), name: name || "New product", category: "Draught beer", supplier, stock: 0, par: 6, unit: "units", price: 0 })} label="Add product" /></Modal> }
function OrderDialog({ onClose, onSave }: { onClose: () => void; onSave: () => void }) { return <Modal title="Create purchase order" subtitle="Choose a supplier to begin an order." onClose={onClose}><div className="supplier-options">{["Nordic Drinks", "Vin & Co.", "Bar Supply DK", "City Produce"].map((supplier, i) => <label key={supplier}><input type="radio" name="supplier" defaultChecked={i === 0} /><span className="attention-icon blue"><Truck size={18} /></span><b>{supplier}</b><ChevronRight size={17} /></label>)}</div><ModalActions onClose={onClose} onSave={onSave} label="Continue" /></Modal> }
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return <div className="modal-layer" role="presentation"><button className="modal-scrim" onClick={onClose} aria-label="Close dialog" /><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div>
}
function ModalActions({ onClose, onSave, label }: { onClose: () => void; onSave: () => void; label: string }) { return <div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" onClick={onSave}>{label}</button></div> }
function money(value: number) { return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(value); }
