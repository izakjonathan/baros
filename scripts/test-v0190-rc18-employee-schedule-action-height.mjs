import fs from "node:fs";
const src=fs.readFileSync("app/employee/shifts/shift-actions.tsx","utf8");
const note=fs.readFileSync("app/employee/shifts/shift-note-form.tsx","utf8");
function ok(v,m){if(!v) throw new Error(m)}
ok(src.includes('className="portal-action compact shift-card-action"'),"handover must use compact height");
ok(src.includes('className="portal-action primary-action compact shift-card-action"'),"request shift must use compact height");
ok(note.includes('className="secondary compact shift-card-action"'),"add shift note compact baseline missing");
console.log("rc.18 employee schedule action height regression passed");
