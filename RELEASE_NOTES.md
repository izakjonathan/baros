# v0.19.0-rc.100 — Owner News Controls

## Baseline

- Continued from v0.19.0-rc.99. That release is the rollback checkpoint.

## Included

- Owner Today news cards again expose their Edit and Delete controls; employee and shared staff views remain read/action-only according to existing permissions.
- Saving a News article immediately adds or updates the card before a background refresh completes. Network failures leave the editor open and show a retry message.

No database migration is required. Existing owner, employee and shared-staff permissions remain unchanged.

Rollback checkpoint: **v0.19.0-rc.99**.
