# v0.4.1 — Payroll approval, approved-hours export and scale pass

- Adds explicit single and bulk timesheet approval.
- Pending and running timesheets are excluded from every export.
- Adds custom-period CSV export aggregated by employee.
- Export contains employee name, email, phone, role, selected period, approved timesheet count and approved-hour total.
- Adds persistent tenant-scoped `/api/timesheets/export` route.
- Adds export preview cards and a three-step payroll workflow.
- Standardises scale and spacing across every manager module and mobile dialog.
- Adds payroll export regression tests and a product gap audit.
