import fs from 'node:fs';
import assert from 'node:assert/strict';

const requests=fs.readFileSync('app/api/requests/route.ts','utf8');
const claims=fs.readFileSync('app/api/shift-claims/route.ts','utf8');
const transfers=fs.readFileSync('app/api/shift-transfers/route.ts','utf8');
const workspace=fs.readFileSync('components/requests-workspace.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

assert.ok(['0.11.6','0.12.0','0.12.1','0.12.2','0.12.3','0.12.4','0.13.0'].includes(pkg.version));
assert.match(requests,/r\.status='PENDING'/);
assert.match(claims,/c\.status='PENDING'/);
assert.match(claims,/s\.is_open=true and s\.employee_id is null/);
assert.match(transfers,/t\.status='PENDING_MANAGER'/);
assert.match(transfers,/s\.employee_id=t\.requested_by_employee_id/);
assert.match(transfers,/ss\.employee_id=t\.target_employee_id/);
assert.match(workspace,/r\.status===409/);
assert.match(workspace,/already resolved or is no longer valid/);
assert.match(workspace,/setItems\(current=>current\.filter/);
assert.match(workspace,/setInterval\(refresh,15000\)/);
assert.match(workspace,/visibilitychange/);
assert.match(workspace,/filter\(actionable\)/);
assert.doesNotMatch(workspace,/item\.status==='PENDING'\|\|item\.status==='PENDING_MANAGER'/);
console.log('v0.11.6 request queue consistency checks passed');
