import fs from 'node:fs';
const route=fs.readFileSync('app/api/time-clock/manage/route.ts','utf8');
const bootstrap=fs.readFileSync('app/api/manager/bootstrap/route.ts','utf8');
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
for (const text of ['BREAK_START','BREAK_END','requireUser(["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER"])','for update']) if(!route.includes(text)) throw new Error(`Missing ${text}`);
if(!bootstrap.includes('open_break_started_at')) throw new Error('Bootstrap does not expose break start');
if(!app.includes('toggleBreak(entry: TimeEntry)')||!app.includes('Start break')||!app.includes('End break')) throw new Error('Manager break controls missing');
console.log('v0.13.2 break management checks passed');
