import fs from 'node:fs';
const publish=fs.readFileSync('app/api/schedule-publish/route.ts','utf8');
const ack=fs.readFileSync('app/api/schedule-acknowledgements/route.ts','utf8');
const employee=fs.readFileSync('app/employee/shifts/page.tsx','utf8');
const migration=fs.readFileSync('db/migrations/011_schedule_publication_changes.sql','utf8');
const checks=[
 ['snapshot table',migration.includes('schedule_publication_shift_snapshots')],
 ['change table',migration.includes('schedule_publication_changes')],
 ['previous publication comparison',publish.includes('previousPublicationId')],
 ['new shift detection',publish.includes("'NEW_SHIFT'")],
 ['removed shift detection',publish.includes("'REMOVED_SHIFT'")],
 ['time change detection',publish.includes("'TIME_CHANGED'")],
 ['role change detection',publish.includes("'ROLE_CHANGED'")],
 ['affected-only notifications',publish.includes('from schedule_publication_changes c join employees e')],
 ['manager change types',ack.includes('changeTypes: row.change_types || []')],
 ['removed employee can acknowledge',ack.includes('schedule_publication_changes where publication_id=${publicationId}')],
 ['employee sees affected publication',employee.includes('schedule_publication_changes c where c.publication_id=p.id')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`Missing ${name}`)}
console.log(`v0.12.3 checks passed (${checks.length})`);
