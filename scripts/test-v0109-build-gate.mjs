import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const route = fs.readFileSync("app/api/employee/hours-summary/route.ts", "utf8");

const checks = [
  [["0.10.9", "0.10.10","0.10.11","0.11.0","0.11.1","0.11.2","0.11.3","0.11.4","0.11.6","0.12.0","0.12.1","0.12.2","0.12.3","0.12.4","0.13.0","0.13.1","0.13.2","0.13.3","0.13.4","0.14.0","0.14.1","0.14.2"].includes(pkg.version), "release version"],
  [route.includes("const timesheets = await db()<Array<{"), "timesheet query has an explicit result contract"],
  [route.includes("id: string;"), "timesheet result contract guarantees id"],
  [route.includes("timesheets.map((item) => ({"), "mapping relies on query-boundary inference"],
  [!route.includes("timesheets.map((item: { id: string })"), "unsafe callback-only annotation removed"],
];

for (const [ok, label] of checks) {
  if (!ok) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
