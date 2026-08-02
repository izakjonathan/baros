import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const checks=[
  [pkg.version==="0.10.5","package version"],
  [read("README.md").includes("v0.10.5"),"current README"],
  [read("IMPLEMENTATION_STATUS.md").startsWith("# Implementation status — v0.10.5"),"current implementation status"],
  [read("public/sw.js").includes("bar-ops-v0105"),"rotated service-worker cache"],
  [!read("app/manifest.ts").includes("?module=schedule"),"dead manager shortcut removed"],
  [!read("app/manifest.ts").includes("portrait-primary"),"iPad orientation not locked"],
  [!fs.existsSync(path.join(root,"FULL_SYSTEM_AUDIT.md")),"stale system audit removed"],
  [!fs.existsSync(path.join(root,"FULL_FUNCTIONAL_AUDIT_V0101.md")),"stale functional audit removed"],
  [!fs.existsSync(path.join(root,"RELEASE_NOTES_V0102.md")),"stale release notes removed"],
  [fs.existsSync(path.join(root,".github/workflows/database-admin.yml")),"database workflow retained"],
  [fs.existsSync(path.join(root,".github/workflows/quality.yml")),"quality workflow retained"],
];
for(const [ok,label] of checks){if(!ok)throw new Error(`Cleanup check failed: ${label}`)}
console.log(`v0.10.5 cleanup checks passed (${checks.length})`);
