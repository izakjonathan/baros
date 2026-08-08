# Bar Ops v0.19.0-rc.10 — Employee Workspace Shell Unification

## Baseline

Built from `v0.19.0-rc.9`.

## Scope

This release corrects the employee workspace architecture and visual shell so employee, owner, admin, manager and shift-manager surfaces reuse the same application chrome wherever the interaction is equivalent.

## Changes

- Added a shared workspace chrome component for the top bar and side navigation.
- Migrated the existing manager shell wrappers to the shared chrome without changing manager navigation behaviour.
- Replaced the employee-only Bar Ops header, bottom navigation and More sheet with the shared workspace top bar and side menu.
- Employee navigation is role-aware and contains Home, Schedule, Clock, Requests, Availability and Notifications.
- Employee workspace now starts in dark mode and uses the same black shell foundation as management workspaces.
- Preserved the owner/manager multi-colour top-bar controls and location pill in the employee workspace.
- Preserved linked-manager employee-portal access through `employee.self_service`.
- Added a shared native datetime interaction field for the employee Time Off request form so iPhone Safari no longer visually owns the datetime text layout.
- Removed the superseded `EmployeeShell.module.css` and obsolete employee bottom-nav/sheet styling.

## Preserved behaviour

No employee API, permission, clocking, shift, availability, request, notification or persistence behaviour was changed.

## Validation

Source-level and regression validation is recorded in `VALIDATION_LOG.md`.

Dependency-backed lint, complete TypeScript validation, Next.js production build, Vercel staging and physical-device acceptance remain deployment gates for the exact RC.
