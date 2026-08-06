import { createHash } from "node:crypto";
import { requireCapability } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { jsonError, readJsonObject, uuid } from "@/lib/http";
const csv=(v:unknown)=>/[",\n]/.test(String(v??''))?`"${String(v??'').replaceAll('"','""')}"`:String(v??'');
export async function GET(){const u=await requireCapability("payroll.read");return Response.json(await db()`select x.*,p.starts_on,p.ends_on from payroll_exports x join payroll_periods p on p.id=x.payroll_period_id where x.organization_id=${u.organizationId} order by x.created_at desc`)}
export async function POST(req:Request){
 try{
  const u=await requireCapability("payroll.export");const b=await readJsonObject(req);const periodId=uuid(b.periodId,'periodId');
  const result=await db().begin(async sql=>{
   const [period]=await sql`select * from payroll_periods where id=${periodId} and organization_id=${u.organizationId} and status='LOCKED' for update`;
   if(!period) return null;
   const existing=await sql`select * from payroll_exports where payroll_period_id=${period.id} order by created_at desc limit 1`;
   if(existing.length) return {conflict:true,record:existing[0]};
   const rows=await sql`select e.id,e.first_name||' '||e.last_name employee,e.email,e.phone,e.employment_title role,e.payroll_id,e.salary_code,e.cost_centre,count(t.id)::int timesheets,coalesce(sum(t.worked_minutes),0)::int minutes,array_agg(t.id order by t.id) ids from employees e join timesheets t on t.employee_id=e.id where t.organization_id=${u.organizationId} and e.organization_id=${u.organizationId} and t.status='APPROVED' and t.work_date between ${period.starts_on} and ${period.ends_on} and (${period.location_id}::uuid is null or t.location_id=${period.location_id}) group by e.id order by e.first_name,e.last_name`;
   const header=['Payroll ID','Employee','Email','Phone','Role','Salary code','Cost centre','Period start','Period end','Approved timesheets','Approved hours'];
   const body=rows.map((r:any)=>[r.payroll_id,r.employee,r.email,r.phone,r.role,r.salary_code,r.cost_centre,period.starts_on,period.ends_on,r.timesheets,(r.minutes/60).toFixed(2)]);
   const content=[header,...body].map(r=>r.map(csv).join(',')).join('\r\n');const hash=createHash('sha256').update(content).digest('hex');const name=`payroll-${period.starts_on}-${period.ends_on}.csv`;const ids=rows.flatMap((r:any)=>r.ids||[]);const minutes=rows.reduce((n:number,r:any)=>n+Number(r.minutes),0);
   const [record]=await sql`insert into payroll_exports(organization_id,location_id,payroll_period_id,created_by,file_name,file_sha256,row_count,employee_count,approved_minutes,included_timesheet_ids) values(${u.organizationId},${period.location_id},${period.id},${u.userId},${name},${hash},${rows.length},${rows.length},${minutes},${ids}) returning *`;
   await sql`update payroll_periods set status='EXPORTED',exported_by=${u.userId},exported_at=now(),export_file_name=${name},export_sha256=${hash} where id=${period.id}`;
   await sql`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${u.organizationId},${period.location_id},${u.userId},'PAYROLL_EXPORTED','payroll_export',${record.id},${JSON.stringify(record)}::jsonb)`;
   return {content,name,record};
  });
  if(!result)return Response.json({error:'Payroll period must be locked before export'},{status:409});
  if('conflict' in result)return Response.json({error:'This payroll period has already been exported',exportId:result.record.id},{status:409});
  return new Response('\ufeff'+result.content,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':`attachment; filename="${result.name}"`,'x-export-id':result.record.id,'cache-control':'no-store'}});
 }catch(error){return jsonError(error)}
}
