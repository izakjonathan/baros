import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const ignoredDirectories = new Set([".git", ".next", "node_modules"]);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? ignoredDirectories.has(entry.name) ? [] : walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
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
const observability = read("lib/observability.ts");
const capabilities = read("lib/auth/capabilities.ts");
const devAuth = read("lib/auth/dev-auth.ts");
const sessionCookie = read("lib/auth/session-cookie.ts");
const scheduleUtils = read("features/workspace/schedule-utils.ts");
const dataSource = read("lib/data.ts");
const rateLimit = read("lib/security/rate-limit.ts");
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
const sourceFiles = walk(root).filter((file) => /\.(?:ts|tsx)$/.test(file));
const remoteGoogleFontImports = sourceFiles.filter((file) => fs.readFileSync(file, "utf8").includes("next/font/google")).map((file) => path.relative(root, file));
const cssModuleImporters = sourceFiles.filter((file) => /from\s+["'][^"']+\.module\.css["']/.test(fs.readFileSync(file, "utf8"))).map((file) => path.relative(root, file));
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
const featureDialogModules = [
  ["features/scheduling/ScheduleDialogs.tsx", ["ShiftDialog", "EditShiftDialog"]],
  ["features/attendance/AttendanceWorkspace.tsx", ["TimesheetDialog"]],
  ["features/employees/TeamWorkspace.tsx", ["EmployeeDialog"]],
  ["features/inventory/InventoryWorkspace.tsx", ["ProductDialog", "StockCountDialog"]],
  ["features/orders/OrdersWorkspace.tsx", ["OrderDialog"]],
];
const featureDialogsOwned = featureDialogModules.every(([file, symbols]) => {
  const source = read(file);
  return source.includes('from "@/components/ui/interaction-ui"') && symbols.every((symbol) => source.includes(`export function ${symbol}`) && managerApp.includes(symbol) && !managerApp.includes(`function ${symbol}`));
}) && !managerApp.includes('from "./ui/interaction-ui"');

