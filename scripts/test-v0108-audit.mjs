import fs from "node:fs";
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const required=["README.md","IMPLEMENTATION_STATUS.md","RELEASE_NOTES.md","VALIDATION_LOG.md","IPAD_NEON_VERCEL_SETUP.md"];
if(!required.every(f=>fs.existsSync(f))) throw new Error("FAIL: streamlined release documentation");
if(!pkg.version) throw new Error("FAIL: release version");
console.log("PASS: streamlined release documentation");
