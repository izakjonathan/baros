# v0.19.0-rc.42 Validation

## Passed

- `npm run test:rc42`
- `npm run test:current`
- rc.38 CSS architecture gate
- rc.41 CSS contract-integrity gate

## rc.42 focused assertions

- one standard base card exists;
- compact cards only change density;
- flush cards only remove internal spacing;
- obsolete panel/card variants are gone;
- shared states compose the base card;
- manager loading and employee request-success surfaces reuse shared state/card contracts;
- Attendance preview uses the global card;
- Request cards use the compact card contract;
- feature card hooks do not redefine base radius/padding;
- React Card primitive exposes only default/compact/flush density;
- Shift Plan retains the sole custom shift-card exception.

## CSS inventory

- `styles/tokens.css`: 47 declarations
- `app/globals.css`: 1,405 declarations
- `features/scheduling/ScheduleWorkspace.module.css`: 278 declarations
- Total: **1,730 declarations across 3 CSS files**

Dependency-backed lint/typecheck/build still require the installed dependency environment. Vercel remains the authoritative dependency-backed TypeScript/build gate.
