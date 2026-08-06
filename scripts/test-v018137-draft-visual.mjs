import fs from "node:fs";

const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const css = fs.readFileSync("app/mono-components.css", "utf8");

if (app.includes('shift.status === "Draft" && <em>Draft</em>')) {
  throw new Error("Draft shifts must not render a visible Draft pill.");
}
if (!app.includes('shift.status === "Draft" ? "is-draft" : ""')) {
  throw new Error("Draft shifts must retain the is-draft state class.");
}
if (!app.includes('data-draft={shift.status === "Draft"}')) {
  throw new Error("Draft state data attribute must remain available.");
}
if (!css.includes('.shift-card.is-draft')) {
  throw new Error("Muted draft styling must remain in place.");
}
console.log("v0.18.13.7 draft visual regression passed");
