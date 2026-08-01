import fs from "node:fs";

const source = fs.readFileSync("app/api/employees/route.ts", "utf8");
const ui = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const checks = [
  [source.includes('databaseError.code === "23505"'), "employee API detects PostgreSQL unique violations"],
  [source.includes("An employee with this email already exists"), "duplicate employee response is actionable"],
  [source.includes("status: 409"), "duplicate employee response uses HTTP 409"],
  [ui.includes('.error||"Save failed"'), "manager persistence client surfaces API messages"],
  [ui.includes("setDialog(null); notify(devMode?"), "employee dialog closes only after successful save"],
];
let failed = false;
for (const [ok, label] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed = true;
}
if (failed) process.exit(1);
