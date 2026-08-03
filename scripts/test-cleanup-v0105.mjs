import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const checks=[
  [["0.10.5","0.10.6","0.11.0","0.11.1","0.11.2","0.11.3","0.11.4","0.11.6","0.11.8","0.11.9","0.12.0","0.12.1","0.13.0","0.13.1","0.13.2","0.14.0"].includes(pkg.version),"package version"],
  [/v0\.(?:10\.[56]|11\.[0-9]|12\.[0-9])/.test(read("README.md")),"current README"],
  [/^# Implementation status — v0\.(?:10|11|12)\./.test(read("IMPLEMENTATION_STATUS.md")),"current implementation status"],
  [/bar-ops-v(?:010[56]|0110|0111|0112|0113|0114|0115|0116|0117|0118|0119|0\.12\.[012])/.test(read("public/sw.js")),"rotated service-worker cache"],
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
