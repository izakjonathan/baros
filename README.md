# Bar Ops

Current release: **v0.19.0-rc.121**

## RC.120 — Owner Operation settings

- Replaced the owner palette shortcut with an Operation Settings control and kept UI Studio inside the same focused popup.
- Added separate confirmed resets for the saved Count list and completed/dismissed Reminder history; active reminders are preserved.
- Reset mutations are owner-authorized, location-scoped, transactional, and recorded in the audit log with the actor and deleted row count.
- No migration is required.

## RC.119 — Staff content position

- Removed the obsolete top-navigation clearance from employee and shared-link Operation pages after navigation moved to the bottom dock.
- Empty staff headers are no longer rendered, so their gradient layer cannot reserve or cover the top of Home, Handbook, Tasks, Reminders, or Count.
- Owner top clearance remains unchanged for the UI Studio and contextual add controls.

## RC.118 — Compact independent dock

- Reversed the Operation dock to an Ink background with Canvas-colored icons and labels, including the selected state.
- Reduced the phone dock while retaining 44px-equivalent destination targets.
- Moved navigation out of the fixed owner header into its own viewport-fixed layer so document scrolling cannot move it on mobile Safari.
- The dock is not rendered while an article or editor is open and remains hidden while a phone text field has focus.

## RC.117 — Adaptive Operation navigation

- Replaced the phone's top module dock with a persistent bottom dock using both icons and visible labels.
- At iPad widths, the same destinations adapt into a left-side navigation rail without changing module order or permissions.
- Owner UI Studio and contextual add actions remain separate at the top; readers and the full-screen editor continue to cover navigation.
- The phone dock yields while a text field has focus so it does not compete with the software keyboard.

## RC.116 — Owner navigation fit

- The owner Operation dock now reserves explicit space between the UI Studio and add controls instead of rendering beneath them.
- Removed the mobile rule that expanded the dock back to its full content width; overflow remains horizontally swipeable.

## RC.115 — Count cutoff and navigation

- Operation navigation can now be swiped horizontally when the module labels exceed the available width.
- Counts submitted between 00:00 and 03:59 Copenhagen time are assigned to the previous bar date.
- Simplified the Count card heading and aligned its save control with the shared Operation button treatment.

## RC.114 — Count canvas fields

- Count now uses the saved Operation canvas without an ink tint.
- Removed Safari's white input focus and autofill outline; Count fields retain only the normal Operation border.

## RC.113 — Operation Count

- Added Count for authenticated staff and shared staff links: each entry stores the counter name, till and/or change-box amount, exact submission time, and operational bar date.
- Counts made from 00:00 through 01:59 Copenhagen time are assigned to the previous bar date; multiple counts are preserved rather than overwritten.
- Added migration `020_operation_cash_counts.sql`. Run the normal database migration workflow before using Count in production.

## RC.112 — BarOs homescreen icon

- Added a purpose-built orange `BarOs` icon with regular `Bar` and bold `Os` wordmark styling.
- Replaced the Apple touch, standard PWA, and maskable PWA PNG assets, so both authenticated and shared Operation installations use the same homescreen identity.

## RC.111 — Operation typography system

- Consolidated conflicting editor and category-pill rules, then established semantic Operation roles for reading text, compact body text, metadata, and labels.
- Published Handbook articles now use a 16px reading size with clearer title-to-content rhythm; list items retain compact wrapped lines while separating distinct points more clearly.
- Task and Reminder titles use protected title columns and controlled wrapping, preserving the alignment of statuses and actions when staff enter longer names.
- UI Studio now prevents saving Canvas/Ink pairs below 4.5:1 contrast, keeping owner-selected typography readable for every Operation audience.
- No migration is required.

## RC.110 — Handbook New status and Operation viewport

- Operation locks the module viewport scale and keeps all touch form controls at 16px, preventing iPhone’s automatic input zoom across owner, employee, and shared-staff Operation routes.
- Every Handbook article is marked **New** for seven days from its immutable creation timestamp. The Handbook filters now include New, and current articles show a small star inside their existing category pill rather than a second badge.
- The native Task date/time values use full-width centered editing controls, and the Handbook reader close control is filled from the owner-selected Operation Canvas color.
- No migration is required.

Rollback checkpoint: **v0.19.0-rc.108**.

## RC.109 — Task controls and unified reminder history

- Saved task steps are included in the initial Operations payload and displayed as check-off items immediately.
- Date and time controls use a centred, bounded iOS rendering; unchecked task boxes now use the active canvas with an Ink border, while checked boxes retain the dark filled state.
- Removed the redundant scheduling explanation and merged Order/Issue history into one collapsible, date-stamped activity list.
- No migration is required.

## RC.108 — Reminder history and reading hierarchy

- Article titles now have intentional separation from the first text block; lists retain compact wrapped lines while separating distinct points more clearly.
- Restored collapsible Order history and added matching Issue history. Each row records Ordered, Resolved, or Dismissed with its Copenhagen action date.
- The same history and action data is available to authenticated staff and shared-staff links. No migration is required.

## RC.107 — Compact reminder rows

- Tightened article reader body leading and list spacing for a denser, still readable operational reading rhythm.
- On phone widths, Reminders use labelled check and dismiss icons, reclaiming title width while retaining the full action words on iPad and desktop.
- No migration is required.

