# v0.7.0 implementation status

## Implemented in development mode

- Product creation and editing
- Product-level stock, par, reorder level, supplier, SKU, unit, pack size, pricing, notes, and status
- Reasoned stock adjustments and adjustment history
- Stock-count workflow and variance review
- Suggested replenishment
- Basic delivery receiving and stock update
- Opening and closing checklists
- General and maintenance tasks
- Manager logbook and handover notes
- Browser persistence with JSON backup/restore/reset

## Still staged for production integration

The v0.6 PostgreSQL foundations remain present, but the new v0.7 operational editors are intentionally local-first while the product is being tested. Before production launch, connect stock counts, product metadata, task templates, task completions, and logbook entries to tenant-scoped PostgreSQL APIs and immutable audit records.
