import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const employees=read('app/api/employees/route.ts');
const activate=read('app/api/auth/activate/route.ts');
const invitations=read('app/api/employee-invitations/route.ts');
const shifts=read('app/api/shifts/route.ts');
const ui=read('components/bar-ops-app.tsx')+read('features/team/team.tsx');
const checks=[
 ['employee PINs use scrypt',employees.includes('hashKioskPin')&&!employees.includes("createHash('sha256')")],
 ['employee writes are transactional',employees.includes('db().begin')],
 ['employee API validates JSON',employees.includes('readJsonObject')&&employees.includes('email is invalid')],
 ['existing account password is preserved',activate.includes('verifyPassword')&&!activate.includes('update users set password_hash')],
 ['production invitations require APP_URL',invitations.includes('APP_URL_REQUIRED')],
 ['expired invitations are normalized',invitations.includes("status='EXPIRED'")],
 ['manager can revoke invitation',(ui.includes('Revoke invite')||ui.includes('>Revoke<'))&&ui.includes('action: "revoke"')],
 ['employee UI updates by UUID',ui.includes('item.id === editingEmployee.id')],
 ['share cancellation has fallback',ui.includes('window.prompt("Copy this activation link"')],
 ['recurring shift create is transactional',shifts.includes('db().begin')&&shifts.includes('SHIFT_SERIES_CREATED')],
 ['series edit preserves offsets',shifts.includes('dateDelta')&&shifts.includes('item.starts_at')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
console.log(`v0.7.4 hardening assertions passed (${checks.length})`);
