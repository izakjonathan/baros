import fs from 'node:fs';
const css=fs.readFileSync('app/product-system.css','utf8');
const tokens=fs.readFileSync('app/design-tokens.css','utf8');
const app=fs.readFileSync('components/bar-ops-app.tsx','utf8');
const required=[
  '.schedule-head {', '.schedule-toolbar {', '.attendance-filters {', '.team-card h2 {',
  '.dialog-footer-actions {', '.employee-nav {', '.floating-navigation {', '.primary, .secondary',
  'grid-template-columns: repeat(2,minmax(0,1fr))'
];
for(const value of required){if(!css.includes(value)) throw new Error(`Missing canonical layout rule: ${value}`)}
for(const token of ['--control-height-lg:','--radius-xl:','--color-surface-pressed:','--content-width:']){if(!tokens.includes(token)) throw new Error(`Missing token ${token}`)}
if(!app.includes('modalRef.current?.scrollTo')) throw new Error('Modal does not reset to its top when opened');
if(!app.includes('className="modal-content"')) throw new Error('Modal content wrapper missing');
if(css.includes('!important')) throw new Error('Cascade forcing is not permitted');
console.log('v0.13.2 layout recovery checks passed');
