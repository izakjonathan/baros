import fs from 'node:fs';
import assert from 'node:assert/strict';

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const consistency = fs.readFileSync('app/interface-consistency.css','utf8');
const employee = fs.readFileSync('app/employee/EmployeeWorkspace.css','utf8');

assert.equal(pkg.version, '0.19.0-rc.23');
assert.match(consistency, /v0\.19\.0-rc\.23 — mobile\/iPhone\/iPad micro-polish/);
assert.match(consistency, /font-size:\s*16px/);
assert.match(consistency, /scroll-margin-block:\s*5rem/);
assert.match(consistency, /scroll-padding-block-end:\s*calc\(5\.5rem \+ env\(safe-area-inset-bottom\)\)/);
assert.match(consistency, /min-inline-size:\s*0/);
assert.match(consistency, /@media \(min-width: 40\.01rem\) and \(max-width: 64rem\)/);
assert.match(employee, /v0\.19\.0-rc\.23 — employee mobile\/iPad viewport polish/);
assert.match(employee, /padding-bottom:\s*calc\(8rem \+ env\(safe-area-inset-bottom\)\)/);
assert.match(employee, /@media \(min-width: 700px\) and \(max-width: 1024px\)/);
assert.match(employee, /\.shift-action-row \.shift-card-action \{[\s\S]*max-inline-size:\s*100%/);

console.log('v0.19.0-rc.23 mobile/iPad micro-polish regression passed');
