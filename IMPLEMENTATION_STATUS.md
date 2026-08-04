## v0.11.4 monthly availability type fix

Current release. Monthly availability SQL inputs are narrowed and normalized so optional values cannot reach PostgreSQL as `undefined`. No migration is required.

## v0.11.3 request targeting and monthly availability

- Transfer response actions are target-employee-only.
- Requesters retain outgoing status visibility.
- Employees can edit every date in a selected month.
- Date-specific availability uses the existing availability rules schema.
- No migration required.
