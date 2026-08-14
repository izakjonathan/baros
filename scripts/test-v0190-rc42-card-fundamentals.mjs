import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const css=read('app/globals.css');
const schedule=read('features/scheduling/ScheduleWorkspace.module.css');
const ui=read('lib/ui-classes.ts');
const workspace=read('components/ui/workspace-ui.tsx');
const request=read('app/employee/request-form.tsx');
const manager=read('components/bar-ops-app.tsx');
const card=read('components/ui/primitives/Card.tsx');
const checks=[
 ['version is rc.42 or later',/^0\.19\.0-rc\.(?:4[2-9]|[5-9]\d|\d{3,})$/.test(pkg.version)],
 ['standard card is the single base surface',/\.card\{[^}]*display:grid[^}]*padding:var\(--space-4\)[^}]*border-radius:var\(--radius-lg\)[^}]*background:var\(--cream\)/.test(css)],
 ['compact card only changes density',/\.card-compact\{gap:var\(--space-2\);padding:\.8rem\}/.test(css)],
 ['flush card only removes internal spacing',/\.card-flush\{gap:0;padding:0\}/.test(css)],
 ['obsolete card fundamentals are gone',!css.includes('.card-state{')&&!css.includes('.card-muted{')&&!css.includes('.card-elevated{')&&!css.includes('.panel,.card')],
 ['shared states compose base card instead of inventing card geometry',workspace.includes('card card-compact shared-state-card')&&/\.shared-state-card\{[^}]*min-height:6rem[^}]*place-items:center/.test(css)],
 ['request success reuses shared state card',request.includes('card card-compact shared-state-card request-success')],
 ['manager loading reuses shared state card',manager.includes('card card-compact shared-state-card workspace-loading-card')],
 ['attendance preview uses the base card',ui.includes('preview:"card"')],
 ['request cards use compact card fundamental',ui.includes('card:"card card-compact"')],
 ['feature card hooks do not redefine base radius or padding',!(/\.team-card\{[^}]*(padding|border-radius)/.test(css))&&!(/\.(product-card|order-card)\{[^}]*(padding|border-radius)/.test(css))&&!(/\.request-card\{[^}]*(padding|border-radius)/.test(css))&&!(/\.clock-card\{[^}]*(padding|border-radius)/.test(css))],
 ['Card primitive exposes only default compact flush density',card.includes('density?:"default"|"compact"|"flush"')&&!card.includes('elevated')&&!card.includes('tone?')],
 ['Shift Plan retains its custom shift card exception',/\.shiftCard\{[^}]*padding:[^}]*border-radius:[^}]*background:/.test(schedule)],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
console.log('Global card fundamentals: card, card-compact, card-flush. Custom exception: Shift Plan shiftCard.');
