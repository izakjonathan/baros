# Bar Ops v0.8.3 — Location Context

- Adds an organization-wide current-location context to the manager workspace.
- Automatically selects the only active location when an organization has one location.
- Shows a persistent location switcher when multiple active locations exist.
- Reloads shifts, inventory, orders, timesheets, alerts, templates and forecasts for the selected location.
- New shifts inherit the current location automatically; the shift form exposes a location selector only when multiple choices exist.
- Employee and product creation inherit the current location.
- Product stock/par edits are applied to the current location inventory record.
- Replaces the vague “A location is required” failure with actionable no-location handling.
- Adds `npm run test:location-context`.

No database migration is required.
