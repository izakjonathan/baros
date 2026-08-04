# Release Notes — v0.16.21.3

## Audit Remediation

- Removed `vercel.json`, restoring parity with the approved deployment contract.
- Updated activation reliability tests to validate shared session persistence rather than obsolete inline SQL strings.
- Repaired historical regression version checks so later releases and patch-level versions remain valid.
- Corrected semantic-version parsing for four-part hotfix releases.
- Consolidated duplicated release metadata and headings.

## Migration

No migration required.

## Rollback

Approved rollback checkpoint: v0.16.17.
