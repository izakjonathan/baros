"use client";

import { PanelTitle, WorkspaceHeader } from "@/components/ui/workspace-ui";
import { useEffect, useState } from "react";
import { Clock3, Palette, RotateCcw, Save } from "lucide-react";
import type { ClockSettings, Location } from "@/features/workspace/types";
import { settingsStyles, surfaceStyles } from "@/lib/ui-classes";

const defaultClockSettings: ClockSettings = { allowMobileClock:true, allowKioskClock:true, allowUnscheduledClock:false, requireLocationCheck:false, earlyClockInMinutes:15, lateClockOutMinutes:60, roundingMinutes:0, autoApproveWithinMinutes:"" };
const defaultTheme = { canvasColor:"#fff4c4", inkColor:"#000000" };
type UiThemeDraft = typeof defaultTheme;
const validColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

function previewTheme(theme: UiThemeDraft) {
  if (validColor(theme.canvasColor) && validColor(theme.inkColor)) window.dispatchEvent(new CustomEvent("barops-theme-updated", { detail: { ...theme, updatedAt:null } }));
}

export function SettingsWorkspace({ locations, selectedLocationId, userRole, devMode, notify }: { locations: Location[]; selectedLocationId: string; userRole: string; devMode: boolean; notify: (message:string)=>void }) {
  const [section, setSection] = useState<"general"|"time"|"security"|"studio">("time");
  const [clock, setClock] = useState<ClockSettings>(defaultClockSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<UiThemeDraft>(defaultTheme);
  const [savedTheme, setSavedTheme] = useState<UiThemeDraft>(defaultTheme);
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const canManage = ["OWNER","ADMIN","MANAGER"].includes(userRole);
  const canManageStudio = userRole === "OWNER";
  const location = locations.find(item => item.id === selectedLocationId);

  useEffect(() => {
    if (devMode || !selectedLocationId || section !== "time") return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/settings/time-clock?locationId=${encodeURIComponent(selectedLocationId)}`, { cache:"no-store", signal:controller.signal })
      .then(async response => { const data=await response.json(); if(!response.ok) throw new Error(data.error||"Could not load settings"); return data; })
      .then(data => setClock({ allowMobileClock:Boolean(data.allow_mobile_clock), allowKioskClock:Boolean(data.allow_kiosk_clock), allowUnscheduledClock:Boolean(data.allow_unscheduled_clock), requireLocationCheck:Boolean(data.require_location_check), earlyClockInMinutes:Number(data.early_clock_in_minutes||0), lateClockOutMinutes:Number(data.late_clock_out_minutes||0), roundingMinutes:Number(data.rounding_minutes||0), autoApproveWithinMinutes:data.auto_approve_within_minutes ?? "" }))
      .catch(error => { if (error?.name !== "AbortError") notify(error.message || "Could not load settings"); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [devMode, selectedLocationId, section, notify]);

  useEffect(() => {
    if (section !== "studio" || !canManageStudio) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (devMode) {
        try {
          const parsed: unknown = JSON.parse(window.localStorage.getItem("barops-ui-theme") || "null");
          if (typeof parsed === "object" && parsed !== null && "canvasColor" in parsed && "inkColor" in parsed) {
            const next = parsed as UiThemeDraft;
            if (validColor(next.canvasColor) && validColor(next.inkColor)) { setTheme(next); setSavedTheme(next); }
          }
        } catch { window.localStorage.removeItem("barops-ui-theme"); }
        return;
      }
      setThemeLoading(true);
      fetch("/api/settings/ui-theme", { cache:"no-store", signal:controller.signal })
      .then(async response => { const data=await response.json(); if(!response.ok) throw new Error(data.error||"Could not load UI Studio"); return data as UiThemeDraft; })
      .then(data => { setTheme(data); setSavedTheme(data); })
      .catch(error => { if (error?.name !== "AbortError") notify(error.message || "Could not load UI Studio"); })
        .finally(() => { if (!controller.signal.aborted) setThemeLoading(false); });
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [canManageStudio, devMode, notify, section]);

  async function saveClock() {
    if (devMode) { notify("Development settings saved for this session"); return; }
    if (!selectedLocationId) { notify("Select a location first"); return; }
    setSaving(true);
    try { const response=await fetch("/api/settings/time-clock", { method:"PUT", headers:{"content-type":"application/json"}, body:JSON.stringify({ locationId:selectedLocationId, ...clock }) }); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||"Could not save settings"); notify("Time clock settings saved"); }
    catch(error) { notify(error instanceof Error ? error.message : "Could not save settings"); } finally { setSaving(false); }
  }
  function setThemeValue(key: keyof UiThemeDraft, value: string) { const next = { ...theme, [key]:value }; setTheme(next); previewTheme(next); }
  function restoreSavedTheme() { setTheme(savedTheme); previewTheme(savedTheme); }
  async function saveTheme() {
    if (!validColor(theme.canvasColor) || !validColor(theme.inkColor)) { notify("Use a six-digit hex value, for example #fff4c4"); return; }
    if (theme.canvasColor.toLowerCase() === theme.inkColor.toLowerCase()) { notify("Canvas and ink colors must be different"); return; }
    setThemeSaving(true);
    try {
      if (devMode) { window.localStorage.setItem("barops-ui-theme", JSON.stringify(theme)); setSavedTheme(theme); previewTheme(theme); notify("Development UI scheme saved for this browser"); return; }
      const response = await fetch("/api/settings/ui-theme", { method:"PUT", headers:{"content-type":"application/json"}, body:JSON.stringify(theme) }); const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save UI scheme"); const next = data as UiThemeDraft; setTheme(next); setSavedTheme(next); previewTheme(next); notify("Global UI scheme saved for every login");
    } catch (error) { notify(error instanceof Error ? error.message : "Could not save UI scheme"); } finally { setThemeSaving(false); }
  }

  return <div className={`${settingsStyles.workspace} page-flow`}><WorkspaceHeader eyebrow="Workspace configuration" title="Settings" /><div className={settingsStyles.layout}>
    <nav className={settingsStyles.nav} aria-label="Settings sections"><button className={section==="general"?"active":""} onClick={()=>setSection("general")}>Organization</button><button className={section==="time"?"active":""} onClick={()=>setSection("time")}>Time clock</button><button className={section==="security"?"active":""} onClick={()=>setSection("security")}>Security</button>{canManageStudio && <button className={section==="studio"?"active":""} onClick={()=>setSection("studio")}><Palette size={16}/>UI Studio</button>}</nav>
    <section className={settingsStyles.panel}>
      {section==="general" && <><PanelTitle title="Organization & location" description="The active workspace context used by scheduling, inventory and attendance."/><div className={`${surfaceStyles.metrics} ${settingsStyles.summary}`}><div className="card card-compact"><span>Current location</span><strong>{location?.name || "No active location"}</strong></div><div className="card card-compact"><span>Available locations</span><strong>{locations.length}</strong></div><div className="card card-compact"><span>Your role</span><strong>{userRole.replaceAll("_"," ")}</strong></div></div><p className={settingsStyles.help}>Location creation and organization identity editing are staged for a later administration release. Switch location from the top bar.</p></>}
      {section==="time" && <><PanelTitle title="Time clock" description="Control mobile and kiosk attendance for the selected location."/>{loading?<div className={settingsStyles.loading}>Loading settings…</div>:<div className={settingsStyles.form}><label className={settingsStyles.toggle}><span><strong>Mobile clock-in</strong><small>Allow linked employees to clock in from their portal.</small></span><input type="checkbox" checked={clock.allowMobileClock} onChange={e=>setClock({...clock,allowMobileClock:e.target.checked})}/></label><label className={settingsStyles.toggle}><span><strong>Kiosk clock-in</strong><small>Allow PIN-based clocking from a shared device.</small></span><input type="checkbox" checked={clock.allowKioskClock} onChange={e=>setClock({...clock,allowKioskClock:e.target.checked})}/></label><label className={settingsStyles.toggle}><span><strong>Unscheduled clock-in</strong><small>Permit clock-in when no nearby published shift exists.</small></span><input type="checkbox" checked={clock.allowUnscheduledClock} onChange={e=>setClock({...clock,allowUnscheduledClock:e.target.checked})}/></label><label className={settingsStyles.toggle}><span><strong>Require location check</strong><small>Require location verification when geofencing is configured.</small></span><input type="checkbox" checked={clock.requireLocationCheck} onChange={e=>setClock({...clock,requireLocationCheck:e.target.checked})}/></label><div className={settingsStyles.fields}><label>Early clock-in window<input type="number" min="0" max="240" value={clock.earlyClockInMinutes} onChange={e=>setClock({...clock,earlyClockInMinutes:Number(e.target.value)})}/><small>Minutes before the shift</small></label><label>Missed clock-out threshold<input type="number" min="0" max="720" value={clock.lateClockOutMinutes} onChange={e=>setClock({...clock,lateClockOutMinutes:Number(e.target.value)})}/><small>Minutes after scheduled end</small></label><label>Rounding<select value={clock.roundingMinutes} onChange={e=>setClock({...clock,roundingMinutes:Number(e.target.value)})}><option value="0">No rounding</option><option value="5">5 minutes</option><option value="6">6 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label><label>Auto-approval tolerance<input type="number" min="0" max="240" value={clock.autoApproveWithinMinutes} onChange={e=>setClock({...clock,autoApproveWithinMinutes:e.target.value===""?"":Number(e.target.value)})}/><small>Leave blank for manager approval</small></label></div><div className={settingsStyles.actions}><button className={`primary ${surfaceStyles.control}`} disabled={!canManage||saving} onClick={saveClock}><Save size={17}/>{saving?"Saving…":"Save settings"}</button><a className={`secondary ${surfaceStyles.control}`} href="/employee/hours"><Clock3 size={17}/>Open my time clock</a>{!canManage&&<small>Owner, Admin or Manager permission is required to change settings.</small>}</div></div>}</>}
      {section==="studio" && canManageStudio && <><PanelTitle title="UI Studio" description="Choose the organization-wide canvas and ink colors. Tints, muted text and status accents are derived from these two values."/>{themeLoading?<div className={settingsStyles.loading}>Loading saved UI scheme…</div>:<div className={`${settingsStyles.form} ui-studio-form`}><div className="ui-studio-colors"><label className="ui-color-field"><span>Canvas / background</span><input aria-label="Canvas color picker" type="color" value={theme.canvasColor} onChange={event=>setThemeValue("canvasColor",event.target.value)}/><input aria-label="Canvas color hex value" value={theme.canvasColor} onChange={event=>setThemeValue("canvasColor",event.target.value)} inputMode="text" maxLength={7}/></label><label className="ui-color-field"><span>Ink / text and borders</span><input aria-label="Ink color picker" type="color" value={theme.inkColor} onChange={event=>setThemeValue("inkColor",event.target.value)}/><input aria-label="Ink color hex value" value={theme.inkColor} onChange={event=>setThemeValue("inkColor",event.target.value)} inputMode="text" maxLength={7}/></label></div><div className="ui-theme-preview" style={{ backgroundColor:theme.canvasColor, color:theme.inkColor }}><strong>Bar Ops preview</strong><span>Muted and tinted UI colors inherit this scheme.</span><button type="button" style={{ backgroundColor:theme.inkColor, color:theme.canvasColor }}>Example action</button></div><p className={settingsStyles.help}>Saving updates the shared organization scheme and is visible to every owner, manager and employee on their next render. This control is restricted to owners.</p><div className={settingsStyles.actions}><button className={`primary ${surfaceStyles.control}`} disabled={themeSaving} onClick={saveTheme}><Save size={17}/>{themeSaving?"Saving…":"Save global scheme"}</button><button className={`secondary ${surfaceStyles.control}`} type="button" disabled={themeSaving} onClick={restoreSavedTheme}><RotateCcw size={17}/>Restore saved</button></div></div>}</>}
      {section==="security" && <><PanelTitle title="Security & data" description="Current production safeguards and administration status."/><div className={`${surfaceStyles.metrics} ${settingsStyles.summary}`}><div className="card card-compact"><span>Authentication</span><strong>Database sessions</strong></div><div className="card card-compact"><span>Audit trail</span><strong>Enabled</strong></div><div className="card card-compact"><span>GDPR requests</span><strong>Foundation ready</strong></div></div><p className={settingsStyles.help}>MFA enrollment, password-reset delivery, session revocation and managed backups remain in the production roadmap.</p></>}
    </section>
  </div></div>;
}
