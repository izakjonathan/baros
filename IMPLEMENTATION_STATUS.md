# Implementation Status

Version: **v0.19.0-rc.95**

## Current focus

Operation palette coverage from the verified rc.94 baseline.

## rc.95

- All Operations colors, including accents and status treatments, now derive from the persisted Canvas/Ink pair.
- Applies to authenticated Operations roles and the public read-only handbook/news route, including open sessions after the palette refresh interval.
- Rollback checkpoint: v0.19.0-rc.94.

## rc.94

- Owners manage the persisted Operation canvas and ink pair from the Operation header; all Operation roles see the saved palette.
- Added `/operation/public/<organization-slug>` for published handbook and news without login. It deliberately excludes Tasks, Needs, editor actions and UI Studio.
- Added Google Work Sans as the shared font and retained iPad-safe Operation input and editor viewport handling.
- Added migration `020_organization_ui_theme.sql`.
- Rollback checkpoint: v0.19.0-rc.93.

## rc.89

- Removed the duplicate owner article list; actions now live on regular Handbook cards for owners only.
- Fixed private image persistence and added in-browser 2048px WebP preparation before upload.
- Returns a specific Vercel Blob storage error and restores a valid package lock.
- No database migration is required.
- Rollback checkpoint: v0.19.0-rc.88.

## rc.88

- Removed generic input/textarea sizing from article-editor metadata only.
- Tightened the editor canvas rhythm and moved the format bar closer to the visual-viewport edge.
- No database migration is required.
- Rollback checkpoint: v0.19.0-rc.87.

## rc.87

- Reduced editor-selector typography and made the New-category menu action explicit.
- Removed the format dock’s enclosing surface above Safari browser chrome.
- No database migration is required.
- Rollback checkpoint: v0.19.0-rc.86.

## rc.86

- Consolidated the full-screen article editor controls into one compact top row.
- Added existing-category selection and a dedicated New category input.
- Made the editing title body-sized while retaining reader title styling.
- Fixed private Vercel Blob image upload and authenticated rendering.
- No database migration is required.
- Rollback checkpoint: v0.19.0-rc.85.

## rc.85

- Fixed task creation when the optional short instruction is blank.
- Added persisted task audiences: specific employee, everyone on shift, and everyone.
- Everyone on shift uses the published rota for the selected service date; it does not use clock-in status. Everyone is independent of scheduling.
- Added migration `019_operation_task_assignment_scope.sql`.
- Rollback checkpoint: v0.19.0-rc.84.

## rc.84

- Corrected selected-date task completion, mutation recovery, Copenhagen service dates, and month-end recurrence.
- Aligned task management with `operations.manage`; articles remain OWNER/ADMIN managed.
- Removed unshipped governance, reminder, and audit tables with migration `018_operation_integrity_cleanup.sql`.
- Added Operation integrity coverage and rejected SVG uploads.
- Rollback checkpoint: v0.19.0-rc.83.

## rc.71

- Restyled the standalone Operation module into a tighter field-notes interface.
- Reduced card, row, section-label, control, and reader typography scale.
- Kept the full-screen dark Apple Notes-style Quill editor intact.
- Rollback checkpoint: v0.19.0-rc.70.

## rc.70

- Hardened Operation content parsing so saved articles render from block arrays, raw Quill Delta objects, and stringified JSON.
- Added a non-empty reader fallback using the article title and description.
- Made saved H1/H2 header attributes render whether Quill supplies numeric or string values.
- Rollback checkpoint: v0.19.0-rc.69.

## rc.69

- Changed the Operation Quill toolbar to expose H1, H2, and Body rich-text formats.
- Rendered saved Quill H1/H2 headings as matching article-reader headings.
- Rollback checkpoint: v0.19.0-rc.68.

## rc.68

- Added explicit migration-required state for Operation module storage.
- Returned clear migration-required mutation errors when the Operation tables or enum types are missing.
- Kept article drafts, task text, and needed-item text visible when saves fail.
- Disabled Operation write controls with a visible database migration notice while production storage is unavailable.
- Rollback checkpoint: v0.19.0-rc.67.

## rc.67

- Replaced the temporary block editor with direct Quill 2 rich text editing.
- Added formatting controls for title/H1/H2/body, inline text styles, links, images, lists, alignment, colour, and clean formatting.
- Saved article bodies as Quill Delta JSON in the existing Operation content field.
- Preserved legacy block rendering and conversion when old articles are edited.
- Rollback checkpoint: v0.19.0-rc.66.

## rc.66

- Moved the Operation owner article editor into a full-screen Notes-style window.
- Added dedicated Add handbook article and Add news buttons.
- Kept text, heading, subheading, bullet list, numbered list, and image blocks in article order.
- Kept save validation visible inside the editor so failed Add article attempts explain what is missing.
- Rollback checkpoint: v0.19.0-rc.65.

## rc.65

- Replaced the simple article textarea with an ordered Notes-style block editor.
- Added text, heading, subheading, bullet list, numbered list, and image blocks.
- Added block move/remove controls so content can be arranged in article order.
- Added visible save validation and API error feedback.
- Rollback checkpoint: v0.19.0-rc.64.

## rc.64

- Added an Operation navigation item to the owner/manager workspace.
- The item opens `/operation`, where OWNER and ADMIN users can use the Handbook and News editor.
- Preserved Operation as a standalone module without the main side menu inside the module itself.
- Rollback checkpoint: v0.19.0-rc.63.

## rc.63

- Removed the top-right article reader Close button.
- Converted the bottom reader X into a centered outlined circle with no fill.
- Removed visible article-link CTA buttons from articles.
- Removed Handbook category group headings and kept category pills on article cards.
- Improved Operation typography across news, handbook, daily tasks, and needs.
- Rollback checkpoint: v0.19.0-rc.62.

## rc.62

- Removed the Operation home intro title/copy block and duplicate News module card.
- Removed standalone module page titles from Operation, Handbook, Daily Tasks, and We Need.
- Fixed the Operation segmented navigation to the viewport and centered its links inside the pill.
- Reduced Operation section/category heading scale for a more professional mobile presentation.
- Rollback checkpoint: v0.19.0-rc.61.

## rc.61

- Removed the extra Operation header label and Bar Ops pill.
- Removed arrow icons from Operation article cards and linked article buttons.
- Kept module icons, the main Operation page title, and all workflows intact.
- Rollback checkpoint: v0.19.0-rc.60.

## rc.60

- Made the standalone Operation module smaller and more professional on mobile.
- Reduced oversized typography, heavy borders, large rounded cards, and loose spacing.
- Kept the standalone route, single-colour module background, owner editor, article reader, Daily Tasks, and We Need behavior intact.
- Rollback checkpoint: v0.19.0-rc.59.

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
