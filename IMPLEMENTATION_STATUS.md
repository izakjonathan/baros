# Implementation Status — v0.19.0-rc.36

rc.36 is a corrective visual-regression release based on rc.35 with the rc.35 CSS purge reverted to the validated rc.34 CSS baseline. The application architecture, components, data model, and feature behavior are otherwise unchanged.

The next CSS reduction pass must use rendered/state-aware verification; declaration-level cascade equivalence alone is no longer accepted as sufficient evidence for deletion.
