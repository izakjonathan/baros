# v0.19.0-rc.43 Validation

## Passed

- `npm run test:rc43`
- full `npm run test:current`
- rc.38 CSS architecture gate
- rc.41 CSS contract-integrity gate
- rc.42 card-fundamentals gate
- repository/test-surface contraction checks
- fixed shared-topbar ownership checks
- Shift Plan horizontal-scroll containment checks

## Repository inventory

Compared with the rc.42 archive:

- release files: 354 -> 179
- `scripts/*.mjs`: 200 -> 26
- npm script commands: 208 -> 25
- historical test command removed
- generated `tsconfig.tsbuildinfo` removed

The active test suite retains current business/security/database/release/UI protections. Historical release-specific source-text tests remain recoverable from previous ZIPs and Git history instead of shipping in every active release.

## UI contracts

- shared topbar is `position: fixed` at desktop, tablet and mobile widths;
- shared main shell reserves topbar + top safe-area height;
- Owner/Admin/Manager/Shift Manager/Employee all use `WorkspaceTopbar`;
- Shift Plan workspace cannot own whole-page horizontal scrolling;
- only `.calendarScroll` owns horizontal scrolling for the wide day grid.

## Dependency-backed validation

`npm run lint`, `npm run typecheck`, and `npm run build` are attempted separately when dependencies are available. Vercel remains the authoritative dependency-backed build/type gate when the extracted release has no `node_modules`.

## Constitution-required command attempts

- `npm run lint` — attempted; cannot execute because the extracted release has no installed `node_modules` and `eslint` is unavailable.
- `npm run typecheck` — attempted; without installed React/Next/Postgres/Node dependency types the compiler cannot perform an authoritative project typecheck. Vercel/GitHub remains the dependency-backed gate.
- `npm run build` — attempted; cannot execute because the extracted release has no installed `node_modules` and `next` is unavailable.

No pass is claimed for those three commands locally.
