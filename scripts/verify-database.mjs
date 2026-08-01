import postgres from "postgres";

const url = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_DIRECT_URL or DATABASE_URL is required");

const sql = postgres(url, {
  max: 1,
  prepare: false,
  connect_timeout: 15,
  idle_timeout: 5,
});

try {
  const [server] = await sql`
    select
      current_database() as database_name,
      current_user as database_user,
      current_setting('server_version') as server_version
  `;

  const migrations = await sql`
    select filename, applied_at
    from schema_migrations
    order by filename
  `;

  const requiredMigrations = [
    "001_initial.sql",
    "002_shift_workflows.sql",
    "003_time_attendance.sql",
    "004_payroll_integrity.sql",
    "005_production_operations.sql",
    "006_integrity_remediation.sql",
    "007_employee_portal_access.sql",
  ];

  const applied = new Set(migrations.map((row) => row.filename));
  const missing = requiredMigrations.filter((name) => !applied.has(name));
  if (missing.length) {
    throw new Error(`Missing migrations: ${missing.join(", ")}`);
  }

  const [counts] = await sql`
    select
      (select count(*)::int from organizations) as organizations,
      (select count(*)::int from locations) as locations,
      (select count(*)::int from users) as users,
      (select count(*)::int from employees) as employees,
      (select count(*)::int from products) as products
  `;

  console.log("Database connection verified.");
  console.log(`Database: ${server.database_name}`);
  console.log(`PostgreSQL: ${server.server_version}`);
  console.log(`Applied migrations: ${migrations.length}`);
  console.log(
    `Rows — organizations: ${counts.organizations}, locations: ${counts.locations}, users: ${counts.users}, employees: ${counts.employees}, products: ${counts.products}`,
  );
} finally {
  await sql.end({ timeout: 5 });
}
