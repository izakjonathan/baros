# Bar Ops — v0.19.0-rc.36

Current release: **v0.19.0-rc.36**.

Release: **Visual Regression Recovery**.

This release supersedes rc.35. The sub-4000 CSS purge removed declarations that appeared superseded structurally but remained necessary in live responsive/stateful UI contexts. rc.36 restores the affected CSS surfaces to the validated rc.34 state while preserving all non-CSS work from rc.35.

No database migration is required.

Rollback checkpoint: **v0.19.0-rc.34**.
