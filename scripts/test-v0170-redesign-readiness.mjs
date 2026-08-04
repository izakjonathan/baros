import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const packageJson = JSON.parse(read("package.json"));
const app = read("components/bar-ops-app.tsx");
const types = read("features/workspace/types.ts");
const schedule = read("features/workspace/schedule-utils.ts");
const tokens = read("app/mono-tokens.css");
const architecture = read("docs/architecture.md");
const inventory = read("docs/redesign-inventory.md");

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const versionParts = packageJson.version.split(".").map(Number);
expect(versionParts[0] > 0 || versionParts[1] >= 17, "Package must be v0.17.0 or newer");
expect(fs.existsSync(path.join(root, "features/workspace/types.ts")), "Workspace domain contracts must be centralized");
expect(fs.existsSync(path.join(root, "features/workspace/schedule-utils.ts")), "Pure schedule utilities must be centralized");
expect(!app.includes("type Location ="), "Location contract must not return to the monolithic app component");
expect(!app.includes("function mapDatabaseShift"), "Database shift mapping must not return to the monolithic app component");
expect(!app.includes("function shiftsOverlap"), "Pure shift conflict logic must not return to the monolithic app component");
expect(types.includes("export type Employee"), "Employee contract must be exported from the workspace domain layer");
expect(types.includes("export type ClockSettings"), "Clock settings contract must be exported from the workspace domain layer");
expect(schedule.includes("export function mapDatabaseShift"), "Typed database shift mapping must be present");
expect(schedule.includes("DatabaseShiftRecord"), "Database shift mapping must use an explicit input contract");
expect(!schedule.includes("any"), "Pure schedule utilities must not use any");
expect(tokens.includes("--space-1") && tokens.includes("--mono-radius-md") && tokens.includes("--mono-control"), "Canonical design tokens must remain available for Phase D");
expect(architecture.includes("Stability boundaries for Phase D"), "Architecture documentation must define redesign stability boundaries");
expect(inventory.includes("Manager workspaces") && inventory.includes("Employee workspaces") && inventory.includes("States requiring redesign coverage"), "Redesign inventory must cover roles and states");
expect(!fs.existsSync(path.join(root, "vercel.json")), "vercel.json must remain absent");
expect(!fs.existsSync(path.join(root, "public/offline.html")), "public/offline.html must remain absent");
expect(fs.existsSync(path.join(root, "public/sw.js")), "public/sw.js must remain present");

if (failures.length) {
  console.error("v0.17.0 redesign-readiness regression failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("v0.17.0 redesign-readiness regression passed");
