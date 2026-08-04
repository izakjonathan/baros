# Validation Log — Bar Ops v0.16.17

## Passed

- v0.16.14 tenant-scope regression
- v0.16.15 transaction-integrity regression
- v0.16.15.1 order-route typing regression
- v0.16.16 operational-observability regression
- v0.16.17 release-and-recovery regression
- Release contract validation
- Package and required-document version alignment
- Node 24 package and workflow alignment
- `public/sw.js` present
- `public/offline.html` absent
- `vercel.json` absent
- Release ZIP integrity

## Not run in this environment

- Clean dependency installation
- ESLint
- TypeScript compilation
- Full Next.js production build
- Live Vercel health and log verification
- Rollback deployment exercise

These dependency- and deployment-based checks remain configured for GitHub Actions and Vercel.
