import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const spacing = fs.readFileSync("app/spacing-system.css", "utf8");
const legacy = fs.readFileSync("app/mono-components.css", "utf8");
const shell = fs.readFileSync("components/shell/ManagerShell.module.css", "utf8");
const fail = (message) => { console.error(`v0.18.4.13 spacing ownership regression: ${message}`); process.exit(1); };

if (pkg.version.localeCompare("0.18.4.13", undefined, { numeric: true }) < 0) fail("package version mismatch");
if (layout.indexOf('import "./spacing-system.css"') < layout.indexOf('import "./mono-components.css"')) fail("spacing owner must load after legacy component CSS");
for (const token of [
  "--layout-gap: 8px",
  "padding-inline-start: max(var(--layout-gap), env(safe-area-inset-left))",
  "margin-block-end: var(--layout-gap)",
  "gap: var(--layout-gap)",
  "Approved exception: the mobile schedule calendar"
]) if (!spacing.includes(token)) fail(`missing canonical rule: ${token}`);

const forbidden = [
  '.page-header { margin-bottom: 22px; }',
  'gap:24px;margin:0 0 2px',
  '.employee-page>.employee-lead{margin-bottom:18px}',
  '.team-toolbar{margin-bottom:14px}',
  'margin-top:28px',
  'padding-top:20px',
  'padding-inline:max(14px',
  'padding-left:max(12px'
];
for (const fragment of forbidden) if (legacy.includes(fragment)) fail(`legacy external spacing remains: ${fragment}`);
if (shell.includes('padding-inline:max(.75rem') || shell.includes('padding-inline:max(var(--space-4)')) fail("manager shell still bypasses the grid gutter");
console.log("v0.18.4.13 spacing ownership regression passed");
