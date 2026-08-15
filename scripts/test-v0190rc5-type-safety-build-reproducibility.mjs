import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
const pkg=JSON.parse(read("package.json"));
const app=read("components/bar-ops-app.tsx");
const requests=read("components/requests-workspace.tsx");
const contract=read("features/workspace/bootstrap-contract.ts");
const workflow=read(".github/workflows/quality.yml");
const dbWorkflow=read(".github/workflows/database-admin.yml");

assert.match(pkg.version,/^0\.19\.0-rc\.(?:[5-9]|[1-9]\d+)$/);
assert.equal(pkg.scripts["test:all"],"npm run test:current");
assert.match(pkg.scripts["test:historical"],/test:v0101-functional/);
assert.match(pkg.scripts["test:current"],/test:v0190rc5/);
assert.match(contract,/export type ManagerBootstrapResponse/);
assert.match(contract,/parseManagerBootstrapResponse/);
assert.match(app,/parseManagerBootstrapResponse\(await response\.json\(\)\)/);
assert.doesNotMatch(app,/map\(\(e: any\)/);
assert.doesNotMatch(app,/map\(\(x:any\)/);
assert.doesNotMatch(requests,/\(r:any\)/);
assert.match(requests,/fetchJsonArray<RequestQueueRecord>/);
assert.match(pkg.scripts["test:historical"],/test:v0101-functional/);
assert.match(pkg.scripts["test:current"],/test:v0190rc5/);
assert.match(workflow,/npm install --no-audit --no-fund/);
assert.match(dbWorkflow,/npm install --no-audit --no-fund/);
assert.equal(fs.existsSync("package-lock.json"),false,"Lockfile must not be fabricated while registry access is unavailable");
console.log("v0.19.0-rc.5 type-safety and build-reproducibility regression passed");
