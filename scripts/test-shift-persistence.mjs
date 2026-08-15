import fs from 'node:fs';
const src = fs.readFileSync(new URL('../components/bar-ops-app.tsx', import.meta.url), 'utf8');
const checks = [
  ['production bootstrap waits before workspace is ready', /setDatabaseStatus\(resolvedLocationId \? "PostgreSQL connected" : "No active location configured"\);[\s\S]{0,80}setDataReady\(true\)/],
  ['loading gate exists', /if \(!dataReady\)/],
  ['shift creation awaits PostgreSQL', /savedGroups = await Promise\.all/],
  ['server returned shift IDs replace temporary state', /result\?\.shifts/],
  ['shift deletion waits for PostgreSQL', /await persist\(`\/api\/shifts\?id=/],
  ['shift edit uses returned database rows', /const rows = await persist\("\/api\/shifts"/],
];
for (const [name, pattern] of checks) { if (!pattern.test(src)) { console.error(`FAIL: ${name}`); process.exit(1); } console.log(`PASS: ${name}`); }
