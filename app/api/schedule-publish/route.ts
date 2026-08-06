import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, isoDate, jsonError, readJsonObject, uuid } from "@/lib/http";
export async function POST(req:Request){
 try{
  const u=await requireCapability("schedule.publish");const b=await readJsonObject(req);const locationId=uuid(b.locationId||u.locationId,'locationId');const start=isoDate(b.weekStart,'weekStart');const end=isoDate(b.weekEnd,'weekEnd');
  if(start>=end)throw new ApiError(400,'weekEnd must be after weekStart');
  const idempotencyKey=String(req.headers.get('idempotency-key')||b.idempotencyKey||'').trim()||null;
  const pub=await db().begin(async sql=>{
   if(idempotencyKey){const existing=await sql`select * from schedule_publications where organization_id=${u.organizationId} and idempotency_key=${idempotencyKey} limit 1`;if(existing.length)return existing[0]}
   await sql`select pg_advisory_xact_lock(hashtext(${`${u.organizationId}:${locationId}:${start}`}))`;
   const conflicts=await sql`select a.id a_id,b.id b_id from shifts a join shifts b on a.organization_id=b.organization_id and a.employee_id=b.employee_id and a.id<b.id and a.starts_at<b.ends_at and b.starts_at<a.ends_at where a.organization_id=${u.organizationId} and b.organization_id=${u.organizationId} and a.location_id=${locationId} and b.location_id=${locationId} and a.starts_at<${end}::date and a.ends_at>${start}::date and a.employee_id is not null and a.status<>'CANCELLED' and b.status<>'CANCELLED' limit 1`;
   if(conflicts.length)throw new ApiError(409,'Resolve schedule conflicts before publishing');
   const employeeConflicts=await sql`select s.id from shifts s where s.organization_id=${u.organizationId} and s.location_id=${locationId} and s.starts_at>=${start}::date and s.starts_at<${end}::date and s.status='DRAFT' and s.employee_id is not null and (exists(select 1 from requests r where r.organization_id=s.organization_id and r.employee_id=s.employee_id and r.type='TIME_OFF' and r.status='APPROVED' and r.starts_at<s.ends_at and r.ends_at>s.starts_at) or exists(select 1 from lateral (select ar.available,ar.available_from,ar.available_to from availability_rules ar where ar.organization_id=s.organization_id and ar.employee_id=s.employee_id and ((ar.valid_from=s.starts_at::date and ar.valid_until=s.starts_at::date) or (ar.valid_from is null and ar.valid_until is null and ar.weekday=extract(dow from s.starts_at)::int)) order by (ar.valid_from is not null) desc limit 1) availability where not availability.available or (availability.available_from is not null and s.starts_at::time<availability.available_from) or (availability.available_to is not null and s.ends_at::date=s.starts_at::date and s.ends_at::time>availability.available_to))) limit 1`;
   if(employeeConflicts.length)throw new ApiError(409,'Resolve employee availability conflicts before publishing');
   const previousRows=await sql<Array<{id:string}>>`select id from schedule_publications where organization_id=${u.organizationId} and location_id=${locationId} and week_start=${start}::date order by version desc limit 1`;
   const previousPublicationId=previousRows[0]?.id ?? null;
   const [v]=await sql`select coalesce(max(version),0)+1 version from schedule_publications where organization_id=${u.organizationId} and location_id=${locationId} and week_start=${start}::date`;
   await sql`update shifts set status='PUBLISHED',published_at=now(),updated_at=now() where organization_id=${u.organizationId} and location_id=${locationId} and starts_at>=${start}::date and starts_at<${end}::date and status='DRAFT'`;
   const [p]=await sql`insert into schedule_publications(organization_id,location_id,week_start,version,published_by,idempotency_key) values(${u.organizationId},${locationId},${start}::date,${v.version},${u.userId},${idempotencyKey}) returning *`;
   await sql`insert into schedule_publication_shift_snapshots(publication_id,shift_id,employee_id,starts_at,ends_at,role) select ${p.id},id,employee_id,starts_at,ends_at,role from shifts where organization_id=${u.organizationId} and location_id=${locationId} and starts_at>=${start}::date and starts_at<${end}::date and status in ('PUBLISHED','CONFIRMED')`;
   if(previousPublicationId){
    await sql`with previous as (select * from schedule_publication_shift_snapshots where publication_id=${previousPublicationId}), current as (select * from schedule_publication_shift_snapshots where publication_id=${p.id}), changes as (
      select c.employee_id,'NEW_SHIFT'::text change_type from current c left join previous pr on pr.shift_id=c.shift_id where pr.shift_id is null and c.employee_id is not null
      union all select pr.employee_id,'REMOVED_SHIFT' from previous pr left join current c on c.shift_id=pr.shift_id where c.shift_id is null and pr.employee_id is not null
      union all select pr.employee_id,'REMOVED_SHIFT' from previous pr join current c on c.shift_id=pr.shift_id where pr.employee_id is distinct from c.employee_id and pr.employee_id is not null
      union all select c.employee_id,'NEW_SHIFT' from previous pr join current c on c.shift_id=pr.shift_id where pr.employee_id is distinct from c.employee_id and c.employee_id is not null
      union all select c.employee_id,'TIME_CHANGED' from previous pr join current c on c.shift_id=pr.shift_id where pr.employee_id=c.employee_id and c.employee_id is not null and (pr.starts_at is distinct from c.starts_at or pr.ends_at is distinct from c.ends_at)
      union all select c.employee_id,'ROLE_CHANGED' from previous pr join current c on c.shift_id=pr.shift_id where pr.employee_id=c.employee_id and c.employee_id is not null and pr.role is distinct from c.role
    ) insert into schedule_publication_changes(publication_id,employee_id,change_types) select ${p.id},employee_id,array_agg(distinct change_type order by change_type) from changes group by employee_id`;
   }else{
    await sql`insert into schedule_publication_changes(publication_id,employee_id,change_types) select ${p.id},employee_id,array['NEW_SHIFT']::text[] from schedule_publication_shift_snapshots where publication_id=${p.id} and employee_id is not null group by employee_id`;
   }
   await sql`insert into notifications(organization_id,user_id,actor_user_id,type,title,body,href) select ${u.organizationId},e.user_id,${u.userId},case when ${previousPublicationId}::uuid is null then 'SCHEDULE_PUBLISHED' else 'SCHEDULE_UPDATED' end,case when ${previousPublicationId}::uuid is null then 'New schedule published' else 'Your schedule changed' end,case when ${previousPublicationId}::uuid is null then ${`Week of ${start}`} else 'Review changes: '||array_to_string(c.change_types,', ') end,'/employee/shifts' from schedule_publication_changes c join employees e on e.id=c.employee_id and e.organization_id=${u.organizationId} where c.publication_id=${p.id} and e.user_id is not null and e.active`;
   const affected=await sql<Array<{employee_id:string;change_types:string[]}>>`select employee_id,change_types from schedule_publication_changes where publication_id=${p.id} order by employee_id`;
   await sql`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${u.organizationId},${locationId},${u.userId},'SCHEDULE_PUBLISHED','schedule_publication',${p.id},${JSON.stringify({publication:p,affectedEmployees:affected})}::jsonb)`;
   return p;
  });
  return NextResponse.json(pub);
 }catch(error){return jsonError(error)}
}
