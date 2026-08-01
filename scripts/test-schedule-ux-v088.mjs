import fs from 'node:fs';
const source = fs.readFileSync('components/bar-ops-app.tsx', 'utf8');
const css = fs.readFileSync('app/globals.css', 'utf8');
const checks = [
  ['day tile passes its ISO date', 'onClick={() => onNewShift(day.iso)}'],
  ['dialog accepts an initial date', 'initialDate?: string'],
  ['dialog initializes selected date', 'useState(initialDate || dateFromShift(currentWeekOffset, 0))'],
  ['week and month views exist', 'useState<"week" | "month">("week")'],
  ['month view renders full period', 'monthAnchor'],
  ['schedule intro copy removed', !source.includes('Build, review and publish the weekly schedule.')],
  ['compact title actions exist', 'schedule-head-actions'],
  ['horizontal day scrolling exists', 'scroll-snap-type:x proximity'],
  ['compact day headers exist', '.schedule-calendar .day-header{height:47px'],
];
for (const [name, expected] of checks) {
  const ok = typeof expected === 'boolean' ? expected : source.includes(expected) || css.includes(expected);
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`✓ ${name}`);
}
