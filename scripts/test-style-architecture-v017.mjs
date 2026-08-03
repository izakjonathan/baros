import fs from 'node:fs';
import path from 'node:path';
import { readStyles } from './read-styles.mjs';

const root = process.cwd();
const fail = (message) => { throw new Error(message); };
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
const entry = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const components = fs.readFileSync(path.join(root, 'app/styles/components.css'), 'utf8');
const tokens = fs.readFileSync(path.join(root, 'app/styles/tokens.css'), 'utf8');
const all = readStyles(root);

if ((layout.match(/import "\.\/globals\.css";/g) || []).length !== 1) fail('layout must import one CSS entrypoint');
for (const file of ['tokens.css','reset.css','legacy-geometry.css','components.css']) {
  if (!entry.includes(`./styles/${file}`)) fail(`globals.css must import ${file}`);
}
if (!entry.includes('@layer reset, legacy, components;')) fail('explicit layer order missing');
if (fs.existsSync(path.join(root, 'app/interface-v016.css'))) fail('obsolete interface-v016.css still exists');
if (fs.existsSync(path.join(root, 'app/design-tokens.css'))) fail('obsolete design-tokens.css still exists');
if (components.includes('v0.15.0 cascade repair')) fail('embedded repair layer still exists');
if (/!important\b/.test(all)) fail('!important is not allowed');

const defined = new Set([...all.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
const used = new Set([...all.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]));
const externalVars = new Set(['--font-inter','--font-space-grotesk']);
const undefinedVars = [...used].filter((name) => !defined.has(name) && !externalVars.has(name));
if (undefinedVars.length) fail(`undefined variables: ${undefinedVars.join(', ')}`);

// Repeated selectors are permitted only across responsive at-rule scopes; canonical source was merged per scope during generation.

if (!tokens.includes('--font-display') || !tokens.includes('--font-body')) fail('font tokens missing');
if (!components.includes('.floating-navigation')) fail('floating navigation ownership missing');
if (!components.includes('.modal-content')) fail('modal ownership missing');
console.log('v0.17.0 style architecture passed');
