# v0.19.0-rc.41 Validation

## Passed

- `npm run test:current`
- `npm run test:rc41`
- structural CSS parsing with `tinycss2`: 3 CSS files, 0 parse errors
- static runtime class-to-CSS contract scan: 0 unresolved class names
- `ui-classes.ts` mapped class-to-CSS contract scan: 0 unresolved class names
- TypeScript syntax transpilation across 99 TS/TSX files: 0 syntax failures

## rc.41 focused assertions

- exactly three CSS files remain;
- `.page-wrap` solely owns page/safe-area gutters;
- Employee does not own outer page padding/margin;
- top bar and page content use the same mobile gutter token;
- headings/paragraphs have fully reset margins;
- bold typography uses a loaded font weight;
- native controls on light surfaces use a light native color scheme;
- the nonfunctional theme toggle is removed;
- shared loading/error/empty-state components are styled;
- shared Dialog renders a real body wrapper;
- all `ui-classes.ts` mappings resolve to CSS;
- Shift Plan editor styling is module-owned;
- Employee transfer actions use shared form/control primitives;
- Schedule acknowledgement uses a real global button primitive;
- manager PageHeader uses the shared WorkspaceHeader primitive;
- root global-error inline styling is explicitly documented as an intentional exception.

## Dependency-backed validation attempts

The constitution-required commands were attempted in the extracted release workspace:

- `npm run lint` — could not execute because `eslint` is not installed (`node_modules` is absent).
- `npm run typecheck` — the available TypeScript executable ran, but cannot resolve React, Next.js, Postgres, Node, or their type declarations because project dependencies are not installed; this is not an authoritative application typecheck.
- `npm run build` — could not execute because `next` is not installed (`node_modules` is absent).

Vercel remains the production dependency-backed TypeScript/build gate. No pass is claimed for these three commands.
