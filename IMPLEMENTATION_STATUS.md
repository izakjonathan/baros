# Implementation Status

Version: **v0.19.0-rc.66**

## Current focus

Operation full-screen article editor upgrade from the verified rc.65 baseline.

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
