import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const actions=read('app/employee/shifts/shift-actions.tsx');
const shifts=read('app/employee/shifts/page.tsx');
const app=read('components/bar-ops-app.tsx');
const timesheets=read('app/api/timesheets/route.ts');
const transferApi=read('app/api/shift-transfers/route.ts');
const pkg=JSON.parse(read('package.json'));
const checks=[
 ['release version',['0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.12.0','0.12.1','0.12.2','0.12.3','0.12.4','0.13.0','0.13.1','0.13.2'].includes(pkg.version)],
 ['transfer requests always settle',actions.includes('finally{window.clearTimeout(timeout)}')&&actions.includes("setState('error')")&&actions.includes("setState('saving')")],
 ['request timeout and inline API errors',actions.includes('AbortController')&&actions.includes('The request timed out')&&actions.includes('data?.error')&&actions.includes('role="alert"')],
 ['duplicate transfer submissions blocked',actions.includes("if(state==='saving')return")],
 ['dialog state reset on reopen',actions.includes('function openDialog()')&&actions.includes("setState('idle')")&&actions.includes("setError('')")],
 ['swap shifts carry employee identity',shifts.includes('s.employee_id \\"employeeId\\"')||shifts.includes('s.employee_id "employeeId"')],
 ['swap shifts filtered by selected employee',actions.includes('swapShifts.filter(item=>item.employeeId===target)')&&actions.includes('setSwap(\'\')')],
 ['eligible swap query is published future assigned',shifts.includes("s.status='PUBLISHED'")&&shifts.includes('s.is_open=false')&&shifts.includes('s.starts_at>now()')],
 ['active managers remain valid transfer targets',transferApi.includes('organization_id=${user.organizationId} and active')&&!transferApi.includes("role='EMPLOYEE'")],
 ['manager requests are prominent',app.includes('label="Review requests"')&&app.includes('<b>Employee requests</b>')&&app.includes('onNavigate("requests")')],
 ['request deep link retained',app.includes('get("workspace") === "requests"')],
 ['timesheet approver uses uuid expression',timesheets.includes('${u.userId}::uuid')&&timesheets.includes('null::uuid')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`v0.11.1 check failed: ${name}`);console.log(`✓ ${name}`)}
