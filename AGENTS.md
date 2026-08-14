# Bar Ops Development Rules

- Start from the latest confirmed technical baseline; never recreate application behavior from memory.
- Inspect the current implementation before changing it.
- Preserve business logic, permissions, APIs, accessibility, and responsive behavior unless explicitly requested.
- CSS architecture: shared visual rules are global. Shift Plan is the only feature with custom CSS until explicitly changed.
- Do not add release-specific override stylesheets or append historical patch sections.
- Reuse tokens and global primitives for typography, controls, cards, surfaces, shell, spacing, and responsive behavior.
- Keep changes focused, test them, document them, and retain a rollback ZIP.
- Never claim lint, typecheck, tests, or build passed unless the command actually ran successfully.
