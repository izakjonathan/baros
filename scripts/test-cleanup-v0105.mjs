import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const checks=[
  [["0.10.5","0.10.6"].includes(pkg.version),"package version"],
  [/v0\.10\.[56]/.test(read("README.md")),"current README"],
  [read("IMPLEMENTATION_STATUS.md").startsWith("# Implementation status — v0.10."),"current implementation status"],
  [/bar-ops-v010[56]/.test(read("public/sw.js")),"rotated service-worker cache"],
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
