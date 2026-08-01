import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, uuid } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"]);
    const requested = new URL(request.url).searchParams.get("locationId");
    const locations = await db()`select * from locations where organization_id=${user.organizationId} and active order by name`;
    let selectedLocationId: string | null = requested ? uuid(requested, "locationId") : user.locationId || locations[0]?.id || null;
    if (selectedLocationId && !locations.some((location: any) => location.id === selectedLocationId)) throw new ApiError(400, "Location does not belong to this organization");

    const [employees, shifts, products, orders, timesheets, alerts, exports, templates, forecasts] = await Promise.all([
      db()`select e.*,coalesce(json_agg(json_build_object('id',l.id,'name',l.name)) filter(where l.id is not null),'[]') locations,case when e.user_id is not null then 'ACTIVE' else 'NONE' end portal_status from employees e left join employee_locations el on el.employee_id=e.id left join locations l on l.id=el.location_id where e.organization_id=${user.organizationId} group by e.id order by e.first_name,e.last_name`,
      db()`select s.*,e.first_name||' '||e.last_name employee_name from shifts s left join employees e on e.id=s.employee_id where s.organization_id=${user.organizationId} and (${selectedLocationId}::uuid is null or s.location_id=${selectedLocationId}) and s.starts_at>=now()-interval '60 days' and s.starts_at<now()+interval '180 days' order by s.starts_at`,
      db()`select p.*,s.name supplier,li.quantity,li.par_level from products p left join suppliers s on s.id=p.supplier_id left join location_inventory li on li.product_id=p.id and li.location_id=${selectedLocationId} where p.organization_id=${user.organizationId} and p.active order by p.name`,
      db()`select po.*,s.name supplier,coalesce(sum(i.quantity*i.unit_price),0) total,count(i.id)::int items from purchase_orders po join suppliers s on s.id=po.supplier_id left join purchase_order_items i on i.purchase_order_id=po.id where po.organization_id=${user.organizationId} and (${selectedLocationId}::uuid is null or po.location_id=${selectedLocationId}) group by po.id,s.name order by po.created_at desc limit 100`,
      db()`select t.*,e.first_name||' '||e.last_name employee_name from timesheets t join employees e on e.id=t.employee_id where t.organization_id=${user.organizationId} and (${selectedLocationId}::uuid is null or t.location_id=${selectedLocationId}) order by t.work_date desc limit 500`,
      db()`select * from attendance_alerts where organization_id=${user.organizationId} and (${selectedLocationId}::uuid is null or location_id=${selectedLocationId}) and resolved_at is null order by created_at desc limit 100`,
      db()`select * from payroll_exports where organization_id=${user.organizationId} order by created_at desc limit 50`,
      db()`select * from schedule_templates where organization_id=${user.organizationId} and (${selectedLocationId}::uuid is null or location_id=${selectedLocationId}) and active order by name`,
      db()`select * from labour_forecasts where organization_id=${user.organizationId} and (${selectedLocationId}::uuid is null or location_id=${selectedLocationId}) and forecast_date between current_date-14 and current_date+90 order by forecast_date`
    ]);
    return NextResponse.json({ locations, selectedLocationId, employees, shifts, products, orders, timesheets, alerts, exports, templates, forecasts });
  } catch (error) { return jsonError(error); }
}
