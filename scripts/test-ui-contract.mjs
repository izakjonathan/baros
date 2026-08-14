import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const pkg = JSON.parse(read("package.json"));
const global = read("app/globals.css");
const tokens = read("styles/tokens.css");
const schedule = read("features/scheduling/ScheduleWorkspace.module.css");
const layout = read("app/layout.tsx");
const employeeLayout = read("app/employee/layout.tsx");
const employeeShell = read("app/employee/employee-shell.tsx");
const managerApp = read("components/bar-ops-app.tsx");
const dialog = read("components/ui/interaction-ui.tsx");
const chrome = read("components/shell/workspace-chrome.tsx");
const uiClasses = read("lib/ui-classes.ts");
const exceptionRegister = read("docs/constitution/INTENTIONAL_EXCEPTION_REGISTER.md");
const workspace = read("components/ui/workspace-ui.tsx");
const requestForm = read("app/employee/request-form.tsx");
const card = read("components/ui/primitives/Card.tsx");
const quality = read(".github/workflows/quality.yml");
const headerAdapterFiles = [
  "features/attendance/AttendanceWorkspace.tsx",
  "features/inventory/InventoryWorkspace.tsx",
  "features/operations/DailyOperationsWorkspace.tsx",
  "features/settings/SettingsWorkspace.tsx",
  "features/control/ControlCenterWorkspace.tsx",
  "features/employees/TeamWorkspace.tsx",
  "features/dashboard/manager-overview.tsx",
  "features/orders/OrdersWorkspace.tsx",
].map(read);

const cssFiles = walk(root).filter((file) => file.endsWith(".css") && !file.includes("/node_modules/") && !file.includes("/.next/"));
const cssRelative = cssFiles.map((file) => path.relative(root, file)).sort();
const classSelectors = new Set([...global.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]));
for (const match of schedule.matchAll(/\.([A-Za-z_][\w-]*)/g)) classSelectors.add(match[1]);
const mappedClasses = [...uiClasses.matchAll(/:\s*"([^"]+)"/g)].flatMap((match) => match[1].split(/\s+/)).filter(Boolean);
const missingMapped = [...new Set(mappedClasses.filter((name) => !classSelectors.has(name)))];
const scriptFiles = fs.readdirSync(path.join(root, "scripts")).filter((file) => file.endsWith(".mjs"));
const architectureModules = [
  ["features/dashboard/manager-overview.tsx", "DashboardWorkspace"],
  ["features/scheduling/ScheduleWorkspace.tsx", "ScheduleWorkspace"],
  ["features/attendance/AttendanceWorkspace.tsx", "AttendanceWorkspace"],
  ["features/inventory/InventoryWorkspace.tsx", "InventoryWorkspace"],
  ["features/orders/OrdersWorkspace.tsx", "OrdersWorkspace"],
  ["features/operations/DailyOperationsWorkspace.tsx", "DailyOperationsWorkspace"],
  ["features/employees/TeamWorkspace.tsx", "TeamWorkspace"],
  ["features/settings/SettingsWorkspace.tsx", "SettingsWorkspace"],
  ["features/control/ControlCenterWorkspace.tsx", "ControlCenterWorkspace"],
];
const architectureOwned = architectureModules.every(([file, symbol]) => fs.existsSync(path.join(root, file)) && read(file).includes(`export function ${symbol}`) && managerApp.includes(symbol));

