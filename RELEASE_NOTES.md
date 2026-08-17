# v0.19.0-rc.55 — Dead-Code and Runtime Source-Surface Cleanup

## Baseline

- Continued from the exact v0.19.0-rc.54 ZIP confirmed working after successful Vercel deployment. That release remains the rollback checkpoint.

## Cleanup

- Removed the disconnected `Button`, `Badge`, and `Card` wrappers and their unused barrel; no runtime source imported any of those four files.
- Removed the unused shared `EmptyState`, the obsolete static `days` fixture, the uncalled `logServerWarning` helper, and the now-unreferenced `.shared-empty-state` rules.
- Made 17 implementation-only declarations module-private across shared chrome, workspace contracts, scheduling utilities, authentication, observability, rate limiting, and data types.
- Kept every active component, API, service, parser, capability, fixture, and CSS owner in place.

## Regression protection

- Generalized the existing UI contract with an import-graph reachability check: every runtime module under `components`, `features`, and `lib` must be reachable from an App Router or proxy entry surface.
- The existing UI contract continues to protect the three-file CSS architecture, Shift Plan ownership, shared components, feature ownership, responsive containment, and local-font build contract.

## Scope

No dependency, database migration/schema, API contract, authorization rule, permission, rendered layout, visual direction, or business workflow changed. CSS remains owned by exactly `styles/tokens.css`, `app/globals.css`, and `features/scheduling/ScheduleWorkspace.module.css`; the only CSS edit removes a selector with no runtime consumer.

Rollback checkpoint: **v0.19.0-rc.54**.
