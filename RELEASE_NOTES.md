# v0.19.0-rc.58 — Standalone Operation Module

## Baseline

- Continued from the exact v0.19.0-rc.57 source verified with clean dependency-backed lint, typecheck, regression, and production build gates. That release is the rollback checkpoint.

## Operation module

- Adds `/operation` as a separate module shell with no inherited side menu and a deliberately different single-colour visual design.
- The module home shows News cards first, then submodule cards for Handbook, Daily Tasks, We Need, and News.
- Handbook provides title, search, category pills, category-grouped bordered article cards, and full-screen article reading.
- News uses the same article-card and full-screen reader pattern as Handbook.
- Daily Tasks provides day-specific tasks that employees can complete; owner/admin can add tasks.
- We Need provides a reminder-style list where employees can add bar needs and mark them ordered.

## Data and permissions

- Adds migration `014_operation_module.sql` for operation articles, daily task templates/completions, and needed items.
- Adds `/api/operation-module`; API authentication failures return JSON errors.
- Owner/Admin can create, edit, and delete handbook/news articles and daily tasks.
- Authenticated employees can read Operation, complete daily tasks, add needed items, and mark needed items ordered.

## Scope

No existing manager workspace, employee-shell layout, Shift Plan grid, dependency version, or existing business workflow was replaced. Operation is documented as the explicit new CSS Module exception requested for a different design.

Rollback checkpoint: **v0.19.0-rc.57**.
