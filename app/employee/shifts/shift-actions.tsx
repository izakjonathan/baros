"use client";
import { useState } from "react";
import { ArrowRightLeft, Hand, X } from "lucide-react";

type Person = { id: string; name: string };
type SwapShift = { id: string; label: string };

export function ClaimShiftButton({ shiftId }: { shiftId: string }) {
  const [state, setState] = useState<"idle"|"saving"|"done"|"error">("idle");
  async function claim(){setState("saving");const r=await fetch("/api/shift-claims",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({shiftId})});setState(r.ok?"done":"error")}
  return <button className="portal-action primary-action" disabled={state==="saving"||state==="done"} onClick={claim}>{state==="done"?"Request sent":state==="saving"?"Sending…":state==="error"?"Try again":"Request shift"}</button>
}

export function TransferShiftButton({ shiftId, people, swapShifts }: { shiftId:string; people:Person[]; swapShifts:SwapShift[] }) {
  const [open,setOpen]=useState(false); const [type,setType]=useState<"HANDOVER"|"SWAP">("HANDOVER"); const [target,setTarget]=useState(people[0]?.id||""); const [swap,setSwap]=useState(swapShifts[0]?.id||""); const [note,setNote]=useState(""); const [state,setState]=useState("idle");
  async function submit(){setState("saving");const r=await fetch("/api/shift-transfers",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({shiftId,type,targetEmployeeId:target||null,swapShiftId:type==="SWAP"?swap:null,note})});if(r.ok){setState("done");setOpen(false)}else setState("error")}
  return <>{<button className="portal-action" onClick={()=>setOpen(true)}><ArrowRightLeft size={14}/> Hand over / swap</button>}{state==="done"&&<small>Request sent for approval</small>}{open&&<div className="modal-layer"><button className="modal-scrim" onClick={()=>setOpen(false)} aria-label="Close"/><section className="modal"><div className="modal-head"><div><h2>Change this shift</h2><p>The other employee accepts first, then a manager approves.</p></div><button className="icon-button" onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="assignment-toggle"><button className={type==="HANDOVER"?"selected":""} onClick={()=>setType("HANDOVER")}><Hand size={14}/> Hand over</button><button className={type==="SWAP"?"selected":""} onClick={()=>setType("SWAP")}><ArrowRightLeft size={14}/> Swap</button></div><div className="transfer-dialog"><label>Employee<select value={target} onChange={e=>setTarget(e.target.value)}>{people.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>{type==="SWAP"&&<label>Their shift<select value={swap} onChange={e=>setSwap(e.target.value)}>{swapShifts.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select></label>}<label>Note (optional)<textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add context for your colleague and manager"/></label>{state==="error"&&<p className="form-error">Could not send the request.</p>}</div><div className="modal-actions"><button className="secondary" onClick={()=>setOpen(false)}>Cancel</button><button className="primary" disabled={!target||state==="saving"||(type==="SWAP"&&!swap)} onClick={submit}>{state==="saving"?"Sending…":"Send request"}</button></div></section></div>}</>
}
