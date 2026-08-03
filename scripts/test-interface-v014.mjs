import fs from 'node:fs';
const css=fs.readFileSync('app/interface-v014.css','utf8');
const layout=fs.readFileSync('app/layout.tsx','utf8');
const required=['.top-popover','.quick-grid','.settings-nav','.team-card','.attendance-filters','.schedule-toolbar','.modal-content','.floating-navigation'];
for (const token of required) if(!css.includes(token)) throw new Error(`Missing ${token}`);
if(!layout.includes('interface-v014.css')) throw new Error('v0.14 stylesheet is not imported');
let depth=0; for(const c of css){if(c==='{')depth++;if(c==='}')depth--;if(depth<0)throw new Error('CSS brace underflow');} if(depth!==0)throw new Error('CSS braces unbalanced');
if(/#[0-9a-f]{3,8}/i.test(css.replace(/#f4f4f2|#ffffff|#ececea|#e4e4e1|#111111|#686864|#94948f|#e8e8e5|#9b332d|#fff|#111|#d7d7d3/g,''))) console.warn('Additional hard-coded colours found');
console.log('v0.14 interface reset checks passed');
