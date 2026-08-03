import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const url = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_DIRECT_URL or DATABASE_URL is required");
const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 15, idle_timeout: 5 });
// Includes 008_employee_updated_at.sql and all later migrations.
const requiredMigrations = fs.readdirSync("db/migrations").filter(name => name.endsWith(".sql")).sort();
try {
  const [server] = await sql`select current_database() database_name,current_user database_user,current_setting('server_version') server_version`;
  const migrations = await sql`select filename,applied_at,checksum_sha256 from schema_migrations order by filename`;
  const byName = new Map(migrations.map(row => [row.filename,row]));
  const missing = requiredMigrations.filter(name => !byName.has(name));
  if (missing.length) throw new Error(`Missing migrations: ${missing.join(", ")}`);
  for (const name of requiredMigrations) {
    const checksum = crypto.createHash("sha256").update(fs.readFileSync(path.join("db/migrations",name),"utf8")).digest("hex");
    const stored = byName.get(name)?.checksum_sha256;
    if (!stored) throw new Error(`Migration has no checksum: ${name}. Run migrate once to backfill it.`);
    if (stored !== checksum) throw new Error(`Migration checksum mismatch: ${name}`);
  }
  const [counts] = await sql`select (select count(*)::int from organizations) organizations,(select count(*)::int from locations) locations,(select count(*)::int from users) users,(select count(*)::int from employees) employees,(select count(*)::int from products) products,(select count(*)::int from stock_transactions) stock_transactions`;
  const [guards] = await sql`select count(*)::int tenant_guards from pg_trigger where tgname like 'tenant_guard_%' and not tgisinternal`;
  console.log("Database connection verified. Migration checksums verified.");
  console.log(`Database: ${server.database_name}`);
  console.log(`PostgreSQL: ${server.server_version}`);
  console.log(`Applied migrations: ${migrations.length}`);
  console.log(`Tenant guards: ${guards.tenant_guards}`);
  console.log(`Rows — organizations: ${counts.organizations}, locations: ${counts.locations}, users: ${counts.users}, employees: ${counts.employees}, products: ${counts.products}, stock transactions: ${counts.stock_transactions}`);
} finally { await sql.end({ timeout: 5 }); }
