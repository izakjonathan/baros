import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, optionalString, readJsonObject, uuid } from "@/lib/http";
const statuses=['PENDING','APPROVED','REJECTED'] as const;
export async function GET(req:Request){const u=await requireUser();const url=new URL(req.url);const from=url.searchParams.get('from');const to=url.searchParams.get('to');const manager=['OWNER','ADMIN','MANAGER','SHIFT_MANAGER'].includes(u.role);const rows=await db()`select t.*,e.first_name||' '||e.last_name employee_name from timesheets t join employees e on e.id=t.employee_id and e.organization_id=t.organization_id where t.organization_id=${u.organizationId} and (${manager} or t.employee_id=${u.employeeId}) and (${from}::date is null or t.work_date>=${from}::date) and (${to}::date is null or t.work_date<=${to}::date) order by t.work_date desc,t.clocked_in_at desc`;return NextResponse.json(rows)}
export async function PATCH(req:Request){
 try{
  const u=await requireUser(['OWNER','ADMIN','MANAGER','SHIFT_MANAGER']);const b=await readJsonObject(req);const id=uuid(b.id);const status=String(b.status||'APPROVED').toUpperCase();
  if(!statuses.includes(status as typeof statuses[number]))throw new ApiError(400,'Invalid timesheet status');
  const managerNote=optionalString(b,'managerNote',1000);
  const rows=await db().begin(async sql=>{
   const [sheet]=await sql`select * from timesheets where id=${id} and organization_id=${u.organizationId} for update`;
   if(!sheet)return [];
   const locked=await sql`select id,status from payroll_periods where organization_id=${u.organizationId} and work_date_range @> ${sheet.work_date}::date and (location_id is null or location_id=${sheet.location_id}) and status in ('LOCKED','EXPORTED','CLOSED') limit 1`;
   if(locked.length)throw new ApiError(409,`Timesheet belongs to a ${locked[0].status.toLowerCase()} payroll period`);
   const updated=await sql`update timesheets set status=${status},approved_by=case when ${status}='APPROVED' then ${u.userId} else null end,approved_at=case when ${status}='APPROVED' then now() else null end,manager_note=${managerNote},updated_at=now() where id=${id} and organization_id=${u.organizationId} returning *`;
   await sql`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data,after_data) values(${u.organizationId},${sheet.location_id},${u.userId},'TIMESHEET_STATUS_CHANGED','timesheet',${id},${JSON.stringify(sheet)}::jsonb,${JSON.stringify(updated[0])}::jsonb)`;
   return updated;
  });
  return rows.length?NextResponse.json(rows[0]):NextResponse.json({error:'Not found'},{status:404});
 }catch(error){return jsonError(error)}
}
