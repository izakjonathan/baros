import { isVersionAtLeast } from "./version-utils.mjs";
import fs from 'node:fs';
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
  [isVersionAtLeast(pkg.version, "0.12.1"),'package version is v0.12.1'],
  [app.includes('showConflictsOnly'),'schedule can filter to conflicting shifts'],
  [app.includes('Review conflicts ('),'conflict review action is visible'],
  [app.includes('aria-pressed={showConflictsOnly}'),'conflict filter exposes pressed state'],
  [app.includes('No conflicts in this period'),'filtered empty state is explicit'],
  [app.includes('Availability conflict'),'edit dialog explains availability conflict'],
  [app.includes('Reassign the shift, adjust the time, or make it available.'),'resolution guidance is provided'],
  [app.includes('shift.availabilityConflict ? "Make available" : "Available shift"'),'conflicted shift can be converted to open shift'],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`FAIL: ${label}`); console.log(`PASS: ${label}`)}
