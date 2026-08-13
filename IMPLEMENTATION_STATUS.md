# Bar Ops Implementation Status — v0.19.0-rc.19

The current release is **v0.19.0-rc.19**.

## Current correction
The Employee Schedule shift-card actions now share one explicit 34px control height. This removes the previous CSS cascade mismatch between `.secondary.compact` and `.portal-action`.

## Confirmed
- Owner, Admin, Manager, Shift Manager and Employee role families remain represented by the capability model.
- Manager and employee portals continue to reuse shared workspace shell primitives.
- Production remains database-backed.
- No `CONTENT_SOURCE` runtime switch exists.
- No new business feature, API contract, permission model or database migration is introduced by rc.19.

## Remaining external acceptance gates
- Vercel dependency-backed Next.js build and TypeScript validation.
- Physical iPhone/iPad Safari verification of the corrected Schedule action heights.
