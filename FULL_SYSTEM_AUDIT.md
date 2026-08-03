# Bar Ops v0.9.1 full-system audit

## Examined
All application pages, client components, API Route Handlers, authentication/session utilities, PostgreSQL client code, ten migrations, database scripts, GitHub Actions, global CSS, development persistence and all regression scripts were reviewed.

## Corrections included
1. Replaced fixed July/August 2026 calendar anchors with a current-week/current-month baseline.
2. Converted PostgreSQL timestamps to venue-local calendar date/time for schedule rendering.
3. Added location timezone to bootstrap and shift mutation responses.
4. Made Copy Previous Week write each copied shift to PostgreSQL before reporting success.
5. Made production stock-count changes wait for product/inventory persistence.
6. Made clock-in, break and clock-out actions execute entirely in one PostgreSQL transaction with row locks.
7. Derived timesheet work date in the location timezone rather than the database session timezone.
8. Added PostgreSQL connection timeout, connection lifetime and application identification.
9. Removed stale TypeScript build output and superseded audit/release documents.
10. Versioned development browser storage while retaining backward compatibility with the old key.
11. Corrected package/release metadata and expanded GitHub quality checks with type checking.
12. Removed unused browser CSP allowances for Supabase endpoints.

## Frontend/database contract reviewed
- Employees use UUIDs for writes and assignment.
- Shift writes wait for server confirmation and use returned database IDs.
- Published status is persisted before UI success.
- Location context is included in shift/product/inventory mutations.
- Invitation activation, session creation and audit logging are transactional.
- Payroll exports and period state transitions are transactional and guarded.
- Stock receipt, waste and transfer APIs use PostgreSQL transactions.

## Known staged areas
The following are still not represented as finished production workflows:
- The Daily Operations manager editor is largely local presentation state.
- The purchase-order creation dialog is not yet a complete line-item PostgreSQL editor.
- Some dashboard cards use sample editorial content rather than live aggregates.
- Several regression tests are source assertions; live disposable-PostgreSQL and browser end-to-end tests remain desirable.
- The manager component and global stylesheet are still large and should be modularized in a later architecture-only release.

## Validation performed
- Every bundled regression suite passed.
- All JavaScript migration/test scripts passed `node --check`.
- GitHub workflow YAML parsed successfully.
- ZIP path, duplicate-entry and archive-integrity checks passed.
- Full dependency installation/build could not be run in this execution environment because its npm gateway does not provide standard packages. GitHub Quality Checks runs install, test, type-check and Next.js build using the public registry.
