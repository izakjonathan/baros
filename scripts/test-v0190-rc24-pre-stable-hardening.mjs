import fs from 'node:fs';
import assert from 'node:assert/strict';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const readme = fs.readFileSync('README.md', 'utf8');
const notes = fs.readFileSync('RELEASE_NOTES.md', 'utf8');
const validation = fs.readFileSync('VALIDATION_LOG.md', 'utf8');
const status = fs.readFileSync('IMPLEMENTATION_STATUS.md', 'utf8');
const preflight = fs.readFileSync('scripts/preflight-stabilization.mjs', 'utf8');

assert.match(pkg.version, /^0\.19\.0-rc\.(?:2[4-9]|[3-9]\d+)$/);
assert.match(readme, /^Rollback checkpoint: \*\*v0\.19\.0-rc\.\d+\*\*\.$/m);
if (pkg.version === '0.19.0-rc.24') {
  assert.match(readme, /pre-stable production hardening/i);
  assert.match(notes, /pre-stable production hardening/i);
  assert.match(validation, /audit:preflight/);
}
assert.equal(Boolean(pkg.scripts['audit:preflight']), true);
assert.match(status, /v0\.19\.0-rc\.(?:2[4-9]|[3-9]\d+)/);
assert.match(preflight, /README must identify one explicit approved rollback checkpoint/);
assert.equal(Boolean(pkg.scripts['test:rc24']), true);
assert.match(pkg.scripts['test:current'], /test:rc24/);

console.log('v0.19.0-rc.24 pre-stable production hardening regression passed');
