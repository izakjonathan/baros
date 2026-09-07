# Implementation Status

Version: **v0.19.0-rc.59**

## Current focus

Operation migration fallback hotfix from the verified rc.58 baseline.

## rc.59

- Added a server-render fallback so `/operation` opens with starter content when production has not applied `014_operation_module.sql`.
- Added the same migration-required fallback to `/api/operation-module` GET refreshes.
- Added contract coverage for the fallback.
- Rollback checkpoint: v0.19.0-rc.58.

## rc.58

- Added a separate `/operation` route with its own full-screen module shell and no manager/employee side menu.
- Added Handbook and News article cards, full-screen reader, formatted content blocks, and linked-article navigation.
- Added owner/admin article editing for Handbook and News.
- Added day-specific Daily Tasks with employee completion and owner/admin task creation.
- Added a shared We Need list for bar items that employees can add and mark ordered.
- Added migration `014_operation_module.sql` and `/api/operation-module` for durable production data.
- Rollback checkpoint: v0.19.0-rc.57.
