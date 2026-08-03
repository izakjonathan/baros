import fs from 'node:fs';
const css = fs.readFileSync('app/mono-components.css','utf8');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const checks = [
  [['0.10.3','0.10.4','0.10.5','0.10.6','0.10.7','0.10.8','0.10.9','0.10.10','0.10.11','0.11.0'].includes(pkg.version), 'package version is v0.10.3 compatible'],
  [css.includes('Safari-safe schedule selector and custom date controls'), 'v0.10.3 CSS section exists'],
  [css.includes('-webkit-appearance: none;'), 'native select/date appearance is neutralized'],
  [css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);'), 'custom dates use two safe equal columns'],
  [css.includes('::-webkit-date-and-time-value'), 'Safari date value sizing is handled'],
  [css.includes('inline-size: 126px;'), 'schedule selector has stable readable width'],
];
for (const [ok,label] of checks) {
  if (!ok) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
