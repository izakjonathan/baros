# Bar Ops v0.19.0-rc.23 — Mobile/iPhone/iPad Micro-Polish

Current release: **v0.19.0-rc.23**

This release is the responsive-device polish pass following the rc.20–22 micro-design refinement work. It improves Apple-device input behavior, viewport clearance, safe-area handling and tablet gutters without changing the established black/pastel visual direction or any business workflow.

## Scope
- Native date/time/month/datetime containment and Safari focus behavior.
- Keyboard/browser-toolbar clearance for focused controls and transient UI.
- Safe-area-aware employee bottom spacing.
- Compact Employee Schedule action-row spacing while preserving the 34px action contract.
- iPad/tablet content gutters across shared workspaces.
- No API, database, permission or workflow changes.
- No migration required.

## Validation
See `VALIDATION_LOG.md` for the executed release checks.

## Rollback checkpoint
If rc.23 introduces an unexpected responsive regression, roll back to v0.19.0-rc.22. rc.23 contains no database or data-model change.
