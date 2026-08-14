import fs from 'node:fs';

const ui = fs.readFileSync('lib/ui-classes.ts', 'utf8');
const css = fs.readFileSync('app/globals.css', 'utf8');
const app = fs.readFileSync('components/bar-ops-app.tsx', 'utf8');

for (const [key, cls] of [
  ['statusRunning', 'status-running'],
  ['statusPending', 'status-pending'],
  ['statusApproved', 'status-approved'],
  ['statusRejected', 'status-rejected'],
]) {
  if (!ui.includes(`${key}:\"${cls}\"`)) throw new Error(`missing typed attendance class ${key}`);
  if (!css.includes(`.${cls}{`)) throw new Error(`missing attendance status CSS .${cls}`);
}
if (!app.includes('attendanceStyles[`status${e.status}`]')) throw new Error('attendance dynamic status lookup changed unexpectedly');
console.log('rc.39 attendance status contract: ok');
