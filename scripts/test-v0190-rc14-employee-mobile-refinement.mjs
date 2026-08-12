import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync('app/employee/EmployeeWorkspace.css','utf8');
const notifications=fs.readFileSync('app/employee/notifications/page.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

assert.match(pkg.version,/^0\.19\.0-rc\.(?:14|1[5-9]|[2-9]\d+)$/);
assert.match(css,/padding-bottom: calc\(6\.75rem \+ env\(safe-area-inset-bottom\)\)/,'employee shell reserves mobile browser-toolbar clearance');
assert.match(css,/\.shift-action-row \{ display: grid; grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/,'shift actions use compact two-column layout');
assert.match(css,/@media \(max-width: 370px\)[\s\S]*\.shift-action-row \{ grid-template-columns: 1fr; \}/,'very narrow screens fall back to one action column');
assert.match(css,/\.monthly-availability-grid article \{[^}]*padding-block: \.72rem;/,'monthly availability cards use compact vertical padding');
assert.match(notifications,/friendlyNotificationBody\(r\.body\)/,'notification bodies are normalized for display');
assert.match(notifications,/NEW_SHIFT:'New shift'/,'internal change enum is translated into human-readable text');
console.log('v0.19.0-rc.14 employee mobile refinement checks passed');
