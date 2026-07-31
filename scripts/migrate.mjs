import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const sql = postgres(url, { prepare: false, max: 1 });
await sql`create table if not exists schema_migrations (filename text primary key, applied_at timestamptz not null default now())`;
const dir = path.join(process.cwd(), "db/migrations");
for (const filename of (await fs.readdir(dir)).filter(x => x.endsWith('.sql')).sort()) {
  const exists = await sql`select 1 from schema_migrations where filename=${filename}`;
  if (exists.length) continue;
  const source = await fs.readFile(path.join(dir, filename), "utf8");
  await sql.begin(async tx => { await tx.unsafe(source); await tx`insert into schema_migrations(filename) values(${filename})`; });
  console.log(`Applied ${filename}`);
}
await sql.end();
