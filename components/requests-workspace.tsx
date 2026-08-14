"use client";
import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, CheckCircle2, RefreshCw, Shuffle, Umbrella, X } from "lucide-react";
import { requestStyles as styles, surfaceStyles } from "@/lib/ui-classes";
import { WorkspaceHeader } from "@/components/ui/workspace-ui";
import type { RequestQueueRecord, ShiftClaimQueueRecord, ShiftTransferQueueRecord } from "@/features/requests/types";

type QueueItem={id:string;kind:"REQUEST"|"CLAIM"|"TRANSFER";title:string;subtitle:string;status:string;createdAt:string};

export function RequestsWorkspace({devMode,notify}:{devMode:boolean;notify:(message:string)=>void}){
  const [items,setItems]=useState<QueueItem[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null);
  const load=useCallback(async({silent=false}:{silent?:boolean}={})=>{
    if(devMode){setItems([]);setLoading(false);return;}
    if(!silent)setLoading(true);
    try{
      const [requests,claims,transfers]=await Promise.all([

        fetchJsonArray<RequestQueueRecord>('/api/requests'),
        fetchJsonArray<ShiftClaimQueueRecord>('/api/shift-claims'),
        fetchJsonArray<ShiftTransferQueueRecord>('/api/shift-transfers'),
      ]);
      const mapped:QueueItem[]=[
        ...requests.map((r)=>({id:r.id,kind:"REQUEST" as const,title:`${r.employee_name} · ${String(r.type).replaceAll('_',' ')}`,subtitle:range(r.starts_at,r.ends_at),status:r.status,createdAt:r.created_at})),
        ...claims.map((r)=>({id:r.id,kind:"CLAIM" as const,title:`${r.employee_name} · Open shift`,subtitle:range(r.starts_at,r.ends_at),status:r.status,createdAt:r.created_at})),
        ...transfers.map((r)=>({id:r.id,kind:"TRANSFER" as const,title:`${r.requested_by_name||'Employee'} · ${r.type==='SWAP'?'Shift swap':'Shift handover'}`,subtitle:range(r.starts_at,r.ends_at),status:r.status,createdAt:r.created_at})),
      ].filter(actionable).sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
      setItems(mapped);
    }catch{if(!silent)notify('Could not load employee requests');}
    finally{if(!silent)setLoading(false);}
  },[devMode,notify]);
  useEffect(()=>{
    void load();
    const refresh=()=>void load({silent:true});
    const timer=window.setInterval(refresh,15000);
    const onVisibility=()=>{if(document.visibilityState==='visible')refresh()};
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',onVisibility)};
  },[load]);
  async function review(item:QueueItem,status:'APPROVED'|'REJECTED'){
    setBusy(item.id);
    const path=item.kind==='REQUEST'?'/api/requests':item.kind==='CLAIM'?'/api/shift-claims':'/api/shift-transfers';
    const key=item.kind==='REQUEST'?'requestId':item.kind==='CLAIM'?'claimId':'transferId';
    try{
      const r=await fetch(path,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({[key]:item.id,status})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok){
        if(r.status===409){
          setItems(current=>current.filter(entry=>!(entry.id===item.id&&entry.kind===item.kind)));
          notify('This request was already resolved or is no longer valid');
          await load({silent:true});
          return;
        }
        throw new Error(data.error||'Could not review request');
      }
      setItems(current=>current.filter(entry=>!(entry.id===item.id&&entry.kind===item.kind)));
      notify(`Request ${status.toLowerCase()}`);
      await load({silent:true});
    }catch(e){notify(e instanceof Error?e.message:'Could not review request')}
    finally{setBusy(null)}
  }
  const requestCount=items.filter(item=>item.kind==="REQUEST").length;
  const claimCount=items.filter(item=>item.kind==="CLAIM").length;
  const transferCount=items.filter(item=>item.kind==="TRANSFER").length;
  return <section className={surfaceStyles.workspace}>
    <WorkspaceHeader eyebrow="Employee self-service" title="Requests" description="Review time off, open shifts and employee-approved shift changes." actions={<button className={`${surfaceStyles.control} ${surfaceStyles.outline} ${styles.refresh}`} type="button" disabled={loading} onClick={()=>void load()}><RefreshCw className={loading?styles.loadingIcon:undefined} size={16}/>Refresh</button>}/>
    <section className={`${surfaceStyles.metrics} ${styles.summary}`} aria-label="Request summary">
      <article className="card card-compact"><span>Awaiting review</span><strong>{items.length}</strong></article>
      <article className="card card-compact"><span>Open shifts</span><strong>{claimCount}</strong></article>
      <article className="card card-compact"><span>Changes</span><strong>{transferCount+requestCount}</strong></article>
    </section>
    <section className={styles.queue}>
      <header className={`${surfaceStyles.sectionHeader} ${styles.queueHeader}`}><div><h2>Review queue</h2><p>Oldest requests appear first.</p></div><span className={styles.liveStatus}>Live queue</span></header>
      {loading?<div className={`${surfaceStyles.empty} ${styles.empty}`}><RefreshCw className={styles.loadingIcon}/><strong>Loading requests</strong><span>Checking the latest employee requests and shift actions.</span></div>:items.length?<div className={styles.list}>{items.map(item=>{
        const Icon=item.kind==="REQUEST"?Umbrella:item.kind==="CLAIM"?CalendarClock:Shuffle;
        return <article className={styles.card} data-kind={item.kind} key={`${item.kind}-${item.id}`}>
          <header className={`${surfaceStyles.cardHeader} ${styles.cardHeader}`}><span className={styles.kind}>{item.kind}</span><span className={styles.status}>{item.status.replaceAll('_',' ').toLowerCase()}</span></header>
          <h3>{item.title}</h3>
          <div className={styles.meta}><span><Icon size={16}/><p>{item.subtitle}</p></span></div>
          <div className={styles.actions}><button className={`${surfaceStyles.control} ${surfaceStyles.outline} ${styles.reject}`} type="button" disabled={busy===item.id} onClick={()=>void review(item,'REJECTED')}><X size={15}/>Reject</button><button className={`${surfaceStyles.control} ${surfaceStyles.solid} ${styles.approve}`} type="button" disabled={busy===item.id} onClick={()=>void review(item,'APPROVED')}><Check size={15}/>Approve</button></div>
        </article>})}</div>:<div className={`${surfaceStyles.empty} ${styles.empty}`}><CheckCircle2/><strong>Queue is clear</strong><span>No employee requests are awaiting a manager decision.</span></div>}
    </section>
  </section>
}
function actionable(item:QueueItem){return item.kind==='TRANSFER'?item.status==='PENDING_MANAGER':item.status==='PENDING'}
function range(start?:string|null,end?:string|null){if(!start)return 'Flexible';const f=new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'});return `${f.format(new Date(start))}${end?` – ${f.format(new Date(end))}`:''}`}

async function fetchJsonArray<T>(path:string):Promise<T[]>{const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error(`Could not load ${path}`);const value:unknown=await response.json();if(!Array.isArray(value))throw new Error(`Invalid response from ${path}`);return value as T[]}