## RC.106 — Operations reading rhythm

- Corrected legacy ordered and bullet lists so contiguous items render as one semantic list, preserving numbering and removing the accidental large gap between every item.
- Home news cards now use hanging-indent bullets, so wrapped lines align with the bullet text instead of the marker.
- Tightened article reader rhythm while retaining readable Work Sans text leading; Reminders labels stay on one centered line and custom Operation select styling avoids the native white focus artefact.

## RC.105 — Reminders workflow

- Renamed the Operations **Needs** queue to **Reminders** and reduced creation to a required “What is needed?” field, optional description, type, and a conditional Low/Out of choice for restocking.
- Active reminders now separate into **To order** (Restock and New item) and **Issues**. Staff can mark order items Ordered or Dismissed, and issues Resolved or Dismissed.
- The same workflow is available to authenticated staff and installable shared-staff links. Apply `db/migrations/021_operation_reminders.sql` before deploying this release.

## RC.104 — Installable shared staff links

- Adding a shared staff Operation link to an iPhone/iPad Home Screen now reopens that same public workspace instead of the authenticated Bar Ops root.
- The public manifest is validated against the active access token and is not cached, so revoked links cannot keep being installed or refreshed.
- No migration is required.

## RC.102 — Full-width Today News

- Today News cards use a compact title/action header and a full-width readable body without changing the editor.
- No migration is required.

## RC.101 — Readable News & article links

- Today News cards preserve a compact heading/subheading/body/list hierarchy without altering the editor.
- Type `>>` while writing to link another Handbook or News article; links open with a bottom circular back control beside Close.
- No migration is required.

## RC.100 — Owner News controls

- Owners can edit/delete Today news directly, and saved news appears immediately with visible connection-failure feedback when needed.
- No migration is required.

## RC.99 — Readable Today news

- Today news cards include the article’s readable body and render every published update in a naturally scrollable feed.
- No migration is required.

## RC.98 — Today-first Home

- Home puts the highest-priority incomplete task at the top, with direct shortcuts to the remaining Tasks and Needs queues.
- Removed duplicate Home tool cards; Handbook, Tasks and Needs remain in the persistent Operation navigation.
- No migration is required.

## RC.97 — Operations image performance

- Operations article uploads automatically generate a compact 960px WebP preview and a detailed reading image.
- The article loads the compact image first; tapping it opens the detailed version.
- No migration is required.

## RC.96 — Shared staff Operations link

- The direct Operations link now uses an unguessable, organisation-scoped token and exposes the employee-level Home, Handbook, Tasks and Needs workspace without a login.
- It includes shared (`Everyone`) tasks and staff ordering actions only. Changes are recorded as shared-link actions, never attributed to an individual employee.

## RC.95 — Operation palette coverage

- Corrected the Operation palette so every card, control, task/Needs view, reader, editor, popover, modal and safe-area canvas derives from the saved Canvas and Ink colors.
- The saved palette is read by every authenticated Operation login and the public read-only route; open Operation pages refresh the shared setting automatically.

## RC.94 — UI Studio and Work Sans

- Owners can save an organization-wide Canvas and Ink palette from the **Operation** module’s UI Studio.
- The palette is scoped to Operation, its handbook/news reader, and editor; shared manager, scheduling, and employee shells keep their existing palettes.
- Saving is owner-authorized, organization-scoped and audited. Apply `db/migrations/020_organization_ui_theme.sql` before enabling the control in production.
- Each organization has a read-only direct URL at `/operation/public/<organization-slug>` for published handbook and news articles. It does not expose Tasks, Needs, editing, or the UI Studio.
- Work Sans is loaded with `next/font/google` as the shared body and display family.
- Operations keeps iPad-safe input sizing and keyboard-aware visual-viewport handling; real iPad Safari acceptance remains required before production sign-off.

Bar Ops is a Next.js operations workspace for hospitality teams. The current architecture uses a global UI system for the manager and employee shells, with Shift Plan and the standalone Operation module as the only custom CSS Module exceptions.

## Development

Use the latest approved ZIP as the baseline. Prefer changing/replacing existing owners before adding new code. The repository pins Node 24, npm 10.9.2, exact dependency versions, and a lockfile; use `corepack enable npm` followed by `npm ci` for dependency-backed work. See `AGENTS.md` and `docs/development-workflow.md`.

## Current source structure

- `components/bar-ops-app.tsx` — application orchestration, shared state, API coordination, and feature-dialog callbacks
- `features/dashboard/` — Today’s operations / Shift execution overview
- `features/scheduling/` — Shift Plan workspace and editor dialogs
- `features/attendance/` — Time & attendance workspace and correction dialog
- `features/inventory/` — Inventory workspace and product/stock-count dialogs
- `features/orders/` — Orders workspace and purchase-order dialog
- `features/operations/` — Daily Operations
- `features/operation/` — standalone Operation module for handbook, news, daily tasks, and Reminders
- `features/employees/` — Team workspace and employee dialog
- `features/settings/` — Settings
- `features/control/` — Control Centre

CSS remains limited to `styles/tokens.css`, `app/globals.css`, `features/scheduling/ScheduleWorkspace.module.css`, and `features/operation/OperationModule.module.css`.
