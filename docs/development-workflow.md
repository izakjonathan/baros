# Development Workflow

1. Start from the latest approved technical ZIP.
2. Inspect the implementation and identify the true owner of the change.
3. Keep business behavior unchanged unless the release explicitly changes it.
4. For visual changes, prefer tokens/global primitives. Do not create feature CSS except for Shift Plan without explicit approval.
5. Run the focused test, current regression suite, release validation, and artifact audit when available.
6. Attempt lint, typecheck, and build when dependencies are installed; record limitations honestly when they are not.
7. Review the final diff for unrelated changes and package a recoverable ZIP.
