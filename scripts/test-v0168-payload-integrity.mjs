import fs from "node:fs";
const http = fs.readFileSync("lib/http.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const checks = [
  [(() => { const v = pkg.version.split(".").map(Number); return v[0] > 0 || v[1] > 16 || (v[1] === 16 && v[2] >= 9); })(), "package version is 0.16.9 or newer"],
  [http.includes('Content-Type must be application/json'), "JSON content type is required"],
  [http.includes('request.body.getReader()'), "request body is read as a stream"],
  [http.includes('received > maxBytes'), "streamed bytes are capped"],
  [http.includes('Invalid Content-Length header'), "invalid Content-Length is rejected"],
  [http.includes('new TextDecoder("utf-8", { fatal: true })'), "invalid UTF-8 is rejected"],
  [!http.includes('await request.json()'), "unbounded Request.json parsing is removed"],
];
for (const [ok, label] of checks) { if (!ok) throw new Error(`FAIL: ${label}`); console.log(`PASS: ${label}`); }
