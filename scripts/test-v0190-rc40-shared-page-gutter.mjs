import fs from "node:fs";
const css=fs.readFileSync("app/globals.css","utf8");
const employeeShell=fs.readFileSync("app/employee/employee-shell.tsx","utf8");
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
function ok(v,m){if(!v)throw new Error(m)}
ok(app.includes('className="page-wrap"'),"manager/owner workspace must use shared page-wrap");
ok(employeeShell.includes('className="page-wrap employee-page-wrap"'),"employee workspace must use shared page-wrap");
ok(css.includes('.page-wrap{width:min(100%,var(--content-max));margin-inline:auto;padding:var(--page-y) var(--page-x)'),"shared page-wrap must own desktop page gutters");
ok(css.includes('.page-wrap{padding:.85rem .75rem calc(5.5rem + env(safe-area-inset-bottom))}'),"shared page-wrap must own mobile page gutters");
ok(css.includes('.employee-page{width:100%;margin:0;padding:0;'),"employee-page must not add a second horizontal gutter");
ok(!css.includes('width:min(100%,46rem);margin-inline:auto;padding:.8rem'),"legacy employee nested gutter must be removed");
console.log("rc.40 shared page gutter regression passed");
