import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const api=read('app/api/requests/route.ts');
const claims=read('app/api/shift-claims/route.ts');
const transfers=read('app/api/shift-transfers/route.ts');
const manager=read('components/requests-workspace.tsx');
const app=read('components/bar-ops-app.tsx');
const notifications=read('lib/services/notifications.ts');
const checks=[
 ['manager requests nav',app.includes('id: "requests"')&&app.includes('<RequestsWorkspace')],
 ['unified review APIs',manager.includes("'/api/requests'")&&manager.includes("'/api/shift-claims'")&&manager.includes("'/api/shift-transfers'")],
 ['time off manager patch',api.includes('export async function PATCH')&&api.includes("'REQUEST_REVIEWED'" )],
 ['server validation',api.includes('The request dates are invalid')&&api.includes('enumValue(body.type')],
 ['manager notifications',api.includes('notifyManagers')&&claims.includes('notifyManagers')&&transfers.includes('notifyManagers')],
 ['employee decision notifications',api.includes('notifyEmployee')&&claims.includes('notifyEmployee')&&transfers.includes('notifyEmployee')],
 ['tenant scoped notification helpers',notifications.includes('e.organization_id=${input.organizationId}')&&notifications.includes('m.organization_id=${input.organizationId}')],
 ['no migration required',!fs.readdirSync(new URL('../db/migrations/',import.meta.url)).some(n=>n.includes('0110'))],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`v0.11.0 check failed: ${name}`);console.log(`✓ ${name}`)}
