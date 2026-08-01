# v0.7.3 audit remediation map

| Audit finding | v0.7.4 result |
|---|---|
| Employee API reintroduced SHA-256 kiosk PINs | Fixed with salted scrypt hashing |
| Existing user password overwritten during invitation | Fixed; existing password is verified and retained |
| Employee updates identified by name | Fixed in manager state updates; UUID is authoritative |
| Invitation revoke missing in Team | Added |
| Share-sheet cancellation/failure ambiguity | Added share, clipboard and visible-link fallback |
| APP_URL could silently fall back in production | Production now requires valid APP_URL before insert |
| Expired invitations remained pending | Normalized to EXPIRED during status retrieval |
| Employee writes could partially succeed | Employee create/update and audits are transactional |
| Recurrence creation could leave partial series | Shift-series creation is transactional |
| Future/series edit could collapse dates | Relative occurrence offsets are preserved |
| Success shown before employee/product persistence | Those workflows now await API success |

The broader architecture, full endpoint validation, database tenant constraints and comprehensive integration/browser testing remain scheduled for later releases.
