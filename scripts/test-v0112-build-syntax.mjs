import { isVersionAtLeast } from "./version-utils.mjs";
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const source = fs.readFileSync('components/bar-ops-app.tsx', 'utf8');
const checks = [
  ['release version', isVersionAtLeast(pkg.version, "0.11.2")],
  ['inventory notification handler has a closed expression', source.includes('onClick={()=>go("inventory")}><Package')],
  ['malformed inventory notification handler is absent', !source.includes('onClick={()=>go("inventory")><Package')],
  ['notification popover remains present', source.includes('notifications-popover')],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error(`v0.11.2 check failed: ${name}`);
  console.log(`✓ ${name}`);
}
