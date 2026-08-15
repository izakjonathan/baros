import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));
const layout = read("app/layout.tsx");
const css = read("app/system-contracts.css");
const docs = read("docs/full-visual-qa-v01813.md");

const checks = [
  [pkg.version.startsWith("0.18.13"), "package remains on the v0.18.13 visual-QA line"],
  [layout.includes('import "./completion-redesign.css";\nimport "./system-contracts.css";'), "visual QA layer follows containment foundation"],
  [css.includes("min-block-size:var(--control-height-default)") && css.includes("inline-size:var(--control-height-default)"), "controls and icon actions use the 44px touch contract"],
  [css.includes(":focus-visible") && css.includes("outline-offset: 3px"), "shared keyboard focus remains visible"],
  [css.includes("overflow-wrap: anywhere") && css.includes("text-wrap: balance"), "long titles and operational content remain contained"],
  [css.includes("overflow-x: auto") && css.includes("overscroll-behavior-inline: contain"), "dense data owns its horizontal scrolling"],
  [css.includes("env(safe-area-inset-left)") && css.includes("100dvh"), "transient UI respects safe areas and dynamic viewport height"],
  [css.includes("prefers-reduced-motion") && css.includes("scroll-behavior: auto"), "reduced-motion preference is respected"],
  [!css.includes("overflow: hidden") && !css.includes("margin-inline: -") && !css.includes("translateX("), "QA fixes do not hide or counteract defects"],
  [docs.includes("Audited surfaces") && docs.includes("Prohibited compensations"), "visual QA scope and ownership are documented"],
];

let failed = false;
for (const [ok, label] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  failed ||= !ok;
}
if (failed) process.exit(1);
