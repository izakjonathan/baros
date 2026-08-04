# Bar Ops

**Current release: v0.13.0 — Schedule Acknowledgement Reminders**

Hospitality operations system built with Next.js, TypeScript and PostgreSQL for Vercel and Neon.

## v0.10.11 employee timesheet rendering

v0.10.11 prevents Clock-page crashes when PostgreSQL date values are returned as full ISO timestamps and keeps geolocation failures inline. See `RELEASE_NOTES_V01011.md`.

## v0.10.10 employee hours and location assignment

v0.10.10 fixes the production employee-hours SQL failure and adds manager-controlled primary location assignment for employees. See `RELEASE_NOTES_V01010.md`.

## v0.10.8 baseline audit

v0.10.8 is an audit-only package based on v0.10.7. It adds a complete SHA-256 manifest, classified repository inventory, functional verification matrix, validation log and prioritized audit report. Application behavior is unchanged. See `AUDIT_REPORT_V0108.md`.


## iPad workflow
Commit the flat ZIP to the private `baros` repository using the Commit app. GitHub Quality Checks installs dependencies, runs tests/type checking/build, and Vercel deploys the commit.

## Database
Use `DATABASE_URL` for the pooled Neon runtime URL and `DATABASE_DIRECT_URL` for migrations.

For this release no new migration is required.

## Install as an iPhone or iPad app

Bar Ops v0.10.4 includes a web app manifest, Apple metadata, app icons and a service worker. In Safari, open the deployed site, choose **Share → Add to Home Screen**, then launch Bar Ops from its icon. If an older shortcut was installed before v0.10.4, delete it and add it again so iOS picks up the new standalone configuration.

The service worker does not cache authenticated API responses or operational pages. When offline, Bar Ops shows a controlled reconnect screen rather than stale schedule, payroll or inventory data.
## v0.10.5 CSS ownership

The CSS cleanup release removes historical redesign blocks, repeated exact selectors and `!important` declarations while preserving the v0.10.4 project architecture. See `CSS_OWNERSHIP_REPORT_V0105.md`.


### v0.10.7 employee workspace integrity

Employee routes derive their employee and location context centrally from the authenticated session. An active session location is preferred; employee accounts use their primary active `employee_locations` assignment when the stored session location is missing or stale. Development employee previews require a seeded, activated employee account and resolve that real database identity instead of using placeholder UUID values.
