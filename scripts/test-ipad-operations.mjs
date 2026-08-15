import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const workflow = read(".github/workflows/database-admin.yml");
const quality = read(".github/workflows/quality.yml");
const verify = read("scripts/verify-database.mjs");
const seed = read("scripts/seed.mjs");

const checks = [
  ["manual database workflow", workflow.includes("workflow_dispatch")],
  ["migrate option", workflow.includes("- migrate")],
  ["verify option", workflow.includes("- verify")],
  ["seed confirmation", workflow.includes("SEED BAROS")],
  ["serialized database operations", workflow.includes("baros-database-admin")],
  ["secrets are referenced", workflow.includes("secrets.DATABASE_DIRECT_URL")],
  ["quality workflow", quality.includes("npm run test:all") && quality.includes("npm run build")],
  ["database verification", verify.includes("requiredMigrations") && verify.includes("Database connection verified")],
  ["seed protection", seed.includes("ALLOW_DATABASE_SEED")],
];

for (const [name, passed] of checks) {
  if (!passed) throw new Error(`FAIL ${name}`);
  console.log(`PASS ${name}`);
}
