import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
assert.match(source, /matcher:\s*["']\/api\/:path\*["']/);
assert.match(source, /MUTATING_METHODS/);
assert.match(source, /sec-fetch-site/);
assert.match(source, /request\.nextUrl\.origin/);
assert.match(source, /x-request-id/);
assert.match(source, /cache-control/);
assert.match(source, /NextResponse\.next\(\{ request: \{ headers: requestHeaders \} \}\)/);
console.log("v0.16.4 request boundary protection checks passed");
