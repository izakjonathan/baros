import fs from 'node:fs';
const css = fs.readFileSync('app/design-system.css','utf8');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const checks = [
  [['0.10.3','0.10.4','0.10.5','0.10.6','0.11.0','0.11.1','0.11.2','0.11.3','0.11.4','0.11.6','0.11.8','0.11.9','0.12.0','0.12.1'].includes(pkg.version), 'package version is v0.10.3 compatible'],
  [css.includes('Safari-safe schedule controls'), 'v0.10.3 CSS section exists'],
  [css.includes('-webkit-appearance: none;'), 'native select/date appearance is neutralized'],
  [css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);'), 'custom dates use two safe equal columns'],
  [css.includes('::-webkit-date-and-time-value'), 'Safari date value sizing is handled'],
  [css.includes('inline-size: 126px;'), 'schedule selector has stable readable width'],
];
for (const [ok,label] of checks) {
  if (!ok) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
