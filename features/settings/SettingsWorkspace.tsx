"use client";
import { WorkspaceHeader } from "@/components/ui/workspace-ui";
function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) { return <WorkspaceHeader eyebrow={eyebrow} title={title} description={subtitle} actions={action} />; }
import { useEffect, useState } from "react";
import { Clock3, Save } from "lucide-react";
import type { ClockSettings, Location } from "@/features/workspace/types";
import { settingsStyles, surfaceStyles } from "@/lib/ui-classes";
function PanelTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) { return <div className="panel-title"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>; }
export function SettingsWorkspace({ locations, selectedLocationId, userRole, devMode, notify }: { locations: Location[]; selectedLocationId: string; userRole: string; devMode: boolean; notify: (message:string)=>void }) {
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
    <PageHeader eyebrow="Workspace configuration" title="Settings" />
    <div className={settingsStyles.layout}>
      <nav className={settingsStyles.nav} aria-label="Settings sections">
        <button className={section==="general"?"active":""} onClick={()=>setSection("general")}>Organization</button>
        <button className={section==="time"?"active":""} onClick={()=>setSection("time")}>Time clock</button>
        <button className={section==="security"?"active":""} onClick={()=>setSection("security")}>Security</button>
      </nav>
      <section className={settingsStyles.panel}>
        {section==="general" && <><PanelTitle title="Organization & location" subtitle="The active workspace context used by scheduling, inventory and attendance."/><div className={`${surfaceStyles.metrics} ${settingsStyles.summary}`}><div className="card card-compact"><span>Current location</span><strong>{location?.name || "No active location"}</strong></div><div className="card card-compact"><span>Available locations</span><strong>{locations.length}</strong></div><div className="card card-compact"><span>Your role</span><strong>{userRole.replaceAll("_"," ")}</strong></div></div><p className={settingsStyles.help}>Location creation and organization identity editing are staged for a later administration release. Switch location from the top bar.</p></>}
        {section==="time" && <><PanelTitle title="Time clock" subtitle="Control mobile and kiosk attendance for the selected location."/>{loading?<div className={settingsStyles.loading}>Loading settings…</div>:<div className={settingsStyles.form}>
          <label className={settingsStyles.toggle}><span><strong>Mobile clock-in</strong><small>Allow linked employees to clock in from their portal.</small></span><input type="checkbox" checked={clock.allowMobileClock} onChange={e=>setClock({...clock,allowMobileClock:e.target.checked})}/></label>
          <label className={settingsStyles.toggle}><span><strong>Kiosk clock-in</strong><small>Allow PIN-based clocking from a shared device.</small></span><input type="checkbox" checked={clock.allowKioskClock} onChange={e=>setClock({...clock,allowKioskClock:e.target.checked})}/></label>
          <label className={settingsStyles.toggle}><span><strong>Unscheduled clock-in</strong><small>Permit clock-in when no nearby published shift exists.</small></span><input type="checkbox" checked={clock.allowUnscheduledClock} onChange={e=>setClock({...clock,allowUnscheduledClock:e.target.checked})}/></label>
          <label className={settingsStyles.toggle}><span><strong>Require location check</strong><small>Require location verification when geofencing is configured.</small></span><input type="checkbox" checked={clock.requireLocationCheck} onChange={e=>setClock({...clock,requireLocationCheck:e.target.checked})}/></label>
          <div className={settingsStyles.fields}><label>Early clock-in window<input type="number" min="0" max="240" value={clock.earlyClockInMinutes} onChange={e=>setClock({...clock,earlyClockInMinutes:Number(e.target.value)})}/><small>Minutes before the shift</small></label><label>Missed clock-out threshold<input type="number" min="0" max="720" value={clock.lateClockOutMinutes} onChange={e=>setClock({...clock,lateClockOutMinutes:Number(e.target.value)})}/><small>Minutes after scheduled end</small></label><label>Rounding<select value={clock.roundingMinutes} onChange={e=>setClock({...clock,roundingMinutes:Number(e.target.value)})}><option value="0">No rounding</option><option value="5">5 minutes</option><option value="6">6 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label><label>Auto-approval tolerance<input type="number" min="0" max="240" value={clock.autoApproveWithinMinutes} onChange={e=>setClock({...clock,autoApproveWithinMinutes:e.target.value===""?"":Number(e.target.value)})}/><small>Leave blank for manager approval</small></label></div>
          <div className={settingsStyles.actions}><button className={`primary ${surfaceStyles.control}`} disabled={!canManage||saving} onClick={saveClock}><Save size={17}/>{saving?"Saving…":"Save settings"}</button><a className={`secondary settings-link ${surfaceStyles.control}`} href="/employee/hours"><Clock3 size={17}/>Open my time clock</a>{!canManage&&<small>Owner, Admin or Manager permission is required to change settings.</small>}</div>
        </div>}</>}
        {section==="security" && <><PanelTitle title="Security & data" subtitle="Current production safeguards and administration status."/><div className={`${surfaceStyles.metrics} ${settingsStyles.summary}`}><div className="card card-compact"><span>Authentication</span><strong>Database sessions</strong></div><div className="card card-compact"><span>Audit trail</span><strong>Enabled</strong></div><div className="card card-compact"><span>GDPR requests</span><strong>Foundation ready</strong></div></div><p className={settingsStyles.help}>MFA enrollment, password-reset delivery, session revocation and managed backups remain in the production roadmap.</p></>}
      </section>
    </div>
  </div>;
}

