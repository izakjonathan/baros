import fs from "node:fs";
const read = path => fs.readFileSync(path,"utf8");
const migration = read("db/migrations/009_postgresql_integrity_completion.sql");
const products = read("app/api/products/route.ts");
const operations = read("app/api/operations/route.ts");
const claims = read("app/api/shift-claims/route.ts");
const transfers = read("app/api/shift-transfers/route.ts");
const migrate = read("scripts/migrate.mjs");
const assertions = [
  [migration.includes("assert_barops_tenant_integrity"),"tenant integrity trigger"],
  [migration.includes("one_open_break_per_timesheet"),"open break constraint"],
  [migration.includes("payroll_period_overlap_guard"),"payroll overlap guard"],
  [products.includes("db().begin") && products.includes("PRODUCT_UPDATED"),"atomic product writes"],
  [operations.includes("goods_receipt_items") && operations.includes("stock_transactions"),"complete receiving ledger"],
  [operations.includes("Waste quantity exceeds available stock"),"negative waste prevention"],
  [operations.includes("TRANSFER_OUT") && operations.includes("TRANSFER_IN"),"paired transfer ledger"],
  [claims.includes("for update of c,s") && claims.includes("Another request already assigned"),"claim concurrency lock"],
  [transfers.includes("order by id for update") && transfers.includes("assignment has changed"),"swap concurrency lock"],
  [migrate.includes("checksum_sha256") && migrate.includes("checksum mismatch"),"migration checksums"],
];
const failed=assertions.filter(([ok])=>!ok);
if(failed.length){for(const [,name] of failed)console.error(`Missing: ${name}`);process.exit(1)}
console.log(`v0.8.5 PostgreSQL integrity assertions passed (${assertions.length}).`);
