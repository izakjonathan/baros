# ADR-002: CSS Architecture Reset

## Status
Accepted for v0.19.0-rc.38.

## Decision
Rebuild CSS from scratch rather than continue consolidating the legacy cascade.

All shared application styling is global. Shift Plan is the only feature allowed a dedicated stylesheet because its schedule grid and shift placement are genuinely feature-specific.

## Consequences
- CSS behavior is easier to trace.
- Shared control/card/type changes propagate site-wide.
- Feature-specific overrides are not permitted by default.
- Historical CSS ownership tests must not force obsolete styling architecture back into production.
