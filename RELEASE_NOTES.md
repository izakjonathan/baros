# Bar Ops v0.19.0-rc.19 — Shift Action Height Root-Cause Fix

## Baseline
- v0.19.0-rc.18

## Fix
The employee Schedule action buttons now share one explicit 34px height contract.

Root cause: `Add shift note` matched the existing `.secondary.compact` rule and rendered at 34px, while `Hand over / swap` and `Request shift` matched the global `.portal-action` rule, which forced 42px. The `compact` class alone did not define a height for portal actions.

The employee-specific `.shift-card-action` rule now explicitly owns both `height` and `min-height` at 34px and removes vertical padding, overriding the generic portal-action control height consistently.

No API, database, permission, or workflow changes.
