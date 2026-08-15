import { isVersionAtLeast } from "./version-utils.mjs";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const route = fs.readFileSync("app/api/employee/hours-summary/route.ts", "utf8");

const checks = [
  [isVersionAtLeast(pkg.version, "0.10.9"), "release version"],
  [route.includes("const timesheets = await db()<Array<{"), "timesheet query has an explicit result contract"],
  [route.includes("id: string;"), "timesheet result contract guarantees id"],
  [route.includes("timesheets.map((item) => ({"), "mapping relies on query-boundary inference"],
  [!route.includes("timesheets.map((item: { id: string })"), "unsafe callback-only annotation removed"],
];

for (const [ok, label] of checks) {
  if (!ok) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
