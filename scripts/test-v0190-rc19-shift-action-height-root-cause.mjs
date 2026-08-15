import fs from "node:fs";

function ok(condition, message) { if (!condition) throw new Error(message); }
const css = fs.readFileSync("app/employee/EmployeeWorkspace.css", "utf8");
const actions = fs.readFileSync("app/employee/shifts/shift-actions.tsx", "utf8");
const note = fs.readFileSync("app/employee/shifts/shift-note-form.tsx", "utf8");

const rule = css.match(/\.employee-app \.shift-action-row \.shift-card-action \{([^}]*)\}/)?.[1] || "";
ok(/height:\s*34px;/.test(rule), "shift-card-action must explicitly own 34px height");
ok(/min-height:\s*34px;/.test(rule), "shift-card-action must explicitly own 34px min-height");
ok(/padding:\s*0 \.62rem;/.test(rule), "shift-card-action must remove vertical padding from height calculation");
ok(actions.includes('className="portal-action compact shift-card-action"'), "handover must remain on shared shift-card-action contract");
ok(actions.includes('className="portal-action primary-action compact shift-card-action"'), "request shift must remain on shared shift-card-action contract");
ok(note.includes('className="secondary compact shift-card-action"'), "add shift note must remain on shared shift-card-action contract");

console.log("rc.19 shift action height root-cause regression passed");
