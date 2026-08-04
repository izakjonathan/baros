import fs from "node:fs";
const app=fs.readFileSync("components/bar-ops-app.tsx","utf8");
const ui=fs.readFileSync("components/ui/workspace-ui.tsx","utf8");
const css=fs.readFileSync("app/mono-components.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const checks=[
  [pkg.version.startsWith("0.15."),"package version preserves the v0.15.x baseline"],
  [app.includes('aria-current={active === item.id ? "page" : undefined}'),"sidebar exposes active page"],
  [app.includes('data-workspace={active}'),"workspace identity is exposed"],
  [app.includes('className="workspace-context"'),"topbar includes workspace context"],
  [ui.includes("export function WorkspaceHeader"),"shared workspace header exists"],
  [ui.includes("export function EmptyState"),"shared empty state exists"],
  [ui.includes("export function LoadingState"),"shared loading state exists"],
  [ui.includes("export function ErrorState"),"shared error state exists"],
  [css.includes("--workspace-section-gap"),"shared workspace spacing tokens exist"],
  [css.includes(".shared-state-card"),"shared state styling exists"],
];
for(const [ok,label] of checks){if(!ok) throw new Error(`FAIL: ${label}`); console.log(`PASS: ${label}`)}
