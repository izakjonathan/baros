import fs from "node:fs";
import assert from "node:assert/strict";

const page = fs.readFileSync("app/employee/shifts/page.tsx", "utf8");
const actions = fs.readFileSync("app/employee/shifts/shift-actions.tsx", "utf8");
const note = fs.readFileSync("app/employee/shifts/shift-note-form.tsx", "utf8");
const css = fs.readFileSync("app/employee/EmployeeWorkspace.css", "utf8");

assert(!page.includes('<p className="eyebrow">Schedule</p>'), "Schedule eyebrow must be removed");
assert(!page.includes("Published shifts, available shifts and exchange requests."), "Schedule helper copy must be removed");
assert(page.includes('className="employee-page employee-schedule-page"><h1>My schedule</h1>'), "My schedule must remain the page heading");
assert(css.includes('.shift-date b, .employee-app .shift-date span { color: var(--employee-cream); }'), "weekday and month need explicit cream text");
assert(actions.includes('className="portal-action shift-card-action"') || actions.includes('className="portal-action compact shift-card-action"'), "handover trigger must use compact card action class");
assert(!actions.includes('<ArrowRightLeft size={14}/>Hand over / swap'), "handover card trigger must not show an icon");
assert(note.includes('className="secondary compact shift-card-action"'), "shift-note trigger must use compact card action class");
assert(!note.includes("MessageSquarePlus"), "shift-note card trigger must not show an icon");
assert(actions.includes('primary-action shift-card-action') || actions.includes('primary-action compact shift-card-action'), "request-shift trigger must use compact card action class");
assert(css.includes('background: var(--employee-ink); color: var(--employee-cream);'), "card actions must be black with cream text");
assert(css.includes('white-space: nowrap;'), "card action labels must remain single-line");
assert(css.includes('font-weight: 600; font-size: .67rem;'), "card action typography must be smaller and lighter");
assert(css.includes('min-height: 1.9rem;'), "card actions must have reduced vertical height");
console.log("v0.19.0-rc.17 employee schedule refinement checks passed");
