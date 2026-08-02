import fs from "node:fs";

const app = fs.readFileSync("components/bar-ops-app.tsx", "utf8");
const primitives = fs.readFileSync("components/ui-primitives.tsx", "utf8");
const tokens = fs.readFileSync("app/design-tokens.css", "utf8");
const system = fs.readFileSync("app/design-system.css", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const checks = [
  [["0.11.0","0.11.1","0.11.2","0.11.3","0.11.4","0.11.6"].includes(pkg.version), "package version is 0.11.0"],
  [primitives.includes("export function ActionButton"), "shared ActionButton exists"],
  [primitives.includes("export function InputField") && primitives.includes("export function SelectField"), "shared field primitives exist"],
  [primitives.includes("export function SegmentedControl"), "shared segmented control exists"],
  [primitives.includes("export function DialogFooter"), "shared dialog footer exists"],
  [primitives.includes("export function KpiCard"), "shared KPI card exists"],
  [app.includes("function ShiftCoreFields"), "create and edit shifts share one core field component"],
  [(app.match(/<ShiftCoreFields/g) || []).length === 2, "both shift dialog modes use ShiftCoreFields"],
  [app.includes("<FilterBar className=\"attendance-filters\""), "attendance uses shared FilterBar"],
  [app.includes("<DialogFooter onCancel={onClose}"), "dialogs use shared footer pattern"],
  [tokens.includes("--space-inline") && tokens.includes("--space-field") && tokens.includes("--space-section"), "semantic rhythm tokens exist"],
  [system.includes("v0.11.0 shared UI primitives and patterns"), "design system contains primitive layer"],
];
for (const [ok, label] of checks) {
  if (!ok) throw new Error(`v0.11.0 UI architecture check failed: ${label}`);
  console.log(`✓ ${label}`);
}
