"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Hand } from "lucide-react";
import { Dialog, DialogActions, FormMessage } from "../../../components/ui/interaction-ui";

type Person={id:string;name:string};
type SwapShift={id:string;employeeId:string;label:string};
type RequestState='idle'|'saving'|'done'|'error';

async function jsonRequest(path:string,options:RequestInit){
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(path,{...options,signal:controller.signal});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(typeof data?.error==='string'?data.error:`Request failed (${response.status})`);
    return data;
  }catch(error){
    if(error instanceof DOMException&&error.name==='AbortError') throw new Error('The request timed out. Check your connection and try again.');
    throw error;
  }finally{window.clearTimeout(timeout)}
}

export function ClaimShiftButton({shiftId}:{shiftId:string}){
  const router=useRouter();
  const [state,setState]=useState<RequestState>('idle');
  const [error,setError]=useState('');
  async function claim(){
    if(state==='saving'||state==='done')return;
    setState('saving');setError('');
    try{await jsonRequest('/api/shift-claims',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({shiftId})});setState('done');router.refresh()}
    catch(e){setError(e instanceof Error?e.message:'Could not request this shift');setState('error')}
  }
  return <div><button type="button" className="portal-action primary-action shift-card-action" disabled={state==='saving'||state==='done'} onClick={claim}>{state==='done'?'Request sent':state==='saving'?'Sending…':state==='error'?'Try again':'Request shift'}</button>{error&&<small className="form-error" role="alert">{error}</small>}</div>
}

export function TransferResponse({transferId}:{transferId:string}){
  const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  async function respond(accept:boolean){if(busy)return;setBusy(true);setError('');try{await jsonRequest('/api/shift-transfers',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transferId,accept})});router.refresh()}catch(e){setError(e instanceof Error?e.message:'Could not respond to this request')}finally{setBusy(false)}}
  return <div><div className="transfer-response"><button type="button" disabled={busy} className="secondary" onClick={()=>respond(false)}>Decline</button><button type="button" disabled={busy} className="primary" onClick={()=>respond(true)}>Accept</button></div>{error&&<small className="form-error" role="alert">{error}</small>}</div>
}

export function TransferShiftButton({shiftId,people,swapShifts}:{shiftId:string;people:Person[];swapShifts:SwapShift[]}){
  const router=useRouter();
  const [open,setOpen]=useState(false),[type,setType]=useState<'HANDOVER'|'SWAP'>('HANDOVER'),[target,setTarget]=useState(people[0]?.id||''),[swap,setSwap]=useState(''),[note,setNote]=useState(''),[state,setState]=useState<RequestState>('idle'),[error,setError]=useState('');
  const targetShifts=useMemo(()=>swapShifts.filter(item=>item.employeeId===target),[swapShifts,target]);
  function openDialog(){const initialTarget=people[0]?.id||'';setTarget(initialTarget);setType('HANDOVER');setSwap('');setNote('');setState('idle');setError('');setOpen(true)}
  function changeTarget(value:string){setTarget(value);setSwap('');setState('idle');setError('')}
  function changeType(value:'HANDOVER'|'SWAP'){setType(value);setSwap('');setState('idle');setError('')}
  async function submit(){
    if(state==='saving')return;
    setState('saving');setError('');
    try{
      await jsonRequest('/api/shift-transfers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({shiftId,type,targetEmployeeId:target||null,swapShiftId:type==='SWAP'?swap:null,note})});
      setState('done');setOpen(false);router.refresh();
    }catch(e){setError(e instanceof Error?e.message:'Could not send request');setState('error')}
  }
  return <><button type="button" className="portal-action shift-card-action" disabled={!people.length} onClick={openDialog}>Hand over / swap</button>{state==='done'&&<small role="status">Request sent</small>}{open&&<Dialog title="Change this shift" description="The other employee responds first, then a manager approves." onClose={()=>setOpen(false)}><div className="assignment-toggle" role="group" aria-label="Transfer type"><button type="button" aria-pressed={type==='HANDOVER'} className={type==='HANDOVER'?'selected':''} onClick={()=>changeType('HANDOVER')}><Hand size={14}/>Hand over</button><button type="button" aria-pressed={type==='SWAP'} className={type==='SWAP'?'selected':''} onClick={()=>changeType('SWAP')}><ArrowRightLeft size={14}/>Swap</button></div><div className="transfer-dialog form-stack"><label>Employee<select value={target} onChange={e=>changeTarget(e.target.value)}>{people.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>{type==='SWAP'&&<label>Their shift<select value={swap} onChange={e=>setSwap(e.target.value)}><option value="">Select their shift</option>{targetShifts.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select>{!targetShifts.length&&<small className="field-help">No eligible published shifts for this employee.</small>}</label>}<label>Note<textarea rows={3} value={note} onChange={e=>setNote(e.target.value)}/></label>{error&&<FormMessage>{error}</FormMessage>}</div><DialogActions onClose={()=>setOpen(false)} onConfirm={submit} confirmLabel={state==='saving'?'Sending…':'Send request'} busy={state==='saving'} disabled={!target||(type==='SWAP'&&!swap)}/></Dialog>}</>
}
