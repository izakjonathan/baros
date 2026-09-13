# v0.19.0-rc.72 — Operation editor, uploads and scheduled tasks

## Baseline

- Continued from v0.19.0-rc.71. That release is the rollback checkpoint.

## Operation editor and actions

- Restyled the full-screen Quill editor in the cream/charcoal Operation palette.
- Kept rich-text Heading, Subheading, Body, emphasis, lists, links and device image insertion in the fixed editor toolbar.
- Replaced the large owner add buttons with circular plus actions at the right of News and Handbook headers.

## Task schedule and images

- Tasks can be assigned to one specific date or repeat daily, weekly, monthly or yearly, including an interval and optional end date.
- Image uploads use a private server-side `BLOB_READ_WRITE_TOKEN` and Vercel Blob public URLs. Add the token to the Vercel project environment before using image insertion.
- Apply database migration `015_operation_task_schedule.sql` after deployment.

Rollback checkpoint: **v0.19.0-rc.71**.
