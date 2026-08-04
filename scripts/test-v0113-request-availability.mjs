import fs from 'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const shifts=fs.readFileSync('app/employee/shifts/page.tsx','utf8');
const availability=fs.readFileSync('app/employee/availability/availability-editor.tsx','utf8');
const api=fs.readFileSync('app/api/availability/route.ts','utf8');
const css=fs.readFileSync('app/mono-components.css','utf8');
const checks=[
  ['release version',['0.11.3','0.11.4','0.11.6'].includes(pkg.version)],
  ['incoming transfer is target scoped',shifts.includes("t.target_employee_id===u.employeeId")],
  ['transfer query exposes target id',shifts.includes('t.target_employee_id,t.requested_by_employee_id')],
  ['monthly availability mode exists',availability.includes('mode === "monthly"')&&availability.includes('type="month"')],
  ['all month dates are generated',availability.includes('datesInMonth(month)')],
  ['monthly save is explicit',availability.includes('mode: "MONTH"')&&availability.includes('Save {monthLabel(month)}')],
  ['monthly API validates month',api.includes('MONTH_PATTERN')&&api.includes('monthBounds(month)')],
  ['monthly rows are date specific',api.includes('valid_from,valid_until')&&api.includes('${date}::date,${date}::date')],
  ['weekly rules remain separate',api.includes('valid_from is null and valid_until is null')],
  ['monthly controls styled',css.includes('.monthly-availability-grid')&&css.includes('.availability-mode')],
];
for(const [name,ok] of checks){if(!ok)throw new Error(`v0.11.3 check failed: ${name}`);console.log(`✓ ${name}`)}
