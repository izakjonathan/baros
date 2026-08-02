import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json"));
const app = read("components/bar-ops-app.tsx");
const primitives = read("components/ui-primitives.tsx");

const checks = [
  [["0.11.1","0.11.2","0.11.3","0.11.4","0.11.6","0.11.8","0.11.9","0.12.0","0.12.1","0.12.2"].includes(pkg.version), "package version is 0.11.1"],
  [fs.existsSync("components/app-shell.tsx"), "app shell extracted"],
  [fs.existsSync("features/overview/dashboard.tsx"), "overview feature extracted"],
  [fs.existsSync("features/team/team.tsx"), "team feature extracted"],
  [fs.existsSync("lib/schedule-utils.ts"), "schedule utilities extracted"],
  [fs.existsSync("lib/workspace-types.ts"), "workspace types centralized"],
  [!app.includes("function Sidebar("), "sidebar removed from manager monolith"],
  [!app.includes("function Dashboard("), "dashboard removed from manager monolith"],
  [!app.includes("function Team("), "team removed from manager monolith"],
  [primitives.includes("export function IconButton"), "shared icon button exists"],
  [primitives.includes("export function StatusPill"), "shared status pill exists"],
  [fs.existsSync("playwright.config.ts") && fs.existsSync("e2e/workspace-smoke.spec.ts"), "Playwright foundation exists"],
];
for (const [ok, label] of checks) {
  if (!ok) throw new Error(`v0.11.1 check failed: ${label}`);
  console.log(`✓ ${label}`);
}
