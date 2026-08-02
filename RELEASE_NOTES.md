# Bar Ops v0.11.0 — UI Architecture

This release converts the visual cleanup into a reusable component architecture.

## Shared primitives

A new `components/ui-primitives.tsx` provides the canonical application controls:

- `ActionButton`
- `ActionGroup`
- `FilterBar`
- `InputField`
- `SelectField`
- `SegmentedControl`
- `KpiCard`
- `DialogFooter`

## Migrated workflows

- Overview and Time & Attendance KPI cards use one shared card component.
- Time & Attendance actions and filters use shared action/field patterns.
- Add Shift and Edit Shift now share a single `ShiftCoreFields` implementation.
- Assignment and repeat-frequency selectors use one segmented-control pattern.
- Modal footers use one shared responsive action layout, including the Edit Shift destructive action.

## Central design changes

`app/design-tokens.css` now includes semantic rhythm tokens for inline spacing, fields, cards, sections, and pages. `app/design-system.css` includes the primitive and pattern layer. Future alignment changes can be made centrally instead of per page.

## Validation

- All bundled regression suites passed.
- 67 TypeScript/TSX files passed TypeScript syntax transpilation.
- The service-worker cache namespace was rotated to v0.11.0.
- No database migration is required.
