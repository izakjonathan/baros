# Bar Ops Implementation Status

Current approved release: **v0.16.7 — Session Lifecycle & CI Runtime Alignment**

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
- v0.16.4 Request Boundary Protection
- v0.16.5 Configuration Integrity
- v0.16.6 Session Lifecycle Hardening
- v0.16.7 CI Runtime Alignment

## Current guarantees

- Existing role permissions and business workflows are preserved.
- No database migration is required for v0.16.7.
- All session creation and removal paths share one cookie policy.
- Session cookies are HTTP-only, production-secure, same-site protected and high priority.
- GitHub Actions and Vercel target Node 24.x.
- Direct dependency versions are pinned against accidental range drift.
- API request-boundary, readiness, rate-limit and configuration protections remain active.
- The PWA service worker remains present.
