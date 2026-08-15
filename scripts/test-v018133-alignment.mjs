import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8');
const checks=[
 ['app/button-alignment-corrections.css','text-align:center'],
 ['features/inventory/InventoryWorkspace.module.css','v0.18.13.3 — authoritative mobile button alignment'],
 ['features/orders/OrdersWorkspace.module.css','order actions center icon and label'],
 ['features/attendance/AttendanceWorkspace.module.css','::-webkit-date-and-time-value'],
 ['features/scheduling/ScheduleWorkspace.module.css','--iphone-day-gap:.08rem'],
 ['features/operations/DailyOperations.module.css','border-top:0']
];
for (const [file,needle] of checks){if(!read(file).includes(needle)) throw new Error(`${file} missing ${needle}`)}
console.log('v0.18.13.3 alignment regression passed');
