import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { distanceMeters } from "@/lib/security/geofence";
import { verifyKioskPin } from "@/lib/security/kiosk-pin";
import { jsonError, readJsonObject, requiredString, uuid } from "@/lib/http";

export async function POST(req:Request){
 try {
  const b=await readJsonObject(req,8_000); const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const locationId=uuid(b.locationId,'locationId'); const employeeId=uuid(b.employeeId,'employeeId'); const pin=requiredString(b,'pin',8);
  try{await enforceRateLimit(`kiosk:${locationId}:${employeeId}:${ip}`,10,15*60)}catch{return NextResponse.json({error:'Too many attempts. Try again later.'},{status:429})}
  const [employee]=await db()`select e.*,l.latitude,l.longitude,l.clock_radius_meters from employees e join employee_locations el on el.employee_id=e.id join locations l on l.id=el.location_id where e.id=${employeeId} and l.id=${locationId} and e.organization_id=l.organization_id and e.active and e.kiosk_pin_hash is not null and (e.pin_locked_until is null or e.pin_locked_until<now()) limit 1`;
  if(!employee || !(await verifyKioskPin(pin,String(employee.kiosk_pin_hash)))){
    if(employee) await db()`update employees set pin_failed_attempts=pin_failed_attempts+1,pin_locked_until=case when pin_failed_attempts+1>=5 then now()+interval '15 minutes' else pin_locked_until end where id=${employee.id}`;
    return NextResponse.json({error:'Invalid employee or PIN'},{status:401});
  }
  if(employee.latitude!=null&&employee.longitude!=null){
    if(b.latitude==null||b.longitude==null)return NextResponse.json({error:'Location permission is required'},{status:403});
    const d=distanceMeters(Number(employee.latitude),Number(employee.longitude),Number(b.latitude),Number(b.longitude));
    if(d>Number(employee.clock_radius_meters)){await db()`insert into attendance_alerts(organization_id,location_id,employee_id,alert_type,severity,message) values(${employee.organization_id},${locationId},${employee.id},'GEOFENCE','WARNING',${`Clock attempt ${Math.round(d)}m from venue`})`;return NextResponse.json({error:'Outside approved clock-in area',distanceMeters:Math.round(d)},{status:403})}
  }
  await db()`update employees set pin_failed_attempts=0,pin_locked_until=null where id=${employee.id}`;
  return NextResponse.json({employeeId:employee.id,name:`${employee.first_name} ${employee.last_name}`,verified:true});
 } catch(error){return jsonError(error)}
}
