import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const layout = read("app/layout.tsx");
const css = read("app/interface-consistency.css");
const pkg = JSON.parse(read("package.json"));

const checks = [
  [["0.18.12", "0.18.13"].includes(pkg.version), "package version retains the v0.18.12 containment contract"],
  [layout.includes('import "./completion-redesign.css";\nimport "./interface-consistency.css";'), "correction layer is imported after redesign surfaces"],
  [css.includes('input[type="date"]') && css.includes('input[type="datetime-local"]'), "native temporal inputs are covered"],
  [css.includes("min-inline-size: 0") && css.includes("max-inline-size: 100%") && css.includes("box-sizing: border-box"), "controls use the canonical shrinkability contract"],
  [css.includes("position: fixed") && css.includes("inset-inline-end: max(var(--layout-gap), env(safe-area-inset-right))"), "phone popovers are viewport-owned and safe-area bounded"],
  [css.includes("@media (max-width: 22rem)") && css.includes("grid-template-columns: minmax(0, 1fr)"), "very narrow dialog actions have a one-column fallback"],
  [!css.includes("overflow: hidden") && !css.includes("margin-inline: -") && !css.includes("transform: translate"), "shared corrections do not hide or counteract layout defects"],
];

let failed = false;
for (const [ok, label] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  failed ||= !ok;
}
if (failed) process.exit(1);
