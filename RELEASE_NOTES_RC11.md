# v0.19.0-rc.11

Focused build hotfix for the employee invitation response contract.

- Uses a dedicated parser/type for POST `/api/employee-invitations` responses instead of the manager bootstrap contract.
- Preserves API error messages for failed invite/revoke requests.
- Requires a successful invite response to contain an activation URL before share/copy handling.
- Adds a focused regression check.
- No database migration, CSS, role, permission, navigation, or visual-design changes.
