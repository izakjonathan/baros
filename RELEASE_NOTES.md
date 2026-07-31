# Bar Ops v0.7.0 — Inventory & Daily Operations

## Added

- Complete create/edit product workflow with supplier, SKU, category, unit, pack size, purchase/selling prices, active state, notes, stock, par, and reorder level.
- Audited manual stock adjustments requiring a reason.
- Stock-count sessions with expected/actual values, variance review, and approval.
- Suggested replenishment based on par shortage.
- Development delivery receiving that updates stock.
- Daily Operations workspace with opening/closing tasks, maintenance tasks, manager logbook, and shift handovers.
- Browser-local persistence for the development workspace.
- Development JSON export, import, and reset-to-demo controls.
- Responsive inventory, count, logbook, and checklist layouts.

## Validation

- Existing shift, payroll, audit, integrity, and production-foundation tests pass.
- New `npm run test:inventory` suite passes.
- Full Next.js build was not run because dependencies are not installed in the execution workspace.
