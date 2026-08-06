import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json"));
const layout = read("app/employee/layout.tsx");
const shell = read("app/employee/employee-shell.tsx");
const css = read("app/employee/EmployeeWorkspace.css");
const legacy = read("app/completion-redesign.css");
const status = read("EMPLOYEE_WORKSPACE_STATUS.md");

assert.equal(pkg.version, "0.19.0-rc.4");
assert.match(layout, /import "\.\/EmployeeWorkspace\.css"/);
assert.match(layout, /requireCapability\("employee\.self_service"\)/);
assert.match(shell, /role="dialog" aria-modal="true"/);
assert.match(shell, /aria-controls="employee-more-sheet"/);
assert.match(css, /Route-scoped presentation owner/);
assert.match(css, /\.employee-app \.employee-page/);
assert.match(css, /grid-template-columns: repeat\(5,minmax\(0,1fr\)\)/);
assert.match(css, /grid-template-columns: repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css, /input\[type="datetime-local"\]/);
assert.match(css, /env\(safe-area-inset-bottom\)/);
assert.match(css, /@media \(max-width: 360px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.doesNotMatch(legacy, /\/\* Employee portal shell \*\//);
assert.match(legacy, /Employee portal presentation moved to app\/employee\/EmployeeWorkspace\.css/);
assert.match(status, /redesign is complete for the current employee portal surfaces/i);
assert.match(status, /linked manager/i);
console.log("v0.19.0-rc.4 employee workspace redesign regression passed");
