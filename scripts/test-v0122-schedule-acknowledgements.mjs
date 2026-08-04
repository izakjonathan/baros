import fs from 'node:fs';
const api=fs.readFileSync('app/api/schedule-acknowledgements/route.ts','utf8');
const employee=fs.readFileSync('app/employee/shifts/page.tsx','utf8');
const action=fs.readFileSync('app/employee/shifts/schedule-acknowledgement.tsx','utf8');
const manager=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const migration=fs.readFileSync('db/migrations/005_production_operations.sql','utf8');
const checks=[
 ['existing acknowledgement table retained',migration.includes('create table if not exists schedule_acknowledgements')],
 ['manager summary is tenant and week scoped',api.includes('organization_id=${user.organizationId}')&&api.includes('week_start=${weekStart}::date')&&api.includes("status in ('PUBLISHED','CONFIRMED')")],
 ['employee acknowledgement validates assigned schedule',api.includes('This schedule update does not affect you')&&api.includes('employee_id=${user.employeeId}')],
 ['acknowledgement insert is idempotent',api.includes('on conflict(publication_id,employee_id) do update')],
 ['employee sees latest assigned publications',employee.includes('schedule_publications')&&employee.includes('pendingPublications')&&employee.includes('Schedule updates')],
 ['employee action posts and refreshes',action.includes('/api/schedule-acknowledgements')&&action.includes('router.refresh()')],
 ['manager can inspect acknowledgement status',manager.includes('Acknowledged {acknowledgedCount}')&&manager.includes('Schedule acknowledgements')&&manager.includes('loadAcknowledgements')],
 ['release version',['0.12.2','0.12.3','0.12.4','0.13.0','0.13.1','0.13.2','0.13.3','0.13.4','0.14.0','0.14.1','0.14.2'].includes(JSON.parse(fs.readFileSync('package.json','utf8')).version)],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`FAIL: ${name}`);console.log(`PASS: ${name}`)}
