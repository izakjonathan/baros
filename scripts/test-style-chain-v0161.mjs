import fs from 'node:fs';
import { readStyles } from './read-styles.mjs';
const layout=fs.readFileSync('app/layout.tsx','utf8');
const entry=fs.readFileSync('app/globals.css','utf8');
const css=readStyles();
const fail=(m)=>{throw new Error(m)};
if ((layout.match(/\.css"/g)||[]).length !== 1) fail('Root layout must import exactly one stylesheet entrypoint');
if (!layout.includes('import "./globals.css"')) fail('globals.css must be the root stylesheet');
if (!entry.includes('@layer reset, legacy, components')) fail('Explicit cascade layer order missing');
if (!css.includes('.floating-navigation')) fail('Floating navigation ownership missing');
let depth=0;
for (const ch of css.replace(/\/\*[\s\S]*?\*\//g,'')) { if(ch==='{') depth++; if(ch==='}') depth--; if(depth<0) fail('CSS closes a block before it opens'); }
if(depth!==0) fail(`CSS brace imbalance: ${depth}`);
console.log('v0.17.0 style chain audit passed');
