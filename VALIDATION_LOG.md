# Validation Log — v0.16.7

Baseline: v0.16.5

## Completed

- v0.16.5 configuration-integrity regression
- v0.16.6 session-lifecycle regression
- v0.16.7 CI-runtime regression
- Source inspection for duplicated session-cookie implementations
- Node 24 alignment check for `package.json` and GitHub Actions
- Exact direct-dependency version check
- Confirmed `public/sw.js` remains present
- Confirmed `public/offline.html` remains absent
- Confirmed `vercel.json` remains absent
- Release ZIP integrity check

## Limitations

A complete dependency installation, ESLint run, TypeScript check and Next.js production build could not be executed in this environment because its npm mirror returned 404 for `@types/node`. Vercel or GitHub Actions must run the dependency-based gates.

The approved baseline contains no `package-lock.json`. CI therefore continues to use `npm install`; all direct dependency versions are pinned, but transitive dependency resolution is not fully lockfile-reproducible yet.
