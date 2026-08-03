"use client";
import { useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

type QueueItem={id:string;kind:"REQUEST"|"CLAIM"|"TRANSFER";title:string;subtitle:string;status:string;createdAt:string};

export function RequestsWorkspace({devMode,notify}:{devMode:boolean;notify:(message:string)=>void}){
  const [items,setItems]=useState<QueueItem[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null);
  async function load(){
    if(devMode){setItems([]);setLoading(false);return;}
    setLoading(true);
    try{
      const [requests,claims,transfers]=await Promise.all([
        fetch('/api/requests',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()),
        fetch('/api/shift-claims',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()),
        fetch('/api/shift-transfers',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()),
      ]);
      const mapped:QueueItem[]=[
        ...requests.map((r:any)=>({id:r.id,kind:"REQUEST" as const,title:`${r.employee_name} · ${String(r.type).replaceAll('_',' ')}`,subtitle:range(r.starts_at,r.ends_at),status:r.status,createdAt:r.created_at})),
        ...claims.map((r:any)=>({id:r.id,kind:"CLAIM" as const,title:`${r.employee_name} · Open shift`,subtitle:range(r.starts_at,r.ends_at),status:r.status,createdAt:r.created_at})),
        ...transfers.map((r:any)=>({id:r.id,kind:"TRANSFER" as const,title:`${r.requested_by_name||'Employee'} · ${r.type==='SWAP'?'Shift swap':'Shift handover'}`,subtitle:range(r.starts_at,r.ends_at),status:r.status,createdAt:r.created_at})),
      ].sort((a,b)=>(a.status==='PENDING'||a.status==='PENDING_MANAGER'?-1:1)-(b.status==='PENDING'||b.status==='PENDING_MANAGER'?-1:1)||new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
      setItems(mapped);
    }catch{notify('Could not load employee requests');}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load()},[]);
  async function review(item:QueueItem,status:'APPROVED'|'REJECTED'){
    setBusy(item.id);
    const path=item.kind==='REQUEST'?'/api/requests':item.kind==='CLAIM'?'/api/shift-claims':'/api/shift-transfers';
    const key=item.kind==='REQUEST'?'requestId':item.kind==='CLAIM'?'claimId':'transferId';
    try{const r=await fetch(path,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({[key]:item.id,status})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Could not review request');notify(`Request ${status.toLowerCase()}`);await load();}catch(e){notify(e instanceof Error?e.message:'Could not review request')}finally{setBusy(null)}
  }
  const actionable=(item:QueueItem)=>item.status==='PENDING'||item.status==='PENDING_MANAGER';
  return <section><div className="page-header"><div><p className="eyebrow">Employee self-service</p><h1>Requests</h1><p>Review time off, open shifts and employee-approved shift changes.</p></div><button className="secondary" type="button" onClick={()=>void load()}><RefreshCw size={16}/>Refresh</button></div><div className="panel request-queue"><div className="panel-title"><div><h2>Review queue</h2><p>{items.filter(actionable).length} awaiting a decision</p></div></div>{loading?<div className="queue-empty">Loading requests…</div>:items.length?items.map(item=><article key={`${item.kind}-${item.id}`}><div><span className="queue-kind">{item.kind}</span><strong>{item.title}</strong><p>{item.subtitle}</p><small>{item.status.replaceAll('_',' ')}</small></div>{actionable(item)&&<div className="queue-actions"><button className="secondary" type="button" disabled={busy===item.id} onClick={()=>void review(item,'REJECTED')}><X size={15}/>Reject</button><button className="primary" type="button" disabled={busy===item.id} onClick={()=>void review(item,'APPROVED')}><Check size={15}/>Approve</button></div>}</article>):<div className="queue-empty">No employee requests yet.</div>}</div></section>
}
function range(start?:string|null,end?:string|null){if(!start)return 'Flexible';const f=new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'});return `${f.format(new Date(start))}${end?` – ${f.format(new Date(end))}`:''}`}
