import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));
const tokens = read("styles/tokens.css");
const base = read("styles/base.css");
const globals = read("app/globals.css");
const shellCss = read("components/shell/ManagerShell.module.css");
const monoTokens = read("styles/tokens.css");
const manifest = read("app/manifest.ts");
const rootLayout = read("app/layout.tsx");
const managerApp = read("components/bar-ops-app.tsx");
const employeeShell = read("app/employee/employee-shell.tsx");
const employeeCss = read("app/employee/EmployeeWorkspace.css");
const capabilities = read("lib/auth/capabilities.ts");
const envValidation = read("scripts/validate-environment.mjs");

assert.match(pkg.version, /^0\.19\.0-rc\.(?:16|1[7-9]|[2-9]\d+)$/);

// Shared workspace chrome is the canonical navigation/topbar implementation for both portals.
assert.match(managerApp, /WorkspaceSidebar, WorkspaceTopbar/);
assert.match(employeeShell, /WorkspaceSidebar, WorkspaceTopbar/);

// All role families remain represented in the capability model.
for (const role of ["OWNER", "ADMIN", "MANAGER", "SHIFT_MANAGER", "EMPLOYEE"]) {
  assert.match(capabilities, new RegExp(`${role}:`), `${role} remains represented in the role capability map`);
}

// Page canvas ownership is black at both semantic and legacy token boundaries.
assert.match(tokens, /--color-black:\s*#000000/i);
assert.match(tokens, /--surface-page:\s*var\(--color-black\)/i);
assert.match(tokens, /--surface-shell:\s*var\(--color-black\)/i);
assert.match(monoTokens, /--mono-canvas:\s*(?:#000000|var\(--surface-page\))/i);
assert.match(base, /html\{background:var\(--surface-page\)/);
assert.match(globals, /\.app-frame\{[^}]*background:var\(--surface-page\)/);
assert.match(employeeCss, /--employee-canvas:\s*#000/);

// Browser/PWA launch surfaces must not flash the legacy cream canvas.
assert.match(manifest, /background_color:\s*"#000000"/);
assert.match(manifest, /theme_color:\s*"#000000"/);
assert.match(rootLayout, /prefers-color-scheme: light[\s\S]*color: "#000000"/);
assert.match(rootLayout, /prefers-color-scheme: dark[\s\S]*color: "#000000"/);

// Mobile shells retain safe-area handling and employee browser-toolbar clearance.
assert.match(employeeCss, /padding-bottom:\s*calc\(6\.75rem \+ env\(safe-area-inset-bottom\)\)/);
assert.match(shellCss, /env\(safe-area-inset-left\)/);
assert.match(shellCss, /env\(safe-area-inset-right\)/);

// Production remains database-backed with dev auth rejected.
assert.match(envValidation, /DATABASE_URL is required in production/);
assert.match(envValidation, /DEV_AUTH_ENABLED must not be true in production/);

console.log("v0.19.0-rc.16 refinement closeout checks passed");
