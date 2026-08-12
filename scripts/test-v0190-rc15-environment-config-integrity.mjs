import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const checks = [];
function check(name, ok) { checks.push([name, ok]); if (!ok) failures.push(name); }

const envExample = read('.env.example');
const envValidation = read('scripts/validate-environment.mjs');
const devAuth = read('lib/auth/dev-auth.ts');
const managerApp = read('components/bar-ops-app.tsx');
const quality = read('.github/workflows/quality.yml');
const runtimeFiles = [
  '.env.example', 'scripts/validate-environment.mjs', 'lib/auth/dev-auth.ts',
  'lib/db/client.ts', 'app/page.tsx', 'app/login/page.tsx',
  '.github/workflows/quality.yml', '.github/workflows/database-admin.yml'
].map(read).join('\n');

check('CONTENT_SOURCE is not part of the supported runtime contract', !/(?:^|\n)\s*CONTENT_SOURCE\s*=/.test(runtimeFiles) && !runtimeFiles.includes('process.env.CONTENT_SOURCE'));
check('production explicitly requires DATABASE_URL', envValidation.includes('DATABASE_URL is required in production'));
check('production explicitly requires APP_URL', envValidation.includes('APP_URL is required in production'));
check('production rejects development authentication', envValidation.includes('DEV_AUTH_ENABLED must not be true in production') && devAuth.includes('DEV_AUTH_ENABLED must never be true in production'));
check('CI production build keeps development authentication disabled', /- name: Production build[\s\S]*DEV_AUTH_ENABLED: "false"/.test(quality) && !/- name: Production build[\s\S]*DEV_AUTH_ENABLED: "true"/.test(quality));
check('CI production build supplies production environment contract', /- name: Production build[\s\S]*NODE_ENV: production[\s\S]*DATABASE_URL:[\s\S]*APP_URL: https:\/\/barops\.example/.test(quality));
check('browser-local operational persistence remains gated to explicit devMode', managerApp.includes('if (!devMode) return;') && managerApp.includes('if (!devMode || !dataReady) return;'));
check('environment example labels database-free development as explicit development-only mode', envExample.includes('Explicit database-free development mode') && envExample.includes('DEV_AUTH_ENABLED=false'));

for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
if (failures.length) process.exit(1);
