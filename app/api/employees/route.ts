import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasCapability } from "@/lib/auth/capabilities";
import { db } from "@/lib/db/client";
import { hashKioskPin } from "@/lib/security/kiosk-pin";
import { ApiError, jsonError, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const numberValue = (value: unknown, key: string, min = 0, max = 1_000_000) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new ApiError(400, `${key} is invalid`);
  return parsed;
};
const emailValue = (value: unknown) => {
  if (value == null || value === "") return null;
  const email = String(value).trim().toLowerCase();
  if (email.length > 254 || !emailPattern.test(email)) throw new ApiError(400, "email is invalid");
  return email;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user || !hasCapability(user.role, "team.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await db()`select e.*,coalesce(json_agg(json_build_object('id',l.id,'name',l.name)) filter(where l.id is not null),'[]') locations from employees e left join employee_locations el on el.employee_id=e.id left join locations l on l.id=el.location_id where e.organization_id=${user.organizationId} group by e.id order by e.first_name,e.last_name`);
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !hasCapability(user.role, "team.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(request, 20_000);
    const suppliedName = optionalString(body, "name", 160);
    const nameParts = String(suppliedName || "").trim().split(/\s+/).filter(Boolean);
    const firstName = optionalString(body, "firstName", 80) || nameParts[0];
    const lastName = optionalString(body, "lastName", 80) || nameParts.slice(1).join(" ") || "-";
    if (!firstName) throw new ApiError(400, "Employee first name is required");
    const email = emailValue(body.email);
    const phone = optionalString(body, "phone", 40);
    const title = optionalString(body, "title", 120) || optionalString(body, "role", 120);
    const locationId = body.locationId ? uuid(body.locationId, "locationId") : user.locationId;
    const kioskPinHash = body.kioskPin ? await hashKioskPin(requiredString(body, "kioskPin", 8)) : null;

    const row = await db().begin(async (tx) => {
      if (locationId) {
        const locations = await tx`select id from locations where id=${locationId} and organization_id=${user.organizationId}`;
        if (!locations.length) throw new ApiError(400, "Location does not belong to this organization");
      }
      const created = await tx`insert into employees(organization_id,first_name,last_name,email,phone,employment_title,hourly_rate,contracted_hours,payroll_id,salary_code,cost_centre,kiosk_pin_hash,active)
        values(${user.organizationId},${firstName},${lastName},${email},${phone},${title},${numberValue(body.hourlyRate,"hourlyRate")},${numberValue(body.contractedHours,"contractedHours",0,168)},${optionalString(body,"payrollId",100)},${optionalString(body,"salaryCode",100)},${optionalString(body,"costCentre",100)},${kioskPinHash},${body.active !== false}) returning *`;
      const employee = created[0];
      if (locationId) await tx`insert into employee_locations(employee_id,location_id,primary_location) values(${employee.id},${locationId},true) on conflict do nothing`;
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,after_data) values(${user.organizationId},${locationId},${user.userId},'EMPLOYEE_CREATED','employee',${employee.id},${JSON.stringify(employee)}::jsonb)`;
      return employee;
    });
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    const databaseError = error as { code?: string; constraint?: string; constraint_name?: string };
    const constraint = String(databaseError.constraint || databaseError.constraint_name || "");
    if (databaseError.code === "23505" && constraint.toLowerCase().includes("employee")) {
      return NextResponse.json(
        { error: "An employee with this email already exists. Open their existing Team profile instead." },
        { status: 409 },
      );
    }
    return jsonError(error, request);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !hasCapability(user.role, "team.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await readJsonObject(request, 20_000);
    const id = uuid(body.id, "id");
    const result = await db().begin(async (tx) => {
      const beforeRows = await tx`select * from employees where id=${id} and organization_id=${user.organizationId} for update`;
      const before = beforeRows[0];
      if (!before) throw new ApiError(404, "Employee not found");
      const suppliedName = optionalString(body, "name", 160);
      const parts = String(suppliedName || `${before.first_name} ${before.last_name}`).trim().split(/\s+/).filter(Boolean);
      const pin = body.kioskPin ? await hashKioskPin(requiredString(body, "kioskPin", 8)) : before.kiosk_pin_hash;
      const email = body.email === undefined ? before.email : emailValue(body.email);
      const rows = await tx`update employees set
        first_name=${optionalString(body,"firstName",80)||parts[0]},last_name=${optionalString(body,"lastName",80)||parts.slice(1).join(" ")||"-"},
        email=${email},phone=${body.phone===undefined?before.phone:optionalString(body,"phone",40)},employment_title=${optionalString(body,"title",120)||optionalString(body,"role",120)||before.employment_title},
        hourly_rate=${body.hourlyRate===undefined?before.hourly_rate:numberValue(body.hourlyRate,"hourlyRate")},contracted_hours=${body.contractedHours===undefined?before.contracted_hours:numberValue(body.contractedHours,"contractedHours",0,168)},
        payroll_id=${body.payrollId===undefined?before.payroll_id:optionalString(body,"payrollId",100)},salary_code=${body.salaryCode===undefined?before.salary_code:optionalString(body,"salaryCode",100)},cost_centre=${body.costCentre===undefined?before.cost_centre:optionalString(body,"costCentre",100)},
        kiosk_pin_hash=${pin},active=${body.active===undefined?before.active:Boolean(body.active)},updated_at=now()
        where id=${id} and organization_id=${user.organizationId} returning *`;
      const employee = rows[0];
      if (body.locationId !== undefined) {
        const locationId = body.locationId ? uuid(body.locationId, "locationId") : null;
        if (locationId) {
          const [location] = await tx`select id from locations where id=${locationId} and organization_id=${user.organizationId} and active=true`;
          if (!location) throw new ApiError(400, "Location does not belong to this organization or is inactive");
          await tx`delete from employee_locations where employee_id=${employee.id}`;
          await tx`insert into employee_locations(employee_id,location_id,primary_location) values(${employee.id},${locationId},true)`;
        } else {
          if (employee.user_id) throw new ApiError(409, "Portal-enabled employees must have an assigned location");
          await tx`delete from employee_locations where employee_id=${employee.id}`;
        }
      }
      await tx`insert into audit_logs(organization_id,location_id,actor_user_id,action,entity_type,entity_id,before_data,after_data) values(${user.organizationId},${user.locationId},${user.userId},'EMPLOYEE_UPDATED','employee',${employee.id},${JSON.stringify(before)}::jsonb,${JSON.stringify(employee)}::jsonb)`;
      return employee;
    });
    return NextResponse.json(result);
  } catch (error) {
    const databaseError = error as { code?: string; constraint?: string; constraint_name?: string };
    const constraint = String(databaseError.constraint || databaseError.constraint_name || "");
    if (databaseError.code === "23505" && constraint.toLowerCase().includes("employee")) {
      return NextResponse.json(
        { error: "An employee with this email already exists. Open their existing Team profile instead." },
        { status: 409 },
      );
    }
    return jsonError(error, request);
  }
}
