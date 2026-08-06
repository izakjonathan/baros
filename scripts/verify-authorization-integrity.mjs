import fs from "node:fs";
import crypto from "node:crypto";
import postgres from "postgres";

const url = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_DIRECT_URL or DATABASE_URL is required for live integrity verification");

const sql = postgres(url, { max: 2, prepare: false, connect_timeout: 15, idle_timeout: 5 });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  const migrations = fs.readdirSync("db/migrations").filter((name) => name.endsWith(".sql")).sort();
  const applied = await sql`select filename, checksum_sha256 from schema_migrations order by filename`;
  const byName = new Map(applied.map((row) => [row.filename, row.checksum_sha256]));
  for (const filename of migrations) {
    assert(byName.has(filename), `Missing applied migration: ${filename}`);
    const checksum = crypto.createHash("sha256").update(fs.readFileSync(`db/migrations/${filename}`, "utf8")).digest("hex");
    assert(byName.get(filename) === checksum, `Migration checksum mismatch: ${filename}`);
  }

  const [guardCount] = await sql`select count(*)::int count from pg_trigger where tgname like 'tenant_guard_%' and not tgisinternal`;
  assert(Number(guardCount.count) > 0, "No tenant guard triggers are installed");

  const [auditShape] = await sql`
    select count(*)::int count
    from information_schema.columns
    where table_schema='public' and table_name='audit_logs'
      and column_name in ('organization_id','location_id','actor_user_id','action','entity_type','entity_id','before_data','after_data','created_at')`;
  assert(Number(auditShape.count) === 9, "audit_logs is missing required actor/state/timestamp columns");

  const [orphanEmployeeLocations] = await sql`
    select count(*)::int count
    from employee_locations el
    join employees e on e.id=el.employee_id
    join locations l on l.id=el.location_id
    where e.organization_id<>l.organization_id`;
  assert(Number(orphanEmployeeLocations.count) === 0, "Cross-tenant employee/location links exist");

  const [orphanShifts] = await sql`
    select count(*)::int count
    from shifts s
    join locations l on l.id=s.location_id
    left join employees e on e.id=s.employee_id
    where s.organization_id<>l.organization_id
       or (s.employee_id is not null and s.organization_id<>e.organization_id)`;
  assert(Number(orphanShifts.count) === 0, "Cross-tenant shift relationships exist");

  const [orphanTimesheets] = await sql`
    select count(*)::int count
    from timesheets t
    join locations l on l.id=t.location_id
    join employees e on e.id=t.employee_id
    where t.organization_id<>l.organization_id or t.organization_id<>e.organization_id`;
  assert(Number(orphanTimesheets.count) === 0, "Cross-tenant timesheet relationships exist");

  const [overlappingPeriods] = await sql`
    select count(*)::int count
    from payroll_periods a
    join payroll_periods b on a.id<b.id and a.organization_id=b.organization_id
      and coalesce(a.location_id,'00000000-0000-0000-0000-000000000000'::uuid)=coalesce(b.location_id,'00000000-0000-0000-0000-000000000000'::uuid)
      and a.work_date_range && b.work_date_range`;
  assert(Number(overlappingPeriods.count) === 0, "Overlapping payroll periods exist");

  const [openBreakConflicts] = await sql`
    select count(*)::int count from (
      select timesheet_id from time_breaks where ended_at is null group by timesheet_id having count(*)>1
    ) conflicts`;
  assert(Number(openBreakConflicts.count) === 0, "A timesheet has multiple open breaks");

  console.log("Live authorization/data-integrity verification passed.");
  console.log(`Applied migrations: ${applied.length}`);
  console.log(`Tenant guard triggers: ${guardCount.count}`);
} finally {
  await sql.end({ timeout: 5 });
}
