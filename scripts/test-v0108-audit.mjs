import fs from "node:fs";
import crypto from "node:crypto";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const required = [
  "BASELINE_MANIFEST_V0107.sha256",
  "REPOSITORY_INVENTORY_V0108.csv",
  "AUDIT_REPORT_V0108.md",
  "FUNCTIONAL_MATRIX_V0108.md",
  "VALIDATION_LOG_V0108.md",
  "RELEASE_NOTES_V0108.md",
];

const checks = [
  [["0.10.8", "0.10.9","0.10.10","0.10.11","0.11.0","0.11.1","0.11.2","0.11.3","0.11.4","0.11.6","0.12.0","0.12.1","0.12.2","0.12.3","0.12.4","0.13.0","0.13.1"].includes(pkg.version), "release version"],
  [required.every((file) => fs.existsSync(file)), "audit deliverables exist"],
  [fs.readFileSync("BASELINE_MANIFEST_V0107.sha256", "utf8").includes("components/bar-ops-app.tsx"), "baseline manifest covers application source"],
  [fs.readFileSync("AUDIT_REPORT_V0108.md", "utf8").includes("No application behavior was changed"), "audit-only scope is explicit"],
  [fs.readFileSync("VALIDATION_LOG_V0108.md", "utf8").includes("npm run test:all"), "validation evidence is recorded"],
];
for (const [ok, label] of checks) {
  if (!ok) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
