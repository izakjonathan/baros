# Bar Ops Implementation Status

Current approved release: **v0.16.3.1 — Production Build Hotfix**

## Completed refinement releases

- v0.15.0 Navigation & Workspace Consistency
- v0.15.1 Interaction System
- v0.15.2 Search & Productivity
- v0.15.3 Mobile & iPad Polish

## Completed production-hardening releases

- v0.16.0 Runtime Resilience
- v0.16.1 Deployment & Operational Guardrails
- v0.16.1.1 TypeScript Build Hotfix
- v0.16.2 Request Abuse Protection
- v0.16.3 Runtime & Health Probes
- v0.16.3.1 Next.js health alias and Node 24 deployment hotfix

## Current guarantees

- Existing role permissions and business workflows are preserved.
- No database migration is required for v0.16.3.1.
- Throttled API responses include request IDs and retry metadata.
- Liveness and database readiness can be monitored independently.
- Production is pinned to the Node 20 runtime line.
- The PWA service worker remains present.
