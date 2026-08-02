"use client";

import { AlertTriangle, ArrowRight, Boxes, CalendarDays, ChevronRight, CircleDollarSign, ClipboardList, Clock3, MoreHorizontal, ShoppingCart, Sparkles, Truck, UserRoundPlus, Users, type LucideIcon } from "lucide-react";
import { KpiCard, PanelTitle } from "@/components/ui-primitives";
import { PageHeader } from "@/components/app-shell";
import type { NavKey, Product, Shift } from "@/lib/data";

export function Dashboard({ shifts, products, onNavigate }: { shifts: Shift[]; products: Product[]; onNavigate: (id: NavKey) => void }) {
  const lowStock = products.filter((product) => product.stock < product.par);
  const draftCount = shifts.filter((shift) => shift.status === "Draft").length;
  return <>
    <PageHeader eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} title="Overview" subtitle="Here’s what needs your attention across the bar." />
    <section className="metric-grid">
      <Metric icon={Users} label="On shift today" value="3 people" detail="Next shift starts at 17:00" trend="Fully covered" />
      <Metric icon={Clock3} label="Scheduled this week" value="139 hours" detail="Across 14 shifts" trend="8% vs last week" />
      <Metric icon={CircleDollarSign} label="Estimated labour" value="22,480 kr." detail="16.2% of forecast sales" trend="On target" />
      <Metric icon={AlertTriangle} label="Needs attention" value={`${lowStock.length + draftCount} items`} detail={`${lowStock.length} low stock · ${draftCount} draft shifts`} trend="Review now" warning />
    </section>
    <div className="dashboard-grid">
      <section className="panel today-panel"><PanelTitle title="Today at the bar" subtitle={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} action={<button className="text-button" onClick={() => onNavigate("schedule")}>View shift plan <ArrowRight size={15} /></button>} />
        <div className="timeline">{[
          { time: "15:00", title: "Maya Chen", role: "Manager", initials: "MC", end: "00:00" },
          { time: "17:00", title: "Jonas Berg", role: "Bartender", initials: "JB", end: "03:00" },
          { time: "19:00", title: "Sofia Lund", role: "Floor · confirmation pending", initials: "SL", end: "02:00", pending: true }
        ].map((item) => <div className="timeline-row" key={item.title}><time>{item.time}</time><div className={`avatar ${item.pending ? "sand" : ""}`}>{item.initials}</div><div className="grow"><strong>{item.title}</strong><span>{item.role}</span></div><span className="shift-time">{item.time}–{item.end}</span><button className="more" aria-label={`More options for ${item.title}`}><MoreHorizontal size={19} /></button></div>)}</div>
      </section>
      <section className="panel attention-panel"><PanelTitle title="Attention needed" subtitle="Prioritised for you" />
        <button className="attention-item" onClick={() => onNavigate("inventory")}><span className="attention-icon amber"><Boxes size={19} /></span><div><strong>{lowStock.length} products below par</strong><small>Pilsner, house red and more</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("schedule")}><span className="attention-icon violet"><CalendarDays size={19} /></span><div><strong>{draftCount} unpublished shifts</strong><small>Complete and publish this week</small></div><ChevronRight size={18} /></button>
        <button className="attention-item" onClick={() => onNavigate("orders")}><span className="attention-icon blue"><Truck size={19} /></span><div><strong>Delivery tomorrow</strong><small>Nordic Drinks · 4 items</small></div><ChevronRight size={18} /></button>
      </section>
    </div>
    <section className="panel quick-panel"><PanelTitle title="Quick actions" subtitle="Common management tasks" /><div className="quick-grid">
      <Quick icon={CalendarDays} label="Open shift plan" detail="Create and publish shifts" onClick={() => onNavigate("schedule")} />
      <Quick icon={ClipboardList} label="Start stock count" detail="Update inventory levels" onClick={() => onNavigate("inventory")} />
      <Quick icon={ShoppingCart} label="Create order" detail="Build a purchase order" onClick={() => onNavigate("orders")} />
      <Quick icon={UserRoundPlus} label="Invite employee" detail="Add someone to the team" onClick={() => onNavigate("team")} />
    </div></section>
  </>;
}

function Metric({ icon: Icon, label, value, detail, trend, warning }: { icon: LucideIcon; label: string; value: string; detail: string; trend: string; warning?: boolean }) {
  return <KpiCard icon={<Icon size={20} />} label={label} value={value} detail={detail} warning={warning} footer={<>{warning ? <AlertTriangle size={13} /> : <Sparkles size={13} />}{trend}</>} />;
}
function Quick({ icon: Icon, label, detail, onClick }: { icon: LucideIcon; label: string; detail: string; onClick: () => void }) { return <button className="quick-action" onClick={onClick}><span><Icon size={19} /></span><div><strong>{label}</strong><small>{detail}</small></div><ArrowRight size={17} /></button>; }
