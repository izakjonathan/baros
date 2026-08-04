import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const interaction=read('components/ui/interaction-ui.tsx');
const manager=read('components/bar-ops-app.tsx');
const employee=read('app/employee/shifts/shift-actions.tsx');
const css=read('app/mono-components.css');
const pkg=JSON.parse(read('package.json'));
const checks=[
 ['release version',pkg.version.startsWith('0.15.')],
 ['shared accessible dialog',interaction.includes('aria-labelledby')&&interaction.includes('aria-describedby')&&interaction.includes('aria-modal="true"')],
 ['escape close',interaction.includes('event.key === "Escape"')],
 ['focus containment',interaction.includes('event.key !== "Tab"')&&interaction.includes('previouslyFocused?.focus()')],
 ['manager uses shared dialog',manager.includes('return <Dialog title={title}')],
 ['employee uses shared dialog',employee.includes('<Dialog title="Change this shift"')],
 ['pressed state exposed',employee.includes('aria-pressed={type===\'HANDOVER\'}')],
 ['standard form messages',employee.includes('<FormMessage>')],
 ['interaction css',css.includes('/* v0.15.1 interaction system */')&&css.includes('button[aria-busy="true"]')]
];
for(const [name,ok] of checks){if(!ok)throw new Error(`v0.15.1 check failed: ${name}`);console.log(`✓ ${name}`)}
console.log('v0.15.1 interaction system checks passed');