function runtimeBindings(source) {
  const bindings = new Set();
  for (const match of source.matchAll(/import\s+(?!type\b)([A-Za-z_$][\w$]*)\s*(?:,|from)/g)) bindings.add(match[1]);
  for (const match of source.matchAll(/import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from/g)) bindings.add(match[1]);
  for (const match of source.matchAll(/import\s+(?!type\b)(?:[A-Za-z_$][\w$]*\s*,\s*)?\{([\s\S]*?)\}\s*from/g)) {
    for (const imported of match[1].split(",")) {
      if (/^\s*type\b/.test(imported)) continue;
      const localName = (imported.trim().split(/\s+as\s+/).at(-1) || "").trim();
      if (/^[A-Za-z_$][\w$]*$/.test(localName)) bindings.add(localName);
    }
  }
  for (const match of source.matchAll(/\b(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) bindings.add(match[1]);
  for (const match of source.matchAll(/\b[A-Za-z_$][\w$]*\s*:\s*([A-Z][A-Za-z0-9_$]*)\b/g)) bindings.add(match[1]);
  return bindings;
}

const unboundJsxComponents = sourceFiles.flatMap((file) => {
  const source = fs.readFileSync(file, "utf8");
  const bindings = runtimeBindings(source);
  const used = new Set();
  for (const match of source.matchAll(/<([A-Z][A-Za-z0-9_$]*)\s+(?=[A-Za-z_$][\w$:-]*\s*=)/g)) used.add(match[1]);
  for (const match of source.matchAll(/<([A-Z][A-Za-z0-9_$]*)\s*\/>/g)) used.add(match[1]);
  return [...used].filter((name) => !bindings.has(name)).map((name) => `${path.relative(root, file)}:${name}`);
});

const checks = [
  ["package remains a v0.19 release candidate", /^0\.19\.0-rc\.\d+$/.test(pkg.version)],
  ["only three CSS files exist", JSON.stringify(cssRelative) === JSON.stringify(["app/globals.css", "features/scheduling/ScheduleWorkspace.module.css", "styles/tokens.css"])],
  ["root imports only global CSS", layout.includes('import "./globals.css";') && !layout.includes("completion-redesign.css") && !layout.includes("system-contracts.css") && !layout.includes("design-system.css")],
  ["root fonts are repository-owned build assets", layout.includes('import localFont from "next/font/local";') && remoteGoogleFontImports.length === 0 && layout.includes('src: "./fonts/inter-latin-variable.woff"') && layout.includes('src: "./fonts/space-grotesk-latin-variable.woff"') && ["app/fonts/inter-latin-variable.woff","app/fonts/space-grotesk-latin-variable.woff","app/fonts/Inter-OFL.txt","app/fonts/Space-Grotesk-OFL.txt"].every((file) => fs.existsSync(path.join(root, file)))],
  ["employee has no route CSS import", !employeeLayout.includes(".css")],
  ["only Shift Plan uses a CSS module", cssModuleImporters.length > 0 && cssModuleImporters.every((file) => file.startsWith("features/scheduling/"))],
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
  ["Shift Plan page is shrink-safe and only the day scroller owns horizontal scrolling", /html,body\{[^}]*overflow-x:clip/.test(global) && /\.page-wrap\{[^}]*grid-template-columns:minmax\(0,1fr\)/.test(global) && /\.page-flow,[^{]*\{[^}]*grid-template-columns:minmax\(0,1fr\)/.test(global) && schedule.includes(':global(.page-wrap[data-workspace="schedule"]){overflow-x:clip}') && /\.workspace\{[^}]*overflow-x:clip[^}]*contain:inline-size/.test(schedule) && /\.calendarPanel\{[^}]*overflow:hidden[^}]*contain:inline-size/.test(schedule) && /\.calendarScroll\{[^}]*overflow-x:auto[^}]*contain:inline-size[^}]*overscroll-behavior-x:contain/.test(schedule) && !/grid-template-columns:1fr(?:\s+1fr)?(?=[;}])/.test(schedule)],
  ["manager workspaces are feature-owned", architectureOwned && Buffer.byteLength(managerApp) < 60000],
  ["feature dialogs are feature-owned", featureDialogsOwned],
  ["shared chrome has no local forwarding adapters", managerApp.includes("<WorkspaceSidebar") && managerApp.includes("<WorkspaceTopbar") && !managerApp.includes("function Sidebar") && !managerApp.includes("function Topbar")],
  ["orchestrator has no shared-dialog implementation dependency", !managerApp.includes("<Dialog") && !managerApp.includes("<DialogActions") && !managerApp.includes("function Modal") && !managerApp.includes("function ModalActions")],
  ["orchestrator has no stale Team component reference", !managerApp.includes("<Team\n") && managerApp.includes("<TeamWorkspace")],
  ["capitalized JSX components are runtime-bound", unboundJsxComponents.length === 0],
  ["feature workspaces have no local PageHeader adapters", headerAdapterFiles.every((source) => !source.includes("function PageHeader")) && !managerApp.includes("function PageHeader")],
  ["shared WorkspaceHeader is used directly where applicable", headerAdapterFiles.slice(1).every((source) => source.includes("<WorkspaceHeader"))],
  ["shared PanelTitle replaces feature-local copies", workspace.includes("export function PanelTitle") && ["features/dashboard/manager-overview.tsx","features/operations/DailyOperationsWorkspace.tsx","features/settings/SettingsWorkspace.tsx","features/control/ControlCenterWorkspace.tsx"].every((file) => read(file).includes("PanelTitle") && !read(file).includes("function PanelTitle"))],
  ["same-file-only helpers are not exported", !observability.includes("logServerWarning") && !capabilities.includes("export const ROLE_CAPABILITIES") && !devAuth.includes("export function getDevSessionUser") && !sessionCookie.includes("export function sessionTtlDays") && !scheduleUtils.includes("export function shiftsOverlap") && !dataSource.includes("export const days") && !rateLimit.includes("export class RateLimitError")],
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
if (unboundJsxComponents.length) console.log("Unbound JSX components:", unboundJsxComponents.join(", "));
if (failed) process.exit(1);
console.log(`UI contract passed: ${cssRelative.length} CSS files, ${scriptFiles.length} active scripts`);
