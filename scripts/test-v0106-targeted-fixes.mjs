import fs from "node:fs";
const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const hours = fs.readFileSync("app/employee/hours/page.tsx", "utf8");
const api = fs.readFileSync("app/api/employee/hours-summary/route.ts", "utf8");
const css = fs.readFileSync("app/mono-components.css", "utf8");
const checks = [
  [app.includes('<LogOut size={19} /><span>Sign out</span>'), "owner sign-out action exists"],
  [app.includes('fetch("/api/auth/logout", { method: "POST" })'), "sign-out uses existing logout endpoint"],
  [hours.includes('.finally(() =>') && hours.includes('setLoading(false)'), "employee loading state ends after failures"],
  [api.includes('code !== "42P01"') && api.includes('correction_pending: pendingCorrectionIds.has(item.id)'), "missing correction table has a narrow fallback"],
  [/\.topbar\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*space-between;/s.test(css), "topbar owns its flex layout"],
  [!css.includes("!important"), "CSS ownership remains free of important declarations"],
];
for (const [ok, label] of checks) {
  if (!ok) { console.error("FAIL:", label); process.exit(1); }
  console.log("PASS:", label);
}
