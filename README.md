# Bar Ops — Operation

Current release: **v0.19.0-rc.140**

This repository now contains only the focused Operation product:

- `/login` — account sign-in
- `/activate/[token]` — single-use account activation
- `/operation` — authenticated Home, Handbook, Tasks, Reminders and Count
- `/operation/public/[accessToken]` — shared staff access with employee-level permissions

The former scheduling, attendance, inventory, ordering, payroll and employee-portal routes have been removed from the deployed application. Their historical database migrations remain intentionally preserved so existing production data can be extracted safely into a future repository.

## Owner settings

Owners can open Operation Settings to:

- manage the Operation color system;
- create Owner, Manager or Employee invitations;
- edit account names, email addresses, access levels and assigned locations;
- delete account access while preserving historical records;
- copy or revoke pending activation links;
- enable, disable or rotate the shared staff link;
- reset Count or Reminder history independently;
- sign out.

Invitation links expire after seven days, are single-use, and are stored only as SHA-256 hashes. Run migration `025_operation_user_invitations.sql` before using Add user.

## Local development

```bash
npm ci
npm run db:migrate
npm run dev
```

Required production variables:

- `DATABASE_URL`
- `DATABASE_DIRECT_URL` for migrations
- `APP_URL`
- `BLOB_READ_WRITE_TOKEN` for image upload

## Verification

```bash
npm run test:all
npm run lint
npm run typecheck
npm run validate:env
npm run build
```

Rollback checkpoint: **v0.19.0-rc.139**.

## Responsive Operation layout

At widths of 64rem and above, Operation uses a centered canvas capped at 54rem, with additional side gutters and top spacing, two-column Handbook cards and task groups. Home places the overview beside News, Reminders places To order beside Issues, and Count places the entry form beside saved counts. Smaller screens retain one column; open articles retain their existing reading width. A lone task remains compact.

## Task body text

Create or edit a task and choose **Add body text** / **Edit body text**. This opens the same full-screen rich-text editor used by the Handbook. Use More → Link article (or type `>>`) to insert a Handbook link. Done returns to the task form; Create task / Save changes saves the task. Cards show a two-line text preview; opening a task shows its complete formatted body above its checklist. Following a Handbook link offers Back to task. Existing instructions and saved templates remain usable.

Home now starts with **Blågårds Apotek**, with task/reminder shortcuts and formatted News cards. Tasks use a compact date navigation bar with previous/next day, a native date picker and Today.

## Live Handbook updates

Visible Home, Handbook and article readers check for saved article changes every two seconds, including shared staff links. Open readers use the latest article data; closing a reader requests a refresh immediately. Saving and closing an editor resumes checking immediately. Hidden/offline pages pause and refresh when they return. Local edits are protected by pausing article sync while the editor is open. Changes require the existing Save checkmark; closing an unsaved draft does not publish it.

## Editor controls

Article formatting controls occupy a separate footer in the visible editor frame. The note body scrolls independently; the toolbar and its popovers are outside that scroller. The frame follows the visual viewport when the software keyboard opens, pans or closes.

## Paste from Apple Notes

Paste normally into the article body. Notes Title and Heading become Baros Heading; Notes Subheading becomes Baros Subheading. Bold, italic, underline, links and lists retain the supported editor formatting. Clipboard fonts and colors do not replace the Operation theme.

Semantic headings and Apple text-style hints take priority. When Notes supplies only styled paragraphs, whole-line bold text at standard Notes sizes is mapped to Heading or Subheading; a fully bold body line of the same size can be indistinguishable from a subheading. Plain-text-only clipboard content cannot retain heading styles. Real-device Notes/Safari clipboard testing is still required.

Handbook cards are grouped under their category headings. Search and category filters show only matching groups, with the existing responsive card grid inside each group.

Home shows all tasks for the current Copenhagen bar day, with open and completion controls and no date picker. The task day changes at 04:00, matching Count. Browsing another date in Tasks does not change Home’s daily list. Completed tasks stay visible and can be unchecked. An empty day shows “No pending tasks for today.”

Recurring task edits update the series. Deleting offers only the selected bar-day occurrence or the entire series. Migration 026 stores occurrence exceptions without modifying completion history; its dedicated production workflow runs on changes to that migration.
