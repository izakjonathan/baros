import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const url = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_DIRECT_URL or DATABASE_URL is required");
const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 20, idle_timeout: 5 });
await sql`create table if not exists schema_migrations(filename text primary key,applied_at timestamptz not null default now())`;
await sql`alter table schema_migrations add column if not exists checksum_sha256 text`;

for (const file of fs.readdirSync("db/migrations").filter(name => name.endsWith(".sql")).sort()) {
  const body = fs.readFileSync(path.join("db/migrations", file), "utf8");
  const checksum = crypto.createHash("sha256").update(body).digest("hex");
  const [done] = await sql`select filename,checksum_sha256 from schema_migrations where filename=${file}`;
  if (done) {
    if (done.checksum_sha256 && done.checksum_sha256 !== checksum) throw new Error(`Migration checksum mismatch: ${file}`);
    if (!done.checksum_sha256) await sql`update schema_migrations set checksum_sha256=${checksum} where filename=${file}`;
    console.log(`Verified ${file}`);
    continue;
  }
  await sql.begin(async tx => {
    await tx.unsafe(body);
    await tx`insert into schema_migrations(filename,checksum_sha256) values(${file},${checksum})`;
  });
  console.log(`Applied ${file}`);
}
await sql.end({ timeout: 5 });
