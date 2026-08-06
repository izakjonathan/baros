import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const operations = read('features/operations/DailyOperations.module.css');
const dashboard = read('features/dashboard/Dashboard.module.css');
const execution = read('features/execution/ShiftExecution.module.css');
const attendance = read('features/attendance/AttendanceWorkspace.module.css');
const team = read('features/employees/TeamWorkspace.module.css');
const pkg = JSON.parse(read('package.json'));

const checks = [
  [operations.includes('.compose textarea') && operations.includes('background:transparent'), 'logbook textarea is transparent'],
  [operations.includes('.logEntry') && operations.includes('border-top:2px solid #000'), 'log entries use separators instead of beige cards'],
  [dashboard.includes('.heroPanel :global(.daily-empty)') && dashboard.includes('background:transparent'), 'dashboard empty boards inherit the parent colour'],
  [execution.includes('.board :global(.daily-empty)') && execution.includes('background:transparent'), 'execution empty board inherits the parent colour'],
  [attendance.includes('.periodFields>label') && attendance.includes('overflow:visible'), 'attendance labels are not clipped'],
  [attendance.includes('-webkit-appearance:none') && attendance.includes('min-inline-size:0'), 'native date inputs are contained and styled'],
  [team.includes('max-inline-size:none') && team.includes('background:#fff4c4'), 'team search owns its complete mobile presentation'],
  [pkg.version === '0.18.13.2', 'package version updated'],
];
for (const [ok, label] of checks) {
  if (!ok) throw new Error(`FAILED: ${label}`);
  console.log(`PASS: ${label}`);
}
