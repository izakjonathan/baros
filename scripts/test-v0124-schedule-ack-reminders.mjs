import { isVersionAtLeast } from "./version-utils.mjs";
import fs from 'node:fs';
const api=fs.readFileSync('app/api/schedule-acknowledgements/route.ts','utf8');
const ui=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['release version',isVersionAtLeast(pkg.version, "0.12.4"),'0.13.0','0.13.1','0.13.2','0.13.3','0.13.4','0.14.0','0.14.1','0.14.2','0.14.3','0.14.4','0.15.0'],
 ['manager reminder action',api.includes('REMIND_OUTSTANDING')],
 ['manager authorization',api.includes('requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"])')],
 ['outstanding only',api.includes('left join schedule_acknowledgements')&&api.includes('where a.employee_id is null')],
 ['active portal users only',api.includes('e.active and e.user_id is not null')],
 ['cooldown protection',api.includes("interval '15 minutes'")],
 ['audit trail',api.includes('SCHEDULE_ACKNOWLEDGEMENT_REMINDERS_SENT')],
 ['manager control',ui.includes('Remind outstanding')],
 ['manager result message',ui.includes('No new reminders were sent')],
 ['button disabled when complete',ui.includes('acknowledgedCount===acknowledgements.employees.length')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`Missing ${name}`)}
console.log(`v0.12.4 checks passed (${checks.length})`);