const checks = [
  ["release is rc.48", pkg.version === "0.19.0-rc.48"],
  ["only three CSS files exist", JSON.stringify(cssRelative) === JSON.stringify(["app/globals.css", "features/scheduling/ScheduleWorkspace.module.css", "styles/tokens.css"])],
  ["root imports only global CSS", layout.includes('import "./globals.css";') && !layout.includes("completion-redesign.css") && !layout.includes("system-contracts.css") && !layout.includes("design-system.css")],
  ["employee has no route CSS import", !employeeLayout.includes(".css")],
  ["only Shift Plan uses a CSS module", managerApp.includes("ScheduleWorkspace.module.css")],
  ["global CSS owns shell and controls", global.includes(".sidebar{") && global.includes(".topbar{") && global.includes(".main-shell{") && global.includes(".button,.primary,.secondary") && global.includes("input,select,textarea")],
  ["global CSS owns cards and employee portal", global.includes(".card{") && global.includes(".metrics{") && global.includes(".employee-page{") && global.includes(".shift-action-row{")],
  ["Shift Plan owns its grid", schedule.includes(".calendarGrid{") && schedule.includes(".shiftCard{") && schedule.includes(".dayColumn{")],
  ["CSS has no release patch comments", cssFiles.every((file) => !/(v0\.\d|rc\.\d)/i.test(fs.readFileSync(file, "utf8")))],
  ["page wrap is the single safe-area gutter owner", global.includes("--mobile-gutter") && global.includes("padding-left:max(var(--mobile-gutter),env(safe-area-inset-left))") && !/\.employee-page\{[^}]*padding/i.test(global) && !/\.employee-page\{[^}]*margin/i.test(global)],
  ["topbar uses shared mobile gutter", /\.topbar\{[^}]*padding-left:max\(var\(--mobile-gutter\),env\(safe-area-inset-left\)\)/.test(global)],
  ["heading and paragraph margins are reset", global.includes("h1,h2,h3,p{margin:0}")],
  ["bold token matches loaded font", tokens.includes("--weight-bold:700;")],
  ["theme toggle stays removed", !chrome.includes("onToggleTheme") && !managerApp.includes("bar-ops-theme") && !employeeShell.includes("bar-ops-theme") && !layout.includes("data-theme")],
  ["shared state components are styled", global.includes(".shared-empty-state{") && global.includes(".shared-state-card{") && global.includes(".shared-spinner{") && global.includes(".shared-error-state{")],
  ["Dialog renders shared modal body", dialog.includes('<div className="modal-body">{children}</div>') && global.includes(".modal-body{")],
  ["all mapped UI classes resolve", missingMapped.length === 0],
  ["Shift Plan editor styling is module-owned", schedule.includes(".assignmentToggle{") && schedule.includes(".shiftDialogFields{") && schedule.includes(".repeatPanel{") && schedule.includes(".editShiftActions{")],
  ["global card has only three fundamentals", /\.card\{[^}]*padding:var\(--space-4\)[^}]*border-radius:var\(--radius-lg\)/.test(global) && /\.card-compact\{gap:var\(--space-2\);padding:\.8rem\}/.test(global) && /\.card-flush\{gap:0;padding:0\}/.test(global)],
  ["shared states and requests compose base card", workspace.includes("card card-compact shared-state-card") && requestForm.includes("card card-compact shared-state-card request-success")],
  ["Card primitive exposes only density variants", card.includes('density?:"default"|"compact"|"flush"') && !card.includes("elevated") && !card.includes("tone?")],
  ["topbar remains globally fixed", /\.topbar\{position:fixed;top:0;/.test(global) && !global.includes(".topbar{position:sticky")],
  ["main shell reserves fixed topbar", /\.main-shell\{[^}]*padding-top:calc\(var\(--topbar-h\) \+ env\(safe-area-inset-top\)\)/.test(global)],
  ["only day scroller owns horizontal Shift Plan scrolling", schedule.includes(':global(.page-wrap[data-workspace="schedule"]){overflow-x:hidden}') && /\.workspace\{[^}]*overflow-x:hidden[^}]*contain:inline-size/.test(schedule) && /\.calendarPanel\{[^}]*overflow:hidden[^}]*contain:inline-size/.test(schedule) && /\.calendarScroll\{[^}]*overflow-x:auto[^}]*contain:inline-size/.test(schedule)],
  ["manager workspaces are feature-owned", architectureOwned && Buffer.byteLength(managerApp) < 60000],
  ["orchestrator has no stale Team component reference", !managerApp.includes("<Team\n") && managerApp.includes("<TeamWorkspace")],
  ["feature workspace headers use shared description/actions contract", headerAdapterFiles.every((source) => !source.includes("title={title} subtitle={subtitle} action={action}") && source.includes("title={title} description={subtitle} actions={action}"))],
  ["active script surface remains compact", scriptFiles.length <= 20 && Object.keys(pkg.scripts).length <= 25],
  ["quality workflow runs current suite", quality.includes("npm run test:all")],
  ["root global-error exception remains documented", exceptionRegister.includes("global-error.tsx") && exceptionRegister.includes("root error boundary")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}
if (missingMapped.length) console.log("Missing mapped classes:", missingMapped.join(", "));
if (failed) process.exit(1);
console.log(`UI contract passed: ${cssRelative.length} CSS files, ${scriptFiles.length} active scripts`);
