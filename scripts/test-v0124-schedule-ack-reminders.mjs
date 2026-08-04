import fs from 'node:fs';
const api=fs.readFileSync('app/api/schedule-acknowledgements/route.ts','utf8');
const ui=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
 ['release version',['0.12.4','0.13.0','0.13.1'].includes(pkg.version),'0.13.0','0.13.1'],
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
