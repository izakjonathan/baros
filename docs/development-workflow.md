# Development Workflow

1. Start from the latest approved ZIP or repository commit.
2. Audit the affected domain and identify current owners before editing.
3. Preserve API, authorization, tenant, database and workflow contracts unless a breaking change is explicitly approved.
4. Prefer shared primitives and domain-owned helpers over duplicated screen-specific implementations.
5. Keep visual work separate from business-logic refactoring during Phase D.
6. Run the release preflight, regressions, lint, typecheck and production build.
7. Review the final diff for unrelated changes, dead code, duplicated logic and accessibility regressions.
8. Package only the approved release documentation and source files.
